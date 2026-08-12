import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import { STANDARD_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/pricing/types';

describe('computeOrderTotals', () => {
  it('does not double-credit shipping when a Pro user (already above the free-shipping threshold) redeems a stackable free-shipping code', () => {
    const subtotalCents = FREE_SHIPPING_THRESHOLD_CENTS + 10000; // above threshold

    const result = computeOrderTotals({
      subtotalCents,
      userTier: 'pro',
      discountCode: {
        discountType: 'FIXED',
        value: 0,
        stackableWithFreeShipping: true,
      },
    });

    // Shipping should be free...
    expect(result.shippingCents).toBe(0);
    // ...but the discount should NOT also be inflated by the shipping rate,
    // since no shipping charge was ever actually applied to offset it.
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(subtotalCents);
  });

  it('credits the shipping value as a discount when a standard-tier user (below/without the threshold) redeems a stackable free-shipping code', () => {
    const subtotalCents = 100000; // below the free-shipping threshold

    const result = computeOrderTotals({
      subtotalCents,
      userTier: 'standard',
      discountCode: {
        discountType: 'FIXED',
        value: 0,
        stackableWithFreeShipping: true,
      },
    });

    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(subtotalCents - STANDARD_SHIPPING_RATE);
  });

  it('charges standard shipping when there is no discount code and the user is not Pro', () => {
    const subtotalCents = 50000;

    const result = computeOrderTotals({
      subtotalCents,
      userTier: 'standard',
      discountCode: null,
    });

    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(subtotalCents + STANDARD_SHIPPING_RATE);
  });
});
