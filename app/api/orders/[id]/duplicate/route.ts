import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderItem {
  product: Product;
  quantity: number;
}

interface DuplicateOrderResult {
  items: DuplicateOrderItem[];
  skipped: { name: string; reason: string }[];
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

    // Re-fetch current product state — stock/price/availability may have
    // changed since the order was originally placed.
    const items: DuplicateOrderItem[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (const orderItem of order.items) {
      const product = orderItem.product;

      if (!product || !product.active) {
        skipped.push({
          name: orderItem.product.name,
          reason: 'No longer available',
        });
        continue;
      }

      if (product.stock <= 0) {
        skipped.push({ name: product.name, reason: 'Out of stock' });
        continue;
      }

      const quantity = Math.min(orderItem.quantity, product.stock);
      if (quantity < orderItem.quantity) {
        skipped.push({
          name: product.name,
          reason: `Only ${product.stock} left — added what's available`,
        });
      }

      items.push({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
          active: product.active,
        },
        quantity,
      });
    }

    if (items.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'None of the items in this order are still available' },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<DuplicateOrderResult>>({
      data: { items, skipped },
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
