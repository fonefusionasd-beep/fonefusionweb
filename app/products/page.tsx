'use client';

import { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { Filter, X, Search, Smartphone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { products, categories, brands } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initCategory = searchParams.get('category') || '';
  const initBrand = searchParams.get('brand') || '';
  const initSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initSearch);
  const [selectedCategory, setSelectedCategory] = useState(initCategory);
  const [selectedBrand, setSelectedBrand] = useState(initBrand);
  const [sort, setSort] = useState('featured');
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active);

    // Search query matches product name, description OR supported models (e.g. "iPhone 15", "S24 Ultra")
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesModel = p.supported_models?.some((m) => m.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesModel;
      });
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) list = list.filter((p) => p.category_id === cat.id);
    }
    if (selectedBrand) {
      const br = brands.find((b) => b.slug === selectedBrand);
      if (br) list = list.filter((p) => p.brand_ids.includes(br.id));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    if (sort === 'price-desc') list = [...list].sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    if (sort === 'featured') list = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return list;
  }, [searchQuery, selectedCategory, selectedBrand, sort]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
  };
  const hasFilters = searchQuery || selectedCategory || selectedBrand;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters — desktop */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-xl transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-orange-500 text-white font-semibold shadow-sm shadow-orange-500/20'
                        : 'text-gray-700 hover:bg-orange-50/50 hover:text-orange-600'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-100 p-0.5 flex-shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <Image src={cat.image} alt={cat.name} width={20} height={20} className="object-contain" />
                      ) : (
                        <span>{cat.icon}</span>
                      )}
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Brand</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedBrand ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.slug)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedBrand === brand.slug ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Products</h1>
              <p className="text-sm text-gray-500">{filtered.length} products found</p>
            </div>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 border border-orange-300 px-3 py-1.5 rounded-lg">
                  <X size={12} /> Clear filters
                </button>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              {/* Mobile filter button */}
              <button
                className="md:hidden flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-sm"
                onClick={() => setShowFilter(true)}
              >
                <Filter size={15} /> Filter
              </button>
            </div>
          </div>

          {/* Search by Model or Product Bar */}
          <div className="mb-6 bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone model (e.g. iPhone 15, S24 Ultra, Vivo V30) or product name..."
                className="w-full pl-11 pr-10 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {/* Quick Model Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-xs text-gray-500">
              <span className="font-semibold text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Smartphone size={12} /> Quick models:
              </span>
              {['iPhone 15', 'iPhone 15 Pro', 'Samsung S24 Ultra', 'OnePlus 12R', 'Vivo V30 Pro'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSearchQuery(m)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors flex-shrink-0 ${
                    searchQuery.toLowerCase() === m.toLowerCase()
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium">No products found</p>
              <button onClick={clearFilters} className="mt-3 text-orange-500 text-sm underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowFilter(false)}><X size={20} /></button>
            </div>
            {/* Same filter content */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Category</h3>
                <div className="space-y-1.5">
                  <button onClick={() => { setSelectedCategory(''); setShowFilter(false); }} className={`w-full text-left text-sm px-3 py-2 rounded-lg ${!selectedCategory ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.slug); setShowFilter(false); }}
                      className={`w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-xl transition-all ${
                        selectedCategory === cat.slug
                          ? 'bg-orange-500 text-white font-semibold'
                          : 'text-gray-700 hover:bg-orange-50/50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gray-100 p-0.5 flex-shrink-0 flex items-center justify-center">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} width={20} height={20} className="object-contain" />
                        ) : (
                          <span>{cat.icon}</span>
                        )}
                      </div>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Brand</h3>
                <div className="space-y-1.5">
                  <button onClick={() => { setSelectedBrand(''); setShowFilter(false); }} className={`w-full text-left text-sm px-3 py-2 rounded-lg ${!selectedBrand ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                  {brands.map((brand) => (
                    <button key={brand.id} onClick={() => { setSelectedBrand(brand.slug); setShowFilter(false); }} className={`w-full text-left text-sm px-3 py-2 rounded-lg ${selectedBrand === brand.slug ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
