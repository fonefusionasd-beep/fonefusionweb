'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon, PincodeOffer } from '@/types';
import { defaultCoupons, defaultPincodeOffers } from '@/lib/data';
import { supabase } from '@/lib/supabase';

interface OffersStore {
  coupons: Coupon[];
  pincodeOffers: PincodeOffer[];
  fetchOffers: () => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  addPincodeOffer: (offer: PincodeOffer) => Promise<void>;
  updatePincodeOffer: (offer: PincodeOffer) => Promise<void>;
  deletePincodeOffer: (id: string) => Promise<void>;
  checkPincode: (pincode: string, orderAmount: number) => PincodeOffer | null;
  validateCoupon: (code: string, orderAmount: number) => { valid: boolean; coupon?: Coupon; discount: number; message: string };
}

export const useOffersStore = create<OffersStore>()(
  persist(
    (set, get) => ({
      coupons: defaultCoupons,
      pincodeOffers: defaultPincodeOffers,

      fetchOffers: async () => {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['coupons', 'pincode_offers']);

          if (data && data.length > 0) {
            const cRow = data.find((r) => r.key === 'coupons');
            const pRow = data.find((r) => r.key === 'pincode_offers');

            if (cRow?.value && Array.isArray(cRow.value)) {
              set({ coupons: cRow.value });
            }
            if (pRow?.value && Array.isArray(pRow.value)) {
              set({ pincodeOffers: pRow.value });
            }
          }
        } catch (e) {
          console.error(e);
        }
      },

      addCoupon: async (coupon) => {
        const updated = [...get().coupons, coupon];
        set({ coupons: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'coupons',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      updateCoupon: async (coupon) => {
        const updated = get().coupons.map((c) => (c.id === coupon.id ? coupon : c));
        set({ coupons: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'coupons',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      deleteCoupon: async (id) => {
        const updated = get().coupons.filter((c) => c.id !== id);
        set({ coupons: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'coupons',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      addPincodeOffer: async (offer) => {
        const updated = [...get().pincodeOffers, offer];
        set({ pincodeOffers: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'pincode_offers',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      updatePincodeOffer: async (offer) => {
        const updated = get().pincodeOffers.map((p) => (p.id === offer.id ? offer : p));
        set({ pincodeOffers: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'pincode_offers',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      deletePincodeOffer: async (id) => {
        const updated = get().pincodeOffers.filter((p) => p.id !== id);
        set({ pincodeOffers: updated });
        try {
          await supabase.from('site_settings').upsert({
            key: 'pincode_offers',
            value: updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch (e) {
          console.error(e);
        }
      },

      checkPincode: (pincode, orderAmount) => {
        const cleanPin = pincode.trim().replace(/[^0-9]/g, '');
        if (!cleanPin || cleanPin.length < 6) return null;

        const offer = get().pincodeOffers.find(
          (p) => p.is_active && p.pincode === cleanPin && orderAmount >= p.min_order
        );
        return offer || null;
      },

      validateCoupon: (code, orderAmount) => {
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode) {
          return { valid: false, discount: 0, message: 'Please enter a coupon code' };
        }

        const found = get().coupons.find(
          (c) => c.code.toUpperCase() === cleanCode && c.is_active
        );

        if (!found) {
          return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
        }

        if (orderAmount < found.min_order_amount) {
          return {
            valid: false,
            discount: 0,
            message: `Minimum order amount of ₹${found.min_order_amount} required for this coupon`,
          };
        }

        let discount = 0;
        if (found.discount_type === 'flat') {
          discount = found.discount_value;
        } else if (found.discount_type === 'percentage') {
          discount = Math.round((orderAmount * found.discount_value) / 100);
        } else if (found.discount_type === 'free_shipping') {
          discount = 49; // standard shipping charge waived
        }

        return {
          valid: true,
          coupon: found,
          discount: Math.min(discount, orderAmount),
          message: `Coupon "${found.code}" applied successfully!`,
        };
      },
    }),
    {
      name: 'fone-fusion-offers',
    }
  )
);
