'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b-4 border-white bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {}
          <Link href="/" className="flex items-center gap-2 group hover:bg-white hover:text-black px-2 py-1 border-2 border-transparent hover:border-black transition-none">
            <span className="font-bold text-2xl tracking-tighter uppercase font-sans">
              OrbitStack
            </span>
          </Link>

          {}
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/products"
              className="text-sm uppercase tracking-widest font-bold border-2 border-transparent px-2 py-1 transition-none hover:bg-white hover:text-black hover:border-black"
            >
              Shop
            </Link>
            <Link
              href="/dashboard"
              className="text-sm uppercase tracking-widest font-bold border-2 border-transparent px-2 py-1 transition-none hover:bg-white hover:text-black hover:border-black"
            >
              Orders
            </Link>
          </nav>

          {}
          <button
            id="header-cart-btn"
            onClick={() => setCartOpen(true)}
            className="relative p-2 font-bold uppercase transition-none border-2 border-white hover:bg-white hover:text-black flex items-center gap-2"
            aria-label="Open cart"
          >
            CART
            {mounted && count > 0 && (
              <span
                aria-label={`${count} items in cart`}
                className="flex h-6 w-6 items-center justify-center bg-white text-black text-xs font-bold border-2 border-black"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
