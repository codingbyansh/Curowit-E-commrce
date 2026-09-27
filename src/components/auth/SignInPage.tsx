import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CurowitLogo } from '../common/CurowitLogo';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    isAuthLoading,
    authRedirectIntent,
    setAuthRedirectIntent,
    setActiveView,
  } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isBuyingFlow =
    authRedirectIntent?.reason === 'checkout' ||
    authRedirectIntent?.reason === 'buy-now' ||
    authRedirectIntent?.autoOpenCheckout;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginWithEmail(email, name, phone);
  };

  const handleBackToShopping = () => {
    setAuthRedirectIntent(null);
    setActiveView(isBuyingFlow ? 'cart' : 'shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#F7EBD7] py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Top Back Navigation */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBackToShopping}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#173B3D]/80 hover:text-[#07545A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBuyingFlow ? 'Back to Cart' : 'Continue Exploring Storefront'}</span>
          </button>
        </div>

        {/* Dedicated Sign-In Card */}
        <div className="rounded-3xl border border-[#07545A]/15 shadow-xl bg-[#FFF8EA] p-6 sm:p-9">
          {/* Brand Lockup & Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <CurowitLogo variant="horizontal" size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display">
              {mode === 'signin' ? 'Sign In to Curowit' : 'Create Your Store Account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#687778] mt-1">
              {isBuyingFlow
                ? 'Sign in with your account to complete your purchase.'
                : 'Sign in with Google or your email address to access your account.'}
            </p>
          </div>

          {/* Primary CTA: Google Sign-In Button */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isAuthLoading}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#F7EBD7]/60 text-[#173B3D] font-bold text-sm border-2 border-[#07545A]/20 hover:border-[#07545A] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.4l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.09c.95-2.85 3.6-4.94 6.73-4.94z"
              />
            </svg>
            <span>
              {isAuthLoading
                ? 'Connecting to Google...'
                : isBuyingFlow
                ? 'Continue with Google to Buy'
                : 'Continue with Google'}
            </span>
          </button>

          <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-[#3F704B] font-medium">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              One-Click Sign In
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Secure Account Access
            </span>
          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <span className="bg-[#FFF8EA] px-3 text-[11px] text-[#687778] font-semibold uppercase tracking-wider relative z-10">
              or continue with email
            </span>
            <div className="absolute inset-0 top-1/2 border-t border-[#07545A]/15" />
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F7EBD7] border border-[#07545A]/10 mb-5">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#07545A] text-[#FFF8EA] shadow-2xs'
                  : 'text-[#173B3D]/70 hover:text-[#07545A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#07545A] text-[#FFF8EA] shadow-2xs'
                  : 'text-[#173B3D]/70 hover:text-[#07545A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#173B3D] block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#173B3D] block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#173B3D] block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#173B3D] block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687778] hover:text-[#07545A] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs sm:text-sm font-bold hover:bg-[#063F45] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] mt-2"
            >
              <span>
                {isBuyingFlow
                  ? mode === 'signup'
                    ? 'Create Account & Proceed to Checkout'
                    : 'Sign In & Proceed to Checkout'
                  : mode === 'signup'
                  ? 'Create Store Account'
                  : 'Sign In to Curowit'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
