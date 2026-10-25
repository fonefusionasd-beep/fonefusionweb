'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, ShoppingBag, MapPin, Phone, Mail,
  LogOut, Clock, CheckCircle2, Truck, AlertCircle, MessageCircle, ExternalLink, ArrowRight, Edit2, Check
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

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profilePincode, setProfilePincode] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [profileError, setProfileError] = useState('');

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

    setProfileName(currentCustomer.name || '');
    setProfilePhone(currentCustomer.phone || '');
    setProfileEmail(currentCustomer.email || '');
    setProfileAddress(currentCustomer.address || '');
    setProfileCity(currentCustomer.city || '');
    setProfilePincode(currentCustomer.pincode || '');

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

  const openEditModal = () => {
    if (!currentCustomer) return;
    setProfileName(currentCustomer.name || '');
    setProfilePhone(currentCustomer.phone || '');
    setProfileEmail(currentCustomer.email || '');
    setProfileAddress(currentCustomer.address || '');
    setProfileCity(currentCustomer.city || '');
    setProfilePincode(currentCustomer.pincode || '');
    setProfileError('');
    setShowProfileModal(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    const cleanPhone = profilePhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setProfileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!profileEmail.includes('@') || !profileEmail.includes('.')) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    await updateProfile({
      name: profileName.trim(),
      phone: cleanPhone,
      email: profileEmail.trim().toLowerCase(),
      address: profileAddress.trim(),
      city: profileCity.trim(),
      pincode: profilePincode.trim(),
    });

    setShowProfileModal(false);
    setSuccessToast('Your profile details have been updated successfully!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleSaveAddress = async () => {
    await updateProfile({
      address: addrText,
      city: cityText,
      pincode: pinText,
    });
    setIsEditingAddress(false);
    setSuccessToast('Delivery address saved!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  if (!currentCustomer) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Toast */}
        {successToast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20 flex-shrink-0">
              {currentCustomer.name ? currentCustomer.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{currentCustomer.name}</h1>
                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                  Member
                </span>
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg font-bold transition-colors ml-1"
                  title="Correct or edit your mobile number, email, or name"
                >
                  <Edit2 size={12} /> Edit Profile
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <Phone size={13} className="text-orange-500" /> {currentCustomer.phone}
                </span>
                {currentCustomer.email && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Mail size={13} className="text-orange-500" /> {currentCustomer.email}
                    </span>
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
              Shop More
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
                      maxLength={6}
                      value={pinText}
                      onChange={(e) => setPinText(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Pincode"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:border-orange-500"
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
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Payment:</span>
                            {order.payment_status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Online (Paid) ✓
                              </span>
                            ) : order.payment_status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                Payment Incomplete / Failed ✕
                              </span>
                            ) : order.payment_method === 'cod' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                Cash on Delivery 📦
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                Payment Pending ⏳
                              </span>
                            )}
                          </div>
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

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Edit Account Details</h3>
                <p className="text-xs text-gray-500">Correct your phone number, email address, or name</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 border-t">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Delivery Address
                </span>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Street / House address"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs mb-2 focus:outline-none focus:border-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={profilePincode}
                    onChange={(e) => setProfilePincode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Pincode"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
