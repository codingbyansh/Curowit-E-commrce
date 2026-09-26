import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, Heart, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';

export const FeaturedEditorial: React.FC = () => {
  const { navigateToProduct, addToCart, toggleWishlist, isInWishlist, products } = useStore();
  const allProducts = products && products.length >= 4 ? products : PRODUCTS;

  const heroProduct = allProducts[0]; // Primary showcase product
  const companionProducts = [
    allProducts[1] || allProducts[0],
    allProducts[2] || allProducts[0],
    allProducts[3] || allProducts[0],
  ];

  return (
    <section className="relative py-8 sm:py-12 bg-[#FFF8EA] overflow-hidden" aria-label="Made for You Editorial">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact, Punchy Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3F704B] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Curated Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display">
            Made for You: Cozy Living & Mindful Gifts
          </h2>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-md mx-auto line-clamp-1">
            Handcrafted treasures born in quiet creator studios.
          </p>
        </div>

        {/* ========================================================
            Compact Side-by-Side Product Showcase (Product is Prominent!)
            ======================================================== */}
        <div className="bg-[#F7EBD7] rounded-3xl sm:rounded-[32px] p-4 sm:p-6 border border-[#07545A]/12 shadow-xs mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center">
            {/* Prominent Large Product Image (Left Column on Desktop) */}
            <div className="md:col-span-5 lg:col-span-5 relative">
              <div
                onClick={() => navigateToProduct(heroProduct.id)}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-square max-h-[320px] w-full bg-[#EADCC8] shadow-sm border border-[#07545A]/10 group cursor-pointer"
              >
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                />

                {/* Floating Single-Click Heart Wishlist Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(heroProduct.id);
                  }}
                  className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md border ${
                    isInWishlist(heroProduct.id)
                      ? 'bg-[#E97868] text-white border-[#E97868]'
                      : 'bg-[#FFF8EA]/95 text-[#173B3D]/75 border-[#07545A]/15 hover:text-[#E97868] hover:bg-[#FFF8EA]'
                  }`}
                  aria-label="Save to Wishlist"
                  title={isInWishlist(heroProduct.id) ? 'Saved' : 'Save to Wishlist'}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      isInWishlist(heroProduct.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>

                {/* Small Tag on Image */}
                <div className="absolute bottom-2.5 left-2.5 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 shadow-2xs">
                  ✨ 100% Cotton Yarn
                </div>
              </div>
            </div>

            {/* Short & Concise Product Details (Right Column on Desktop) */}
            <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#07545A] text-[#FFF8EA] px-2.5 py-0.5 rounded-full">
                    Curator’s Choice
                  </span>
                  <span className="text-[11px] font-semibold text-[#3F704B] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Handmade</span>
                  </span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-[#F2A900]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#173B3D]">{heroProduct.rating}</span>
                  </div>
                </div>

                <h3
                  onClick={() => navigateToProduct(heroProduct.id)}
                  className="text-xl sm:text-2xl font-bold text-[#07545A] font-display hover:text-[#E69A16] transition-colors cursor-pointer"
                >
                  {heroProduct.name}
                </h3>

                <p className="text-xs text-[#07545A] font-semibold mt-1">
                  By {heroProduct.creatorName} · Bengaluru Studio
                </p>

                <p className="text-xs sm:text-sm text-[#173B3D]/75 mt-2 line-clamp-2 leading-relaxed">
                  {heroProduct.description}
                </p>
              </div>

              {/* Price & Action Bar */}
              <div className="mt-4 pt-3 border-t border-[#07545A]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-[#07545A] tabular-nums font-display">
                    ₹{heroProduct.price.toLocaleString('en-IN')}
                  </span>
                  {heroProduct.originalPrice && (
                    <span className="text-xs text-[#687778] line-through">
                      ₹{heroProduct.originalPrice}
                    </span>
                  )}
                  {heroProduct.discountBadge && (
                    <span className="text-[10px] font-bold text-[#E97868] bg-[#E97868]/10 px-2 py-0.5 rounded-full">
                      {heroProduct.discountBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addToCart(heroProduct)}
                    className="px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    onClick={() => navigateToProduct(heroProduct.id)}
                    className="px-3.5 py-2 rounded-xl border border-[#07545A]/25 text-[#07545A] text-xs font-semibold hover:bg-[#07545A]/5 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            Compact 3-Card Companion Row (Short & Prominent Images)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {companionProducts.map((product) => {
            const isFav = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                onClick={() => navigateToProduct(product.id)}
                className="bg-[#F7EBD7] rounded-2xl p-3 border border-[#07545A]/10 hover:border-[#07545A]/25 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group cursor-pointer"
              >
                {/* Prominent Small Square Image */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-[#EADCC8] border border-[#07545A]/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
                      isFav ? 'bg-[#E97868] text-white' : 'bg-[#FFF8EA]/85 text-[#173B3D]/70'
                    }`}
                  >
                    <Heart className={`w-2.5 h-2.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Concise Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#3F704B] block truncate">
                    {product.category}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#173B3D] group-hover:text-[#07545A] truncate mt-0.5">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#07545A]/10">
                    <span className="font-bold text-xs sm:text-sm text-[#07545A]">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#07545A] text-[#FFF8EA] text-[10px] font-semibold hover:bg-[#063F45] transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
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
