import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/client';
import type { User } from '@/types';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    tier: user.tier as User['tier'],
    createdAt: user.createdAt.toISOString(),
  };
}

export async function requireSession(): Promise<User> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ data: null, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
