import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import type { ApiResponse, CartItem } from '@/types';

interface DuplicateOrderResult {
  items: CartItem[];
  unavailableItems: string[];
}

export async function POST(
  _request: Request,
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
    const order = await prisma.order.findFirst({
      where: { id, userId: session.id },
      select: {
        items: {
          select: {
            quantity: true,
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Order not found' },
        { status: 404 }
      );
    }

    const availableItems: CartItem[] = [];
    const unavailableItems: string[] = [];

    for (const item of order.items) {
      if (item.product.active && item.product.stock >= item.quantity) {
        availableItems.push({ product: item.product, quantity: item.quantity });
      } else {
        unavailableItems.push(item.product.name);
      }
    }

    if (availableItems.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'None of the items in this order are currently available' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse<DuplicateOrderResult>>({
      data: { items: availableItems, unavailableItems },
      error: null,
    });
  } catch (error) {
    console.error('[POST /api/orders/[id]/duplicate]', error);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to duplicate order' },
      { status: 500 }
    );
  }
}
