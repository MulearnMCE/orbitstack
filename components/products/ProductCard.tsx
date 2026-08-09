import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { formatCents } from '@/lib/utils/format';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <article
      id={`product-card-${product.id}`}
      className="group rounded-xl border border-space-700/60 bg-space-900 overflow-hidden transition-colors hover:border-space-600"
    >
      {}
      <div className="relative h-40 w-full bg-space-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">📦</div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-lunar-100 hover:text-moon-gold line-clamp-2 transition-colors"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-lunar-500 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-lunar-100">{formatCents(product.priceCents)}</span>
          {outOfStock && (
            <span className="text-xs text-red-400">Out of stock</span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="text-xs text-amber-400">Only {product.stock} left</span>
          )}
        </div>

        <AddToCartButton product={product} disabled={outOfStock} />
      </div>
    </article>
  );
}
