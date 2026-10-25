'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AUTHORIZED_ADMIN_EMAIL = 'fonefusionasd@gmail.com';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if redirected with an unauthorized error
    const errParam = searchParams.get('error');
    if (errParam === 'unauthorized') {
      setError('Access Denied: Only the authorized store owner can access the Admin Panel.');
    }

    // Check if already logged in as authorized admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email?.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        localStorage.setItem('fone_fusion_admin_token', session.user.id);
        router.replace('/admin');
      }
    });
  }, [searchParams, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectTo = `${window.location.origin}/admin`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err?.message || 'Failed to initialize Google login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/30">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            <span className="text-orange-500">Fone</span> Fusion
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-gray-400 mt-1">
            Admin Security Portal
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 text-xs text-red-300 bg-red-950/60 border border-red-800/80 rounded-2xl leading-relaxed">
            <ShieldAlert size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Security Warning</p>
              <p className="mt-0.5 text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:scale-[0.98] text-gray-900 font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-black/40 transition-all text-sm border border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <p className="text-[11px] text-center text-gray-500 leading-normal">
            Only the authorized store administrator Google account can access this panel.
          </p>
        </div>

        {/* Security badges */}
        <div className="mt-8 pt-6 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <span>Google OAuth 2.0 Verified Authentication</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-orange-400 flex-shrink-0" />
            <span>Restricted Single-Administrator Whitelist</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
