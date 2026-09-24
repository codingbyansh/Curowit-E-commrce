import React from 'react';
import { WORKSHOPS, Workshop } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, Video } from 'lucide-react';

export const WorkshopsSection: React.FC = () => {
  const { showToast } = useStore();

  const handleRegister = (ws: Workshop) => {
    showToast(`Saved seat inquiry for ${ws.title}`, 'Workshop details sent to your registered email');
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F7EBD7] border-t border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Creative Experiences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Learn. Create. Share.
            </h2>
            <p className="text-sm text-[#173B3D]/70 mt-1 max-w-xl">
              Intimate hands-on workshops hosted by our featured makers. Discover the craft firsthand.
            </p>
          </div>
        </div>

        {/* Workshops Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {WORKSHOPS.map((ws) => (
            <div
              key={ws.id}
              className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                <img
                  src={ws.image}
                  alt={ws.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#FFF8EA]/90 backdrop-blur-xs text-[#07545A] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#07545A]/15 flex items-center gap-1">
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

                <div className="absolute top-2.5 right-2.5 bg-[#07545A] text-[#FFF8EA] text-[11px] font-bold px-2 py-0.5 rounded-md">
                  {ws.seatsLeft} seats left
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#687778] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#07545A]" />
                      {ws.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#07545A]" />
                      {ws.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-[#173B3D]/70 mt-1.5 line-clamp-2">
                    {ws.description}
                  </p>

                  <div className="text-xs text-[#07545A] font-medium mt-2">
                    Hosted by {ws.creatorName}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#687778] block">Registration</span>
                    <span className="text-lg font-bold text-[#07545A] tabular-nums">
                      ₹{ws.price}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRegister(ws)}
                    className="px-4 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
