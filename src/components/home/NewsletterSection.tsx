import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

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
    <section className="relative py-8 sm:py-12 bg-[#FFF8EA] overflow-hidden select-none border-t border-[#07545A]/10" aria-label="Stay Close to Creativity">
      {/* ========================================================
          Aesthetic Textured Background with Curved Lines & Sparks
          ======================================================== */}
      {/* Ambient Radial Color Glows */}
      <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[#F2A900]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#07545A]/8 blur-3xl pointer-events-none" />

      {/* Floating Little Spark Accents */}
      <div className="absolute top-4 left-10 text-[#F2A900]/60 text-xs select-none pointer-events-none animate-pulse">✦</div>
      <div className="absolute top-6 right-16 text-[#E97868]/50 text-sm select-none pointer-events-none">✧</div>
      <div className="absolute bottom-4 left-1/4 text-[#3F704B]/50 text-xs select-none pointer-events-none">✨</div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================
            Concise, Compact & Textured Newsletter Card
            ======================================================== */}
        <div className="relative bg-gradient-to-r from-[#F7EBD7] via-[#FFF8EA] to-[#F7EBD7] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-[#07545A]/15 shadow-xs overflow-hidden">
          {/* Subtle Organic Background Contour Curves */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <svg
              viewBox="0 0 1000 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#07545A]"
              preserveAspectRatio="none"
            >
              <path
                d="M-20,60 C200,160 500,20 750,110 C900,160 980,40 1020,70"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="6 6"
              />
              <path
                d="M0,150 C250,80 550,180 800,90 C920,45 980,120 1020,100"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            {/* Left Column: Concise Header & Info */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#3F704B] mb-1.5 bg-[#FFF8EA] px-2.5 py-0.5 rounded-full border border-[#07545A]/10 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#F2A900]" />
                <span>The Curowit Circle</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#07545A] font-display leading-tight">
                Stay Close to Creativity.
              </h2>

              <p className="text-xs text-[#173B3D]/75 mt-1.5 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Handcrafted discoveries, studio visits, and workshop invites delivered gently to your inbox.
              </p>
            </div>

            {/* Right Column: Fluid Form and Button */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {subscribed ? (
                <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#3F704B]/15 text-[#3F704B] font-semibold text-xs border border-[#3F704B]/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Welcome to the circle! Check your email for quiet delights.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative flex flex-col sm:flex-row items-center gap-2 bg-[#FFF8EA] p-1.5 rounded-2xl sm:rounded-full border border-[#07545A]/20 shadow-xs focus-within:ring-2 focus-within:ring-[#07545A] transition-all"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 rounded-full bg-transparent text-[#173B3D] text-xs placeholder:text-[#687778] focus:outline-none"
                  />

                  {/* Fluid Type Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 active:scale-95 group"
                  >
                    <span>Join Circle</span>
                    <Send className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              )}

              <p className="text-[10px] text-[#687778] mt-2 text-center lg:text-left flex items-center justify-center lg:justify-start gap-1">
                <span>✦</span>
                <span>No spam, ever. Only heartfelt creative stories and handcrafted releases.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
