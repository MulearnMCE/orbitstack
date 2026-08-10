import type { Metadata } from 'next';
import { CartSummaryPage } from '@/components/cart/CartSummaryPage';

export const metadata: Metadata = {
  title: 'Cart',
};

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-lunar-100">Your Cart</h1>
      <CartSummaryPage />
    </div>
  );
}
