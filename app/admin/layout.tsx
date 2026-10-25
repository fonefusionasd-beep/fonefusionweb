'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AUTHORIZED_ADMIN_EMAIL = 'fonefusionasd@gmail.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already on login page, skip verification
    if (pathname === '/admin/login') {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
          const userEmail = user.email?.toLowerCase().trim();
          if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
            if (isMounted) {
              setAuthorized(true);
              setChecking(false);
              localStorage.setItem('fone_fusion_admin_token', user.id);
            }
            return;
          } else {
            // Logged in with unauthorized Google account
            console.warn('Unauthorized admin login attempt:', userEmail);
            await supabase.auth.signOut();
            localStorage.removeItem('fone_fusion_admin_token');
            if (isMounted) {
              router.replace('/admin/login?error=unauthorized');
            }
            return;
          }
        }

        // Check if browser just arrived from OAuth redirect with access_token or code
        const hasAuthParams = typeof window !== 'undefined' && (
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code')
        );

        if (!hasAuthParams) {
          localStorage.removeItem('fone_fusion_admin_token');
          if (isMounted) {
            router.replace('/admin/login');
          }
          return;
        }

        // Wait for OAuth token to be processed by supabase-js
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!isMounted) return;
          const authUser = newSession?.user;
          if (authUser) {
            const authEmail = authUser.email?.toLowerCase().trim();
            if (authEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
              setAuthorized(true);
              setChecking(false);
              localStorage.setItem('fone_fusion_admin_token', authUser.id);
            } else {
              await supabase.auth.signOut();
              localStorage.removeItem('fone_fusion_admin_token');
              router.replace('/admin/login?error=unauthorized');
            }
          } else if (event === 'SIGNED_OUT') {
            router.replace('/admin/login');
          }
        });

        // Safety fallback timer if OAuth parsing times out
        const timer = setTimeout(() => {
          if (isMounted && !authorized) {
            router.replace('/admin/login');
          }
        }, 5000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error('Admin layout auth error:', err);
        if (isMounted) {
          router.replace('/admin/login');
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, authorized]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-semibold tracking-wide text-gray-200">
          Verifying Admin Access...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Authorized ID: {AUTHORIZED_ADMIN_EMAIL}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
