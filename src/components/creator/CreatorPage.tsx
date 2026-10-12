import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CREATORS, PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import {
  MapPin,
  Star,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Heart,
  Hammer,
  Scissors,
  Award,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { ArtisanCraftBackground } from './ArtisanCraftBackground';

export const CreatorPage: React.FC = () => {
  const { selectedCreator, setActiveView, showToast, creators, products } = useStore();

  const creator = selectedCreator || (creators && creators[0]) || CREATORS[0];
  const creatorProducts = (products || PRODUCTS).filter((p) => p.creatorId === creator.id);

  const handleFollow = () => {
    showToast(`Following ${creator.name}!`, 'You will be notified when new creations are listed.');
  };

  return (
    <ArtisanCraftBackground theme="warm-paper" className="min-h-screen py-6 sm:py-10 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveView('creators')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07545A] hover:text-[#E69A16] cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>All Creators</span>
          </button>

          {/* Quick Deep Link to Founding Creator Program */}
          <button
            onClick={() => {
              window.history.pushState(null, '', '/foundingcreator');
              setActiveView('foundingcreator');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07545A] bg-[#FFF8EA]/90 hover:bg-[#FFF8EA] px-3 py-1.5 rounded-full border border-[#07545A]/20 transition-all shadow-2xs hover:border-[#07545A]/40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Join Founding Creator Cohort →</span>
          </button>
        </div>

        {/* Creator Banner & Bio Box with Architectural Craft Stitch Borders */}
        <div className="relative bg-[#FFF8EA]/95 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#07545A]/20 shadow-sm mb-10 overflow-hidden">
          {/* Decorative Corner Blueprint Markers */}
          <div className="absolute top-2 left-2 text-[9px] font-mono text-[#173B3D]/30 select-none pointer-events-none">
            + SPEC-01 · STUDIO VERIFIED
          </div>
          <div className="absolute top-2 right-2 text-[9px] font-mono text-[#173B3D]/30 select-none pointer-events-none">
            70% ARTISAN SHARE
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#07545A]/15">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-[#07545A]/25 shadow-xs"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#3F704B] border-2 border-[#FFF8EA]" title="Active Studio Online" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#173B3D] font-display">
                    {creator.name}
                  </h1>
                  {creator.badge && (
                    <span className="text-[11px] font-bold text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded-md border border-[#07545A]/15">
                      {creator.badge}
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-[#07545A] mt-0.5 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-[#E69A16]" />
                  <span>{creator.specialty}</span>
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleFollow}
                className="px-5 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Follow Studio</span>
              </button>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#3F704B]">
                  The Artisan Story & Craft Discipline
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-[#3F704B]/30 to-transparent" />
              </div>
              <p className="text-xs sm:text-sm text-[#173B3D]/85 leading-relaxed font-serif">
                {creator.story}
              </p>

              {/* Artisan Blueprint Details */}
              <div className="mt-4 pt-3 border-t border-dashed border-[#173B3D]/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-[#173B3D]/75 font-mono">
                <div>
                  <span className="text-[#687778] block text-[10px]">CRAFT TECHNIQUE:</span>
                  <span className="font-semibold text-[#07545A]">Slow-Hand Crafted</span>
                </div>
                <div>
                  <span className="text-[#687778] block text-[10px]">PACKAGING:</span>
                  <span className="font-semibold text-[#3F704B]">100% Plastic-Free</span>
                </div>
                <div>
                  <span className="text-[#687778] block text-[10px]">VERIFICATION:</span>
                  <span className="font-semibold text-[#173B3D]">Curowit Master Tier</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F7EBD7]/80 rounded-2xl p-4 text-xs space-y-3 border border-[#07545A]/15 relative">
              <div className="flex items-center gap-2 text-[#07545A] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#3F704B]" />
                <span>Curowit Verified Atelier</span>
              </div>
              <p className="text-[11px] text-[#173B3D]/75 leading-relaxed">
                Studio visits, physical quality audits, and non-toxic material standards vetted by the Curowit Curatorial Board.
              </p>
              <div className="pt-2 border-t border-[#07545A]/10 flex items-center justify-between text-[10px] text-[#07545A] font-bold">
                <span>Direct Artisan Payout: 70%</span>
                <span className="text-emerald-700">✓ 7-Day SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Creator's Portfolio / Products with Craft Section Divider */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#07545A] font-display">
                Handmade Creations ({creatorProducts.length})
              </h2>
              <div className="hidden sm:block h-px w-24 bg-gradient-to-r from-[#07545A]/30 to-transparent" />
            </div>
            <span className="text-xs font-mono text-[#687778]">
              STUDIO CATALOG · ACTIVE BATCH
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {creatorProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Bottom Founding Creator Callout */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#FFF8EA]/90 border border-dashed border-[#173B3D]/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#07545A] bg-[#07545A]/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3 text-[#F2A900]" />
              <span>Are You an Independent Maker?</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#173B3D] font-display">
              Join the Curowit Founding Creator Cohort
            </h3>
            <p className="text-xs text-[#687778] max-w-xl">
              Showcase your handmade products, keep 70% of every sale with guaranteed 7-day payouts, and connect with patrons who value slow-crafted quality.
            </p>
          </div>

          <button
            onClick={() => {
              window.history.pushState(null, '', '/foundingcreator');
              setActiveView('foundingcreator');
            }}
            className="px-6 py-3 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span>Explore Creator Program</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ArtisanCraftBackground>
  );
};
