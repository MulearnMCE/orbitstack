'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import type { ApiResponse, CartItem } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

interface DuplicateOrderResult {
  items: CartItem[];
  unavailableItems: string[];
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const addItems = useCartStore((state) => state.addItems);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function duplicateOrder() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/duplicate`, { method: 'POST' });
      const result = (await response.json()) as ApiResponse<DuplicateOrderResult>;

      if (!response.ok || !result.data) {
        throw new Error(result.error ?? 'Unable to duplicate order');
      }

      addItems(result.data.items);
      const skipped = result.data.unavailableItems.length;
      setMessage(
        skipped > 0
          ? `Added available items; ${skipped} unavailable item${skipped === 1 ? '' : 's'} skipped.`
          : 'Order added to cart.'
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to duplicate order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" size="sm" loading={loading} onClick={duplicateOrder}>
        Duplicate Order
      </Button>
      {message && <p className="text-right text-xs text-lunar-400" role="status">{message}</p>}
    </div>
  );
}
