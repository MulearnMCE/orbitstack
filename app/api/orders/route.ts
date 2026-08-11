import { NextRequest, NextResponse } from 'next/server';
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
