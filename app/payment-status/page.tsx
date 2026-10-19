import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

function StatusContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const status = searchParams.status;
  const isSuccess = status === 'success';

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isSuccess ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
        {isSuccess ? <CheckCircle size={40} /> : <XCircle size={40} />}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isSuccess ? 'Payment Successful! 🎉' : 'Payment Failed ❌'}
      </h2>
      <p className="text-gray-500 mb-6">
        {isSuccess
          ? 'Thank you! Your payment has been confirmed and order is being processed.'
          : 'The payment transaction could not be completed. You can try again or choose Cash on Delivery.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md shadow-orange-500/20"
        >
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
        {!isSuccess && (
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Retry Checkout
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading status...</div>}>
      {/* @ts-ignore Server Component handling */}
      <AsyncWrapper {...props} />
    </Suspense>
  );
}

async function AsyncWrapper({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  return <StatusContent searchParams={params} />;
}
