

export const STANDARD_SHIPPING_RATE = 89900; 
export const FREE_SHIPPING_THRESHOLD_CENTS = 500000; 
export const PRO_TIER = 'pro' as const;
export const STANDARD_TIER = 'standard' as const;

export type UserTierConst = typeof PRO_TIER | typeof STANDARD_TIER;

export interface ComputeParams {
    subtotalCents: number;
    discountCode: {
    discountType: 'PERCENTAGE' | 'FIXED';
        value: number;
    stackableWithFreeShipping: boolean;
  } | null;
    userTier: UserTierConst;
}

export interface PricingResult {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}
