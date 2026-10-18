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
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(255,107,0,0.15)] hover:border-orange-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        <Image
          src={product.images[0] || '/images/placeholder-product.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map((i) => (
            <Star key={i} size={11} className={i <= 4 ? 'fill-orange-400 text-orange-400' : 'text-gray-300'} />
          ))}
          <span className="text-xs text-gray-400 ml-0.5">(4.0)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.discount_price ?? product.price)}
          </span>
          {product.discount_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
