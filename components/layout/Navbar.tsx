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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-orange-500">Fone</span>
                <span className="text-gray-900"> Fusion</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-700 hover:text-orange-500">Home</Link>
              <Link href="/products" className="text-gray-700 hover:text-orange-500">All Products</Link>
              <Link href="/products?category=covers" className="text-gray-700 hover:text-orange-500">Covers</Link>
              <Link href="/products?category=chargers" className="text-gray-700 hover:text-orange-500">Chargers</Link>
              <Link href="/products?category=earphones" className="text-gray-700 hover:text-orange-500">Earphones</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-orange-500"
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
