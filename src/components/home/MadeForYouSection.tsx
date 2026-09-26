import React, { useRef } from 'react';
import { PRODUCTS, Product } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Coffee } from 'lucide-react';

export const MadeForYouSection: React.FC = () => {
  const { navigateToProduct, addToCart, toggleWishlist, isInWishlist } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Curate 8 cozy handcrafted products ideal for personal comfort & home
  const cozyProductIds = [
    'prod-crochet-bunny',
    'prod-botanical-candle',
    'prod-painted-mug',
    'prod-crochet-sunflower-pot',
    'prod-resin-daisy-earrings',
    'prod-scented-wax-sachets',
    'prod-macrame-plant-hanger',
    'prod-pressed-flower-bookmark',
  ];

  const cozyProducts = cozyProductIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden select-none py-10 sm:py-16 bg-[#FFF8EA]" aria-label="Made For You Cozy Showcase">
      {/* ========================================================
          Aesthetic Curved Backdrop with Organic Arched Ribbon
          ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Cozy Aesthetic */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#C46843]" />
              <span>Cozy Corner</span>
              <span className="text-[#07545A]/40">·</span>
              <span className="text-[#07545A] font-bold">Curated Warmth</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Made for You
            </h2>

            <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl leading-relaxed">
              Tactile, comforting creations chosen for your quiet corners, evening teas, and personal spaces.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-[#F7EBD7] hover:bg-[#EFE2D2] text-[#07545A] flex items-center justify-center border border-[#07545A]/15 shadow-2xs transition-all cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-[#F7EBD7] hover:bg-[#EFE2D2] text-[#07545A] flex items-center justify-center border border-[#07545A]/15 shadow-2xs transition-all cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            Curved Product Showcase Style:
            Features a curved decorative track line & arched curved cards
            with small, charming product images
            ======================================================== */}
        <div className="relative">
          {/* Subtle Curved Guide Ribbon SVG in Background */}
          <div className="absolute top-16 left-0 right-0 h-28 pointer-events-none opacity-40 hidden md:block">
            <svg
              viewBox="0 0 1200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#E97868]/25"
              preserveAspectRatio="none"
            >
              <path
                d="M0,80 Q300,10 600,60 T1200,30"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          {/* Horizontal Scrollable Curved Deck */}
          <div
            ref={scrollContainerRef}
            className="flex items-end gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 pt-4 px-2 snap-x snap-mandatory"
          >
            {cozyProducts.map((product, idx) => {
              const isFavorited = isInWishlist(product.id);

              // Wave curve vertical modulation: creates a gentle undulating curve across the showcase row
              const curveOffsets = [0, -12, -22, -14, 0, -16, -24, -10];
              const curveY = curveOffsets[idx % curveOffsets.length];

              return (
                <div
                  key={product.id}
                  style={{ transform: `translateY(${curveY}px)` }}
                  className="snap-start shrink-0 w-[180px] sm:w-[205px] md:w-[220px] transition-transform duration-300 hover:!-translate-y-6 group cursor-pointer"
                  onClick={() => navigateToProduct(product.id)}
                >
                  {/* Curved Arch Showcase Card */}
                  <div className="relative bg-[#FBF3E8] rounded-t-[36px] rounded-b-2xl border border-[#07545A]/12 p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                    {/* Top Delicate Arch Accent */}
                    <div className="w-12 h-1 bg-[#07545A]/15 rounded-full mb-2.5" />

                    {/* Small Product Image Container (Arched Window Style) */}
                    <div className="relative w-28 h-28 sm:w-34 sm:h-34 md:w-36 md:h-36 rounded-t-[28px] rounded-b-xl overflow-hidden bg-[#FFF8EA] shadow-2xs border border-[#07545A]/10 mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                      />

                      {/* Floating Single-Click Heart Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs border ${
                          isFavorited
                            ? 'bg-[#E97868] text-white border-[#E97868]'
                            : 'bg-[#FFF8EA]/90 text-[#173B3D]/70 border-[#07545A]/15 hover:text-[#E97868] hover:bg-[#FFF8EA]'
                        }`}
                        aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                        title={isFavorited ? 'Saved' : 'Save to Wishlist'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                            isFavorited ? 'fill-current' : ''
                          }`}
                        />
                      </button>

                      {/* Small subtle discount badge if present */}
                      {product.discountBadge && (
                        <div className="absolute bottom-1.5 left-1.5 z-10 bg-[#FFF8EA]/95 text-[#07545A] text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-[#07545A]/15">
                          {product.discountBadge}
                        </div>
                      )}
                    </div>

                    {/* Category / Maker Specialty Tag */}
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-[#3F704B] line-clamp-1 mb-0.5">
                      {product.creatorName}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-xs sm:text-sm text-[#173B3D] group-hover:text-[#07545A] transition-colors line-clamp-2 leading-tight min-h-[32px] sm:min-h-[36px]">
                      {product.name}
                    </h3>

                    {/* Price & Quick Add Bar */}
                    <div className="mt-2 pt-2 border-t border-[#07545A]/10 w-full flex items-center justify-between">
                      <div className="flex items-baseline gap-1 text-left">
                        <span className="font-bold text-xs sm:text-sm text-[#07545A]">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-[#687778] line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-2xs"
                        title="Quick Add to Bag"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
