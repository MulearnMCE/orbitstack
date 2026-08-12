import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: {
        items: { include: { product: true } },
      },
    });

    const items = (cart?.items ?? []).map((item) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        priceCents: item.product.priceCents,
        stock: item.product.stock,
        category: item.product.category,
        imageUrl: item.product.imageUrl,
        active: item.product.active,
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
      },
      quantity: item.quantity,
    }));

    return NextResponse.json<ApiResponse<typeof items>>({
      data: items,
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/cart]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to load cart' },
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
    const { items } = body as {
      items: { productId: string; quantity: number }[];
    };

    if (!Array.isArray(items)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Invalid cart data' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: session.id },
        create: { userId: session.id },
        update: {},
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
    });

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error('[POST /api/cart]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to save cart' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.cart.deleteMany({ where: { userId: session.id } });

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error('[DELETE /api/cart]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
