import { prisma } from '@/lib/db/client';

const DASHBOARD_HISTORY_DAYS = 30;

export async function listOrders(userId: string) {
  const historyStart = new Date(Date.now() - DASHBOARD_HISTORY_DAYS * 24 * 60 * 60 * 1000);

  return prisma.order.findMany({
    where: {
      userId,
      createdAt: { gte: historyStart },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
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
