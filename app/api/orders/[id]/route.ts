import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import type { ApiResponse } from '@/types';

export async function GET(
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
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<typeof order>>({
      data: order,
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/orders/[id]]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to load order' },
      { status: 500 }
    );
  }
}

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
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!order.items || order.items.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Order has no items' },
        { status: 400 }
      );
    }

    const productIds = order.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'One or more products are no longer available' },
        { status: 400 }
      );
    }

    const outOfStock = order.items.filter((item) => {
      const product = products.find((p: typeof products[0]) => p.id === item.productId)!;
      return product.stock < item.quantity;
    });

    if (outOfStock.length > 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: `Insufficient stock for ${outOfStock.map((i) => i.product.name).join(', ')}` },
        { status: 400 }
      );
    }

    const itemsForCart = order.items.map((item) => {
      const product = products.find((p: typeof products[0]) => p.id === item.productId)!;
      return {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
          active: product.active,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
        quantity: item.quantity,
      };
    });

    return NextResponse.json<ApiResponse<typeof itemsForCart>>({
      data: itemsForCart,
      error: null,
    });
  } catch (err) {
    console.error('[POST /api/orders/[id]/duplicate]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to duplicate order' },
      { status: 500 }
    );
  }
}
