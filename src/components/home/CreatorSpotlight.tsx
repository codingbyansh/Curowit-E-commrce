import React from 'react';
import { CREATORS } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Sparkles, MapPin, Star } from 'lucide-react';

export const CreatorSpotlight: React.FC = () => {
  const { navigateToCreator } = useStore();

  // Create a gentle undulating height wave for the moving cards
  const waveHeights = ['h-[260px]', 'h-[285px]', 'h-[250px]', 'h-[295px]', 'h-[265px]', 'h-[280px]'];

  return (
    <section className="relative py-12 sm:py-20 bg-[#F7EBD7] overflow-hidden select-none border-t border-[#07545A]/10" aria-label="Meet the Creators">
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_40%,#FFF8EA_0%,transparent_75%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Centered without any Explore Creators button) */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] bg-[#FFF8EA] px-3.5 py-1 rounded-full border border-[#07545A]/10 shadow-2xs mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Artisans & Makers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
            Meet the Creators
          </h2>

          <p className="text-xs sm:text-sm text-[#173B3D]/75 mt-2 leading-relaxed max-w-lg mx-auto">
            Every piece on Curowit is made by passionate independent artisans across India. Discover their workshops, hands, and quiet dedication.
          </p>
        </div>
      </div>

      {/* ========================================================
          Moving Right to Left Creator Cards (Slow Continuous Marquee)
          ======================================================== */}
      <div className="relative w-full overflow-hidden group-marquee py-3">
        {/* Left & Right Soft Fade Masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-20 md:w-32 bg-gradient-to-r from-[#F7EBD7] via-[#F7EBD7]/80 to-transparent z-20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-20 md:w-32 bg-gradient-to-l from-[#F7EBD7] via-[#F7EBD7]/80 to-transparent z-20"
          aria-hidden="true"
        />

        {/* Moving Track: glides right to left, pauses on hover */}
        <div className="animate-slow-marquee flex items-end gap-4 sm:gap-6 pl-4">
          {/* First set of creators */}
          {CREATORS.map((creator, idx) => {
            const cardHeight = waveHeights[idx % waveHeights.length];

            return (
              <div
                key={`creator-1-${creator.id}`}
                onClick={() => navigateToCreator(creator.id)}
                className={`w-[170px] sm:w-[200px] md:w-[220px] ${cardHeight} shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFF8EA] border border-[#07545A]/15 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-104 relative flex flex-col justify-end`}
                title={`Visit ${creator.name}'s Studio`}
              >
                {/* Creator Image Background */}
                <div className="absolute inset-0 bg-[#EADCC8]">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Dark Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173B3D]/95 via-[#173B3D]/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                </div>

                {/* Top Badge */}
                {creator.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#FFF8EA] bg-[#07545A]/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 shadow-2xs">
                      {creator.badge}
                    </span>
                  </div>
                )}

                {/* Rating Badge (Top Right) */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
                  <Star className="w-2.5 h-2.5 fill-[#F2A900] text-[#F2A900]" />
                  <span>{creator.rating}</span>
                </div>

                {/* Creator Information Overlay at Bottom */}
                <div className="relative z-10 p-3 sm:p-4 text-white">
                  <h3 className="font-bold text-sm sm:text-base leading-tight font-display drop-shadow-xs group-hover:text-[#F7EBD7] transition-colors">
                    {creator.name}
                  </h3>

                  <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5 font-medium">
                    {creator.specialty.split('•')[0]}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-white/70 mt-1.5 pt-1.5 border-t border-white/15">
                    <MapPin className="w-3 h-3 text-[#E97868] shrink-0" />
                    <span className="truncate">{creator.location.split(',')[0]}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80">{creator.salesCount}+ pieces</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Seamless Duplicate Set for Infinite Right-to-Left Gliding */}
          {CREATORS.map((creator, idx) => {
            const cardHeight = waveHeights[idx % waveHeights.length];

            return (
              <div
                key={`creator-2-${creator.id}`}
                onClick={() => navigateToCreator(creator.id)}
                className={`w-[170px] sm:w-[200px] md:w-[220px] ${cardHeight} shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFF8EA] border border-[#07545A]/15 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-104 relative flex flex-col justify-end`}
                title={`Visit ${creator.name}'s Studio`}
              >
                {/* Creator Image Background */}
                <div className="absolute inset-0 bg-[#EADCC8]">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Dark Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173B3D]/95 via-[#173B3D]/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                </div>

                {/* Top Badge */}
                {creator.badge && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#FFF8EA] bg-[#07545A]/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 shadow-2xs">
                      {creator.badge}
                    </span>
                  </div>
                )}

                {/* Rating Badge (Top Right) */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
                  <Star className="w-2.5 h-2.5 fill-[#F2A900] text-[#F2A900]" />
                  <span>{creator.rating}</span>
                </div>

                {/* Creator Information Overlay at Bottom */}
                <div className="relative z-10 p-3 sm:p-4 text-white">
                  <h3 className="font-bold text-sm sm:text-base leading-tight font-display drop-shadow-xs group-hover:text-[#F7EBD7] transition-colors">
                    {creator.name}
                  </h3>

                  <p className="text-[11px] text-white/85 line-clamp-1 mt-0.5 font-medium">
                    {creator.specialty.split('•')[0]}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-white/70 mt-1.5 pt-1.5 border-t border-white/15">
                    <MapPin className="w-3 h-3 text-[#E97868] shrink-0" />
                    <span className="truncate">{creator.location.split(',')[0]}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/80">{creator.salesCount}+ pieces</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
