'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, ShoppingBag, MapPin, Phone, Mail,
  LogOut, Clock, CheckCircle2, Truck, AlertCircle, MessageCircle, ExternalLink, ArrowRight
} from 'lucide-react';
import { useCustomerStore } from '@/lib/customerStore';
import { useOrderStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pending:    { label: 'Order Confirmed', class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  processing: { label: 'Packaging',       class: 'bg-blue-100 text-blue-800 border-blue-200',     icon: Package },
  shipped:    { label: 'Shipped / Out',   class: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  delivered:  { label: 'Delivered',       class: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',       class: 'bg-red-100 text-red-800 border-red-200',         icon: AlertCircle },
};

export default function CustomerAccountPage() {
  const router = useRouter();
  const { currentCustomer, logout, updateProfile } = useCustomerStore();
  const { orders: localOrders } = useOrderStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addrText, setAddrText] = useState('');
  const [cityText, setCityText] = useState('');
  const [pinText, setPinText] = useState('');

  // Check login
  useEffect(() => {
    if (!currentCustomer) {
      router.replace('/account/login');
      return;
    }
    setAddrText(currentCustomer.address || '');
    setCityText(currentCustomer.city || '');
    setPinText(currentCustomer.pincode || '');

    // Fetch customer's orders from Supabase (by phone number)
    const fetchCustomerOrders = async () => {
      setLoadingOrders(true);
      const cleanPhone = currentCustomer.phone.replace(/[^0-9]/g, '');

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Filter matching customer's phone or email
          const matching = data.filter((o: Order) => {
            const oPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
            return (
              (cleanPhone && oPhone.includes(cleanPhone.slice(-10))) ||
              (currentCustomer.email && o.customer_email?.toLowerCase() === currentCustomer.email.toLowerCase())
            );
          });
          setOrders(matching.length > 0 ? matching : localOrders.slice(0, 3));
        } else {
          setOrders(localOrders.slice(0, 2));
        }
      } catch (err) {
        setOrders(localOrders.slice(0, 2));
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchCustomerOrders();
  }, [currentCustomer, router, localOrders]);

  const handleSaveAddress = () => {
    updateProfile({
      address: addrText,
      city: cityText,
      pincode: pinText,
    });
    setIsEditingAddress(false);
  };

  if (!currentCustomer) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
              {currentCustomer.name ? currentCustomer.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{currentCustomer.name}</h1>
                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                  Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Phone size={13} className="text-orange-500" /> {currentCustomer.phone}
                {currentCustomer.email && (
                  <>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <Mail size={13} className="text-orange-500" /> {currentCustomer.email}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Saved Address & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" /> Default Delivery Address
                </h3>
                {!isEditingAddress ? (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSaveAddress}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Save
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                <div className="text-xs text-gray-600 leading-relaxed">
                  {currentCustomer.address ? (
                    <>
                      <p className="font-semibold text-gray-800">{currentCustomer.address}</p>
                      <p>{currentCustomer.city || ''} {currentCustomer.pincode ? `- ${currentCustomer.pincode}` : ''}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No address saved yet. Click edit to add delivery address for faster checkout.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={addrText}
                    onChange={(e) => setAddrText(e.target.value)}
                    placeholder="House/Street address"
                    className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-orange-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cityText}
                      onChange={(e) => setCityText(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={pinText}
                      onChange={(e) => setPinText(e.target.value)}
                      placeholder="Pincode"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Support Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm mb-1">Need help with an order?</h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Connect directly with our store support on WhatsApp or phone call.
              </p>
              <a
                href="https://wa.me/919541974000?text=Hello%20Fone%20Fusion%20Support!%20I%20have%20a%20question%20about%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                <MessageCircle size={15} /> WhatsApp Support
              </a>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Order History</h2>
                  <p className="text-xs text-gray-500">Track current orders &amp; previous purchases</p>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-bold text-gray-800">No orders placed yet</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Explore our cases, chargers &amp; cables collection!</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    Start Shopping <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusConfig[order.order_status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-orange-200 transition-all shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div>
                            <span className="font-mono font-bold text-sm text-gray-900">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-2">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${status.class}`}>
                            <StatusIcon size={13} />
                            {status.label}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="py-3.5 space-y-2.5">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg p-1 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.product_image || '/categories/covers.svg'}
                                    alt={item.product_name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-800 line-clamp-1">{item.product_name}</span>
                                  <span className="text-gray-400 text-[11px]">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                          <span className="text-gray-500">
                            Payment:{' '}
                            <strong className="text-gray-700 capitalize">
                              {order.payment_status === 'paid' ? 'Online (Paid)' : 'Cash on Delivery'}
                            </strong>
                          </span>
                          <div className="text-right">
                            <span className="text-gray-400 text-[11px] mr-1.5">Total:</span>
                            <span className="text-base font-extrabold text-orange-600">
                              {formatPrice(order.total_amount)}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
