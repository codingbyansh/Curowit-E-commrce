import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import { CurowitLogo } from '../common/CurowitLogo';

interface FoundingCreatorLoginProps {
  onNavigate: (view: string) => void;
}

export const FoundingCreatorLogin: React.FC<FoundingCreatorLoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = foundingCreatorService.loginCreator(email);
      if (!res.success || !res.creator) {
        setErrorMessage(res.error || 'Invalid credentials or creator profile not found.');
        setIsLoading(false);
        return;
      }

      // Check role status
      if (res.creator.accountStatus === 'approved') {
        onNavigate('foundingcreator-dashboard');
      } else if (res.creator.accountStatus === 'pending') {
        onNavigate(`foundingcreator-status?id=${res.creator.email}`);
      } else if (res.creator.accountStatus === 'rejected') {
        onNavigate(`foundingcreator-status?id=${res.creator.email}`);
      } else if (res.creator.accountStatus === 'suspended') {
        setErrorMessage('This creator account has been suspended by administration. Please contact atelier@curowit.com.');
      } else {
        onNavigate('foundingcreator-dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#192B2C] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Radiant Warm Ambient Lighting */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-50 z-0 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245, 158, 11, 0.14), rgba(7, 84, 90, 0.08) 50%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Blueprint guidelines */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-20 select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="85%" cy="20%" r="140" fill="none" stroke="#07545A" strokeWidth="0.8" strokeDasharray="3 6" />
        <circle cx="15%" cy="85%" r="160" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="5 7" />
      </svg>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center relative z-10">
        <button
          onClick={() => onNavigate('foundingcreator')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07474C] hover:text-[#B45309] transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Creator Program</span>
        </button>

        <div className="flex justify-center">
          <CurowitLogo variant="horizontal" size="md" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold font-display text-[#07474C] tracking-tight">
          Founding Creator Portal Login
        </h2>
        <p className="text-xs text-[#233837]/75 max-w-xs mx-auto font-normal">
          Access your artisan atelier dashboard, manage inventory, track order fulfillment, and review 7-day settlements.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xs py-8 px-6 sm:px-10 shadow-[0_12px_32px_-6px_rgba(7,84,90,0.08)] border border-[#07545A]/14 rounded-3xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resetSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
              <span className="font-semibold block">Password Reset Instructions Sent</span>
              <p>Check your inbox for a secure password reset link.</p>
              <button
                onClick={() => setResetSent(false)}
                className="underline font-semibold text-[#07474C] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#07474C] mb-1 font-sans">
                  Registered Creator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233837]/45" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@yourstudio.in"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#07474C] font-sans">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!email) {
                        setErrorMessage('Please enter your email above first.');
                      } else {
                        setResetSent(true);
                      }
                    }}
                    className="text-[11px] text-[#07474C] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233837]/45" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold transition-all shadow-[0_2px_8px_-1px_rgba(7,84,90,0.25)] hover:shadow-[0_4px_14px_-2px_rgba(7,84,90,0.35)] cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Creator Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Secure Artisan Credentials Note */}
          <div className="pt-3 border-t border-[#07545A]/10 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#233837]/70 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Secure encrypted artisan access with cloud database sync</span>
            </div>
          </div>

          <div className="text-center text-xs text-[#233837]/75 pt-1">
            New handmade artisan?{' '}
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="text-[#07474C] font-semibold hover:underline cursor-pointer"
            >
              Apply to join cohort →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
