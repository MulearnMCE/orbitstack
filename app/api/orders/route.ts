import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { listOrders } from '@/lib/orders/queries';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await listOrders(session.id);

    return NextResponse.json<ApiResponse<typeof orders>>({
      data: orders,
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to load orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, discountCode: discountCodeStr } = body as {
      items: { productId: string; quantity: number }[];
      discountCode?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'One or more products are unavailable' },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json<ApiResponse<null>>(
          { data: null, error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    const subtotalCents = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.priceCents * item.quantity;
    }, 0);

    let discountCodeRecord = null;
    if (discountCodeStr) {
      discountCodeRecord = await prisma.discountCode.findUnique({
        where: { code: discountCodeStr.toUpperCase() },
      });
    }

    const pricing = computeOrderTotals({
      subtotalCents,
      discountCode: discountCodeRecord
        ? {
            discountType: discountCodeRecord.discountType,
            value: discountCodeRecord.value,
            stackableWithFreeShipping: discountCodeRecord.stackableWithFreeShipping,
          }
        : null,
      userTier: session.tier,
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.id,
          status: 'confirmed',
          subtotalCents: pricing.subtotalCents,
          discountCents: pricing.discountCents,
          shippingCents: pricing.shippingCents,
          totalCents: pricing.totalCents,
          discountCodeId: discountCodeRecord?.id ?? null,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: product.priceCents,
              };
            }),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      return newOrder;
    });

    return NextResponse.json<ApiResponse<typeof order>>(
      { data: order, error: null },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
