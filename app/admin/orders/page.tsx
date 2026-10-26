'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Filter, ShoppingBag, Eye,
  Phone, MapPin, Calendar, CheckCircle2, Clock, Truck, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { useOrderStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatPrice, getWhatsAppLink } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const { orders: storeOrders, updateOrderStatus: storeUpdateStatus } = useOrderStore();
  const [orders, setOrders] = useState<Order[]>(storeOrders);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setOrders(data as Order[]);
      } else {
        setOrders(storeOrders);
      }
    } catch (e) {
      setOrders(storeOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['order_status']) => {
    storeUpdateStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o)));
    try {
      await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    } catch (e) {
      console.warn('Supabase status update error:', e);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_phone.includes(search);
      const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle2 size={12} /> Delivered</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Truck size={12} /> Shipped</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700"><Clock size={12} /> Processing</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: Order['payment_status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, payment_status: newPaymentStatus } : null);
    }
    try {
      await supabase.from('orders').update({ payment_status: newPaymentStatus }).eq('id', orderId);
    } catch (err) {
      console.warn('Supabase update payment status error:', err);
    }
  };

  const getPaymentBadge = (status: Order['payment_status']) => {
    if (status === 'paid') {
      return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">PAID ✓</span>;
    }
    if (status === 'failed') {
      return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">FAILED ✕</span>;
    }
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">COD / PENDING</span>;
  };

  const generateWhatsAppMessage = (order: Order) => {
    const text = `Hi ${order.customer_name}! Your Fone Fusion Order #${order.id} update: Status is currently "${order.order_status.toUpperCase()}". Total: ${formatPrice(order.total_amount)}. Thanks for shopping with us!`;
    return getWhatsAppLink(order.customer_phone, text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            </div>
            <p className="text-sm text-gray-500">View customer orders, tracking IDs, and dispatch status</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              title="Refresh Orders from Cloud"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <span className="text-xs font-semibold px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items Ordered</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-semibold text-gray-900">
                        <div>{order.id}</div>
                        <div className="text-[11px] font-sans text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-gray-400" /> {order.customer_phone}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 max-w-xs">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="truncate">
                            • {i.product_name} <span className="font-semibold text-gray-800">x{i.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{formatPrice(order.total_amount)}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <select
                            value={order.payment_status}
                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as any)}
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                              order.payment_status === 'paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : order.payment_status === 'failed'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="pending">COD / Pending</option>
                            <option value="paid">Paid ✓</option>
                            <option value="failed">Failed ✕</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.order_status)}
                          <select
                            value={order.order_status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <a
                            href={generateWhatsAppMessage(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="WhatsApp Customer"
                          >
                            💬
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Order #{selectedOrder.id}</h3>
                  <p className="text-xs text-gray-400">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer &amp; Shipping</h4>
                  <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1.5">
                    <p className="font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                    <p className="text-gray-600 flex items-center gap-1.5"><Phone size={12} /> {selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && <p className="text-gray-600">✉️ {selectedOrder.customer_email}</p>}
                    <p className="text-gray-600 flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 flex-shrink-0" /> {selectedOrder.customer_address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ordered Items</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-gray-100 text-xs">
                        <div className="flex-1 mr-2">
                          <p className="font-semibold text-gray-800">{it.product_name}</p>
                          <p className="text-gray-400">Qty: {it.quantity} × {formatPrice(it.price)}</p>
                        </div>
                        <span className="font-bold text-gray-900">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block mb-0.5">Payment Status</span>
                    {getPaymentBadge(selectedOrder.payment_status)}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Amount</span>
                    <span className="text-lg font-bold text-orange-600">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <a
                  href={generateWhatsAppMessage(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  💬 Send WhatsApp Update
                </a>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
