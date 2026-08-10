import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db/client';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { Product } from '@/types';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse all OrbitStack lunar merchandise.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });

  const categories = ['electronics', 'apparel', 'accessories'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-lunar-100">Shop</h1>

        {}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              !category ? 'bg-moon-gold text-space-950 font-medium' : 'bg-space-800 text-lunar-400 hover:text-lunar-100'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${cat}`}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                category === cat
                  ? 'bg-moon-gold text-space-950 font-medium'
                  : 'bg-space-800 text-lunar-400 hover:text-lunar-100'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <ProductGrid products={products as Product[]} />
    </div>
  );
}
