import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import { STANDARD_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/pricing/types';

describe('computeOrderTotals', () => {
  it('charges standard shipping with no discount code and no free-shipping tier', () => {
    const result = computeOrderTotals({
      subtotalCents: 10000,
      discountCode: null,
      userTier: 'standard',
    });

    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(10000 + STANDARD_SHIPPING_RATE);
  });

  it('does not go negative or double-discount when a Pro user (already over the free-shipping threshold) applies a stackable free-shipping code', () => {
    const subtotalCents = FREE_SHIPPING_THRESHOLD_CENTS + 10000;

    const result = computeOrderTotals({
      subtotalCents,
      discountCode: {
        discountType: 'FIXED',
        value: 0,
        stackableWithFreeShipping: true,
      },
      userTier: 'pro',
    });

    // Shipping should simply be free — not "free and then discounted again".
    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(subtotalCents);
  });

  it('gives a Pro user free shipping via a stackable code even under the threshold', () => {
    const result = computeOrderTotals({
      subtotalCents: 5000,
      discountCode: {
        discountType: 'FIXED',
        value: 0,
        stackableWithFreeShipping: true,
      },
      userTier: 'pro',
    });

    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(5000);
  });

  it('combines a percentage discount with free shipping without double-counting', () => {
    const subtotalCents = FREE_SHIPPING_THRESHOLD_CENTS + 10000;

    const result = computeOrderTotals({
      subtotalCents,
      discountCode: {
        discountType: 'PERCENTAGE',
        value: 1000, // 10% in basis points
        stackableWithFreeShipping: true,
      },
      userTier: 'pro',
    });

    const expectedDiscount = Math.round((subtotalCents * 1000) / 10000);
    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(expectedDiscount);
    expect(result.totalCents).toBe(subtotalCents - expectedDiscount);
  });
});
