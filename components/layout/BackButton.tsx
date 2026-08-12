'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BackButton() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <Link
      href="/"
      aria-label="Back to OrbitStack homepage"
      className="mb-6 inline-flex items-center gap-2 border-2 border-white px-3 py-1.5 text-sm font-bold uppercase tracking-widest transition-none hover:bg-white hover:text-black hover:border-black"
    >
      <span aria-hidden="true">←</span>
      Home
    </Link>
  );
}
