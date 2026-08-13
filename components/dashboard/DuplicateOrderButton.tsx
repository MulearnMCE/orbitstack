'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import type { ApiResponse, DuplicateOrderResult } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const addItems = useCartStore((state) => state.addItems);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });
      const result = (await response.json()) as ApiResponse<DuplicateOrderResult>;

      if (!response.ok || !result.data) {
        setError(result.error ?? 'Could not duplicate this order.');
        return;
      }

      addItems(result.data.items);

      const addedCount = result.data.items.reduce((sum, item) => sum + item.quantity, 0);
      const skippedCount = result.data.skippedItems.length;

      if (addedCount === 0) {
        setMessage('None of the items in this order are currently available.');
      } else if (skippedCount > 0) {
        setMessage(
          `Added ${addedCount} item${addedCount === 1 ? '' : 's'} to cart; ${skippedCount} unavailable product${skippedCount === 1 ? '' : 's'} skipped.`
        );
      } else {
        setMessage(`Added ${addedCount} item${addedCount === 1 ? '' : 's'} to cart.`);
      }
    } catch {
      setError('Could not duplicate this order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
      {message && (
        <p className="text-xs text-emerald-400" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
