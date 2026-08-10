'use client';

import { useCartStore } from '@/store/cart';
import { useHydrated } from '@/lib/utils/useHydrated';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function CartSummaryPage() {
  const mounted = useHydrated();
  const { items, clearCart } = useCartStore();

  const displayedItems = mounted ? items : [];

  if (displayedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-6xl">🌑</div>
        <p className="text-lunar-400">Your cart is empty.</p>
        <Link href="/products" className="mt-4 text-sm text-moon-gold hover:underline">
          Browse the lunar collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <ul className="space-y-3">
          {displayedItems.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </ul>
        <button
          onClick={clearCart}
          className="text-xs text-lunar-500 hover:text-red-400 transition-colors"
          id="cart-clear-btn"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        <CartSummary />
        <Link href="/checkout" className="block">
          <Button id="cart-page-checkout-btn" className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
