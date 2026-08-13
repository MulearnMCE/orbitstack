import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/db/client';
import { listOrders } from '@/lib/orders/queries';

vi.mock('@/lib/db/client', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
    },
  },
}));

describe('listOrders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T12:00:00.000Z'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads only the last 30 days with items and products in one database query', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([]);

    await listOrders('user-123');

    expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.orderItem.findMany).not.toHaveBeenCalled();
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        createdAt: { gte: new Date('2026-07-14T12:00:00.000Z') },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  });
});
