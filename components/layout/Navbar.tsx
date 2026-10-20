'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Phone, Zap } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-orange-600 text-white text-xs py-1.5 text-center tracking-wide">
        <span className="flex items-center justify-center gap-2">
          <Phone size={12} />
          Free delivery on orders above ₹499 &nbsp;|&nbsp; Support: +91 95419 74000
        </span>
      </div>

      {/* Main navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-17">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
                <Zap size={19} className="text-white" fill="white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight leading-none">
                  <span className="text-orange-500">Fone</span>
                  <span className="text-gray-900"> Fusion</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 -mt-0.5">
                  Premium Gear
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
              <Link href="/" className="px-3.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-white transition-all">Home</Link>
              <Link href="/products" className="px-3.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-white transition-all">All Products</Link>
              <Link href="/products?category=covers" className="px-3.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-white transition-all">Covers</Link>
              <Link href="/products?category=chargers" className="px-3.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-white transition-all">Chargers</Link>
              <Link href="/products?category=earphones" className="px-3.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-white transition-all">Earphones</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl border border-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-95"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                {mounted && totalItems > 0 && (
                  <span className="bg-white text-orange-600 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu */}
              <button
                className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-500 border border-gray-100 rounded-xl"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-orange-500 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3 text-sm font-medium">
            {[
              ['/', 'Home'],
              ['/products', 'All Products'],
              ['/products?category=covers', 'Covers & Cases'],
              ['/products?category=chargers', 'Chargers'],
              ['/products?category=cables', 'Cables'],
              ['/products?category=earphones', 'Earphones'],
              ['/products?category=screen-guards', 'Screen Guards'],
              ['/products?category=holders', 'Holders & Stands'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block py-2 text-gray-700 hover:text-orange-500 border-b border-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
