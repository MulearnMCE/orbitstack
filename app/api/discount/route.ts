import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { validateDiscountCode } from '@/lib/pricing/calculator';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import type { ApiResponse, PricingResult } from '@/types';

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
    const { code, subtotalCents } = body as { code: string; subtotalCents: number };

    if (!code || typeof subtotalCents !== 'number') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Missing code or subtotal' },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    const validationError = validateDiscountCode(subtotalCents, discountCode);
    if (validationError) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: validationError },
        { status: 422 }
      );
    }

    const pricing = computeOrderTotals({
      subtotalCents,
      discountCode: {
        discountType: discountCode!.discountType,
        value: discountCode!.value,
        stackableWithFreeShipping: discountCode!.stackableWithFreeShipping,
      },
      userTier: session.tier,
    });

    return NextResponse.json<ApiResponse<{ code: string; pricing: PricingResult }>>({
      data: {
        code: discountCode!.code,
        pricing,
      },
      error: null,
    });
  } catch (err) {
    console.error('[POST /api/discount]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
