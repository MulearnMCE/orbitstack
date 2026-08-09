'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const SEEDED_USERS = [
  { email: 'alice@orbitstack.dev', name: 'Alice Nakamura', tier: 'Pro' },
  { email: 'bob@orbitstack.dev', name: 'Bob Chen', tier: 'Standard' },
  { email: 'carol@orbitstack.dev', name: 'Carol Singh', tier: 'Pro' },
  { email: 'dave@orbitstack.dev', name: 'Dave Okafor', tier: 'Standard' },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string) => {
    setLoading(email);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? 'Login failed');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mb-2 text-4xl">🌙</div>
          <h1 className="text-2xl font-bold text-lunar-100">Sign in to OrbitStack</h1>
          <p className="mt-1 text-sm text-lunar-400">
            Select a test account below. No password required.
          </p>
        </div>

        <div className="space-y-3">
          {SEEDED_USERS.map((user) => (
            <button
              key={user.email}
              id={`login-btn-${user.email.split('@')[0]}`}
              onClick={() => handleLogin(user.email)}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-xl border border-space-700 bg-space-900 px-5 py-4 text-left transition-colors hover:border-space-500 hover:bg-space-800 disabled:opacity-50"
            >
              <div>
                <p className="font-medium text-lunar-100">{user.name}</p>
                <p className="text-xs text-lunar-500">{user.email}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.tier === 'Pro'
                    ? 'bg-moon-gold/20 text-moon-gold border border-moon-gold/40'
                    : 'bg-space-700 text-lunar-400 border border-space-600'
                }`}
              >
                {user.tier}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <p className="text-center text-xs text-lunar-600">
          Pro users get free shipping on orders over ₹5,000.
          <br />
          Task 1 repro: log in as Alice, then apply discount code{' '}
          <code className="font-mono text-moon-gold/80">PROSHIP15</code> at checkout.
        </p>
      </div>
    </div>
  );
}
