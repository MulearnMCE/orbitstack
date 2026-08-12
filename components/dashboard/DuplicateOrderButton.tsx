'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import type { ApiResponse, Product } from '@/types';

interface DuplicateOrderButtonProps {
  orderId: string;
}

type DuplicateItem = { product: Product; quantity: number };
type Skipped = { productId: string; name: string; reason: string };
type DuplicateResponse = { items: DuplicateItem[]; skipped: Skipped[] };

type Status = 'idle' | 'loading' | 'success' | 'error';

export function DuplicateOrderButton({ orderId }: DuplicateOrderButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleDuplicate() {
    setStatus('loading');
    setMessage(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/duplicate`, {
        method: 'POST',
      });
      const json: ApiResponse<DuplicateResponse> = await res.json();

      if (!res.ok || json.error || !json.data) {
        setStatus('error');
        setMessage(json.error ?? 'Something went wrong');
        return;
      }

      const { items, skipped } = json.data;

      if (items.length === 0) {
        setStatus('error');
        setMessage('No items from this order are currently available.');
        return;
      }

      // Add each available item to the Zustand cart store.
      for (const { product, quantity } of items) {
        addItem(product, quantity);
      }

      const addedMsg = `${items.length} item${items.length !== 1 ? 's' : ''} added to cart.`;
      const skippedMsg =
        skipped.length > 0
          ? ` ${skipped.length} item${skipped.length !== 1 ? 's' : ''} unavailable.`
          : '';

      setStatus('success');
      setMessage(addedMsg + skippedMsg);
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <span>✓</span>
        <span>{message}</span>
        <a href="/cart" className="underline hover:text-emerald-300">
          View cart →
        </a>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400">
        <span>✗ {message}</span>
        <button
          onClick={() => { setStatus('idle'); setMessage(null); }}
          className="underline hover:text-red-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      id={`duplicate-order-${orderId}`}
      onClick={handleDuplicate}
      disabled={status === 'loading'}
      className="flex items-center gap-1.5 rounded-lg border border-space-600 bg-space-800 px-3 py-1.5 text-sm text-lunar-300 transition hover:border-moon-gold hover:text-moon-gold disabled:cursor-not-allowed disabled:opacity-50"
    >
      {status === 'loading' ? (
        <>
          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-lunar-500 border-t-transparent" />
          Adding…
        </>
      ) : (
        <>
          <span aria-hidden>⊕</span>
          Duplicate Order
        </>
      )}
    </button>
  );
}
