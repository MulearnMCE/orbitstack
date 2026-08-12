import type { Metadata } from 'next';
import { Oswald, Space_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BackButton } from '@/components/layout/BackButton';

const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' });

export const metadata: Metadata = {
  title: {
    default: 'OrbitStack — Lunar Commerce',
    template: '%s | OrbitStack',
  },
  description: 'Premium moon-themed merchandise for the space-obsessed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${spaceMono.variable} dark`}>
      <body className="min-h-screen bg-black font-mono text-white antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative z-10">
          <BackButton />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
