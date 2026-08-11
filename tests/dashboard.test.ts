import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listOrders } from '@/lib/orders/queries';
import { prisma } from '@/lib/db/client';

vi.mock('@/lib/db/client', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
  },
}));

describe('Task 2: Dashboard Performance & Order Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches orders using a single query with relations included and filters to last 30 days', async () => {
    const mockOrders = [
      {
        id: 'order_1',
        userId: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'confirmed' as const,
        subtotalCents: 1000,
        discountCents: 0,
        shippingCents: 0,
        totalCents: 1000,
        discountCodeId: null,
        items: [
          {
            id: 'item_1',
            orderId: 'order_1',
            productId: 'prod_1',
            quantity: 2,
            priceAtPurchase: 1000,
            product: { id: 'prod_1', name: 'Test Product', description: 'desc', priceCents: 1000, stock: 10, category: 'gear', active: true, createdAt: new Date(), updatedAt: new Date(), imageUrl: null },
          },
        ],
      },
    ];

    const findManyMock = vi.mocked(prisma.order.findMany);
    findManyMock.mockResolvedValue(mockOrders);

    const result = await listOrders('user_123');

    // Verify exactly 1 database call to prisma.order.findMany was executed (eliminating N+1)
    expect(findManyMock).toHaveBeenCalledTimes(1);

    const callArg = findManyMock.mock.calls[0][0];

    // Verify userId filter
    expect(callArg?.where?.userId).toBe('user_123');

    // Verify 30-day cutoff filter
    const createdAtFilter = callArg?.where?.createdAt as { gte?: Date } | undefined;
    expect(createdAtFilter?.gte).toBeInstanceOf(Date);

    if (createdAtFilter?.gte) {
      const thirtyDaysAgoExpected = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(createdAtFilter.gte.getTime() - thirtyDaysAgoExpected.getTime());
      expect(timeDiff).toBeLessThan(5000); // within 5 seconds
    }

    // Verify ordering
    expect(callArg?.orderBy).toEqual({ createdAt: 'desc' });

    // Verify include relations
    expect(callArg?.include).toEqual({
      items: {
        include: { product: true },
      },
    });

    expect(result).toEqual(mockOrders);
  });
});
