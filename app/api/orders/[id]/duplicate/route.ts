import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import type { ApiResponse, DuplicateOrderResult, Product } from '@/types';

export async function POST(
  _request: NextRequest,
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

    const items = order.items
      .filter((item) => item.product.active && item.product.stock >= item.quantity)
      .map((item) => ({
        product: item.product as Product,
        quantity: item.quantity,
      }));

    const result: DuplicateOrderResult = {
      items,
      skippedItemCount: order.items.length - items.length,
    };

    return NextResponse.json<ApiResponse<DuplicateOrderResult>>({
      data: result,
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
