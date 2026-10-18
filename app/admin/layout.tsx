'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Agar login page pe hain, to check ki zaroorat nahi
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem('fone_fusion_admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">Checking security authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
