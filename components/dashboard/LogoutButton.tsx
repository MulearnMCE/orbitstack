'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out"
      className="inline-flex items-center gap-2 border-2 border-white px-3 py-1.5 text-sm font-bold uppercase tracking-widest transition-none hover:bg-white hover:text-black hover:border-black disabled:opacity-50"
    >
      {loading ? '…' : 'Logout'}
    </button>
  );
}
