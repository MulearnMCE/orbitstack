import { prisma } from '@/lib/db/client';

export async function listOrders(userId: string) {
  // Previously this fetched orders first, then fired one extra `OrderItem.findMany`
  // per order — an N+1 pattern that scaled badly for users with large order histories.
  // Prisma's nested `include` loads all relations in a single batched operation,
  // eliminating the per-order round-trips entirely.
  return prisma.order.findMany({
    where: { userId },
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
