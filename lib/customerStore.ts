'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerUser } from '@/types';
import { supabase } from '@/lib/supabase';

interface CustomerStore {
  currentCustomer: CustomerUser | null;
  savedCustomers: CustomerUser[];
  login: (phoneOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  registerOrUpdate: (data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    pincode?: string;
    password?: string;
  }) => Promise<CustomerUser>;
  updateProfile: (data: Partial<CustomerUser>) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      currentCustomer: null,
      savedCustomers: [],

      login: async (phoneOrEmail: string, password?: string) => {
        const cleanQuery = phoneOrEmail.trim().toLowerCase();
        
        // 1. First check in local list
        const localUser = get().savedCustomers.find(
          (c) =>
            c.phone.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '') ||
            (c.email && c.email.toLowerCase() === cleanQuery)
        );

        if (localUser) {
          if (localUser.password && password && localUser.password !== password) {
            return { success: false, message: 'Incorrect password' };
          }
          set({ currentCustomer: localUser });
          return { success: true };
        }

        // 2. Check Supabase site_settings for synced customer list
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'customer_accounts')
            .single();

          if (data?.value && Array.isArray(data.value)) {
            const cloudUser = data.value.find(
              (c: CustomerUser) =>
                c.phone.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '') ||
                (c.email && c.email.toLowerCase() === cleanQuery)
            );

            if (cloudUser) {
              if (cloudUser.password && password && cloudUser.password !== password) {
                return { success: false, message: 'Incorrect password' };
              }
              set({
                currentCustomer: cloudUser,
                savedCustomers: [...get().savedCustomers.filter((x) => x.id !== cloudUser.id), cloudUser],
              });
              return { success: true };
            }
          }
        } catch (e) {
          console.error(e);
        }

        // Auto create guest account if not found
        const newUser: CustomerUser = {
          id: 'cust_' + Date.now(),
          name: cleanQuery.includes('@') ? cleanQuery.split('@')[0] : 'Customer ' + cleanQuery.slice(-4),
          phone: cleanQuery.replace(/[^0-9+]/g, ''),
          email: cleanQuery.includes('@') ? cleanQuery : undefined,
          password: password || '123456',
          created_at: new Date().toISOString(),
        };

        const updatedList = [...get().savedCustomers, newUser];
        set({ currentCustomer: newUser, savedCustomers: updatedList });
        return { success: true };
      },

      registerOrUpdate: async (data) => {
        const cleanPhone = data.phone.trim();
        const existing = get().savedCustomers.find(
          (c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')
        );

        let userToSave: CustomerUser;

        if (existing) {
          userToSave = {
            ...existing,
            name: data.name || existing.name,
            email: data.email || existing.email,
            address: data.address || existing.address,
            city: data.city || existing.city,
            pincode: data.pincode || existing.pincode,
            password: data.password || existing.password,
          };
        } else {
          userToSave = {
            id: 'cust_' + Date.now(),
            name: data.name,
            phone: cleanPhone,
            email: data.email,
            address: data.address,
            city: data.city,
            pincode: data.pincode,
            password: data.password || '123456',
            created_at: new Date().toISOString(),
          };
        }

        const filtered = get().savedCustomers.filter((c) => c.id !== userToSave.id);
        const updatedList = [...filtered, userToSave];

        set({
          currentCustomer: userToSave,
          savedCustomers: updatedList,
        });

        // Sync with Supabase cloud
        try {
          await supabase.from('site_settings').upsert({
            key: 'customer_accounts',
            value: updatedList,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }

        return userToSave;
      },

      updateProfile: (data) => {
        const cur = get().currentCustomer;
        if (!cur) return;
        const updated = { ...cur, ...data };
        const updatedList = get().savedCustomers.map((c) => (c.id === cur.id ? updated : c));
        set({ currentCustomer: updated, savedCustomers: updatedList });
      },

      logout: () => {
        set({ currentCustomer: null });
      },
    }),
    {
      name: 'fone-fusion-customer',
    }
  )
);
