import React from 'react';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';
import { Flame, ArrowRight } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const { setActiveView } = useStore();
  const trendingProducts = PRODUCTS.filter((p) => p.trending).slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-[#F7EBD7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E97868] mb-1.5">
              <Flame className="w-3.5 h-3.5 fill-[#E97868]" />
              <span>Community Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Trending on Curowit
            </h2>
            <p className="text-sm text-[#173B3D]/70 mt-1">
              Creative pieces people are loving and bringing into their homes right now.
            </p>
          </div>

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

        {/* 4-Column Grid on Desktop, 2-Column on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
