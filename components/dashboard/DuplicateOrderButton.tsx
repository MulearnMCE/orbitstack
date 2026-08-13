'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

interface DuplicateOrderItem {
  product: Product;
  quantity: number;
}

interface DuplicateOrderResult {
  items: DuplicateOrderItem[];
  skipped: { name: string; reason: string }[];
}

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });

      const json: ApiResponse<DuplicateOrderResult> = await res.json();

      if (!res.ok || json.error || !json.data) {
        setError(json.error ?? 'Could not duplicate this order');
        return;
      }

      json.data.items.forEach(({ product, quantity }) => {
        addItem(product, quantity);
      });

      if (json.data.skipped.length > 0) {
        setNotice(
          json.data.skipped.map((s) => `${s.name} (${s.reason})`).join(', ')
        );
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError('Could not duplicate this order. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        id={`duplicate-order-${orderId}`}
        variant={added ? 'secondary' : 'ghost'}
        size="sm"
        className="w-full"
        loading={loading}
        onClick={handleDuplicate}
      >
        {added ? '✓ Added to cart' : 'Duplicate Order'}
      </Button>
      {error && (
        <p className="text-xs text-red-400" id={`duplicate-order-error-${orderId}`}>
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-lunar-500" id={`duplicate-order-notice-${orderId}`}>
          Skipped: {notice}
        </p>
      )}
    </div>
  );
}
