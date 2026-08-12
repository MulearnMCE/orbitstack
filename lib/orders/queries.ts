import { prisma } from '@/lib/db/client';

const DASHBOARD_ORDER_HISTORY_DAYS = 30;

export async function listOrders(userId: string) {
  const orderHistoryStart = new Date();
  orderHistoryStart.setDate(orderHistoryStart.getDate() - DASHBOARD_ORDER_HISTORY_DAYS);

  // Load the order history and its displayed relations together. The previous
  // implementation loaded every order and then issued one query per order for
  // its items, which becomes prohibitively slow for customers with many orders.
  return prisma.order.findMany({
    where: {
      userId,
      createdAt: { gte: orderHistoryStart },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      status: true,
      subtotalCents: true,
      discountCents: true,
      shippingCents: true,
      totalCents: true,
      discountCodeId: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          priceAtPurchase: true,
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              category: true,
              imageUrl: true,
            },
          },
        },
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
