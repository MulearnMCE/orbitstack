import {
  ComputeParams,
  PricingResult,
  STANDARD_SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD_CENTS,
  PRO_TIER,
} from './types';

function applyDiscountCode(
  subtotalCents: number,
  discountCode: NonNullable<ComputeParams['discountCode']>
): number {
  if (discountCode.discountType === 'PERCENTAGE') {
    return Math.round((subtotalCents * discountCode.value) / 10000);
  }

  return Math.min(discountCode.value, subtotalCents);
}

export function computeOrderTotals(params: ComputeParams): PricingResult {
  const { subtotalCents, discountCode, userTier } = params;

  let discountCents = 0;
  let shippingCents = STANDARD_SHIPPING_RATE;

  if (discountCode !== null) {
    discountCents = applyDiscountCode(subtotalCents, discountCode);
  }

  // Shipping is free if the Pro-tier order threshold is met, OR the discount
  // code itself grants free shipping.
  const proThresholdFreeShipping =
    userTier === PRO_TIER && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const codeFreeShipping = !!discountCode?.stackableWithFreeShipping;

  if (proThresholdFreeShipping || codeFreeShipping) {
    shippingCents = 0;
  }

  // Only credit the shipping-code's value as part of the "discount" amount
  // when shipping wasn't already free via the Pro threshold. Previously this
  // credit was applied whenever a Pro user redeemed a stackable free-shipping
  // code, even if shippingCents was already 0 from the threshold — silently
  // double-crediting the shipping value and pushing totals below what they
  // should be (i.e. a "negative" shipping discount).
  if (codeFreeShipping && !proThresholdFreeShipping) {
    discountCents += STANDARD_SHIPPING_RATE;
  }

  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
  };
}

export function validateDiscountCode(
  subtotalCents: number,
  discountCode: { minOrderAmountCents: number; active: boolean } | null
): string | null {
  if (!discountCode) return 'Discount code not found';
  if (!discountCode.active) return 'This discount code is no longer active';
  if (subtotalCents < discountCode.minOrderAmountCents) {
    const min = (discountCode.minOrderAmountCents / 100).toFixed(2);
    return `This code requires a minimum order of ₹${min}`;
  }
  return null;
}
