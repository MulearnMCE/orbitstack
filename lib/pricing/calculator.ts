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

  // Free shipping applies if the code grants it, OR the user qualifies
  // via Pro tier + order threshold. Multiple sources of free shipping
  // simply result in free shipping — they don't stack into a bigger refund.
  const hasFreeShipping =
    discountCode?.stackableWithFreeShipping === true ||
    (userTier === PRO_TIER && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS);

  if (hasFreeShipping) {
    shippingCents = 0;
  }

  // total = items minus item discounts, plus shipping (never negative)
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
