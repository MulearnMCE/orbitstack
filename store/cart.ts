import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];

  addItem: (product: Product, quantity?: number) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  itemCount: () => number;
  subtotalCents: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

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
      },

      addItems: (newItems: CartItem[]) => {
        set((state) => {
          const additions = new Map<string, CartItem>();

          for (const item of newItems) {
            const queued = additions.get(item.product.id);
            additions.set(item.product.id, {
              product: item.product,
              quantity: (queued?.quantity ?? 0) + item.quantity,
            });
          }

          const merged = state.items.map((item) => {
            const addition = additions.get(item.product.id);
            if (!addition) return item;

            additions.delete(item.product.id);
            return {
              product: addition.product,
              quantity: item.quantity + addition.quantity,
            };
          });

          return {
            items: [...merged, ...additions.values()],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
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
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
    }),
    {
      name: 'orbitstack-cart',
    }
  )
);
