import { describe, expect, it } from 'vitest';

import { computeOrderTotals } from '@/lib/pricing/calculator';
import { STANDARD_SHIPPING_RATE } from '@/lib/pricing/types';

const proShippingCode = {
  discountType: 'PERCENTAGE' as const,
  value: 1500,
  stackableWithFreeShipping: true,
};

describe('computeOrderTotals', () => {
  it('does not double-count shipping when Pro free shipping and a free-shipping code stack', () => {
    const pricing = computeOrderTotals({
      subtotalCents: 600_000,
      discountCode: proShippingCode,
      userTier: 'pro',
    });

    expect(pricing).toEqual({
      subtotalCents: 600_000,
      discountCents: 90_000,
      shippingCents: 0,
      totalCents: 510_000,
    });
  });

  it('keeps the product discount unchanged when only the code grants free shipping', () => {
    const pricing = computeOrderTotals({
      subtotalCents: 300_000,
      discountCode: proShippingCode,
      userTier: 'pro',
    });

    expect(pricing.discountCents).toBe(45_000);
    expect(pricing.shippingCents).toBe(0);
    expect(pricing.totalCents).toBe(255_000);
  });

  it('still charges standard shipping when no free-shipping benefit applies', () => {
    const pricing = computeOrderTotals({
      subtotalCents: 300_000,
      discountCode: null,
      userTier: 'standard',
    });

    expect(pricing.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(pricing.totalCents).toBe(300_000 + STANDARD_SHIPPING_RATE);
  });
});
