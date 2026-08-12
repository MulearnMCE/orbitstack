'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import type { ApiResponse, DuplicateOrderResult } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });
      const result = (await response.json()) as ApiResponse<DuplicateOrderResult>;

      if (!response.ok || !result.data) {
        setError(result.error ?? 'Could not add this order to your cart.');
        return;
      }

      result.data.items.forEach((item) => addItem(item.product, item.quantity));

      if (result.data.items.length === 0) {
        setMessage('No items from this order are currently in stock.');
      } else if (result.data.skippedItemCount > 0) {
        setMessage(
          `${result.data.items.length} item${result.data.items.length === 1 ? '' : 's'} added; ${result.data.skippedItemCount} unavailable item${result.data.skippedItemCount === 1 ? ' was' : 's were'} skipped.`
        );
      } else {
        setMessage('Order items added to your cart.');
      }
    } catch {
      setError('Could not add this order to your cart. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        id={`duplicate-order-${orderId}`}
        type="button"
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={handleDuplicate}
      >
        Duplicate Order
      </Button>
      {message && <p className="text-xs text-emerald-400" role="status">{message}</p>}
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
