import React from 'react';
import { WORKSHOPS, Workshop } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Calendar, Clock, Video, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export const WorkshopsPage: React.FC = () => {
  const { showToast } = useStore();

  const handleBookSpot = (ws: Workshop) => {
    showToast(`Booked: ${ws.title}`, `Confirmation & craft prep kit details sent to your email`);
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clean, direct title */}
        <div className="mb-8 border-b border-[#07545A]/10 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5 bg-[#FFF8EA] px-3 py-1 rounded-full border border-[#07545A]/10 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Creative Experiences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
            Artisan Craft Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl">
            Intimate hands-on workshops hosted by our featured makers. Discover craft firsthand.
          </p>
        </div>

        {/* ========================================================
            Static Workshop Listing Grid (No Moving Marquee)
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {WORKSHOPS.map((ws) => (
            <div
              key={ws.id}
              className="bg-[#FFF8EA] rounded-2xl sm:rounded-3xl border border-[#07545A]/12 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Workshop Photo Frame */}
              <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                <img
                  src={ws.image}
                  alt={ws.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Format Badge */}
                <div className="absolute top-3 left-3 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 flex items-center gap-1 shadow-2xs">
                  {ws.format === 'Live Online' ? (
                    <>
                      <Video className="w-3 h-3 text-[#3F704B]" />
                      <span>Live Online</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3 text-[#E97868]" />
                      <span>{ws.location || 'Studio Offline'}</span>
                    </>
                  )}
                </div>

                {/* Seats Left Pill */}
                <div className="absolute top-3 right-3 bg-[#07545A] text-[#FFF8EA] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {ws.seatsLeft} seats left
                </div>
              </div>

              {/* Minimal Text Details */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#687778] mb-1.5 font-medium">
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

                  <h2 className="font-bold text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-1">
                    {ws.title}
                  </h2>

                  <div className="text-xs text-[#07545A] font-semibold mt-1 truncate">
                    Hosted by {ws.creatorName}
                  </div>
                </div>

                {/* Bottom Spot Fee & Book Action */}
                <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#687778] uppercase font-medium block">Spot Fee</span>
                    <span className="text-base sm:text-lg font-bold text-[#07545A] tabular-nums font-display">
                      ₹{ws.price}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookSpot(ws)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                    aria-label={`Book spot for ${ws.title}`}
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
  );
};
