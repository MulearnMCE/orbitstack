import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export async function getOrderWithItems(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}

export type OrderWithItems = Prisma.PromiseReturnType<typeof getOrderWithItems>;
import { prisma } from '@/lib/db/prisma';
import type { OrderWithItems } from '@/lib/orders/queries';

type DuplicateUnavailableItem = {
  productId: string;
  name: string;
  reason: 'out_of_stock' | 'inactive' | 'missing';
  requested: number;
  available: number;
};

export type DuplicateResult = {
  addedItems: { productId: string; name: string; quantity: number }[];
  unavailableItems: DuplicateUnavailableItem[];
  cart: { productId: string; quantity: number }[];
};

export async function addItemsToCart(
  order: OrderWithItems,
  userId: string
): Promise<DuplicateResult> {
  if (!order) throw new Error('Order not found');

  const addedItems: DuplicateResult['addedItems'] = [];
  const unavailableItems: DuplicateUnavailableItem[] = [];

  // Load the user's current cart so we can merge, not overwrite.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const cart = (user?.cart ?? []) as { productId: string; quantity: number }[];

  for (const item of order.items) {
    const product = item.product;

    // 1) Validate availability before adding.
    if (!product || !product.active) {
      unavailableItems.push({
        productId: item.productId,
        name: item.name ?? product?.name ?? item.productId,
        reason: product ? 'inactive' : 'missing',
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    if (product.stockQty < item.quantity) {
      unavailableItems.push({
        productId: item.productId,
        name: product.name,
        reason: 'out_of_stock',
        requested: item.quantity,
        available: product.stockQty,
      });
      continue;
    }

    // 2) Valid item — merge into cart, capping combined qty at stock.
    const existing = cart.find((c) => c.productId === item.productId);
    const cappedQty = Math.min(item.quantity + (existing?.quantity ?? 0), product.stockQty);

    if (existing) {
      existing.quantity = cappedQty;
    } else {
      cart.push({ productId: item.productId, quantity: item.quantity });
    }

    addedItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
    });
  }

  // 3) Persist the merged cart in a single update.
  await prisma.user.update({
    where: { id: userId },
    data: { cart },
  });

  return { addedItems, unavailableItems, cart };
}
import { NextRequest, NextResponse } from 'next/server';  
import { getSession } from '@/lib/auth/session';  
import { getOrderWithItems } from '@/lib/orders/queries';  
import { addItemsToCart } from '@/lib/cart/actions';  
import type { ApiResponse } from '@/types';  

export async function POST(  
  request: NextRequest,  
  { params }: { params: Promise<{ id: string }> }  
) {  
  try {  
    const session = await getSession();  
    if (!session) {  
      return NextResponse.json<ApiResponse<null>>(  
        { data: null, error: 'Unauthorized' },  
        { status: 401 }  
      );  
    }  

    const { id } = await params;  
    const order = await getOrderWithItems(id);  

    if (!order) {  
      return NextResponse.json<ApiResponse<null>>(  
        { data: null, error: 'Order not found
