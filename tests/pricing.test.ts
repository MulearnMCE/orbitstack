import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import {
  STANDARD_SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD_CENTS,
  PRO_TIER,
} from '@/lib/pricing/types';

describe('computeOrderTotals', () => {
  it('keeps shipping separate when a Pro user has a stackable free-shipping code', () => {
    const subtotalCents = 600000;
    const result = computeOrderTotals({
      subtotalCents,
      userTier: PRO_TIER,
      discountCode: {
        discountType: 'PERCENTAGE',
        value: 1500,
        stackableWithFreeShipping: true,
      },
    });

    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(Math.round((subtotalCents * 1500) / 10000));
    expect(result.totalCents).toBe(subtotalCents - result.discountCents);
  });

  it('applies free shipping via stackable code without touching discount', () => {
    const subtotalCents = 100000;
    const result = computeOrderTotals({
      subtotalCents,
      userTier: PRO_TIER,
      discountCode: {
        discountType: 'PERCENTAGE',
        value: 1000,
        stackableWithFreeShipping: true,
      },
    });

    expect(result.shippingCents).toBe(0);
    expect(result.discountCents).toBe(Math.round((subtotalCents * 1000) / 10000));
    expect(result.totalCents).toBe(subtotalCents - result.discountCents);
  });

  it('charges standard shipping for a Pro user below the free-shipping threshold without a stackable code', () => {
    const subtotalCents = FREE_SHIPPING_THRESHOLD_CENTS - 1;
    const result = computeOrderTotals({
      subtotalCents,
      userTier: PRO_TIER,
      discountCode: null,
    });

    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(subtotalCents + STANDARD_SHIPPING_RATE);
  });
});
