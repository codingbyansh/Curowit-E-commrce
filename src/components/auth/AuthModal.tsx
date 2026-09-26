import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CurowitLogo } from '../common/CurowitLogo';
import { X, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithGoogle,
    loginWithEmail,
    isAuthLoading,
  } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginWithEmail(email, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF8EA] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#07545A]/20 shadow-2xl relative">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1 rounded-full text-[#687778] hover:text-[#173B3D] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-5">
          <div className="inline-block mb-3">
            <CurowitLogo variant="horizontal" size="lg" />
          </div>
          <h2 className="text-xl font-bold text-[#07545A] font-display">
            {isSignUp ? 'Create your Curowit Account' : 'Sign In to Curowit'}
          </h2>
          <p className="text-xs text-[#687778] mt-1">
            Sign in with Google or email to buy handmade pieces, track orders, and save wishlists.
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-2.5 mb-4">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isAuthLoading}
            className="w-full py-3 px-4 bg-white hover:bg-[#F7EBD7]/60 text-[#173B3D] text-xs sm:text-sm font-bold rounded-xl border-2 border-[#07545A]/20 hover:border-[#07545A] transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-2xs active:scale-98 disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
            <span>{isAuthLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-3.5 text-center">
            <span className="bg-[#FFF8EA] px-2 text-[10px] text-[#687778] uppercase tracking-wider relative z-10">
              or continue with email
            </span>
            <div className="absolute inset-0 top-1/2 border-t border-[#07545A]/10" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-[#173B3D] block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#173B3D] block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#173B3D] block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98 mt-2"
          >
            <span>{isSignUp ? 'Create Creative Account' : 'Sign In to Curowit'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#07545A]/10 text-center text-xs text-[#687778]">
          <button
            type="button"
            onClick={() => setIsSignUp((prev) => !prev)}
            className="text-[#07545A] font-bold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New to Curowit? Create an Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
