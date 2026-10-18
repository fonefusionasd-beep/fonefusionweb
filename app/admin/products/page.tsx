'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Package, ArrowLeft, Search, Eye, EyeOff } from 'lucide-react';
import { products as initialProducts, categories, brands } from '@/lib/data';
import { formatPrice, discountPercent } from '@/lib/utils';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const deleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const [modelInput, setModelInput] = useState('');
  const [currentModels, setCurrentModels] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // When opening modal for edit or add:
  const openModal = (product?: Product) => {
    if (product) {
      setEditing(product);
      setCurrentModels(product.supported_models || []);
      setSelectedBrands(product.brand_ids || []);
    } else {
      setEditing(null);
      setCurrentModels([]);
      setSelectedBrands(['1']); // default first brand (e.g. Samsung)
    }
    setModelInput('');
    setShowModal(true);
  };

  const toggleBrand = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      if (selectedBrands.length > 1) {
        setSelectedBrands(selectedBrands.filter((b) => b !== brandId));
      }
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const addModelTag = () => {
    if (modelInput.trim() && !currentModels.includes(modelInput.trim())) {
      setCurrentModels([...currentModels, modelInput.trim()]);
      setModelInput('');
    }
  };

  const removeModelTag = (modelToRemove: string) => {
    setCurrentModels(currentModels.filter((m) => m !== modelToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = Number(formData.get('price')) || 299;
    const discount_price = Number(formData.get('discount_price')) || undefined;
    const stock = Number(formData.get('stock')) || 50;
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string;

    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name,
                price,
                discount_price,
                stock,
                category_id,
                brand_ids: selectedBrands,
                description,
                supported_models: currentModels,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: 'prod_' + Date.now(),
        name,
        price,
        discount_price,
        stock,
        category_id: category_id || '1',
        brand_ids: selectedBrands,
        description,
        images: ['/categories/covers.svg'],
        supported_models: currentModels,
        is_featured: false,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setProducts([newProduct, ...products]);
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-xs text-gray-500">{products.length} total products</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </header>

      <main className="p-6">
        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Product & Models</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => {
                const cat = categories.find((c) => c.id === product.category_id);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 p-1 border border-gray-100">
                          <Image
                            src={product.images[0] || '/images/placeholder-product.png'}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 block">{product.name}</span>
                          {/* Available Models Pill Tags */}
                          {product.supported_models && product.supported_models.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {product.supported_models.slice(0, 3).map((m) => (
                                <span key={m} className="bg-orange-50 text-orange-600 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-orange-100">
                                  {m}
                                </span>
                              ))}
                              {product.supported_models.length > 3 && (
                                <span className="text-[10px] text-gray-400">
                                  +{product.supported_models.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">Universal / All Models</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          {cat?.image && (
                            <Image src={cat.image} alt={cat.name} width={16} height={16} className="object-contain" />
                          )}
                          <span>{cat ? cat.name : '—'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.brand_ids?.map((bid) => {
                            const b = brands.find((brand) => brand.id === bid);
                            return b ? (
                              <span key={b.id} className="text-[10px] bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
                                {b.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-gray-900">{formatPrice(product.discount_price ?? product.price)}</span>
                        {product.discount_price && (
                          <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`font-medium ${product.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                        {product.stock} pcs
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(product.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title={product.is_active ? 'Hide' : 'Show'}
                        >
                          {product.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          onClick={() => openModal(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                          title="Edit Product & Models"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              {editing ? 'Edit Product & Supported Models' : 'Add New Product (with Models)'}
            </h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Product Title</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Liquid Silicone Protective Case"
                  defaultValue={editing?.name ?? ''}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Supported Models Management */}
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl">
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                  📱 Supported Phone Models (Available Models)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Add models for this cover (e.g. iPhone 15, S24 Ultra, Vivo V30). Customer will choose from this list!
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addModelTag();
                      }
                    }}
                    placeholder="Type model name and click Add (e.g. iPhone 15 Pro)..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addModelTag}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    + Add Model
                  </button>
                </div>

                {/* Chips of added models */}
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-xl border border-gray-100 min-h-[42px] items-center">
                  {currentModels.length > 0 ? (
                    currentModels.map((model) => (
                      <span
                        key={model}
                        className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                      >
                        {model}
                        <button
                          type="button"
                          onClick={() => removeModelTag(model)}
                          className="text-orange-500 hover:text-red-500 font-bold ml-1 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 px-2">No specific models added yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Original Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="299"
                    defaultValue={editing?.price ?? 299}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Sale Price (₹)</label>
                  <input
                    name="discount_price"
                    type="number"
                    placeholder="199"
                    defaultValue={editing?.discount_price ?? 199}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Stock (Qty)</label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="50"
                    defaultValue={editing?.stock ?? 50}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    name="category_id"
                    defaultValue={editing?.category_id ?? '1'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Select Brands (Phone Brands)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 border border-gray-200 rounded-xl min-h-[42px] items-center">
                    {brands.map((b) => {
                      const isSelected = selectedBrands.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggleBrand(b.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{b.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Select brand (e.g. Vivo, Samsung). Customers filtering by that brand will see this cover!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Material, finish, features..."
                  defaultValue={editing?.description ?? ''}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md text-sm"
                >
                  {editing ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
