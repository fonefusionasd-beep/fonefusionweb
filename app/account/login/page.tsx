'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Lock, Eye, EyeOff, Zap, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useCustomerStore } from '@/lib/customerStore';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, register, sendPasswordResetEmail } = useCustomerStore();
  
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success) {
        router.push('/account');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name,
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        password,
        address,
        city,
        pincode,
      });

      if (res.success) {
        router.push('/account');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendPasswordResetEmail(forgotEmail);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900">
            Fone <span className="text-orange-500">Fusion</span>
          </span>
        </Link>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-gray-100">
          
          {/* Top Switcher (Tabs) */}
          {view !== 'forgot' && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              <button
                onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  view === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setView('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  view === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Status Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-start gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ─── 1. SIGN IN FORM ─── */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number or Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="10-digit Mobile Number or Email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs text-orange-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 text-sm transition-all active:scale-95 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In to Account'}
              </button>
            </form>
          )}

          {/* ─── 2. CREATE ACCOUNT FORM ─── */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (Login ID) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit Indian Mobile Number"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                  <Phone size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-400">Must be a valid 10-digit number</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <Mail size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Set Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <Lock size={15} className="absolute left-3.5 top-2.5 text-gray-400" />
                </div>
              </div>

              <div className="pt-2 border-t">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Default Delivery Address (Optional)
                </span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Street/Chowk address"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs mb-2 focus:outline-none focus:border-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / Town"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Pincode (e.g. 132039)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 text-sm transition-all active:scale-95 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ─── 3. FORGOT PASSWORD (EMAIL RESET LINK) ─── */}
          {view === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="text-lg font-bold text-gray-900">Reset Your Password</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your registered email address. We will send a secure password reset link directly to your inbox.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered email (e.g. you@gmail.com)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>{loading ? 'Sending link...' : 'Send Password Reset Link'}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-gray-600 hover:text-orange-600"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800">
              <ArrowLeft size={13} /> Back to Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
