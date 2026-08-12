import { create } from 'zustand';


interface CartState {
  items: CartItem[];
  
  initCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  
  itemCount: () => number;
  subtotalCents: () => number;
}

import type { CartItem, Product } from '@/types';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  initCart: async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const { data } = await res.json();
        if (data) {
          set({ items: data });
        }
      }
    } catch (err) {
      console.error('Failed to init cart:', err);
    }
  },

  addItem: (product: Product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    });

    get().syncToDb();
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
    get().syncToDb();
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
    get().syncToDb();
  },

  clearCart: async () => {
    set({ items: [] });
    await get().syncToDb();
  },

  syncToDb: async () => {
    const state = get();
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotalCents: () =>
    get().items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
}));