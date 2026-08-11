import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import type { ApiResponse, Product } from '@/types';

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

    const availableItems: { product: Product; quantity: number }[] = [];
    let skippedCount = 0;

    for (const item of order.items) {
      if (item.product && item.product.active && item.product.stock > 0) {
        const qty = Math.min(item.quantity, item.product.stock);
        const productData: Product = {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          priceCents: item.product.priceCents,
          stock: item.product.stock,
          category: item.product.category,
          imageUrl: item.product.imageUrl,
          active: item.product.active,
        };
        availableItems.push({ product: productData, quantity: qty });
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json<
      ApiResponse<{ items: { product: Product; quantity: number }[]; skippedCount: number }>
    >({
      data: {
        items: availableItems,
        skippedCount,
      },
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
