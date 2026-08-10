'use client';

import { useCartStore } from '@/store/cart';
import { useHydrated } from '@/lib/utils/useHydrated';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const mounted = useHydrated();
  const { items, itemCount } = useCartStore();
  const count = itemCount();

  const displayedItems = mounted ? items : [];
  const displayedCount = mounted ? count : 0;

  return (
    <>
      {}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {}
      <div
        id="cart-drawer"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-space-950 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {}
        <div className="flex items-center justify-between border-b border-space-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-lunar-100">
            Cart{' '}
            {displayedCount > 0 && (
              <span className="ml-2 rounded-full bg-moon-gold/20 px-2 py-0.5 text-sm text-moon-gold">
                {displayedCount}
              </span>
            )}
          </h2>
          <button
            id="cart-drawer-close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-lunar-400 transition-colors hover:bg-space-800 hover:text-lunar-100"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-5xl">🌙</div>
              <p className="text-lunar-400">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-moon-gold underline-offset-2 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {displayedItems.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {}
        {displayedItems.length > 0 && (
          <div className="border-t border-space-700 px-6 py-4 space-y-4">
            <CartSummary compact />
            <Link href="/checkout" onClick={onClose} className="block">
              <Button id="cart-checkout-btn" className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
