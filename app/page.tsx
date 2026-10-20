import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Zap, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { categories, getFeaturedProducts } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';
import HomeCategoriesSection from '@/components/home/HomeCategoriesSection';

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className="bg-white">
      {/* ===== HERO — Modern Flagship Glassmorphism ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-16 lg:py-24">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-300 mb-6 shadow-inner">
                <Sparkles size={14} className="text-orange-400" />
                <span>Next-Gen Mobile Gear &amp; Tough Cases</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                Precision Fit.<br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Ultimate Defense.
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Engineered for iPhone, Samsung Galaxy, Vivo, OnePlus &amp; more. Military-grade drop shockproof covers, 65W GaN fast chargers &amp; crystal-clear protection.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 text-sm"
                >
                  Explore Collection <ArrowRight size={16} />
                </Link>
                <Link
                  href="/products?category=covers"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 text-sm"
                >
                  Find Covers for Your Phone
                </Link>
              </div>

              {/* Trust badges strip */}
              <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white">500+</div>
                  <div className="text-xs text-gray-400">Models Supported</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white">100%</div>
                  <div className="text-xs text-gray-400">Tested Quality</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white">4.9 ★</div>
                  <div className="text-xs text-gray-400">Customer Rating</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Banner */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Glowing header badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                      Bestseller Showcase
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> In Stock
                    </span>
                  </div>

                  {/* Visual 3D Card */}
                  <div className="relative h-60 w-full flex items-center justify-center bg-gradient-to-b from-gray-900/60 to-black/60 rounded-2xl p-4 mb-5 border border-white/5">
                    <Image
                      src="/categories/covers.svg"
                      alt="Featured Phone Case"
                      width={180}
                      height={180}
                      className="object-contain drop-shadow-[0_15px_30px_rgba(255,107,0,0.35)] hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product quick info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Liquid Armor Pro Case</h3>
                      <p className="text-xs text-gray-400">iPhone 15 &amp; S24 Series</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-orange-400">₹199</div>
                      <div className="text-[11px] text-gray-500 line-through">₹299</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== VALUE PROPOSITIONS (LUXURY STYLE) ===== */}
      <section className="border-b border-gray-100 bg-gray-50/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Express Delivery', desc: 'Fast, secure doorstep shipping' },
              { icon: ShieldCheck, title: 'Precision Molding', desc: 'Accurate cutouts for each model' },
              { icon: RefreshCw, title: 'Hassle-free Returns', desc: 'Easy 7-day replacement support' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Call or WhatsApp +91 95419 74000' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-100">
                  <Icon size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{title}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <HomeCategoriesSection />

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Curated Bestsellers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Featured Gear &amp; Accessories</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Handpicked accessories chosen for build quality, durability, and customer satisfaction</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl transition-all"
          >
            Browse All Catalog <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ===== HIGH-CONVERTING HERO PROMO BANNER ===== */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-950 to-orange-950 p-8 sm:p-12 text-white border border-gray-800 shadow-2xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-300 uppercase tracking-wider mb-4">
              Need Help Finding Your Exact Case?
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Search by Exact Phone Model
            </h3>
            <p className="text-gray-300 text-sm sm:text-base mb-6 leading-relaxed">
              Whether you carry an iPhone 15 Pro Max, Samsung S24 Ultra, Vivo V30, OnePlus, or Redmi Note — we stock custom precision covers for hundreds of models.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md shadow-orange-500/25 text-sm"
              >
                Search Your Phone Model <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?category=chargers"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
              >
                Fast Chargers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BRAND COMPATIBILITY CAROUSEL STRIP ===== */}
      <section className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
            Official Compatibility Across Major Smartphone Brands
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              { name: 'Apple iPhone', slug: 'apple', badge: '100% Fit Guaranteed' },
              { name: 'Samsung Galaxy', slug: 'samsung', badge: 'Ultra & A Series' },
              { name: 'OnePlus', slug: 'oneplus', badge: 'Flagships & Nord' },
              { name: 'Vivo', slug: 'vivo', badge: 'V & T Series' },
              { name: 'Xiaomi / Redmi', slug: 'redmi', badge: 'Note & Series' },
              { name: 'Realme', slug: 'realme', badge: 'Pro & Narzo' },
            ].map((brand) => (
              <Link
                key={brand.slug}
                href={`/products?brand=${brand.slug}`}
                className="group flex flex-col p-4 bg-gray-50/70 hover:bg-orange-50/50 border border-gray-100 hover:border-orange-200 rounded-2xl transition-all duration-200 text-center min-w-[150px] shadow-sm hover:-translate-y-0.5"
              >
                <span className="font-extrabold text-sm text-gray-800 group-hover:text-orange-600 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-orange-400 transition-colors mt-0.5">
                  {brand.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
