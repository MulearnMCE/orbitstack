// Shared types used across API routes, components, and the pricing module.
// Keep this file as the single source of truth for domain shapes.

export type UserTier = 'standard' | 'pro';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// ---------------------------------------------------------------------------
// Domain entities (mirrors Prisma models, but safe to pass client-side)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  active: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number; // basis points for PERCENTAGE, cents for FIXED
  stackableWithFreeShipping: boolean;
  minOrderAmountCents: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number; // cents, snapshot at order time
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  discountCodeId?: string | null;
  createdAt: string;
  items?: OrderItem[];
}

// ---------------------------------------------------------------------------
// Cart (client-side only, managed by Zustand)
// ---------------------------------------------------------------------------

export interface CartItem {
  product: Product;
  quantity: number;
}

// ---------------------------------------------------------------------------
// API envelope — all routes return { data, error }
// Never deviate from this shape: Task 1 tests that it's preserved.
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface PricingResult {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}
