'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const discount = product.discount_price
    ? discountPercent(product.price, product.discount_price)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-[0_12px_36px_rgba(255,107,0,0.14)] hover:border-orange-300 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 aspect-square overflow-hidden flex items-center justify-center p-4">
        <Image
          src={product.images[0] || '/categories/covers.svg'}
          alt={product.name}
          fill
          className="object-contain p-3 group-hover:scale-108 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Subtle glass badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm shadow-orange-500/30">
              {discount}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gray-900/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              ★ Top Pick
            </span>
          )}
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-rose-500/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Model compatibility tag if exists */}
          {product.supported_models && product.supported_models.length > 0 && (
            <p className="text-[11px] text-gray-400 mb-2 truncate">
              Fits: {product.supported_models.slice(0, 3).join(', ')}...
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={11} className={i <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
            ))}
            <span className="text-[11px] font-medium text-gray-500 ml-1">4.8</span>
            <span className="text-[10px] text-gray-300">· 120+ sold</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <div className="text-base font-extrabold text-gray-900">
              {formatPrice(product.discount_price ?? product.price)}
            </div>
            {product.discount_price && (
              <div className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-200 disabled:to-gray-200 text-white font-bold p-2.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20 active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
            <span className="hidden sm:inline text-xs">Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
