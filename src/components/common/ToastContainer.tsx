import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#07545A] text-[#FFF8EA] p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#FFF8EA]/15 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-[#F2A900] text-[#07545A] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold leading-tight text-[#FFF8EA]">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-[11px] text-[#F7EBD7]/80 mt-0.5 line-clamp-1">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#F7EBD7]/60 hover:text-[#FFF8EA] p-0.5 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
