'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { ShoppingCart, Star, ChevronLeft, Plus, Minus, Shield, Truck, Search, Check, Smartphone } from 'lucide-react';
import { getProductById, getCategoryById, getBrandById, products } from '@/lib/data';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>(
    product?.supported_models && product.supported_models.length > 0 ? product.supported_models[0] : ''
  );
  const [modelSearch, setModelSearch] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return notFound();

  const category = getCategoryById(product.category_id);
  const productBrands = product.brand_ids.map(getBrandById).filter(Boolean);
  const discount = product.discount_price ? discountPercent(product.price, product.discount_price) : 0;

  // Filter models based on search input
  const filteredModels = (product.supported_models || []).filter((m) =>
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // Related products (same category, excluding current)
  const related = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_active)
    .slice(0, 4);

  const handleAddToCart = () => {
    // Custom product with selected model name attached
    const customProduct = selectedModel
      ? { ...product, name: `${product.name} (${selectedModel})` }
      : product;
    addItem(customProduct, qty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-orange-500">Products</Link>
        <span>/</span>
        {category && <Link href={`/products?category=${category.slug}`} className="hover:text-orange-500">{category.name}</Link>}
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
            <Image
              src={product.images[activeImg] || '/images/placeholder-product.png'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {category && (
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {category.image && (
                <Image src={category.image} alt={category.name} width={14} height={14} className="object-contain" />
              )}
              {category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={16} className={i <= 4 ? 'fill-orange-400 text-orange-400' : 'text-gray-300'} />
            ))}
            <span className="text-sm text-gray-500">(4.0) · 24 reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.discount_price ?? product.price)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="text-green-600 font-semibold text-sm">Save {formatPrice(product.price - product.discount_price)}</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.description}</p>

          {/* Select Phone Model with Search */}
          {product.supported_models && product.supported_models.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-orange-500" />
                  <span className="text-sm font-bold text-gray-900">
                    Select Your Phone Model:
                  </span>
                </div>
                {selectedModel && (
                  <span className="text-xs bg-orange-500 text-white font-semibold px-2.5 py-0.5 rounded-full">
                    Selected: {selectedModel}
                  </span>
                )}
              </div>

              {/* Model Search Bar */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search model (e.g. iPhone 15, S24 Ultra)..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Model Chips */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => {
                    const isSelected = selectedModel === model;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20 scale-105'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {model}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 py-2">
                    Model not found in list. Please check the model name or contact store.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Compatible brands */}
          {productBrands.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Compatible Brands:</p>
              <div className="flex flex-wrap gap-2">
                {productBrands.map((brand) => brand && (
                  <span key={brand.id} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {brand.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className={`text-sm font-medium mb-5 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚠️ Only ${product.stock} left!` : '✗ Out of Stock'}
          </p>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold text-gray-800">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md shadow-orange-500/20"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, text: 'Genuine Product' },
              { icon: Truck, text: 'Fast Delivery' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <Icon size={14} className="text-orange-400" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
