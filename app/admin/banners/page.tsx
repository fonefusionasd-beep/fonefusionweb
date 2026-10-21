'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Edit2, Trash2, Check, ExternalLink,
  Sparkles, Tag, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Link as LinkIcon, RefreshCw, AlertCircle
} from 'lucide-react';
import { HeroBanner } from '@/types';
import { defaultBanners } from '@/lib/data';
import { supabase } from '@/lib/supabase';

const THEME_PRESETS = [
  { name: 'Dark Flagship', value: 'from-gray-950 via-gray-900 to-black', color: 'bg-gray-900' },
  { name: 'Sunset Orange', value: 'from-orange-950 via-neutral-900 to-black', color: 'bg-orange-900' },
  { name: 'Electric Blue', value: 'from-slate-950 via-blue-950 to-black', color: 'bg-blue-950' },
  { name: 'Emerald Green', value: 'from-emerald-950 via-neutral-900 to-black', color: 'bg-emerald-950' },
  { name: 'Royal Purple', value: 'from-purple-950 via-neutral-900 to-black', color: 'bg-purple-950' },
];

const IMAGE_PRESETS = [
  { label: 'Cases & Covers', src: '/categories/covers.svg' },
  { label: '65W Fast Charger', src: '/categories/chargers.svg' },
  { label: 'Braided Cable', src: '/categories/cables.svg' },
  { label: 'Wireless Earphones', src: '/categories/earphones.svg' },
  { label: 'Screen Guard', src: '/categories/screen-guards.svg' },
  { label: 'Phone Holder', src: '/categories/holders.svg' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>(defaultBanners);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [bgGradient, setBgGradient] = useState(THEME_PRESETS[0].value);
  const [isActive, setIsActive] = useState(true);

  // Load banners from Supabase or localStorage
  const loadBanners = async () => {
    setLoading(true);
    // 1. Try local cache first
    const cached = localStorage.getItem('fone_fusion_hero_banners');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Fetch from Supabase site_settings
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_banners')
        .single();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setBanners(data.value);
        localStorage.setItem('fone_fusion_hero_banners', JSON.stringify(data.value));
      }
    } catch (e) {
      console.log('Supabase banner load fallback to cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Save banners to Supabase & localStorage
  const saveAllBanners = async (updatedBanners: HeroBanner[]) => {
    setSaving(true);
    setBanners(updatedBanners);
    localStorage.setItem('fone_fusion_hero_banners', JSON.stringify(updatedBanners));

    try {
      // Upsert into Supabase site_settings table
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'hero_banners', value: updatedBanners, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (!error) {
        setSuccessMsg('Banners saved & live on website!');
      } else {
        setSuccessMsg('Saved locally! (Run Supabase SQL to sync cloud)');
      }
    } catch (err) {
      setSuccessMsg('Saved to local storage!');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('🔥 SPECIAL OFFER');
    setImageUrl('/categories/covers.svg');
    setLinkUrl('/products');
    setButtonText('Shop Now');
    setBgGradient(THEME_PRESETS[1].value);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setBadge(banner.badge || '');
    setImageUrl(banner.image_url);
    setLinkUrl(banner.link_url || '/products');
    setButtonText(banner.button_text || 'Shop Now');
    setBgGradient(banner.bg_gradient || THEME_PRESETS[0].value);
    setIsActive(banner.is_active);
    setShowModal(true);
  };

  // Handle Image File Upload (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a banner title');
      return;
    }

    if (editingBanner) {
      // Update existing
      const updated = banners.map((b) =>
        b.id === editingBanner.id
          ? {
              ...b,
              title,
              subtitle,
              badge,
              image_url: imageUrl || '/categories/covers.svg',
              link_url: linkUrl,
              button_text: buttonText,
              bg_gradient: bgGradient,
              is_active: isActive,
            }
          : b
      );
      saveAllBanners(updated);
    } else {
      // Create new
      const newBanner: HeroBanner = {
        id: 'banner_' + Date.now(),
        title,
        subtitle,
        badge,
        image_url: imageUrl || '/categories/covers.svg',
        link_url: linkUrl,
        button_text: buttonText,
        bg_gradient: bgGradient,
        is_active: isActive,
        display_order: banners.length + 1,
      };
      saveAllBanners([...banners, newBanner]);
    }

    setShowModal(false);
  };

  const toggleBannerStatus = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
    saveAllBanners(updated);
  };

  const deleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this offer banner?')) {
      const updated = banners.filter((b) => b.id !== id);
      saveAllBanners(updated);
    }
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    // update display order
    const updated = reordered.map((b, i) => ({ ...b, display_order: i + 1 }));
    saveAllBanners(updated);
  };

  const resetBanners = () => {
    if (confirm('Reset all banners back to original defaults?')) {
      saveAllBanners(defaultBanners);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Top Offer Banners</h1>
              <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                Multi-Banner Carousel
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Manage website top hero banners &amp; promo offers. Auto-changes every 5 seconds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            <ExternalLink size={14} /> View Live Web
          </a>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Add New Banner
          </button>
        </div>
      </header>

      {/* Success Notification */}
      {successMsg && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Quick Helper Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-2xl p-5 mb-8 shadow-md border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} /> Customer Homepage Top Hero
            </div>
            <p className="text-sm text-gray-300">
              Active banners automatically rotate every 5 seconds on the homepage. You can upload custom offer posters, set button links, change background themes, and turn them ON/OFF anytime.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={loadBanners}
              disabled={loading}
              className="text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={resetBanners}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-xl border border-red-500/30 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Banners List */}
        <div className="space-y-4">
          {banners.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center">
              <Tag size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Banners Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">Click below to create your first top promotional banner.</p>
              <button
                onClick={openCreateModal}
                className="bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={15} /> Add Banner
              </button>
            </div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  banner.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50/70 opacity-70'
                }`}
              >
                {/* Left: Reorder controls + Thumbnail */}
                <div className="flex items-center gap-4">
                  {/* Up / Down Controls */}
                  <div className="flex flex-col gap-1 text-gray-400">
                    <button
                      onClick={() => moveBanner(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:text-gray-900 disabled:opacity-20 hover:bg-gray-100 rounded"
                      title="Move Up"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      onClick={() => moveBanner(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1 hover:text-gray-900 disabled:opacity-20 hover:bg-gray-100 rounded"
                      title="Move Down"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>

                  {/* Thumbnail / Graphic preview */}
                  <div className={`w-28 h-20 rounded-xl bg-gradient-to-br ${banner.bg_gradient || 'from-gray-900 to-black'} p-2 flex items-center justify-center border border-gray-700 flex-shrink-0 relative overflow-hidden shadow-inner`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.image_url || '/categories/covers.svg'}
                      alt={banner.title}
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {banner.badge && (
                        <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                          {banner.badge}
                        </span>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                        {banner.is_active ? '● Live on Web' : '○ Inactive / Hidden'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{banner.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{banner.subtitle}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                      <span>Link: <strong className="text-gray-700">{banner.link_url}</strong></span>
                      <span>Button: <strong className="text-gray-700">{banner.button_text}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => toggleBannerStatus(banner.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      banner.is_active
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                    title={banner.is_active ? 'Hide from website' : 'Show on website'}
                  >
                    {banner.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="hidden sm:inline">{banner.is_active ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </main>

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingBanner ? 'Edit Offer Banner' : 'Create New Offer Banner'}
                </h2>
                <p className="text-xs text-gray-500">Fill details to display banner on customer homepage top slider</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Banner Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mega Deal: 50% Off On Covers!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Offer Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. 🔥 LIMITED DEAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subtitle / Promo Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Buy any shockproof case and get free tempered glass + free shipping across India."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Links & Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Link URL
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products or /products?category=chargers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Shop Deals Now"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Background Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Banner Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {THEME_PRESETS.map((t) => (
                    <button
                      type="button"
                      key={t.name}
                      onClick={() => setBgGradient(t.value)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        bgGradient === t.value
                          ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/50 text-orange-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${t.color} border border-white/20`} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Image Selection: Upload OR URL OR Presets */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Banner Graphic / Product Showcase Image
                </label>

                {/* Preset Fast Selection */}
                <div className="mb-3">
                  <span className="text-[11px] text-gray-500 block mb-1.5 font-medium">Quick Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setImageUrl(p.src)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          imageUrl === p.src
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload or Custom URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1 font-medium">Upload from PC (Photo / Poster):</label>
                    <label className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-orange-400 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer shadow-sm transition-colors">
                      <Upload size={14} className="text-orange-500" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1 font-medium">Or Paste Image URL:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... or /categories/covers.svg"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-orange-500"
                      />
                      <LinkIcon size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Live Thumbnail Preview */}
                {imageUrl && (
                  <div className="mt-3 p-3 bg-gray-900 rounded-xl flex items-center gap-3">
                    <div className="w-14 h-14 bg-black/50 rounded-lg flex items-center justify-center p-1 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold block">✓ Image Selected</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-xs block">{imageUrl.slice(0, 45)}...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <label htmlFor="activeCheck" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  Activate &amp; show this banner in top carousel immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 transition-all active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingBanner ? 'Save Changes' : 'Create Banner'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
