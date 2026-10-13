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
    <div className="min-h-screen bg-[#FFFDF7] text-[#173B3D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <button
          onClick={() => onNavigate('foundingcreator')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Creator Program</span>
        </button>

        <div className="flex justify-center">
          <CurowitLogo variant="horizontal" size="md" />
        </div>

        <h2 className="text-2xl font-bold font-display text-[#07545A] tracking-tight">
          Founding Creator Portal Login
        </h2>
        <p className="text-xs text-[#173B3D]/70 max-w-xs mx-auto">
          Access your artisan atelier dashboard, manage inventory, track order fulfillment, and review 7-day settlements.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#07545A]/15 rounded-3xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resetSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
              <span className="font-bold block">Password Reset Instructions Sent</span>
              <p>Check your inbox for a secure password reset link.</p>
              <button
                onClick={() => setResetSent(false)}
                className="underline font-bold text-[#07545A] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#07545A] mb-1">
                  Registered Creator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@yourstudio.in"
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-xs bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#07545A]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!email) {
                        setErrorMessage('Please enter your email above first.');
                      } else {
                        setResetSent(true);
                      }
                    }}
                    className="text-[11px] text-[#07545A] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-xs bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
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
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#173B3D]/70 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>End-to-end encrypted artisan portal</span>
            </div>
          </div>

          <div className="text-center text-xs text-[#173B3D]/70 pt-1">
            New handmade artisan?{' '}
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="text-[#07545A] font-bold hover:underline cursor-pointer"
            >
              Apply to join cohort →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
