import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/orders/[id]/duplicate/route';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/orders/queries', () => ({
  getOrderById: vi.fn(),
}));

const mockGetSession = vi.mocked(getSession);
const mockGetOrderById = vi.mocked(getOrderById);

const session = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'User One',
  tier: 'pro' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function request(orderId: string) {
  return new NextRequest(`http://localhost/api/orders/${orderId}/duplicate`, {
    method: 'POST',
  });
}

function product(overrides: Partial<{
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  active: boolean;
}> = {}) {
  return {
    id: 'product-1',
    name: 'Product One',
    description: 'Test product',
    priceCents: 100_000,
    stock: 10,
    category: 'gear',
    imageUrl: null,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    userId: 'user-1',
    status: 'delivered' as const,
    subtotalCents: 300_000,
    discountCents: 0,
    shippingCents: 0,
    totalCents: 300_000,
    discountCodeId: null,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    discountCode: null,
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 2,
        priceAtPurchase: 100_000,
        product: product(),
      },
    ],
    ...overrides,
  };
}

describe('POST /api/orders/[id]/duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the user is not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await POST(request('order-1'), {
      params: Promise.resolve({ id: 'order-1' }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ data: null, error: 'Unauthorized' });
  });

  it('returns 403 when the order belongs to another user', async () => {
    mockGetSession.mockResolvedValue(session);
    mockGetOrderById.mockResolvedValue(
      order({ userId: 'user-2' }) as Awaited<ReturnType<typeof getOrderById>>
    );

    const response = await POST(request('order-1'), {
      params: Promise.resolve({ id: 'order-1' }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ data: null, error: 'Forbidden' });
  });

  it('returns available items and skips inactive or insufficient-stock products', async () => {
    mockGetSession.mockResolvedValue(session);
    mockGetOrderById.mockResolvedValue(
      order({
        items: [
          {
            id: 'item-1',
            orderId: 'order-1',
            productId: 'product-1',
            quantity: 2,
            priceAtPurchase: 100_000,
            product: product(),
          },
          {
            id: 'item-2',
            orderId: 'order-1',
            productId: 'product-2',
            quantity: 1,
            priceAtPurchase: 80_000,
            product: product({ id: 'product-2', name: 'Inactive', active: false }),
          },
          {
            id: 'item-3',
            orderId: 'order-1',
            productId: 'product-3',
            quantity: 3,
            priceAtPurchase: 90_000,
            product: product({ id: 'product-3', name: 'Low Stock', stock: 2 }),
          },
        ],
      }) as Awaited<ReturnType<typeof getOrderById>>
    );

    const response = await POST(request('order-1'), {
      params: Promise.resolve({ id: 'order-1' }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.error).toBeNull();
    expect(json.data.items).toEqual([
      {
        product: {
          id: 'product-1',
          name: 'Product One',
          description: 'Test product',
          priceCents: 100_000,
          stock: 10,
          category: 'gear',
          imageUrl: null,
          active: true,
        },
        quantity: 2,
      },
    ]);
    expect(json.data.skippedItems).toEqual([
      {
        productId: 'product-2',
        name: 'Inactive',
        reason: 'inactive',
        requestedQuantity: 1,
        availableQuantity: 10,
      },
      {
        productId: 'product-3',
        name: 'Low Stock',
        reason: 'insufficient_stock',
        requestedQuantity: 3,
        availableQuantity: 2,
      },
    ]);
  });
});
