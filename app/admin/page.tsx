'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Smartphone,
  TrendingUp, Clock, CheckCircle, AlertCircle, LogOut, Menu, X,
  MessageCircle, Settings, Eye, EyeOff, CreditCard, Save, CheckCheck
} from 'lucide-react';
import { products, categories } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { useSettingsStore } from '@/lib/store';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories & Photos', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

// Mock stats
const stats = {
  totalRevenue: 45280,
  totalOrders: 38,
  pendingOrders: 7,
  totalProducts: products.length,
};

const recentOrders = [
  { id: 'ORD-001', customer: 'Rahul Sharma', amount: 649, status: 'delivered', items: 2, time: '2h ago' },
  { id: 'ORD-002', customer: 'Priya Singh', amount: 1299, status: 'shipped', items: 1, time: '4h ago' },
  { id: 'ORD-003', customer: 'Amit Kumar', amount: 447, status: 'pending', items: 3, time: '5h ago' },
  { id: 'ORD-004', customer: 'Sneha Patel', amount: 199, status: 'processing', items: 1, time: '8h ago' },
  { id: 'ORD-005', customer: 'Vikram Rao', amount: 2398, status: 'pending', items: 2, time: '1d ago' },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  pending:    { label: 'Pending',    class: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', class: 'bg-blue-100 text-blue-700' },
  shipped:    { label: 'Shipped',    class: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Delivered',  class: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelled',  class: 'bg-red-100 text-red-700' },
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    whatsappEnabled, setWhatsappEnabled,
    codEnabled, setCodEnabled,
    payuEnabled, setPayuEnabled,
    payuKey, setPayuKey,
    payuSalt, setPayuSalt,
    payuEnv, setPayuEnv,
  } = useSettingsStore();
  const [payuSaved, setPayuSaved] = useState(false);
  const [showSalt, setShowSalt] = useState(false);

  const savePayu = () => {
    setPayuSaved(true);
    setTimeout(() => setPayuSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">
              <span className="text-orange-400">Fone</span> Fusion
            </div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm font-medium transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem('fone_fusion_admin_token');
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-sm w-full transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xs">A</span>
            </div>
            Admin
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-green-500', bg: 'bg-green-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/products" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <p className="font-bold">Manage Products</p>
                <p className="text-orange-100 text-sm">Add, edit, delete</p>
              </div>
            </Link>
            <Link href="/admin/orders" className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-bold">View Orders</p>
                <p className="text-gray-400 text-sm">{stats.pendingOrders} pending</p>
              </div>
            </Link>
          </div>

          {/* ── Site Settings ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-orange-500" />
              <h2 className="font-bold text-gray-900">Site Settings</h2>
            </div>

            {/* WhatsApp Toggle Row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${whatsappEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <MessageCircle size={18} className={whatsappEnabled ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">WhatsApp Floating Button</p>
                  <p className="text-xs text-gray-400">Website par green WhatsApp icon dikhaye</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${whatsappEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${whatsappEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* COD Toggle Row */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${codEnabled ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <span className={`text-base font-bold ${codEnabled ? 'text-orange-600' : 'text-gray-400'}`}>₹</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-400">Checkout mein COD payment option dikhaye</p>
                </div>
              </div>
              <button
                onClick={() => setCodEnabled(!codEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${codEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${codEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Status summary */}
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-400">{whatsappEnabled ? '✅ WhatsApp button: visible' : '⛔ WhatsApp button: hidden'}</p>
              <p className="text-xs text-gray-400">{codEnabled ? '✅ COD: checkout mein enabled' : '⛔ COD: checkout mein disabled'}</p>
              <p className="text-xs text-gray-400">{payuEnabled ? `✅ PayU Gateway: Active (${payuEnv.toUpperCase()})` : '⛔ PayU Gateway: Disabled'}</p>
            </div>
          </div>

          {/* ── PayU Payment Gateway Config ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">PayU Payment Gateway</h2>
                  <p className="text-xs text-gray-400">Manage online payments (UPI, Cards, Net Banking)</p>
                </div>
              </div>
              {/* Enable / Disable Switch */}
              <button
                type="button"
                onClick={() => setPayuEnabled(!payuEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${payuEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${payuEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* PayU Form Fields */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Environment Mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Environment Mode</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayuEnv('test')}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${payuEnv === 'test' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      🧪 Test / Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayuEnv('live')}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${payuEnv === 'live' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      🚀 Live / Production
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {payuEnv === 'test' ? 'Uses test.payu.in for demo payments' : 'Processes real money via secure.payu.in'}
                  </p>
                </div>

                {/* Merchant Key */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Merchant Key</label>
                  <input
                    type="text"
                    placeholder="Enter PayU Merchant Key..."
                    value={payuKey}
                    onChange={(e) => setPayuKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Found in your PayU Dashboard &gt; Integration Details</p>
                </div>
              </div>

              {/* Merchant Salt */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Merchant Salt</label>
                <div className="relative">
                  <input
                    type={showSalt ? 'text' : 'password'}
                    placeholder="Enter PayU Merchant Salt..."
                    value={payuSalt}
                    onChange={(e) => setPayuSalt(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-3.5 pr-10 py-2 text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSalt(!showSalt)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSalt ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Used for cryptographic SHA512 security hash generation</p>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">
                  {payuEnabled ? (payuKey && payuSalt ? '🟢 Ready to accept payments' : '⚠️ Enter Key & Salt to activate') : '⚪ Gateway is currently paused'}
                </span>
                <button
                  type="button"
                  onClick={savePayu}
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  {payuSaved ? (
                    <>
                      <CheckCheck size={14} className="text-emerald-400" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Config
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.id} · {order.items} item(s) · {order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(order.amount)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[order.status]?.class}`}>
                      {statusConfig[order.status]?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
