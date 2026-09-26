import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, X, ArrowRight } from 'lucide-react';

export const AdminPasskeyModal: React.FC = () => {
  const { isAdminModalOpen, closeAdminModal, adminLogin } = useStore();
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passkey.trim()) {
      setErrorMsg('Please enter your security passkey');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = adminLogin(passkey.trim());
      setIsSubmitting(false);
      if (success) {
        setPasskey('');
        setErrorMsg('');
      } else {
        setErrorMsg('Invalid master passkey. Access strictly restricted.');
      }
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeAdminModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Subtle Decorative Background Seal */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#07545A]/5 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAdminModal}
          className="absolute top-5 right-5 p-1.5 text-[#173B3D]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#07545A] text-[#F2A900] flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E97868] bg-[#E97868]/10 px-2 py-0.5 rounded-full inline-block mb-1">
              Restricted Area
            </span>
            <h3 className="text-xl font-bold text-[#07545A] font-display">
              Owner CMS Portal
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#173B3D]/80 leading-relaxed mb-5">
          This portal allows live modification of all storefront images, products, creators, workshops, and customer orders. Enter your master passkey to unlock the CMS.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold animate-in shake">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#07545A] mb-1.5 uppercase tracking-wide">
              Security Passkey
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#07545A]/60">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter master passkey..."
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-[#FFF8EA] text-[#07545A] font-semibold text-sm rounded-xl border border-[#07545A]/25 focus:border-[#07545A] focus:ring-2 focus:ring-[#07545A]/20 outline-none transition-all placeholder:text-[#173B3D]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#173B3D]/50 hover:text-[#07545A] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={closeAdminModal}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-[#173B3D]/70 hover:text-[#173B3D] hover:bg-[#07545A]/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Unlock CMS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
