import { describe, expect, it } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import { STANDARD_SHIPPING_RATE } from '@/lib/pricing/types';

const freeShippingCode = {
  discountType: 'FIXED' as const,
  value: 0,
  stackableWithFreeShipping: true,
};

describe('computeOrderTotals', () => {
  it('does not convert an already-free Pro shipping tier into a discount', () => {
    const result = computeOrderTotals({
      subtotalCents: 600_000,
      discountCode: freeShippingCode,
      userTier: 'pro',
    });

    expect(result).toEqual({
      subtotalCents: 600_000,
      discountCents: 0,
      shippingCents: 0,
      totalCents: 600_000,
    });
  });

  it('applies free shipping once to a standard account', () => {
    const result = computeOrderTotals({
      subtotalCents: 100_000,
      discountCode: freeShippingCode,
      userTier: 'standard',
    });

    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(100_000);
  });

  it('charges standard shipping when no free-shipping rule applies', () => {
    const result = computeOrderTotals({
      subtotalCents: 100_000,
      discountCode: null,
      userTier: 'standard',
    });

    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(100_000 + STANDARD_SHIPPING_RATE);
  });
});
