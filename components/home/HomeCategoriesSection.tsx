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
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-xs text-gray-500 mt-0.5">Explore our wide range of accessories</p>
        </div>
        <Link href="/products" className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1">
          View all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categoriesList.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-orange-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="relative w-20 h-20 mb-3 flex items-center justify-center rounded-2xl bg-gray-50/70 p-2 group-hover:scale-105 transition-transform duration-300">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              ) : (
                <span className="text-3xl">{cat.icon}</span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-800 text-center group-hover:text-orange-500 transition-colors">
              {cat.name}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-0.5 group-hover:text-orange-400 transition-colors">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
