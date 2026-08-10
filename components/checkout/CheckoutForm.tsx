'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { CartSummary } from '@/components/cart/CartSummary';
import { DiscountInput } from './DiscountInput';
import { Button } from '@/components/ui/Button';
import { formatCents } from '@/lib/utils/format';
import type { PricingResult } from '@/types';
import { useHydrated } from '@/lib/utils/useHydrated';

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useHydrated();
  const { items, clearCart } = useCartStore();
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiscountApplied = (code: string, result: PricingResult) => {
    setAppliedCode(code);
    setPricing(result);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          discountCode: appliedCode,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? 'Failed to place order');
        return;
      }

      clearCart();
      router.push(`/dashboard?orderId=${json.data.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || items.length === 0) {
    return (
      <div className="py-12 text-center text-lunar-400">
        Your cart is empty. <Link href="/products" className="text-moon-gold hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {}
      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-lg font-semibold text-lunar-100">Order Summary</h2>

        <ul className="divide-y divide-space-700 rounded-xl border border-space-700 bg-space-900">
          {items.map((item) => (
            <li key={item.product.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-lunar-100">{item.product.name}</p>
                <p className="text-xs text-lunar-500">Qty {item.quantity}</p>
              </div>
              <p className="text-sm text-lunar-300 ml-4">
                {formatCents(item.product.priceCents * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <DiscountInput onApplied={handleDiscountApplied} />
      </div>

      {}
      <div className="lg:col-span-2 space-y-4">
        <CartSummary
          discountCents={pricing?.discountCents}
          shippingCents={pricing?.shippingCents}
        />

        {error && (
          <p id="checkout-error" className="rounded-lg bg-red-900/30 px-3 py-2 text-sm text-red-400 border border-red-800">
            {error}
          </p>
        )}

        <Button
          id="place-order-btn"
          onClick={handlePlaceOrder}
          loading={loading}
          className="w-full"
          size="lg"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
