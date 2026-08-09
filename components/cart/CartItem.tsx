'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { formatCents } from '@/lib/utils/format';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  return (
    <li className="flex items-start gap-3 rounded-lg bg-space-800/50 p-3">
      {}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-space-700 text-2xl overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          product.category === 'electronics' ? '🔌' : product.category === 'apparel' ? '👕' : '🌙'
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-lunar-100">{product.name}</p>
        <p className="text-sm text-lunar-400">{formatCents(product.priceCents)}</p>

        {}
        <div className="mt-2 flex items-center gap-2">
          <button
            id={`cart-item-decrement-${product.id}`}
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-space-700 text-lunar-300 transition-colors hover:bg-space-600"
            aria-label={`Decrease quantity of ${product.name}`}
          >
            −
          </button>
          <span className="w-6 text-center text-sm text-lunar-100">{quantity}</span>
          <button
            id={`cart-item-increment-${product.id}`}
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-space-700 text-lunar-300 transition-colors hover:bg-space-600"
            aria-label={`Increase quantity of ${product.name}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-lunar-100">
          {formatCents(product.priceCents * quantity)}
        </p>
        <button
          id={`cart-item-remove-${product.id}`}
          onClick={() => removeItem(product.id)}
          className="mt-1 text-xs text-lunar-500 transition-colors hover:text-red-400"
          aria-label={`Remove ${product.name} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
