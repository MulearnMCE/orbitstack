import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: 'User not found. Use a seeded email address.' },
        { status: 404 }
      );
    }

    const response = NextResponse.json<ApiResponse<{ id: string; name: string; tier: string }>>({
      data: { id: user.id, name: user.name, tier: user.tier },
      error: null,
    });

    response.cookies.set('session_user_id', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json<ApiResponse<null>>({ data: null, error: null });
  response.cookies.delete('session_user_id');
  return response;
}
