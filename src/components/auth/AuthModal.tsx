import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CurowitLogo } from '../common/CurowitLogo';
import { X, ArrowRight, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginDemo } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDemo(email || 'patron@curowit.com', name || 'Creative Patron');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF8EA] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#07545A]/20 shadow-2xl relative">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1 rounded-full text-[#687778] hover:text-[#173B3D] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <CurowitLogo variant="horizontal" size="lg" />
          </div>
          <h2 className="text-xl font-bold text-[#07545A] font-display">
            {isSignUp ? 'Create your Curowit Account' : 'Welcome to the Creative Circle'}
          </h2>
          <p className="text-xs text-[#687778] mt-1">
            {isSignUp
              ? 'Join our community of mindful collectors and support independent makers.'
              : 'Sign in to access your saved crafts, custom orders, and workshops.'}
          </p>
        </div>

        {/* Quick Demo Access Button */}
        <div className="mb-4">
          <button
            onClick={() => loginDemo('aanya.creative@curowit.com', 'Aanya Verma')}
            className="w-full py-2.5 px-4 bg-[#F2A900] text-[#07545A] text-xs font-bold rounded-xl hover:bg-[#E69A16] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Sign In (Aanya Verma)</span>
          </button>
          <div className="relative my-4 text-center">
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
                placeholder="e.g. Maya Iyer"
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
              defaultValue="••••••••"
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

        <div className="text-center mt-5 pt-3 border-t border-[#07545A]/10 text-xs text-[#687778]">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#07545A] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Curowit?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-[#07545A] font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
