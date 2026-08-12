import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import type { ApiResponse, Product } from '@/types';

type DuplicateItem = {
  product: Product;
  quantity: number;
};

type DuplicateOrderResponse = {
  items: DuplicateItem[];
  skipped: { productId: string; name: string; reason: string }[];
};

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

    const { id: orderId } = await params;

    // Ownership check happens at the DB query level — no second round-trip needed.
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.id, // only the owner can duplicate
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Order not found' },
        { status: 404 }
      );
    }

    const available: DuplicateItem[] = [];
    const skipped: DuplicateOrderResponse['skipped'] = [];

    for (const item of order.items) {
      const { product } = item;

      if (!product.active) {
        skipped.push({
          productId: product.id,
          name: product.name,
          reason: 'Product is no longer available',
        });
        continue;
      }

      // Require the full original quantity to be in stock.
      // e.g. original: 3, current stock: 2 → skip entirely (don't add 2).
      if (product.stock < item.quantity) {
        skipped.push({
          productId: product.id,
          name: product.name,
          reason:
            product.stock === 0
              ? 'Out of stock'
              : `Only ${product.stock} in stock (original order had ${item.quantity})`,
        });
        continue;
      }

      available.push({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl ?? null,
          active: product.active,
        },
        quantity: item.quantity,
      });
    }

    return NextResponse.json<ApiResponse<DuplicateOrderResponse>>({
      data: { items: available, skipped },
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
