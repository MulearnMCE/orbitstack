'use client';

import { useCartStore } from '@/store/cart';
import { formatCents } from '@/lib/utils/format';
import { STANDARD_SHIPPING_RATE } from '@/lib/pricing/types';

interface CartSummaryProps {
    compact?: boolean;
    discountCents?: number;
    shippingCents?: number;
}

export function CartSummary({ compact = false, discountCents = 0, shippingCents }: CartSummaryProps) {
  const { subtotalCents: getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  
  const shipping = shippingCents ?? STANDARD_SHIPPING_RATE;
  const total = subtotal - discountCents + shipping;

  if (compact) {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-lunar-400">
          <span>Subtotal</span>
          <span>{formatCents(subtotal)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lunar-100">
          <span>Total (est.)</span>
          <span>{formatCents(Math.max(0, total))}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-space-700 bg-space-900 p-4 text-sm">
      <div className="flex justify-between text-lunar-400">
        <span>Subtotal</span>
        <span>{formatCents(subtotal)}</span>
      </div>
      {discountCents > 0 && (
        <div className="flex justify-between text-emerald-400">
          <span>Discount</span>
          <span>−{formatCents(discountCents)}</span>
        </div>
      )}
      <div className="flex justify-between text-lunar-400">
        <span>Shipping</span>
        <span>{shipping === 0 ? <span className="text-emerald-400">Free</span> : formatCents(shipping)}</span>
      </div>
      <div className="border-t border-space-700 pt-2">
        <div className="flex justify-between font-semibold text-lunar-100">
          <span>Total</span>
          <span>{formatCents(Math.max(0, total))}</span>
        </div>
      </div>
    </div>
  );
}
