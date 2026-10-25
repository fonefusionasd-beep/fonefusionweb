'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ShoppingBag, ArrowRight, RotateCcw } from 'lucide-react';
import { useOrderStore, useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

function StatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const isSuccess = status === 'success';
  const { updatePaymentStatus } = useOrderStore();
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (orderId) {
      const newStatus = isSuccess ? 'paid' : 'failed';
      updatePaymentStatus(orderId, newStatus);
      supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId)
        .then(() => {});
    }

    // Flipkart Standard: Clear cart ONLY IF payment succeeded!
    // If failed or cancelled, items remain in cart for seamless retry
    if (isSuccess) {
      clearCart();
      try {
        localStorage.removeItem('fone_fusion_checkout_draft');
      } catch (e) {}
    }
  }, [orderId, isSuccess, updatePaymentStatus, clearCart]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
          isSuccess ? 'bg-green-100 text-green-500 shadow-lg shadow-green-500/10' : 'bg-red-100 text-red-500 shadow-lg shadow-red-500/10'
        }`}
      >
        {isSuccess ? <CheckCircle size={42} /> : <XCircle size={42} />}
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
        {isSuccess ? 'Payment Successful! 🎉' : 'Payment Failed / Cancelled ❌'}
      </h2>

      {orderId && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Order ID: #{orderId}
        </p>
      )}

      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        {isSuccess
          ? 'Thank you! Your payment has been confirmed and order is being prepared for shipping.'
          : 'Transaction could not be completed or was cancelled. No money was deducted. Your cart items and address are safe — you can retry or switch to Cash on Delivery.'}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {!isSuccess ? (
          <>
            <Link
              href="/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20 text-sm"
            >
              <RotateCcw size={16} /> Retry Checkout / COD
            </Link>
            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
            >
              <ShoppingBag size={16} /> View Cart
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/20 text-sm"
            >
              View My Orders <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
            >
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading payment status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
