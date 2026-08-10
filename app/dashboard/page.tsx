import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { listOrders } from '@/lib/orders/queries';
import { OrderCard } from '@/components/dashboard/OrderCard';
import type { Order, OrderItem, Product } from '@/types';

export const metadata: Metadata = {
  title: 'Order History',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const orders = await listOrders(session.id);

  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
      },
    })),
  })) as (Order & { items: (OrderItem & { product: Product })[] })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lunar-100">Order History</h1>
        <p className="mt-1 text-sm text-lunar-400">
          Welcome back, {session.name} —{' '}
          <span className="capitalize text-moon-gold">{session.tier}</span> member
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="rounded-xl border border-space-700 bg-space-900 py-16 text-center text-lunar-400">
          <div className="mb-3 text-4xl">🌑</div>
          <p>No orders yet.</p>
          <Link href="/products" className="mt-2 block text-sm text-moon-gold hover:underline">
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {serialized.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
