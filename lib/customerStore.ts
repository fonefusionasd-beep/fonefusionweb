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
  updateProfile: (data: Partial<CustomerUser>) => void;
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

        // Trigger Supabase Auth Reset Email
        try {
          const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/account/reset-password?email=${encodeURIComponent(cleanEmail)}`
            : '';

          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl,
          });
        } catch (err) {
          console.warn('Supabase auth email note:', err);
        }

        return {
          success: true,
          message: `Password reset link has been sent to ${cleanEmail}. Please check your inbox / spam folder.`,
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
