import { prisma } from '@/lib/db/client';

export async function listOrders(userId: string) {
  
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      });
      return { ...order, items };
    })
  );

  return ordersWithItems;
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
