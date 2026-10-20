'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories as defaultCategories } from '@/lib/data';
import { Category } from '@/types';

export default function HomeCategoriesSection() {
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);

  // Sync with uploaded photos from admin if present
  useEffect(() => {
    const saved = localStorage.getItem('fone_fusion_categories');
    if (saved) {
      try {
        setCategoriesList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Categories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Shop by Department</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Explore high-grade covers, GaN chargers, audio &amp; protection</p>
        </div>
        <Link href="/products" className="text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1.5 self-start sm:self-auto">
          Explore All <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {categoriesList.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group relative flex flex-col items-center p-5 bg-gradient-to-b from-white to-gray-50/50 hover:to-orange-50/30 border border-gray-100 hover:border-orange-300 rounded-3xl shadow-sm hover:shadow-[0_10px_30px_rgba(255,107,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
          >
            <div className="relative w-20 h-20 mb-3.5 flex items-center justify-center rounded-2xl bg-white shadow-inner p-2 group-hover:scale-110 transition-transform duration-300">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={72}
                  height={72}
                  className="object-contain drop-shadow-sm"
                />
              ) : (
                <span className="text-3xl">{cat.icon}</span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-900 text-center group-hover:text-orange-600 transition-colors">
              {cat.name}
            </span>
            <span className="text-[11px] font-semibold text-orange-500/80 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Shop Now →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
