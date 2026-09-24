import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Send, CheckCircle2 } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    showToast('Subscribed to Curowit Notes!', 'We will send weekly craft discoveries and maker spotlights.');
  };

  return (
    <section className="py-14 sm:py-20 bg-[#FFF8EA] border-t border-[#07545A]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#F7EBD7] rounded-3xl p-8 sm:p-12 border border-[#07545A]/15 shadow-xs relative overflow-hidden">
          {/* Subtle floral/craft accent shapes */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#F2A900]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#07545A]/10 rounded-full blur-2xl pointer-events-none" />

          <span className="text-xs font-semibold uppercase tracking-wider text-[#3F704B] block mb-2">
            The Curowit Circle
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#07545A] font-display mb-3">
            Stay Close to Creativity.
          </h2>
          <p className="text-sm text-[#173B3D]/75 max-w-lg mx-auto mb-8 leading-relaxed">
            Get newly crafted finds, creator studio visits, workshop invites and creative ideas delivered gently to your inbox.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3F704B]/15 text-[#3F704B] font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>You’re in the circle! Welcome to Curowit.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-[#FFF8EA] border border-[#07545A]/20 text-[#173B3D] text-sm placeholder:text-[#687778] focus:outline-none focus:ring-2 focus:ring-[#07545A] transition-all"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#07545A] text-[#FFF8EA] font-bold text-xs uppercase tracking-wider hover:bg-[#063F45] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95"
              >
                <span>Join Curowit</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="mt-4 text-[11px] text-[#687778]">
            No spam, ever. Only heartfelt creative stories and handcrafted releases.
          </div>
        </div>
      </div>
    </section>
  );
};
