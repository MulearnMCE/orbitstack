import { prisma } from '@/lib/db/client';

export async function listOrders(userId: string) {
  // Previously this ran 1 query for the orders, then N more queries (one per
  // order) to fetch that order's items/product — an N+1 query pattern that
  // scaled linearly with order history size and made /dashboard slow for
  // users with many orders. A single query with a nested `include` lets
  // Prisma fetch everything (orders + items + products) in one round trip.
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return orders;
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
      discountCode: true,
    },
  });
}
