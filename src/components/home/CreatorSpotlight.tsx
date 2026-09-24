import React from 'react';
import { CREATORS, Creator } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Star, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export const CreatorSpotlight: React.FC = () => {
  const { navigateToCreator, setActiveView } = useStore();

  return (
    <section className="py-12 sm:py-16 bg-[#F7EBD7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Artisans & Makers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Meet the Creators
            </h2>
            <p className="text-sm text-[#173B3D]/70 mt-1 max-w-xl">
              Behind every beautiful piece is a creative mind. Discover their stories, hands, and inspiration.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveView('creators');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer group"
          >
            <span>Explore All Creators</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CREATORS.map((creator) => (
            <div
              key={creator.id}
              onClick={() => navigateToCreator(creator.id)}
              className="group bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigateToCreator(creator.id);
              }}
            >
              <div>
                {/* Creator Avatar & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#07545A]/15 group-hover:border-[#07545A] transition-colors"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#3F704B] border-2 border-[#FFF8EA]" />
                  </div>
                  {creator.badge && (
                    <span className="text-[11px] font-bold text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded-md">
                      {creator.badge}
                    </span>
                  )}
                </div>

                {/* Creator Info */}
                <h3 className="font-bold text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors">
                  {creator.name}
                </h3>
                <span className="text-xs text-[#07545A] font-medium block mt-0.5">
                  {creator.specialty}
                </span>

                <p className="text-xs text-[#173B3D]/70 mt-2 line-clamp-2">
                  {creator.bio}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#07545A]/10">
                <div className="flex items-center justify-between text-xs text-[#687778] mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#07545A]" />
                    {creator.location.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#173B3D]">
                    <Star className="w-3 h-3 fill-[#F2A900] text-[#F2A900]" />
                    {creator.rating}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCreator(creator.id);
                  }}
                  className="w-full py-2 bg-[#F7EBD7] text-[#07545A] font-semibold text-xs rounded-xl hover:bg-[#07545A] hover:text-[#FFF8EA] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Creator Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
