import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Fone Fusion — Mobile Accessories Store',
    template: '%s | Fone Fusion',
  },
  description:
    'Premium mobile accessories — covers, chargers, cables, earphones, screen guards and more. Best prices, fast delivery.',
  keywords: ['mobile covers', 'phone cases', 'chargers', 'earphones', 'screen guards', 'mobile accessories'],
  openGraph: {
    title: 'Fone Fusion — Mobile Accessories Store',
    description: 'Premium mobile accessories at best prices.',
    siteName: 'Fone Fusion',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
