import Link from 'next/link';
import type { Metadata } from 'next';

import Image from 'next/image';

export const metadata: Metadata = {
  title: 'OrbitStack — Lunar Commerce',
};

export default function HomePage() {
  return (
    <div className="space-y-20">
      {}
      <section className="relative flex flex-col items-center justify-center py-32 text-center overflow-hidden border-b-4 border-white">
        {}
        <Image 
          src="/moon-landscape.jpg" 
          alt="Lunar Landscape" 
          fill
          className="object-cover grayscale brightness-110 contrast-125 opacity-80 mix-blend-screen -z-10"
          priority
        />

        <div className="relative z-10 space-y-8 flex flex-col items-center p-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl uppercase mix-blend-difference">
            Shop the <span className="text-white underline decoration-4 underline-offset-8">lunar</span> collection
          </h1>
          <p className="mx-auto max-w-xl text-lg text-white font-mono font-bold tracking-wider uppercase mix-blend-difference">
            Premium moon-themed merchandise. Free shipping on Pro orders over ₹5,000.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
            <Link
              href="/products"
              className="bg-white text-black border-4 border-black px-8 py-3 font-bold uppercase tracking-widest transition-none hover:bg-black hover:text-white hover:border-white"
              id="hero-shop-now-btn"
            >
              Shop Now
            </Link>
            <Link
              href="/dashboard"
              className="bg-black text-white border-4 border-white px-8 py-3 font-bold uppercase tracking-widest transition-none hover:bg-white hover:text-black hover:border-black"
              id="hero-orders-btn"
            >
              My Orders
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { icon: '🚀', title: 'Free Shipping', desc: 'Pro members get free shipping on orders over ₹5,000' },
          { icon: '🌙', title: 'Moon-Curated', desc: '18 hand-selected lunar-inspired products' },
          { icon: '🔒', title: 'Secure Checkout', desc: 'Simple, fast checkout with discount codes' },
        ].map((f) => (
          <div
            key={f.title}
            className="border-4 border-white bg-black p-6 text-center transition-none hover:bg-white hover:text-black group"
          >
            <div className="mb-4 text-4xl emoji-white group-hover:invert">{f.icon}</div>
            <h3 className="font-bold text-white group-hover:text-black uppercase tracking-widest">{f.title}</h3>
            <p className="mt-2 text-sm text-white group-hover:text-black font-mono uppercase font-bold">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
