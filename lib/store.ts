// Zustand Cart Store for Fone Fusion
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
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

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
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

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.discount_price ?? i.product.price) * i.quantity,
          0
        ),
    }),
    {
      name: 'fone-fusion-cart',
    }
  )
);

// ─── Site Settings Store ───────────────────────────────────────────────────
interface SettingsStore {
  whatsappEnabled: boolean;
  setWhatsappEnabled: (val: boolean) => void;
  codEnabled: boolean;
  setCodEnabled: (val: boolean) => void;
  // PayU
  payuEnabled: boolean;
  payuKey: string;
  payuSalt: string;
  payuEnv: 'test' | 'live';
  setPayuEnabled: (val: boolean) => void;
  setPayuKey: (val: string) => void;
  setPayuSalt: (val: string) => void;
  setPayuEnv: (val: 'test' | 'live') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      whatsappEnabled: false,
      setWhatsappEnabled: (val) => set({ whatsappEnabled: val }),
      codEnabled: true,
      setCodEnabled: (val) => set({ codEnabled: val }),
      payuEnabled: false,
      payuKey: '',
      payuSalt: '',
      payuEnv: 'test',
      setPayuEnabled: (val) => set({ payuEnabled: val }),
      setPayuKey: (val) => set({ payuKey: val }),
      setPayuSalt: (val) => set({ payuSalt: val }),
      setPayuEnv: (val) => set({ payuEnv: val }),
    }),
    {
      name: 'fone-fusion-settings',
    }
  )
);
