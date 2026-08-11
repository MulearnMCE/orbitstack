import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/orders/[id]/duplicate/route';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/orders/queries', () => ({
  getOrderById: vi.fn(),
}));

const mockGetSession = vi.mocked(getSession);
const mockGetOrderById = vi.mocked(getOrderById);

describe('Task 3: Duplicate Order API Route Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/orders/order_1/duplicate', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'order_1' }) });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ data: null, error: 'Unauthorized' });
  });

  it('returns 404 when order does not exist', async () => {
    mockGetSession.mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test',
      tier: 'standard',
      createdAt: new Date().toISOString(),
    });
    mockGetOrderById.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/orders/nonexistent/duplicate', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({ data: null, error: 'Order not found' });
  });

  it('returns 403 when trying to duplicate an order owned by another user', async () => {
    mockGetSession.mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      name: 'User 1',
      tier: 'standard',
      createdAt: new Date().toISOString(),
    });
    mockGetOrderById.mockResolvedValue({
      id: 'order_other',
      userId: 'user_other_456',
      status: 'confirmed',
      subtotalCents: 1000,
      discountCents: 0,
      shippingCents: 0,
      totalCents: 1000,
      discountCodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      discountCode: null,
      items: [],
    });

    const req = new NextRequest('http://localhost:3000/api/orders/order_other/duplicate', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'order_other' }) });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({ data: null, error: 'Forbidden' });
  });

  it('returns 200 with available items and skips out-of-stock or inactive products', async () => {
    mockGetSession.mockResolvedValue({
      id: 'user_123',
      email: 'user@example.com',
      name: 'User 1',
      tier: 'standard',
      createdAt: new Date().toISOString(),
    });

    mockGetOrderById.mockResolvedValue({
      id: 'order_1',
      userId: 'user_123',
      status: 'confirmed',
      subtotalCents: 5000,
      discountCents: 0,
      shippingCents: 0,
      totalCents: 5000,
      discountCodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      discountCode: null,
      items: [
        {
          id: 'item_1',
          orderId: 'order_1',
          productId: 'prod_active_in_stock',
          quantity: 2,
          priceAtPurchase: 1000,
          product: {
            id: 'prod_active_in_stock',
            name: 'Active In Stock',
            description: 'Item 1',
            priceCents: 1000,
            stock: 5,
            category: 'gear',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageUrl: null,
          },
        },
        {
          id: 'item_2',
          orderId: 'order_1',
          productId: 'prod_out_of_stock',
          quantity: 1,
          priceAtPurchase: 2000,
          product: {
            id: 'prod_out_of_stock',
            name: 'Out of Stock Product',
            description: 'Item 2',
            priceCents: 2000,
            stock: 0,
            category: 'gear',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageUrl: null,
          },
        },
        {
          id: 'item_3',
          orderId: 'order_1',
          productId: 'prod_inactive',
          quantity: 3,
          priceAtPurchase: 1500,
          product: {
            id: 'prod_inactive',
            name: 'Inactive Product',
            description: 'Item 3',
            priceCents: 1500,
            stock: 10,
            category: 'gear',
            active: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageUrl: null,
          },
        },
        {
          id: 'item_4',
          orderId: 'order_1',
          productId: 'prod_low_stock',
          quantity: 10,
          priceAtPurchase: 3000,
          product: {
            id: 'prod_low_stock',
            name: 'Low Stock Product',
            description: 'Item 4',
            priceCents: 3000,
            stock: 3,
            category: 'gear',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            imageUrl: null,
          },
        },
      ],
    });

    const req = new NextRequest('http://localhost:3000/api/orders/order_1/duplicate', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'order_1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.error).toBeNull();
    expect(json.data.skippedCount).toBe(2); // item_2 (stock=0) and item_3 (active=false)
    expect(json.data.items).toHaveLength(2);

    expect(json.data.items[0]).toEqual({
      product: {
        id: 'prod_active_in_stock',
        name: 'Active In Stock',
        description: 'Item 1',
        priceCents: 1000,
        stock: 5,
        category: 'gear',
        active: true,
        imageUrl: null,
      },
      quantity: 2,
    });

    expect(json.data.items[1]).toEqual({
      product: {
        id: 'prod_low_stock',
        name: 'Low Stock Product',
        description: 'Item 4',
        priceCents: 3000,
        stock: 3,
        category: 'gear',
        active: true,
        imageUrl: null,
      },
      quantity: 3,
    });
  });
});
