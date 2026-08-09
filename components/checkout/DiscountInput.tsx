'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import type { PricingResult } from '@/types';

interface DiscountInputProps {
  onApplied: (code: string, pricing: PricingResult) => void;
}

export function DiscountInput({ onApplied }: DiscountInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const { subtotalCents } = useCartStore();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotalCents: subtotalCents() }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? 'Invalid code');
        return;
      }

      setApplied(json.data.code);
      onApplied(json.data.code, json.data.pricing);
    } catch {
      setError('Could not validate code. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div
        id="discount-applied-banner"
        className="flex items-center gap-2 rounded-lg bg-emerald-900/30 border border-emerald-800 px-4 py-3"
      >
        <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-emerald-300">
          Code <span className="font-mono font-semibold">{applied}</span> applied
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="discount-code-input" className="block text-sm font-medium text-lunar-300">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          id="discount-code-input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="PROSHIP15"
          className="flex-1 rounded-lg border border-space-600 bg-space-800 px-3 py-2 text-sm text-lunar-100 placeholder-lunar-600 focus:border-moon-gold/50 focus:outline-none focus:ring-1 focus:ring-moon-gold/30"
        />
        <Button
          id="apply-discount-btn"
          variant="secondary"
          onClick={handleApply}
          loading={loading}
        >
          Apply
        </Button>
      </div>
      {error && (
        <p id="discount-error" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
