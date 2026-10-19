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
      payuEnabled: true, // Default ON so PayU payment option is immediately visible
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

// ─── Orders Store ─────────────────────────────────────────────────────────
import { Order } from '@/types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['order_status']) => void;
}

const initialOrders: Order[] = [
  {
    id: 'FF-849201',
    customer_name: 'Rahul Sharma',
    customer_phone: '+91 98765 43210',
    customer_address: 'House #42, Model Town, Delhi - 110009',
    customer_email: 'rahul.s@gmail.com',
    items: [
      {
        product_id: '1',
        product_name: 'Silicone Matte Case (iPhone 15 Pro)',
        product_image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
        price: 399,
        quantity: 1,
      },
    ],
    total_amount: 448,
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: '2026-10-18T10:30:00Z',
  },
  {
    id: 'FF-849202',
    customer_name: 'Priya Verma',
    customer_phone: '+91 98123 45678',
    customer_address: 'Flat 302, Green Valley Apt, Sector 14, Gurugram - 122001',
    customer_email: 'priya.v@gmail.com',
    items: [
      {
        product_id: '2',
        product_name: '65W GaN Super Fast Charger',
        product_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
        price: 1299,
        quantity: 1,
      },
    ],
    total_amount: 1299,
    payment_status: 'paid',
    order_status: 'shipped',
    created_at: '2026-10-19T14:15:00Z',
  },
  {
    id: 'FF-849203',
    customer_name: 'Amit Patel',
    customer_phone: '+91 95419 74000',
    customer_address: 'Shop No. 5, Main Market, Rohtak, Haryana',
    customer_email: 'amit.patel@gmail.com',
    items: [
      {
        product_id: '3',
        product_name: 'Magnetic Armor Case (Samsung S24 Ultra)',
        product_image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        price: 499,
        quantity: 2,
      },
    ],
    total_amount: 998,
    payment_status: 'pending',
    order_status: 'pending',
    created_at: '2026-10-19T21:45:00Z',
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: initialOrders,
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, order_status: status } : o
          ),
        })),
    }),
    {
      name: 'fone-fusion-orders',
    }
  )
);

