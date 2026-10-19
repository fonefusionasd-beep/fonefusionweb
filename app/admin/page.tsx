'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Smartphone,
  TrendingUp, Clock, CheckCircle, AlertCircle, LogOut, Menu, X,
  MessageCircle, Settings
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
  const { whatsappEnabled, setWhatsappEnabled, codEnabled, setCodEnabled } = useSettingsStore();

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
