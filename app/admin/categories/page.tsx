'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Edit2, Plus, Check, Trash2, Tag, RefreshCw } from 'lucide-react';
import { categories as initialCategories } from '@/lib/data';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load persisted custom categories from localStorage if present
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

  const saveCategories = (updated: Category[]) => {
    setCategoriesList(updated);
    localStorage.setItem('fone_fusion_categories', JSON.stringify(updated));
    setSuccessMsg('Category photos saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openEditModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setPreviewImage(cat.image || '');
    } else {
      setEditingCat(null);
      setPreviewImage('');
    }
    setShowModal(true);
  };

  // Handle local image file upload (converts to base64 for instant preview & persistence)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCat) {
      const updated = categoriesList.map((c) =>
        c.id === editingCat.id ? { ...c, name, slug, image: previewImage || c.image } : c
      );
      saveCategories(updated);
    } else {
      const newCat: Category = {
        id: 'cat_' + Date.now(),
        name,
        slug,
        icon: '📦',
        image: previewImage || '/categories/covers.svg',
      };
      saveCategories([...categoriesList, newCat]);
    }
    setShowModal(false);
  };

  const resetToDefault = () => {
    if (confirm('Reset all categories back to default illustrations?')) {
      localStorage.removeItem('fone_fusion_categories');
      setCategoriesList(initialCategories);
      setSuccessMsg('Reset to default illustrations.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
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
            <h1 className="text-xl font-bold text-gray-900">Manage Category Photos & Cards</h1>
            <p className="text-xs text-gray-500">
              Upload real photos or graphics for each category shown on homepage & filters
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors font-medium"
          >
            <RefreshCw size={14} /> Reset
          </button>
          <button
            onClick={() => openEditModal()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New Category
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-2 text-sm font-semibold">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categoriesList.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Preview Container */}
                <div className="relative w-full aspect-video bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-gray-100 flex items-center justify-center p-3 group">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-4xl">{cat.icon}</span>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
                    {cat.slug}
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Shown on Homepage & Filter sidebar</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  <Upload size={14} /> Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="p-2 text-gray-400 hover:text-blue-500 rounded-xl hover:bg-blue-50"
                  title="Edit details"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Upload / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              {editingCat ? `Change Photo for "${editingCat.name}"` : 'Add New Category'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Smart Watch Straps"
                  defaultValue={editingCat?.name ?? ''}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Category Photo / Banner Graphic
                </label>

                {previewImage ? (
                  <div className="relative w-full h-44 bg-gray-50 rounded-2xl overflow-hidden mb-3 border-2 border-orange-200 flex items-center justify-center p-2">
                    <Image src={previewImage} alt="Preview" fill className="object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => setPreviewImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-orange-300 bg-orange-50/30 rounded-2xl p-6 text-center text-gray-500 cursor-pointer hover:bg-orange-50 flex flex-col items-center justify-center transition-colors">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-bold text-gray-800">Click to upload real photo</span>
                    <span className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP or SVG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="mt-3">
                  <span className="text-xs text-gray-500 block mb-1">Or paste direct Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://example.com/cover-photo.jpg"
                    value={previewImage.startsWith('data:') ? '' : previewImage}
                    onChange={(e) => setPreviewImage(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
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
                  Save Category Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
