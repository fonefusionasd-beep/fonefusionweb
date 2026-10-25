'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

function StatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const isSuccess = status === 'success';
  const { updatePaymentStatus } = useOrderStore();

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
  }, [orderId, isSuccess, updatePaymentStatus]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
          isSuccess ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
        }`}
      >
        {isSuccess ? <CheckCircle size={40} /> : <XCircle size={40} />}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isSuccess ? 'Payment Successful! 🎉' : 'Payment Failed / Incomplete ❌'}
      </h2>

      {orderId && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Order ID: #{orderId}
        </p>
      )}

      <p className="text-gray-600 mb-6 text-sm leading-relaxed">
        {isSuccess
          ? 'Thank you! Your payment has been confirmed and order is being prepared for shipping.'
          : 'The payment transaction was not completed or failed. No money was deducted. You can retry checkout or select Cash on Delivery.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md shadow-orange-500/20 text-sm"
        >
          View My Orders <ArrowRight size={16} />
        </Link>
        {!isSuccess ? (
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Retry Checkout
          </Link>
        ) : (
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
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
