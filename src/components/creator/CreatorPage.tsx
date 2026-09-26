import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CREATORS, PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { MapPin, Star, Sparkles, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

export const CreatorPage: React.FC = () => {
  const { selectedCreator, setActiveView, showToast, creators, products } = useStore();

  const creator = selectedCreator || (creators && creators[0]) || CREATORS[0];
  const creatorProducts = (products || PRODUCTS).filter((p) => p.creatorId === creator.id);

  const handleFollow = () => {
    showToast(`Following ${creator.name}!`, 'You will be notified when new creations are listed.');
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-6 sm:py-10 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActiveView('creators')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07545A] hover:text-[#E69A16] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Creators</span>
        </button>

        {/* Creator Banner & Bio Box */}
        <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#07545A]/10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-[#07545A]/20"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#3F704B] border-2 border-[#FFF8EA]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#173B3D] font-display">
                    {creator.name}
                  </h1>
                  {creator.badge && (
                    <span className="text-[11px] font-bold text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded-md">
                      {creator.badge}
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-[#07545A] mt-0.5">
                  {creator.specialty}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#687778] mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#07545A]" />
                    {creator.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#173B3D]">
                    <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
                    {creator.rating} ({creator.salesCount}+ pieces sold)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFollow}
              className="px-5 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Follow Studio</span>
            </button>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3F704B] mb-1.5">
                The Artisan Story
              </h2>
              <p className="text-xs sm:text-sm text-[#173B3D]/80 leading-relaxed">
                {creator.story}
              </p>
            </div>

            <div className="bg-[#F7EBD7] rounded-2xl p-4 text-xs space-y-2 border border-[#07545A]/10">
              <div className="flex items-center gap-2 text-[#07545A] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#3F704B]" />
                <span>Curowit Verified Maker</span>
              </div>
              <p className="text-[11px] text-[#173B3D]/70">
                Studio visits & material standards vetted by Curowit curatorial board.
              </p>
            </div>
          </div>
        </div>

        {/* Creator's Portfolio / Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#07545A] font-display">
              Handmade Creations ({creatorProducts.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {creatorProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
