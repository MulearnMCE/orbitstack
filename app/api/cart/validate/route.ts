import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: { productId: string; quantity: number }[] };

    if (!items?.length) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'No items to validate' },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    type ValidationResult = {
      productId: string;
      valid: boolean;
      reason?: string;
      currentPriceCents: number;
      stock: number;
    };

    const results: ValidationResult[] = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return {
          productId: item.productId,
          valid: false,
          reason: 'Product no longer available',
          currentPriceCents: 0,
          stock: 0,
        };
      }
      if (product.stock < item.quantity) {
        return {
          productId: item.productId,
          valid: false,
          reason: `Only ${product.stock} left in stock`,
          currentPriceCents: product.priceCents,
          stock: product.stock,
        };
      }
      return {
        productId: item.productId,
        valid: true,
        currentPriceCents: product.priceCents,
        stock: product.stock,
      };
    });

    return NextResponse.json<ApiResponse<ValidationResult[]>>({
      data: results,
      error: null,
    });
  } catch (err) {
    console.error('[POST /api/cart/validate]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
