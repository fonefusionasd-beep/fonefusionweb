'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover amazing products and add them to your cart!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          <ShoppingBag size={18} />
          Start Shopping
        </Link>
      </div>
    );
  }

  const shipping = totalPrice() >= 499 ? 0 : 49;
  const grandTotal = totalPrice() + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart <span className="text-orange-500">({totalItems()} items)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = product.discount_price ?? product.price;
            return (
              <div key={product.id} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                <Link href={`/products/${product.id}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden">
                    <Image
                      src={product.images[0] || '/images/placeholder-product.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-gray-800 hover:text-orange-500 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-base font-bold text-gray-900 mb-3">
                    {formatPrice(price)}
                    {product.discount_price && (
                      <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.price)}</span>
                    )}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Qty */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{formatPrice(price * quantity)}</span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems()} items)</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-500">
                  Add {formatPrice(499 - totalPrice())} more for free shipping!
                </p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors mb-3 shadow-md shadow-orange-500/20"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link href="/products" className="block text-center text-sm text-orange-500 hover:text-orange-600 mt-4">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
