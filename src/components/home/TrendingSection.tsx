import React from 'react';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';
import { Flame, ArrowRight } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const { setActiveView } = useStore();

  // Curate 8-10 standout trending and top-rated creations
  const trendingProducts = PRODUCTS.filter(
    (p) => p.trending || p.rating >= 4.85 || p.featured
  ).slice(0, 8);

  return (
    <section className="relative w-full overflow-hidden select-none" aria-label="Trending Products">
      {/* ========================================================
          Aesthetic Curved Top Shape Transition
          Flows gracefully from upper cream into warm clay curve
          ======================================================== */}
      <div className="w-full bg-[#F7EBD7] leading-none">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-12 md:h-16 block text-[#EFE2D2] fill-current"
          preserveAspectRatio="none"
        >
          {/* Smooth organic concave curve */}
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* ========================================================
          Aesthetic Warm Clay & Linen Background Body
          ======================================================== */}
      <div className="relative bg-[#EFE2D2] py-6 sm:py-10">
        {/* Soft Ambient Radial Craft Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_35%,#FFF6ED_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E97868] mb-1.5">
                <Flame className="w-3.5 h-3.5 fill-[#E97868]" />
                <span>Community Favorites</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
                Trending on Curowit
              </h2>

              <p className="text-xs sm:text-sm text-[#173B3D]/75 mt-1 max-w-xl leading-relaxed">
                Creative pieces people are loving and bringing into their homes right now.
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 self-start sm:self-end">
              <button
                onClick={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer group"
              >
                <span>See All Trending</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            Moving One Row of Trending Products (Slow Gliding Marquee)
            ======================================================== */}
        <div className="relative w-full overflow-hidden group-marquee py-2">
          {/* Left & Right Soft Fade Masks */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-[#EFE2D2] via-[#EFE2D2]/80 to-transparent z-20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-[#EFE2D2] via-[#EFE2D2]/80 to-transparent z-20"
            aria-hidden="true"
          />

          {/* Gliding Row Track */}
          <div className="animate-slow-marquee flex items-stretch gap-4 sm:gap-6 pl-4">
            {/* First Set */}
            {trendingProducts.map((product) => (
              <div
                key={`trend-1-${product.id}`}
                className="w-[230px] sm:w-[260px] md:w-[280px] shrink-0 transition-transform duration-300 hover:scale-102"
              >
                <ProductCard product={product} />
              </div>
            ))}

            {/* Seamless Duplicated Set for Infinite Loop */}
            {trendingProducts.map((product) => (
              <div
                key={`trend-2-${product.id}`}
                className="w-[230px] sm:w-[260px] md:w-[280px] shrink-0 transition-transform duration-300 hover:scale-102"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          Aesthetic Curved Bottom Shape Transition
          Flows seamlessly from warm clay curve into lower section (#FFF8EA)
          ======================================================== */}
      <div className="w-full bg-[#EFE2D2] leading-none">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-7 sm:h-12 md:h-16 block text-[#FFF8EA] fill-current"
          preserveAspectRatio="none"
        >
          {/* Smooth organic convex curve transition */}
          <path d="M0,0 C480,64 960,64 1440,0 L1440,64 L0,64 Z" />
        </svg>
      </div>
    </section>
  );
};
