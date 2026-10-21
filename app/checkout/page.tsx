'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle, Tag, MapPin, Sparkles, Check, X, Lock } from 'lucide-react';
import { useCartStore, useSettingsStore, useOrderStore } from '@/lib/store';
import { useCustomerStore } from '@/lib/customerStore';
import { useOffersStore } from '@/lib/offersStore';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Order, Coupon, PincodeOffer } from '@/types';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { codEnabled, payuEnabled, payuEnv, payuKey } = useSettingsStore();
  const { addOrder } = useOrderStore();
  const { currentCustomer, registerOrUpdate } = useCustomerStore();
  const { checkPincode, validateCoupon, fetchOffers } = useOffersStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    password: '',
  });

  const [createAccount, setCreateAccount] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'payu' | 'cod'>('payu');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);

  // Offers & Coupons State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [pincodeOffer, setPincodeOffer] = useState<PincodeOffer | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchOffers();

    // Auto-fill form if customer is logged in
    if (currentCustomer) {
      setForm((prev) => ({
        ...prev,
        name: currentCustomer.name || prev.name,
        phone: currentCustomer.phone || prev.phone,
        email: currentCustomer.email || prev.email,
        address: currentCustomer.address || prev.address,
        city: currentCustomer.city || prev.city,
        pincode: currentCustomer.pincode || prev.pincode,
      }));
    }
  }, [currentCustomer, fetchOffers]);

  // Check pincode offer whenever pincode or total price changes
  useEffect(() => {
    if (form.pincode && form.pincode.length >= 6) {
      const match = checkPincode(form.pincode, totalPrice());
      setPincodeOffer(match);
    } else {
      setPincodeOffer(null);
    }
  }, [form.pincode, totalPrice, checkPincode]);

  // Shipping calculation: Free if order >= 499 OR if pincode offer applies OR if coupon is free_shipping
  const isPincodeFreeShipping = pincodeOffer?.offer_type === 'free_delivery';
  const isCouponFreeShipping = appliedCoupon?.discount_type === 'free_shipping';
  const baseShipping = totalPrice() >= 499 || isPincodeFreeShipping || isCouponFreeShipping ? 0 : 49;

  const grandTotal = Math.max(0, totalPrice() + baseShipping - couponDiscount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    if (!couponCodeInput.trim()) return;

    const res = validateCoupon(couponCodeInput, totalPrice());
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save/Update Customer Account if requested or already logged in
    if (createAccount || currentCustomer) {
      try {
        await registerOrUpdate({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
          password: form.password.trim() || undefined,
        });
      } catch (e) {
        console.error('Account creation error:', e);
      }
    }

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

    // Save to Supabase Cloud Database asynchronously
    try {
      await supabase.from('orders').insert([
        {
          id: newOrder.id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email || null,
          customer_address: newOrder.customer_address,
          items: newOrder.items,
          total_amount: newOrder.total_amount,
          payment_status: newOrder.payment_status,
          order_status: newOrder.order_status,
          created_at: newOrder.created_at,
        },
      ]);
    } catch (dbErr) {
      console.warn('Supabase order insert note:', dbErr);
    }

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

    // Auto-open WhatsApp message to Store Owner (+91 95419 74000)
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

    const storeOwnerMsg = encodeURIComponent(
      `🔔 *NEW ORDER RECEIVED!*\n\n*Order ID:* ${orderId}\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city} - ${form.pincode}\n\n*Items:*\n${orderItemsSummary}\n\n*Total Amount:* ${formatPrice(grandTotal)}\n*Payment:* ${paymentMethod === 'payu' ? 'Online (PayU)' : 'Cash on Delivery (COD)'}`
    );

    const customerMsg = encodeURIComponent(
      `Hi ${form.name}! 🎉\n\nThank you for ordering with *Fone Fusion*!\nYour Order ID is *#${orderId}*.\n\n*Order Summary:*\n${orderItemsSummary}\n\n*Total Amount:* ${formatPrice(grandTotal)}\n*Status:* Confirmed (Processing for Dispatch)\n\nTrack your order anytime: https://fone-fusion-six.vercel.app/account`
    );

    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed! 🎉</h2>
        <p className="text-sm font-mono text-orange-600 font-bold mb-3">Order ID: #{orderId}</p>
        <p className="text-sm text-gray-500 mb-6">
          Thank you, <strong>{form.name}</strong>! Your order has been placed successfully.
        </p>

        {/* WhatsApp Notification Actions Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp Notifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${adminPhone}?text=${storeOwnerMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              📱 Alert Store Owner
            </a>

            <a
              href={`https://wa.me/${form.phone.replace(/[^0-9]/g, '')}?text=${customerMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors"
            >
              🧾 Send Receipt on WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md"
          >
            Track in My Account
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        {currentCustomer ? (
          <div className="text-xs text-gray-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Logged in as <strong>{currentCustomer.name}</strong></span>
          </div>
        ) : (
          <Link href="/account/login" className="text-xs text-orange-600 font-bold hover:underline">
            Already have an account? Sign in
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Pincode *</label>
                <input
                  name="pincode"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 132039"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              {/* Dynamic Pincode Offer Highlight Banner */}
              {pincodeOffer && (
                <div className="sm:col-span-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-sm">
                  <MapPin size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">🎉 Special Offer for {pincodeOffer.city} ({pincodeOffer.pincode}):</strong>
                    <span className="block text-emerald-700 mt-0.5">
                      {pincodeOffer.note || 'You have unlocked FREE Doorstep Delivery on this order!'}
                    </span>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Street Address *</label>
                <textarea
                  name="address"
                  placeholder="House/Shop No., Chowk, Road, Landmark..."
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
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

            {/* Account Creation Option for New Customers */}
            {!currentCustomer && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Create a free account to track this order &amp; receive exclusive VIP offers
                  </span>
                </label>

                {createAccount && (
                  <div className="mt-3 max-w-sm">
                    <label className="block text-xs text-gray-600 mb-1">Set Account Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Choose a password (e.g. 123456)"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-400"
                      />
                      <Lock size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {/* PayU Gateway */}
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
                  <p className="text-xs text-gray-500 mt-1">Google Pay, PhonePe, Paytm, All UPI apps, Debit/Credit Cards &amp; Net Banking</p>
                </div>
              </label>

              {/* COD */}
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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all text-base sm:text-lg shadow-lg shadow-orange-500/20 active:scale-98"
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

        {/* Order summary & Coupon Input */}
        <div className="lg:w-88 flex-shrink-0 space-y-4">
          
          {/* Coupon Code Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Tag size={16} className="text-orange-500" /> Have a Promo / Coupon Code?
            </h3>

            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME50"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs font-medium ${couponMsg.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-emerald-800">
                    ✓ {appliedCoupon.code} Applied
                  </span>
                  <span className="block text-[11px] text-emerald-600">
                    Saved {formatPrice(couponDiscount)} on this order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg"
                  title="Remove coupon"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Order ({items.length} items)</h2>
            
            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">
                    {formatPrice((product.discount_price ?? product.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Doorstep Shipping</span>
                <span className={baseShipping === 0 ? 'text-emerald-600 font-bold' : ''}>
                  {baseShipping === 0 ? 'FREE' : formatPrice(baseShipping)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-base border-t pt-3">
                <span>Total Amount</span>
                <span className="text-orange-600 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
