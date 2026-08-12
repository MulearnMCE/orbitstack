import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/pricing/calculator';
import {
  STANDARD_SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD_CENTS,
  PRO_TIER,
  STANDARD_TIER,
} from '@/lib/pricing/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A coupon that makes shipping free and is stackable with the pro benefit. */
const freeShippingCoupon = {
  discountType: 'FIXED' as const,
  value: 0,               // no item-level discount
  stackableWithFreeShipping: true,
};

/** A regular percentage-off coupon that is NOT a free-shipping coupon. */
const tenPercentCoupon = {
  discountType: 'PERCENTAGE' as const,
  value: 1000,            // 10% in basis points
  stackableWithFreeShipping: false,
};

const SUBTOTAL_BELOW_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS - 1; // just under ₹5 000
const SUBTOTAL_ABOVE_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS + 1; // just over ₹5 000

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('computeOrderTotals — shipping semantics', () => {

  // ── Combination 1: Standard tier, no free-shipping coupon ──────────────────
  it('standard user pays standard shipping', () => {
    const result = computeOrderTotals({
      subtotalCents: SUBTOTAL_BELOW_THRESHOLD,
      discountCode: null,
      userTier: STANDARD_TIER,
    });

    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(SUBTOTAL_BELOW_THRESHOLD + STANDARD_SHIPPING_RATE);
  });

  // ── Combination 2: Standard tier + free-shipping coupon ────────────────────
  it('standard user with free-shipping coupon pays no shipping, and shipping saving is reflected in discountCents', () => {
    const result = computeOrderTotals({
      subtotalCents: SUBTOTAL_BELOW_THRESHOLD,
      discountCode: freeShippingCoupon,
      userTier: STANDARD_TIER,
    });

    expect(result.shippingCents).toBe(0);
    // The coupon zeroed out shipping → that saving should appear in discountCents
    expect(result.discountCents).toBe(STANDARD_SHIPPING_RATE);
    // total = subtotal - discountCents + shippingCents = subtotal - SHIPPING_RATE
    expect(result.totalCents).toBe(SUBTOTAL_BELOW_THRESHOLD - STANDARD_SHIPPING_RATE);
  });

  // ── Combination 3: Pro tier above threshold, no coupon ────────────────────
  it('pro user above threshold gets free shipping; discountCents stays 0', () => {
    const result = computeOrderTotals({
      subtotalCents: SUBTOTAL_ABOVE_THRESHOLD,
      discountCode: null,
      userTier: PRO_TIER,
    });

    expect(result.shippingCents).toBe(0);
    // The pro tier made shipping free — that is a tier benefit, not a discount code.
    // discountCents must NOT include the shipping rate.
    expect(result.discountCents).toBe(0);
    expect(result.totalCents).toBe(SUBTOTAL_ABOVE_THRESHOLD);
  });

  // ── Combination 4 (the reported bug): Pro above threshold + free-shipping coupon ─
  it('pro user above threshold + stackable free-shipping coupon: shippingCents=0, discountCents does NOT include shipping rate (bug fix)', () => {
    const result = computeOrderTotals({
      subtotalCents: SUBTOTAL_ABOVE_THRESHOLD,
      discountCode: freeShippingCoupon,
      userTier: PRO_TIER,
    });

    expect(result.shippingCents).toBe(0);
    // Shipping was already free due to Pro threshold — the coupon didn't save anything extra.
    // Before the fix, discountCents was wrongly set to STANDARD_SHIPPING_RATE here.
    expect(result.discountCents).toBe(0);
    // total must never be negative
    expect(result.totalCents).toBeGreaterThanOrEqual(0);
    expect(result.totalCents).toBe(SUBTOTAL_ABOVE_THRESHOLD);
  });

  // ── Bonus: Pro below threshold + free-shipping coupon ─────────────────────
  it('pro user BELOW threshold + stackable coupon: coupon makes shipping free, saving appears in discountCents', () => {
    const result = computeOrderTotals({
      subtotalCents: SUBTOTAL_BELOW_THRESHOLD,
      discountCode: freeShippingCoupon,
      userTier: PRO_TIER,
    });

    expect(result.shippingCents).toBe(0);
    // Pro threshold was NOT reached → coupon zeroed shipping → credit the saving
    expect(result.discountCents).toBe(STANDARD_SHIPPING_RATE);
    // total = subtotal - discountCents + shippingCents = subtotal - SHIPPING_RATE
    expect(result.totalCents).toBe(SUBTOTAL_BELOW_THRESHOLD - STANDARD_SHIPPING_RATE);
  });

  // ── Percentage coupon doesn't affect shipping ─────────────────────────────
  it('10% coupon applied to standard user reduces subtotal only, shipping stays standard', () => {
    const subtotal = 100_000; // ₹1 000
    const result = computeOrderTotals({
      subtotalCents: subtotal,
      discountCode: tenPercentCoupon,
      userTier: STANDARD_TIER,
    });

    const expectedDiscount = Math.round((subtotal * 1000) / 10000); // 10%
    expect(result.discountCents).toBe(expectedDiscount);
    expect(result.shippingCents).toBe(STANDARD_SHIPPING_RATE);
    expect(result.totalCents).toBe(subtotal - expectedDiscount + STANDARD_SHIPPING_RATE);
  });
});
