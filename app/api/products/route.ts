import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q');

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json<ApiResponse<typeof products>>({
      data: products,
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Failed to load products' },
      { status: 500 }
    );
  }
}
