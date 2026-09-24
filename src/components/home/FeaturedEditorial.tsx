import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';

export const FeaturedEditorial: React.FC = () => {
  const { navigateToProduct, addToCart } = useStore();
  const heroProduct = PRODUCTS[0]; // Heirloom Crochet Bunny
  const secondaryProduct = PRODUCTS[1]; // Botanical Candle

  return (
    <section className="py-12 sm:py-16 bg-[#FFF8EA] border-y border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Editorial Feature</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
            Made for You: Cozy Living & Mindful Gifts
          </h2>
          <p className="text-sm text-[#173B3D]/70 mt-2">
            Each piece is born in a quiet creator studio, crafted with natural raw elements and ready to bring lasting warmth to your days.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Large Showcase (7 cols) */}
          <div className="lg:col-span-7 bg-[#F7EBD7] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider bg-[#07545A] text-[#FFF8EA] px-2.5 py-1 rounded-md mb-3">
                Curator’s Choice
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mb-2">
                {heroProduct.name}
              </h3>
              <p className="text-sm text-[#173B3D]/80 max-w-md line-clamp-3">
                {heroProduct.description}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-[#07545A] font-medium">
                <span>By {heroProduct.creatorName}</span>
                <span>·</span>
                <span>Bengaluru, India</span>
              </div>
            </div>

            <div className="my-6 relative rounded-2xl overflow-hidden aspect-16/10 sm:aspect-16/9 bg-[#EADCC8]">
              <img
                src={heroProduct.image}
                alt={heroProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              />
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#07545A]/10">
              <div>
                <span className="text-xs text-[#687778] block">Handmade Price</span>
                <span className="text-2xl font-bold text-[#07545A] tabular-nums">
                  ₹{heroProduct.price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addToCart(heroProduct)}
                  className="px-5 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigateToProduct(heroProduct.id)}
                  className="px-4 py-2.5 rounded-xl border border-[#07545A]/20 text-[#07545A] text-xs font-semibold hover:bg-[#07545A]/5 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Story & Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Editorial Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Secondary Spotlight Card */}
            <div className="bg-[#F7EBD7] rounded-3xl p-6 border border-[#07545A]/10 flex flex-col justify-between flex-1 group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#3F704B] uppercase tracking-wider">
                    Pure Botanical Wax
                  </span>
                  <span className="text-sm font-bold text-[#07545A] tabular-nums">
                    ₹{secondaryProduct.price}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-[#07545A] font-display">
                  {secondaryProduct.name}
                </h4>
                <p className="text-xs text-[#173B3D]/70 mt-1 line-clamp-2">
                  Real pressed marigolds and daisies embedded in pure biodegradable soy wax.
                </p>
              </div>

              <div className="my-4 aspect-16/9 rounded-xl overflow-hidden bg-[#EADCC8]">
                <img
                  src={secondaryProduct.image}
                  alt={secondaryProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#687778]">
                  By {secondaryProduct.creatorName}
                </span>
                <button
                  onClick={() => navigateToProduct(secondaryProduct.id)}
                  className="text-xs font-bold text-[#07545A] hover:text-[#E69A16] flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Candle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Curowit Creative Promise Box */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-[#07545A] to-[#063F45] text-[#FFF8EA] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F2A900] mb-2">
                  <Heart className="w-3.5 h-3.5 fill-[#F2A900]" />
                  <span>The Curowit Standard</span>
                </div>
                <h4 className="text-lg font-bold font-display text-[#FFF8EA] mb-1.5">
                  Direct to Independent Creators
                </h4>
                <p className="text-xs text-[#F7EBD7]/80 leading-relaxed">
                  Every order on Curowit directly remunerates creative talent across India. No mass production. Zero factory shortcuts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FFF8EA]/15 flex items-center justify-between text-xs text-[#F2A900]">
                <span>100% Verified Artisans</span>
                <span>Eco-Friendly Parcel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
