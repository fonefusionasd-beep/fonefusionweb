'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { useCartStore, useSettingsStore, useOrderStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { codEnabled, payuEnabled, payuEnv, payuKey } = useSettingsStore();
  const { addOrder } = useOrderStore();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState<'payu' | 'cod'>('payu');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shipping = totalPrice() >= 499 ? 0 : 49;
  const grandTotal = totalPrice() + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newOrder: Order = {
      id: 'FF-' + Math.floor(100000 + Math.random() * 900000),
      customer_name: form.name.trim() || 'Customer',
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim(),
      customer_address: `${form.address}, ${form.city} - ${form.pincode}`,
      items: items.map((it) => ({
        product_id: it.product.id,
        product_name: it.product.name,
        product_image: it.product.images[0] || '',
        price: it.product.discount_price ?? it.product.price,
        quantity: it.quantity,
      })),
      total_amount: grandTotal,
      payment_status: paymentMethod === 'payu' ? 'paid' : 'pending',
      order_status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (paymentMethod === 'payu') {
      try {
        addOrder(newOrder);
        const productTitles = items.map((i) => i.product.name).join(', ').substring(0, 50);
        const res = await fetch('/api/payu/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: grandTotal,
            productinfo: productTitles || 'Mobile Accessories',
            firstname: form.name,
            email: form.email || `${form.phone}@fonefusion.in`,
            phone: form.phone,
            key: payuKey,
            salt: useSettingsStore.getState().payuSalt,
            env: payuEnv,
          }),
        });

        const data = await res.json();
        if (data.success && data.action && data.params) {
          const payuForm = document.createElement('form');
          payuForm.method = 'POST';
          payuForm.action = data.action;

          Object.keys(data.params).forEach((key) => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = data.params[key];
            payuForm.appendChild(hiddenField);
          });

          document.body.appendChild(payuForm);
          clearCart();
          payuForm.submit();
          return;
        } else {
          alert('PayU payment initiation failed: ' + (data.error || 'Please check PayU Key and Salt in Admin.'));
          setLoading(false);
          return;
        }
      } catch (err: any) {
        alert('Payment gateway connection error: ' + err.message);
        setLoading(false);
        return;
      }
    }

    // Cash on Delivery (COD) mode
    await new Promise((r) => setTimeout(r, 1000));
    addOrder(newOrder);
    setPlacedOrder(newOrder);
    clearCart();
    setSuccess(true);
    setLoading(false);

    // Auto-open WhatsApp message to Store Owner (+91 95419 74000) automatically without waiting
    try {
      const itemsSummary = newOrder.items.map(it => `• ${it.product_name} x${it.quantity}`).join('\n');
      const autoMsg = encodeURIComponent(
        `🔔 *NEW ORDER RECEIVED!*\n\n*Order ID:* ${newOrder.id}\n*Customer:* ${newOrder.customer_name}\n*Phone:* ${newOrder.customer_phone}\n*Address:* ${newOrder.customer_address}\n\n*Items:*\n${itemsSummary}\n\n*Total:* ${formatPrice(newOrder.total_amount)}\n*Payment:* Cash on Delivery (COD)`
      );
      window.open(`https://wa.me/919541974000?text=${autoMsg}`, '_blank');
    } catch (e) {
      // Browser popup fallback
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <Link href="/products" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors">
          <ShoppingBag size={18} /> Shop Now
        </Link>
      </div>
    );
  }

  if (success) {
    const adminPhone = '919541974000';
    const orderId = placedOrder?.id || 'FF-' + Math.floor(100000 + Math.random() * 900000);
    const orderItemsSummary = placedOrder?.items.map(it => `• ${it.product_name} x${it.quantity}`).join('\n') || '';

    // WhatsApp message to STORE OWNER (+91 95419 74000)
    const storeOwnerMsg = encodeURIComponent(
      `🔔 *NEW ORDER RECEIVED!*\n\n*Order ID:* ${orderId}\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city} - ${form.pincode}\n\n*Items:*\n${orderItemsSummary}\n\n*Total Amount:* ${formatPrice(grandTotal)}\n*Payment:* ${paymentMethod === 'payu' ? 'Online (PayU)' : 'Cash on Delivery (COD)'}`
    );

    // WhatsApp message to CUSTOMER
    const customerMsg = encodeURIComponent(
      `Hi ${form.name}! 🎉\n\nThank you for ordering with *Fone Fusion*!\nYour Order ID is *#${orderId}*.\n\n*Order Summary:*\n${orderItemsSummary}\n\n*Total Amount:* ${formatPrice(grandTotal)}\n*Status:* Confirmed (Processing for Dispatch)\n\nFor any queries, reach us here anytime!`
    );

    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed! 🎉</h2>
        <p className="text-sm font-mono text-orange-600 font-bold mb-3">Order ID: #{orderId}</p>
        <p className="text-sm text-gray-500 mb-6">
          Thank you, <strong>{form.name}</strong>! Your order has been registered in the system.
        </p>

        {/* WhatsApp Notification Actions Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp Notifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Send to Store Owner */}
            <a
              href={`https://wa.me/${adminPhone}?text=${storeOwnerMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              📱 Alert Store Owner
            </a>

            {/* Send confirmation to customer's WhatsApp */}
            <a
              href={`https://wa.me/${form.phone.replace(/[^0-9]/g, '')}?text=${customerMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              💬 WhatsApp Receipt
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md shadow-orange-500/20 text-sm"
          >
            Continue Shopping →
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                { name: 'email', label: 'Email (optional)', placeholder: 'you@example.com', type: 'email' },
                { name: 'pincode', label: 'Pincode', placeholder: '123456', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as Record<string, string>)[field.name]}
                    onChange={handleChange}
                    required={field.name !== 'email'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  name="address"
                  placeholder="House/Shop No., Street, Area..."
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  type="text"
                  placeholder="Your City"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {/* PayU Gateway (Primary Online Payment) */}
              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'payu' ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/20' : 'border-gray-200 hover:border-orange-300'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="payu"
                  checked={paymentMethod === 'payu'}
                  onChange={() => setPaymentMethod('payu')}
                  className="mt-0.5 accent-orange-500 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">⚡ Online Payment (UPI, Cards, Net Banking)</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      PayU Secure
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Google Pay, PhonePe, Paytm, All UPI apps, Debit/Credit Cards & Net Banking</p>
                </div>
              </label>

              {/* COD - only shown when admin has enabled it */}
              {(!mounted || codEnabled) && (
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/20' : 'border-gray-200 hover:border-orange-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-orange-500 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">💵 Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500 mt-1">Pay with cash or UPI upon delivery at your doorstep</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-orange-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {paymentMethod === 'payu' ? 'Redirecting to PayU Gateway...' : 'Placing Order...'}
              </span>
            ) : (
              <>
                {paymentMethod === 'payu' ? `Proceed to Pay — ${formatPrice(grandTotal)}` : `Place Order (COD) — ${formatPrice(grandTotal)}`}
              </>
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Order ({items.length} items)</h2>
            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    {formatPrice((product.discount_price ?? product.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
