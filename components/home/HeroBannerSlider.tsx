'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Tag, ArrowUpRight } from 'lucide-react';
import { HeroBanner } from '@/types';
import { defaultBanners } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export default function HeroBannerSlider() {
  const [banners, setBanners] = useState<HeroBanner[]>(defaultBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from Supabase site_settings, with localStorage fallback
  useEffect(() => {
    // 1. First try localStorage for instant render
    const cached = localStorage.getItem('fone_fusion_hero_banners');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed.filter((b: HeroBanner) => b.is_active));
        }
      } catch (err) {
        console.error('Error loading cached banners', err);
      }
    }

    // 2. Fetch latest live banners from Supabase
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_banners')
          .single();

        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          const activeBanners = data.value.filter((b: HeroBanner) => b.is_active);
          if (activeBanners.length > 0) {
            setBanners(activeBanners);
            localStorage.setItem('fone_fusion_hero_banners', JSON.stringify(data.value));
          }
        }
      } catch (err) {
        // Fallback to default/cached banners
      }
    };

    fetchBanners();
  }, []);

  const total = banners.length;

  // Auto slide effect every 5 seconds
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex] || banners[0];

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-b ${current.bg_gradient || 'from-gray-950 via-gray-900 to-black'} text-white py-14 lg:py-20 transition-all duration-700 select-none`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[380px]">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 text-center lg:text-left transition-all duration-500">
            {/* Badge */}
            {current.badge && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/25 to-amber-500/20 border border-orange-500/35 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-orange-300 mb-5 shadow-inner">
                <Sparkles size={14} className="text-orange-400" />
                <span>{current.badge}</span>
              </div>
            )}

            {/* Banner Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              {current.title}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-8 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {current.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <Link
                href={current.link_url || '/products'}
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 text-sm"
              >
                {current.button_text || 'Shop Now'} <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?category=covers"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 text-sm"
              >
                Find Phone Covers
              </Link>
            </div>

            {/* Trust badges strip */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-lg sm:text-2xl font-extrabold text-white">500+</div>
                <div className="text-[11px] sm:text-xs text-gray-400">Models Supported</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-extrabold text-white">100%</div>
                <div className="text-[11px] sm:text-xs text-gray-400">Tested Quality</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-extrabold text-white">4.9 ★</div>
                <div className="text-[11px] sm:text-xs text-gray-400">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden group">
                
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Tag size={12} /> Special Offer
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Deal
                  </span>
                </div>

                {/* Banner Image Showcase */}
                <Link
                  href={current.link_url || '/products'}
                  className="relative h-60 w-full flex items-center justify-center bg-gradient-to-b from-gray-900/70 to-black/70 rounded-2xl p-4 mb-4 border border-white/5 overflow-hidden block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.image_url || '/categories/covers.svg'}
                    alt={current.title}
                    className="max-h-52 w-auto object-contain drop-shadow-[0_15px_30px_rgba(255,107,0,0.35)] group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Bottom Quick Info */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{current.title}</h3>
                    <p className="text-xs text-gray-400">Limited Stock Available</p>
                  </div>
                  <Link
                    href={current.link_url || '/products'}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 transition-colors"
                  >
                    View <ArrowUpRight size={13} />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Carousel Navigation Controls (Left/Right Arrows + Indicators) */}
        {total > 1 && (
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Previous Banner"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next Banner"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                {currentIndex + 1} / {total} (Auto-rotates every 5s)
              </span>
            </div>

            {/* Dots / Indicators */}
            <div className="flex items-center gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx
                      ? 'w-8 bg-gradient-to-r from-orange-400 to-amber-400'
                      : 'w-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
