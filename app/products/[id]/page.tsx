import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db/client';
import { formatCents } from '@/lib/utils/format';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  return { title: product?.name ?? 'Product' };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id, active: true } });
  if (!product) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {}
      <div className="relative flex h-64 items-center justify-center rounded-2xl bg-space-800 text-8xl lg:h-96 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          product.category === 'electronics' ? '🔌' : product.category === 'apparel' ? '👕' : '🌙'
        )}
      </div>

      {}
      <div className="space-y-6">
        <div>
          <p className="mb-1 text-sm capitalize text-lunar-500">{product.category}</p>
          <h1 className="text-3xl font-bold text-lunar-100">{product.name}</h1>
        </div>

        <p className="text-lunar-300">{product.description}</p>

        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-lunar-100">{formatCents(product.priceCents)}</span>
          {product.stock === 0 && (
            <span className="text-sm text-red-400">Out of stock</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-sm text-amber-400">Only {product.stock} left</span>
          )}
        </div>

        <div className="max-w-xs">
          <AddToCartButton product={product as Product} disabled={product.stock === 0} />
        </div>

        <p className="text-xs text-lunar-600">
          Pro members: free shipping on orders over ₹5,000 at checkout.
        </p>
      </div>
    </div>
  );
}
