import React from 'react';
import { WORKSHOPS, Workshop } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, Video } from 'lucide-react';

export const WorkshopsSection: React.FC = () => {
  const { showToast } = useStore();

  const handleRegister = (ws: Workshop) => {
    showToast(`Saved spot for ${ws.title}`, 'Workshop details and preparation guide sent to your email');
  };

  return (
    <section className="relative w-full overflow-hidden select-none" aria-label="Creative Workshops">
      {/* ========================================================
          Aesthetic Curved Top Shape Transition
          ======================================================== */}
      <div className="w-full bg-[#F7EBD7] leading-none">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-12 md:h-16 block text-[#EDE2D4] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* ========================================================
          Cozy Aesthetic Curved Workshop Body
          ======================================================== */}
      <div className="relative bg-[#EDE2D4] py-8 sm:py-14">
        {/* Soft Ambient Radial Light */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_30%,#FFF6ED_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-6 sm:mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Creative Experiences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Learn. Create. Share.
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl leading-relaxed">
              Intimate hands-on workshops hosted by our featured makers. Discover the craft firsthand.
            </p>
          </div>
        </div>

        {/* ========================================================
            Moving Workshops Row (Slow Continuous Glide Right-to-Left)
            ======================================================== */}
        <div className="relative w-full overflow-hidden group-marquee py-2">
          {/* Edge Fade Gradients */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-[#EDE2D4] via-[#EDE2D4]/80 to-transparent z-20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-[#EDE2D4] via-[#EDE2D4]/80 to-transparent z-20"
            aria-hidden="true"
          />

          {/* Gliding Row Track (Moving Left to Right) */}
          <div className="animate-slow-marquee-reverse flex items-stretch gap-4 sm:gap-6 pl-4">
            {/* First Set */}
            {WORKSHOPS.map((ws) => (
              <div
                key={`ws-1-${ws.id}`}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 bg-[#FFF8EA] rounded-2xl sm:rounded-3xl border border-[#07545A]/12 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                  <img
                    src={ws.image}
                    alt={ws.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 flex items-center gap-1 shadow-2xs">
                    {ws.format === 'Live Online' ? (
                      <>
                        <Video className="w-3 h-3 text-[#3F704B]" />
                        <span>Live Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-[#E97868]" />
                        <span>Studio Offline</span>
                      </>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-[#07545A] text-[#FFF8EA] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    {ws.seatsLeft} seats left
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 text-[11px] text-[#687778] mb-1.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#07545A]" />
                        {ws.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#07545A]" />
                        {ws.duration}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-1">
                      {ws.title}
                    </h3>

                    <p className="text-xs text-[#173B3D]/70 mt-1 line-clamp-2 leading-relaxed">
                      {ws.description}
                    </p>

                    <div className="text-[11px] text-[#07545A] font-semibold mt-2 truncate">
                      Hosted by {ws.creatorName}
                    </div>
                  </div>

                  {/* Compact Bottom Bar with Small Button & Changed Text */}
                  <div className="pt-2.5 border-t border-[#07545A]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#687778] block uppercase font-medium">Spot Fee</span>
                      <span className="text-base sm:text-lg font-bold text-[#07545A] tabular-nums font-display">
                        ₹{ws.price}
                      </span>
                    </div>

                    {/* Small Button with Changed Text ("Book Spot") */}
                    <button
                      onClick={() => handleRegister(ws)}
                      className="px-3 py-1.5 rounded-lg bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                      title={`Book a spot for ${ws.title}`}
                      aria-label="Book spot"
                    >
                      <span>Book Spot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Seamless Duplicated Set for Infinite Loop */}
            {WORKSHOPS.map((ws) => (
              <div
                key={`ws-2-${ws.id}`}
                className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 bg-[#FFF8EA] rounded-2xl sm:rounded-3xl border border-[#07545A]/12 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                  <img
                    src={ws.image}
                    alt={ws.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 flex items-center gap-1 shadow-2xs">
                    {ws.format === 'Live Online' ? (
                      <>
                        <Video className="w-3 h-3 text-[#3F704B]" />
                        <span>Live Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-[#E97868]" />
                        <span>Studio Offline</span>
                      </>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 bg-[#07545A] text-[#FFF8EA] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    {ws.seatsLeft} seats left
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 text-[11px] text-[#687778] mb-1.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#07545A]" />
                        {ws.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#07545A]" />
                        {ws.duration}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-1">
                      {ws.title}
                    </h3>

                    <p className="text-xs text-[#173B3D]/70 mt-1 line-clamp-2 leading-relaxed">
                      {ws.description}
                    </p>

                    <div className="text-[11px] text-[#07545A] font-semibold mt-2 truncate">
                      Hosted by {ws.creatorName}
                    </div>
                  </div>

                  {/* Compact Bottom Bar with Small Button & Changed Text */}
                  <div className="pt-2.5 border-t border-[#07545A]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#687778] block uppercase font-medium">Spot Fee</span>
                      <span className="text-base sm:text-lg font-bold text-[#07545A] tabular-nums font-display">
                        ₹{ws.price}
                      </span>
                    </div>

                    {/* Small Button with Changed Text ("Book Spot") */}
                    <button
                      onClick={() => handleRegister(ws)}
                      className="px-3 py-1.5 rounded-lg bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                      title={`Book a spot for ${ws.title}`}
                      aria-label="Book spot"
                    >
                      <span>Book Spot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          Aesthetic Curved Bottom Shape Transition
          ======================================================== */}
      <div className="w-full bg-[#EDE2D4] leading-none">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-12 md:h-16 block text-[#F7EBD7] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>
    </section>
  );
};
