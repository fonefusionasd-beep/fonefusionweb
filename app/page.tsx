import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Zap, Star } from 'lucide-react';
import { categories, getFeaturedProducts } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';
import HomeCategoriesSection from '@/components/home/HomeCategoriesSection';

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Zap size={14} fill="white" />
                Premium Mobile Accessories
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Protect Your Phone<br />
                <span className="text-orange-200">in Style</span>
              </h1>
              <p className="text-orange-100 text-lg mb-8 max-w-md">
                Covers, chargers, cables, earphones &amp; more — all brands, best prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/products"
                  className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <a
                  href="https://wa.me/919541974000?text=Hello%20Fone%20Fusion!%20I%20am%20interested%20in%20your%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 backdrop-blur text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <div className="text-white font-bold text-xl">500+ Products</div>
                    <div className="text-orange-200 text-sm">All Major Brands</div>
                    <div className="mt-4 flex justify-center gap-2">
                      {['Samsung','Apple','Redmi','Vivo','Oppo'].map((b) => (
                        <span key={b} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Pan India shipping' },
              { icon: Shield, title: 'Genuine Products', desc: '100% authentic' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'WhatsApp support' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{title}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES (DYNAMIC SYNCED WITH ADMIN) ===== */}
      <HomeCategoriesSection />

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-500">Handpicked bestsellers</p>
          </div>
          <Link href="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== BANNER — WhatsApp Order ===== */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-2xl font-bold mb-2">Can&apos;t find what you need?</h3>
          <p className="text-green-100 mb-6">
            Send us a WhatsApp message and we&apos;ll arrange it for you!
          </p>
          <a
            href="https://wa.me/919541974000?text=Hello%20Fone%20Fusion!%20I%20am%20looking%20for..."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ===== BRAND STRIP ===== */}
      <section className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400 font-medium mb-6">COMPATIBLE WITH ALL MAJOR BRANDS</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Samsung', color: 'border-blue-200 text-blue-700 bg-blue-50/50', slug: 'samsung' },
              { name: 'Apple iPhone', color: 'border-gray-200 text-gray-800 bg-gray-50', slug: 'apple' },
              { name: 'Realme', color: 'border-yellow-200 text-yellow-700 bg-yellow-50/50', slug: 'realme' },
              { name: 'Xiaomi / Redmi', color: 'border-orange-200 text-orange-700 bg-orange-50/50', slug: 'redmi' },
              { name: 'Vivo', color: 'border-indigo-200 text-indigo-700 bg-indigo-50/50', slug: 'vivo' },
              { name: 'Oppo', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50', slug: 'oppo' },
            ].map((brand) => (
              <Link
                key={brand.slug}
                href={`/products?brand=${brand.slug}`}
                className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 shadow-sm ${brand.color}`}
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
