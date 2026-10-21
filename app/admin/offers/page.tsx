'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Edit2, Trash2, Check, Tag, MapPin, Users,
  Percent, Gift, Search, MessageCircle, Star, Phone, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { Coupon, PincodeOffer, Order } from '@/types';
import { useOffersStore } from '@/lib/offersStore';
import { useCustomerStore } from '@/lib/customerStore';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

export default function AdminOffersPage() {
  const {
    coupons, addCoupon, updateCoupon, deleteCoupon,
    pincodeOffers, addPincodeOffer, updatePincodeOffer, deletePincodeOffer,
    fetchOffers
  } = useOffersStore();
  const { adminUpdateCustomer } = useCustomerStore();

  const [activeTab, setActiveTab] = useState<'coupons' | 'pincodes' | 'customers'>('coupons');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [editingPincode, setEditingPincode] = useState<PincodeOffer | null>(null);

  // Edit Customer Modal State (Admin Fix wrong number / email)
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustPhone, setSelectedCustPhone] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Coupon Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<Coupon['discount_type']>('flat');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [minOrder, setMinOrder] = useState<number>(299);
  const [description, setDescription] = useState('');
  const [isCouponActive, setIsCouponActive] = useState(true);

  // Pincode Form State
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [pincodeOfferType, setPincodeOfferType] = useState<PincodeOffer['offer_type']>('free_delivery');
  const [pincodeMinOrder, setPincodeMinOrder] = useState<number>(0);
  const [pincodeNote, setPincodeNote] = useState('');
  const [isPincodeActive, setIsPincodeActive] = useState(true);

  // Customers CRM State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    fetchOffers();
    loadOrdersForCRM();
  }, [fetchOffers]);

  const loadOrdersForCRM = async () => {
    setLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomerOrders(data as Order[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Group orders by customer phone to find Best Customers
  const customerSummaryList = (() => {
    const map = new Map<string, {
      phone: string;
      name: string;
      email?: string;
      address?: string;
      ordersCount: number;
      totalSpent: number;
      lastOrderDate: string;
    }>();

    customerOrders.forEach((o) => {
      const phone = (o.customer_phone || '').trim();
      if (!phone) return;

      const existing = map.get(phone);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += Number(o.total_amount) || 0;
        if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.created_at;
          existing.address = o.customer_address;
        }
      } else {
        map.set(phone, {
          phone,
          name: o.customer_name || 'Customer',
          email: o.customer_email,
          address: o.customer_address,
          ordersCount: 1,
          totalSpent: Number(o.total_amount) || 0,
          lastOrderDate: o.created_at,
        });
      }
    });

    const list = Array.from(map.values());
    // Sort descending by total spend
    list.sort((a, b) => b.totalSpent - a.totalSpent);
    return list;
  })();

  const filteredCustomers = customerSummaryList.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    (c.address && c.address.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Coupon Handlers
  const openCouponCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('flat');
    setDiscountValue(50);
    setMinOrder(299);
    setDescription('');
    setIsCouponActive(true);
    setShowCouponModal(true);
  };

  const openCouponEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(c.discount_value);
    setMinOrder(c.min_order_amount);
    setDescription(c.description || '');
    setIsCouponActive(c.is_active);
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (editingCoupon) {
      await updateCoupon({
        id: editingCoupon.id,
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder),
        description,
        is_active: isCouponActive,
      });
      setSuccessMsg('Coupon updated successfully!');
    } else {
      await addCoupon({
        id: 'coup_' + Date.now(),
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder),
        description,
        is_active: isCouponActive,
      });
      setSuccessMsg('New coupon created successfully!');
    }
    setShowCouponModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Pincode Handlers
  const openPincodeCreate = () => {
    setEditingPincode(null);
    setPincode('');
    setCity('');
    setPincodeOfferType('free_delivery');
    setPincodeMinOrder(0);
    setPincodeNote('Free local doorstep delivery');
    setIsPincodeActive(true);
    setShowPincodeModal(true);
  };

  const openPincodeEdit = (p: PincodeOffer) => {
    setEditingPincode(p);
    setPincode(p.pincode);
    setCity(p.city);
    setPincodeOfferType(p.offer_type);
    setPincodeMinOrder(p.min_order);
    setPincodeNote(p.note || '');
    setIsPincodeActive(p.is_active);
    setShowPincodeModal(true);
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;

    if (editingPincode) {
      await updatePincodeOffer({
        id: editingPincode.id,
        pincode: pincode.trim(),
        city: city.trim(),
        offer_type: pincodeOfferType,
        min_order: Number(pincodeMinOrder),
        note: pincodeNote,
        is_active: isPincodeActive,
      });
      setSuccessMsg('Pincode rule updated successfully!');
    } else {
      await addPincodeOffer({
        id: 'pin_' + Date.now(),
        pincode: pincode.trim(),
        city: city.trim(),
        offer_type: pincodeOfferType,
        min_order: Number(pincodeMinOrder),
        note: pincodeNote,
        is_active: isPincodeActive,
      });
      setSuccessMsg('New pincode delivery rule added!');
    }
    setShowPincodeModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openEditCustomer = (cust: { phone: string; name: string; email?: string; address?: string }) => {
    setSelectedCustPhone(cust.phone);
    setCustName(cust.name || '');
    setCustPhone(cust.phone || '');
    setCustEmail(cust.email || '');
    setCustAddress(cust.address || '');
    setShowCustomerModal(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPhone.trim()) return;

    const res = await adminUpdateCustomer(selectedCustPhone, {
      name: custName.trim(),
      phone: custPhone.trim(),
      email: custEmail.trim().toLowerCase(),
      address: custAddress.trim(),
    });

    if (res.success) {
      setSuccessMsg('Customer details updated and synced with previous orders!');
      setShowCustomerModal(false);
      loadOrdersForCRM();
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Offers, Coupons &amp; Best Customers</h1>
            </div>
            <p className="text-xs text-gray-500">Manage promo codes, pincode-based free delivery, and customer loyalty rewards</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'coupons' && (
            <button
              onClick={openCouponCreate}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <Plus size={16} /> Create Coupon
            </button>
          )}
          {activeTab === 'pincodes' && (
            <button
              onClick={openPincodeCreate}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <Plus size={16} /> Add Pincode Rule
            </button>
          )}
        </div>
      </header>

      {/* Success Notification */}
      {successMsg && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 shadow-sm">
            <Check size={18} className="text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-xl mb-8">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'coupons'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag size={15} /> Promo Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('pincodes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pincodes'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin size={15} /> Pincode Offers ({pincodeOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'customers'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={15} /> Best Customers ({customerSummaryList.length})
          </button>
        </div>

        {/* ─── TAB 1: COUPONS ─── */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative overflow-hidden ${
                    coupon.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-base font-black px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl tracking-wider">
                      {coupon.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                      {coupon.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-gray-900 mb-1">
                    {coupon.discount_type === 'flat' && `Flat ₹${coupon.discount_value} OFF`}
                    {coupon.discount_type === 'percentage' && `${coupon.discount_value}% OFF`}
                    {coupon.discount_type === 'free_shipping' && 'FREE Delivery'}
                  </div>

                  <p className="text-xs text-gray-500 mb-4 min-h-[32px]">
                    {coupon.description || `Applicable on orders above ₹${coupon.min_order_amount}`}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-400">
                    <span>Min Order: <strong className="text-gray-700">₹{coupon.min_order_amount}</strong></span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openCouponEdit(coupon)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon "${coupon.code}"?`)) deleteCoupon(coupon.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 2: PINCODE OFFERS ─── */}
        {activeTab === 'pincodes' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                  <MapPin size={16} /> Smart Pincode-Based Delivery Rules
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                  Jab bhi customer checkout form mein target pincode (jaise aapka local area <strong>132039</strong>) enter karega, website automatically <strong>Free Delivery</strong> activate kar degi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pincodeOffers.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                    p.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {p.pincode}
                      </span>
                      <span className="text-xs font-bold text-gray-600">{p.city}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                      {p.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                    <Check size={15} /> Free Doorstep Delivery
                  </div>

                  <p className="text-xs text-gray-500 mb-4">{p.note || 'Free express local delivery'}</p>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-400">
                    <span>Min Order: <strong className="text-gray-700">{p.min_order === 0 ? 'Any Order' : `₹${p.min_order}`}</strong></span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPincodeEdit(p)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete rule for pincode ${p.pincode}?`)) deletePincodeOffer(p.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: BEST CUSTOMERS (LOYALTY CRM) ─── */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            {/* Search & Refresh */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customer by name, phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-orange-500"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadOrdersForCRM}
                  disabled={loadingCustomers}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-semibold transition-colors"
                >
                  <RefreshCw size={13} className={loadingCustomers ? 'animate-spin' : ''} /> Refresh CRM
                </button>
              </div>
            </div>

            {/* Customers Table / Cards */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Top Loyal Customers</h3>
                <p className="text-xs text-gray-500">Customers sorted by highest spending and order volume. You can send them exclusive WhatsApp offers.</p>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400">
                  No customers found matching search.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCustomers.map((cust, idx) => {
                    const isVIP = cust.ordersCount >= 2 || cust.totalSpent >= 800;
                    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');

                    // Pre-filled WhatsApp promo message for this customer
                    const waText = encodeURIComponent(
                      `Hello ${cust.name}! 🌟 Thank you for being a valued customer at Fone Fusion. As a special gift, here is an exclusive 15% OFF coupon for your next order: *VIP15*\n\nOrder here: https://fone-fusion-six.vercel.app`
                    );

                    return (
                      <div key={cust.phone} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 shadow-sm'
                              : 'bg-orange-50 text-orange-600'
                          }`}>
                            {idx === 0 ? '👑' : cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-sm">{cust.name}</h4>
                              {isVIP && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                  <Star size={10} className="fill-amber-500 text-amber-500" /> TOP VIP
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{cust.phone} {cust.email ? `• ${cust.email}` : ''}</p>
                            {cust.address && (
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{cust.address}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Spent</span>
                            <span className="text-base font-extrabold text-orange-600">
                              {formatPrice(cust.totalSpent)}
                            </span>
                          </div>

                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-gray-400 block uppercase font-bold">Orders</span>
                            <span className="text-sm font-bold text-gray-800">
                              {cust.ordersCount} {cust.ordersCount === 1 ? 'order' : 'orders'}
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm"
                            title="Send exclusive offer on WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>Send Offer</span>
                          </a>

                          <button
                            onClick={() => openEditCustomer(cust)}
                            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                            title="Correct or edit customer phone, email, or name"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL: CREATE / EDIT COUPON ── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingCoupon ? 'Edit Coupon Code' : 'Create New Promo Coupon'}
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50, DIWALI100"
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="flat">Flat ₹ Off</option>
                    <option value="percentage">% Percentage Off</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Amount *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  placeholder="e.g. 299"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Shown to user)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flat ₹50 OFF on mobile accessories"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="activeCoup"
                  checked={isCouponActive}
                  onChange={(e) => setIsCouponActive(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="activeCoup" className="text-xs font-semibold text-gray-800">
                  Enable coupon for checkout immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT PINCODE RULE ── */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingPincode ? 'Edit Pincode Rule' : 'Add New Pincode Delivery Rule'}
              </h3>
              <button onClick={() => setShowPincodeModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 132039"
                    className="w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Assandh (Karnal)"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Order for Free Delivery (₹)</label>
                <input
                  type="number"
                  value={pincodeMinOrder}
                  onChange={(e) => setPincodeMinOrder(Number(e.target.value))}
                  placeholder="0 for any order"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
                <span className="text-[11px] text-gray-400">Put 0 if free delivery applies on all orders in this pincode</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notification Note</label>
                <input
                  type="text"
                  value={pincodeNote}
                  onChange={(e) => setPincodeNote(e.target.value)}
                  placeholder="e.g. Free express local delivery for Assandh"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="activePin"
                  checked={isPincodeActive}
                  onChange={(e) => setIsPincodeActive(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="activePin" className="text-xs font-semibold text-gray-800">
                  Activate this delivery rule immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPincodeModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                >
                  {editingPincode ? 'Save Changes' : 'Add Pincode Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT CUSTOMER DETAILS (ADMIN OVERRIDE) ── */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Edit Customer Details</h3>
                <p className="text-xs text-gray-500">Correct typo in phone number, email address, or name</p>
              </div>
              <button onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (Correct Typo / Wrong Number) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none focus:border-orange-500"
                />
                <span className="text-[11px] text-gray-400">Updating this will automatically sync all previous orders for this customer</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="House/Street address..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                >
                  Save Changes &amp; Sync Orders
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
