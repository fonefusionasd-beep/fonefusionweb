'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerUser } from '@/types';
import { supabase } from '@/lib/supabase';

interface CustomerStore {
  currentCustomer: CustomerUser | null;
  savedCustomers: CustomerUser[];
  login: (phoneOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    pincode?: string;
  }) => Promise<{ success: boolean; message?: string; user?: CustomerUser }>;
  registerOrUpdateCheckout: (data: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    pincode?: string;
    password?: string;
  }) => Promise<CustomerUser>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePasswordByEmail: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
  adminUpdateCustomer: (oldPhone: string, data: Partial<CustomerUser>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  syncFromCloud: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      currentCustomer: null,
      savedCustomers: [],

      syncFromCloud: async () => {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'customer_accounts')
            .single();

          if (data?.value && Array.isArray(data.value)) {
            set({ savedCustomers: data.value });
          }
        } catch (e) {
          console.error(e);
        }
      },

      login: async (phoneOrEmail: string, password: string) => {
        const query = phoneOrEmail.trim().toLowerCase();
        const cleanPhone = query.replace(/[^0-9]/g, '');

        // 1. Refresh latest customers from cloud
        await get().syncFromCloud();

        // 2. Search for user by mobile or email
        const user = get().savedCustomers.find((c) => {
          const userPhone = (c.phone || '').replace(/[^0-9]/g, '');
          const userEmail = (c.email || '').toLowerCase().trim();
          return (cleanPhone.length >= 10 && userPhone.includes(cleanPhone.slice(-10))) || (userEmail && userEmail === query);
        });

        if (!user) {
          return {
            success: false,
            message: 'No account found with this mobile number or email. Please create an account.',
          };
        }

        if (user.password && user.password !== password) {
          return {
            success: false,
            message: 'Incorrect password. Please try again or click Forgot Password.',
          };
        }

        set({ currentCustomer: user });
        return { success: true };
      },

      register: async (data) => {
        const cleanPhone = data.phone.trim().replace(/[^0-9]/g, '');
        const cleanEmail = data.email.trim().toLowerCase();

        // Strict 10-digit mobile number validation
        if (cleanPhone.length < 10) {
          return {
            success: false,
            message: 'Please enter a valid 10-digit mobile number.',
          };
        }

        if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
          return {
            success: false,
            message: 'Please enter a valid email address.',
          };
        }

        if (!data.password || data.password.length < 6) {
          return {
            success: false,
            message: 'Password must be at least 6 characters long.',
          };
        }

        // Refresh cloud list first
        await get().syncFromCloud();

        // Duplicate check: mobile or email already exists?
        const phoneExists = get().savedCustomers.find((c) => {
          const uPhone = (c.phone || '').replace(/[^0-9]/g, '');
          return cleanPhone.length >= 10 && uPhone.includes(cleanPhone.slice(-10));
        });

        if (phoneExists) {
          return {
            success: false,
            message: 'An account with this mobile number already exists. Please sign in or reset your password.',
          };
        }

        const emailExists = get().savedCustomers.find(
          (c) => (c.email || '').toLowerCase().trim() === cleanEmail
        );

        if (emailExists) {
          return {
            success: false,
            message: 'An account with this email already exists. Please sign in or reset your password.',
          };
        }

        const newUser: CustomerUser = {
          id: 'cust_' + Date.now(),
          name: data.name.trim(),
          phone: cleanPhone.slice(-10),
          email: cleanEmail,
          password: data.password,
          address: data.address?.trim() || '',
          city: data.city?.trim() || '',
          pincode: data.pincode?.trim() || '',
          created_at: new Date().toISOString(),
        };

        const updatedList = [...get().savedCustomers, newUser];
        set({ currentCustomer: newUser, savedCustomers: updatedList });

        // Save to Supabase Cloud
        try {
          await supabase.from('site_settings').upsert({
            key: 'customer_accounts',
            value: updatedList,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }

        // Officially Register in Supabase Auth so Password Reset Email works
        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                name: data.name.trim(),
                phone: cleanPhone.slice(-10),
              },
            },
          });
        } catch (authErr) {
          console.warn('Supabase auth signUp note:', authErr);
        }

        return { success: true, user: newUser };
      },

      registerOrUpdateCheckout: async (data) => {
        const cleanPhone = data.phone.trim().replace(/[^0-9]/g, '').slice(-10);
        const cleanEmail = (data.email || '').trim().toLowerCase();

        const existing = get().savedCustomers.find((c) => {
          const uPhone = (c.phone || '').replace(/[^0-9]/g, '');
          return uPhone.includes(cleanPhone);
        });

        let userToSave: CustomerUser;

        if (existing) {
          userToSave = {
            ...existing,
            name: data.name || existing.name,
            email: cleanEmail || existing.email,
            address: data.address || existing.address,
            city: data.city || existing.city,
            pincode: data.pincode || existing.pincode,
            password: data.password || existing.password || '123456',
          };
        } else {
          userToSave = {
            id: 'cust_' + Date.now(),
            name: data.name,
            phone: cleanPhone,
            email: cleanEmail,
            address: data.address || '',
            city: data.city || '',
            pincode: data.pincode || '',
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

      sendPasswordResetEmail: async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          return { success: false, message: 'Please enter a valid email address.' };
        }

        await get().syncFromCloud();

        const user = get().savedCustomers.find(
          (c) => (c.email || '').toLowerCase().trim() === cleanEmail
        );

        if (!user) {
          return {
            success: false,
            message: 'No registered account found with this email address.',
          };
        }

        // If user is not yet in Supabase auth, ensure registered so Supabase can send reset mail
        if (user.password) {
          try {
            await supabase.auth.signUp({
              email: cleanEmail,
              password: user.password,
              options: {
                data: { name: user.name, phone: user.phone },
              },
            });
          } catch (e) {
            // Already in auth
          }
        }

        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/account/reset-password`
          : 'https://fone-fusion-six.vercel.app/account/reset-password';

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (error) {
          return {
            success: false,
            message: error.message || 'Failed to send reset email. Please try again.',
          };
        }

        return {
          success: true,
          message: `Password reset link has been sent to ${cleanEmail}! Please check your email inbox and spam folder.`,
        };
      },

      updatePasswordByEmail: async (email: string, newPassword: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!newPassword || newPassword.length < 6) {
          return { success: false, message: 'New password must be at least 6 characters long.' };
        }

        await get().syncFromCloud();

        const user = get().savedCustomers.find(
          (c) => (c.email || '').toLowerCase().trim() === cleanEmail
        );

        if (!user) {
          return { success: false, message: 'Account not found for password update.' };
        }

        const updatedUser = { ...user, password: newPassword };
        const updatedList = get().savedCustomers.map((c) =>
          c.id === user.id ? updatedUser : c
        );

        set({
          currentCustomer: updatedUser,
          savedCustomers: updatedList,
        });

        try {
          await supabase.from('site_settings').upsert({
            key: 'customer_accounts',
            value: updatedList,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }

        return {
          success: true,
          message: 'Password reset successful! You can now log in with your new password.',
        };
      },

      updateProfile: async (data) => {
        const cur = get().currentCustomer;
        if (!cur) return;
        const updated = { ...cur, ...data };
        const updatedList = get().savedCustomers.map((c) => (c.id === cur.id ? updated : c));
        set({ currentCustomer: updated, savedCustomers: updatedList });

        try {
          await supabase.from('site_settings').upsert({
            key: 'customer_accounts',
            value: updatedList,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      adminUpdateCustomer: async (oldPhone: string, data: Partial<CustomerUser>) => {
        const cleanOldPhone = oldPhone.trim().replace(/[^0-9]/g, '');
        await get().syncFromCloud();

        const updatedList = get().savedCustomers.map((c) => {
          const uPhone = (c.phone || '').replace(/[^0-9]/g, '');
          if (uPhone.includes(cleanOldPhone.slice(-10))) {
            return {
              ...c,
              name: data.name !== undefined ? data.name : c.name,
              phone: data.phone !== undefined ? data.phone.replace(/[^0-9]/g, '').slice(-10) : c.phone,
              email: data.email !== undefined ? data.email.trim().toLowerCase() : c.email,
              address: data.address !== undefined ? data.address : c.address,
              city: data.city !== undefined ? data.city : c.city,
              pincode: data.pincode !== undefined ? data.pincode : c.pincode,
            };
          }
          return c;
        });

        // Also if current logged in customer is this one, update them
        const cur = get().currentCustomer;
        if (cur && cur.phone.replace(/[^0-9]/g, '').includes(cleanOldPhone.slice(-10))) {
          const match = updatedList.find((x) => x.id === cur.id);
          if (match) set({ currentCustomer: match });
        }

        set({ savedCustomers: updatedList });

        // Sync to Supabase site_settings
        try {
          await supabase.from('site_settings').upsert({
            key: 'customer_accounts',
            value: updatedList,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }

        // Also update any orders in Supabase associated with this phone
        try {
          const updatePayload: Record<string, any> = {};
          if (data.name) updatePayload.customer_name = data.name;
          if (data.phone) updatePayload.customer_phone = data.phone;
          if (data.email) updatePayload.customer_email = data.email;
          if (data.address) updatePayload.customer_address = data.address;

          if (Object.keys(updatePayload).length > 0) {
            await supabase
              .from('orders')
              .update(updatePayload)
              .ilike('customer_phone', `%${cleanOldPhone.slice(-10)}%`);
          }
        } catch (dbErr) {
          console.error(dbErr);
        }

        return { success: true, message: 'Customer details successfully updated!' };
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
