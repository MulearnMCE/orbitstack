import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/orders/queries';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderItem {
  product: Product;
  quantity: number;
}

interface DuplicateOrderResult {
  items: DuplicateOrderItem[];
  skipped: { productId: string; name: string; reason: string }[];
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

    // Re-fetch current product state (price/stock/active may have changed
    // since the order was placed) rather than trusting the order snapshot.
    const productIds = order.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const result: DuplicateOrderResult = { items: [], skipped: [] };

    for (const orderItem of order.items) {
      const product = products.find((p) => p.id === orderItem.productId);

      if (!product || !product.active) {
        result.skipped.push({
          productId: orderItem.productId,
          name: orderItem.product.name,
          reason: 'No longer available',
        });
        continue;
      }

      if (product.stock <= 0) {
        result.skipped.push({
          productId: orderItem.productId,
          name: product.name,
          reason: 'Out of stock',
        });
        continue;
      }

      const quantity = Math.min(orderItem.quantity, product.stock);
      if (quantity < orderItem.quantity) {
        result.skipped.push({
          productId: orderItem.productId,
          name: product.name,
          reason: `Only ${product.stock} left in stock — added ${quantity} instead of ${orderItem.quantity}`,
        });
      }

      result.items.push({
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
