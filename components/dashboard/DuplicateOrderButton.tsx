'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleDuplicate = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });

      const json = (await res.json()) as ApiResponse<{
        items: { product: Product; quantity: number }[];
        skippedCount: number;
      }>;

      if (!res.ok || json.error || !json.data) {
        setFeedback({
          message: json.error || 'Failed to duplicate order',
          type: 'error',
        });
        return;
      }

      const { items, skippedCount } = json.data;

      if (items.length === 0) {
        setFeedback({
          message: 'All products in this order are currently out of stock',
          type: 'error',
        });
        return;
      }

      for (const item of items) {
        addItem(item.product, item.quantity);
      }

      const successMsg =
        skippedCount > 0
          ? `Added ${items.length} item(s) to cart (${skippedCount} unavailable item(s) skipped)`
          : '✓ Items added to cart';

      setFeedback({ message: successMsg, type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to duplicate order:', err);
      setFeedback({ message: 'Error duplicating order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <Button
        id={`duplicate-order-${orderId}`}
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={handleDuplicate}
      >
        Duplicate Order
      </Button>
      {feedback && (
        <span
          className={`text-xs font-mono ${
            feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {feedback.message}
        </span>
      )}
    </div>
  );
}
