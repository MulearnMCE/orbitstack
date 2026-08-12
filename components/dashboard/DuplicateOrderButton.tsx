'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderResult {
  items: { product: Product; quantity: number }[];
  skipped: { productId: string; name: string; reason: string }[];
}

interface DuplicateOrderButtonProps {
  orderId: string;
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  async function handleDuplicate() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });
      const json: ApiResponse<DuplicateOrderResult> = await res.json();

      if (!res.ok || json.error || !json.data) {
        setMessage(json.error ?? 'Could not duplicate this order.');
        return;
      }

      const { items, skipped } = json.data;

      items.forEach(({ product, quantity }) => addItem(product, quantity));

      if (items.length === 0) {
        setMessage('None of the items in this order are available anymore.');
      } else if (skipped.length > 0) {
        setMessage(
          `Added ${items.length} item${items.length === 1 ? '' : 's'} to cart. ${skipped.length} item${
            skipped.length === 1 ? '' : 's'
          } could not be added.`
        );
      } else {
        setMessage('All items added to cart.');
        router.push('/cart');
      }
    } catch (err) {
      console.error('[DuplicateOrderButton]', err);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button variant="secondary" size="sm" onClick={handleDuplicate} loading={loading}>
        Duplicate Order
      </Button>
      {message && <p className="text-xs text-lunar-400">{message}</p>}
    </div>
  );
}
