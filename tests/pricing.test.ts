import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import { STANDARD_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/pricing/types';

describe('Task 1: Pricing Logic & Shipping Discount Calculation', () => {
  it('charges standard shipping for a standard user without a discount code', () => {
    const result = computeOrderTotals({
      subtotalCents: 10000,
      discountCode: null,
      userTier: 'standard',
    });

    expect(result.subtotalCents).toBe(10000);
    expect(result.discountCents).toBe(0);
    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(10000 + STANDARD_SHIPPING_RATE);
  });

  it('provides free shipping for a Pro user meeting the free shipping threshold', () => {
    const result = computeOrderTotals({
      subtotalCents: FREE_SHIPPING_THRESHOLD_CENTS,
      discountCode: null,
      userTier: 'pro',
    });

    expect(result.subtotalCents).toBe(FREE_SHIPPING_THRESHOLD_CENTS);
    expect(result.discountCents).toBe(0);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(FREE_SHIPPING_THRESHOLD_CENTS);
  });

  it('correctly calculates discountCents and totalCents for a Pro user with a PROSHIP15 code without double-discounting shipping', () => {
    // PROSHIP15: 15% discount (1500 basis points) + stackable with free shipping
    const subtotal = 600000; // 600,000 cents ($6,000.00)
    const result = computeOrderTotals({
      subtotalCents: subtotal,
      discountCode: {
        discountType: 'PERCENTAGE',
        value: 1500, // 15%
        stackableWithFreeShipping: true,
      },
      userTier: 'pro',
    });

    const expectedItemDiscount = Math.round((subtotal * 1500) / 10000); // 90,000 cents ($900.00)

    expect(result.subtotalCents).toBe(subtotal);
    expect(result.discountCents).toBe(expectedItemDiscount);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(subtotal - expectedItemDiscount);
    expect(result.totalCents).toBeGreaterThanOrEqual(0);
  });

  it('applies stackable free shipping to a standard user without double-discounting', () => {
    const subtotal = 20000;
    const result = computeOrderTotals({
      subtotalCents: subtotal,
      discountCode: {
        discountType: 'FIXED',
        value: 5000,
        stackableWithFreeShipping: true,
      },
      userTier: 'standard',
    });

    expect(result.subtotalCents).toBe(subtotal);
    expect(result.discountCents).toBe(5000);
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(subtotal - 5000);
  });

  it('ensures order total is never negative even with large discounts', () => {
    const result = computeOrderTotals({
      subtotalCents: 1000,
      discountCode: {
        discountType: 'FIXED',
        value: 5000,
        stackableWithFreeShipping: false,
      },
      userTier: 'standard',
    });

    expect(result.discountCents).toBe(1000);
    expect(result.totalCents).toBeGreaterThanOrEqual(0);
  });
});
