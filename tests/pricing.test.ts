import { describe, expect, it } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_RATE,
} from '@/lib/pricing/types';

const PROSHIP15 = {
  discountType: 'PERCENTAGE' as const,
  value: 1500,
  stackableWithFreeShipping: true,
};

describe('computeOrderTotals', () => {
  it('does not double-count shipping for a Pro user using PROSHIP15', () => {
    const subtotalCents = 649_800;
    const expectedDiscount = Math.round((subtotalCents * PROSHIP15.value) / 10_000);

    const result = computeOrderTotals({
      subtotalCents,
      discountCode: PROSHIP15,
      userTier: 'pro',
    });

    expect(result).toEqual({
      subtotalCents,
      discountCents: expectedDiscount,
      shippingCents: 0,
      totalCents: subtotalCents - expectedDiscount,
    });
  });

  it('keeps a free-shipping code separate from the product discount below the Pro threshold', () => {
    const subtotalCents = FREE_SHIPPING_THRESHOLD_CENTS - 1;
    const expectedDiscount = Math.round((subtotalCents * PROSHIP15.value) / 10_000);

    const result = computeOrderTotals({
      subtotalCents,
      discountCode: PROSHIP15,
      userTier: 'pro',
    });

    expect(result.discountCents).toBe(expectedDiscount);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(subtotalCents - expectedDiscount);
  });

  it('allows a stackable free-shipping code for a standard user without adding shipping to discountCents', () => {
    const subtotalCents = 200_000;
    const result = computeOrderTotals({
      subtotalCents,
      discountCode: {
        discountType: 'FIXED',
        value: 50_000,
        stackableWithFreeShipping: true,
      },
      userTier: 'standard',
    });

    expect(result.discountCents).toBe(50_000);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(150_000);
  });

  it('still charges standard shipping when no free-shipping benefit applies', () => {
    const result = computeOrderTotals({
      subtotalCents: 100_000,
      discountCode: null,
      userTier: 'standard',
    });

    expect(result.discountCents).toBe(0);
    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(100_000 + STANDARD_SHIPPING_RATE);
  });
});
