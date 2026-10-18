'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Default admin credentials (ye baad me Supabase Auth se bind ho jayega)
    if (email === 'admin@fonefusion.in' && password === 'admin123') {
      localStorage.setItem('fone_fusion_admin_token', 'logged_in_' + Date.now());
      router.push('/admin');
    } else {
      setError('Invalid email or password. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/30">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            <span className="text-orange-500">Fone</span> Fusion
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Security Portal</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fonefusion.in"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={16} className="text-green-500" />
          <span>Protected Area · Unauthorized Access Prohibited</span>
        </div>
      </div>
    </div>
  );
}
