import Link from 'next/link';
import { Zap, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">
                Fone <span className="text-orange-500">Fusion</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Your one-stop shop for premium mobile accessories — covers, chargers, cables, earphones and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['/products?category=covers', 'Covers & Cases'],
                ['/products?category=chargers', 'Chargers'],
                ['/products?category=cables', 'Cables'],
                ['/products?category=earphones', 'Earphones'],
                ['/products?category=screen-guards', 'Screen Guards'],
                ['/products?category=holders', 'Holders & Stands'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span>Nanak Pura Chowk, JC College Road,<br />Assandh, Karnal - 132039</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-orange-400 flex-shrink-0" />
                <a href="tel:+919541974000" className="hover:text-orange-400">+91 95419 74000</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-orange-400 flex-shrink-0" />
                <a href="mailto:hello@fonefusion.in" className="hover:text-orange-400">hello@fonefusion.in</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Fone Fusion. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-orange-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
