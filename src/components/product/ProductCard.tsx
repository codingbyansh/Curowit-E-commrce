import React from 'react';
import { Product } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  aspectRatio?: 'square' | 'portrait';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  aspectRatio = 'portrait',
}) => {
  const {
    navigateToProduct,
    navigateToCreator,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const isFavorited = isInWishlist(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicked on wishlist heart, creator link or add to cart button, let those handle it
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-navigate]')) return;
    navigateToProduct(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
      role="article"
    >
      {/* Product Image Box */}
      <div
        className={`relative w-full overflow-hidden bg-[#F7EBD7] ${
          aspectRatio === 'square' ? 'aspect-square' : 'aspect-4/5'
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Left Text Tag (Single subtle text badge, no badge spam) */}
        {product.discountBadge && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-[#FFF8EA]/90 backdrop-blur-xs text-[#07545A] border border-[#07545A]/15 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
            {product.discountBadge}
          </div>
        )}

        {/* Floating Wishlist Heart Icon (Single Click Save) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md hover:scale-110 active:scale-90 border ${
            isFavorited
              ? 'bg-[#E97868] text-white border-[#E97868] shadow-[#E97868]/30 ring-2 ring-[#E97868]/25'
              : 'bg-[#FFF8EA]/95 text-[#173B3D]/75 border-[#07545A]/15 hover:text-[#E97868] hover:bg-[#FFF8EA] hover:border-[#E97868]/30'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          title={isFavorited ? 'Saved in Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
              isFavorited ? 'fill-current scale-105' : 'stroke-[2.2]'
            }`}
          />
        </button>

        {/* Quick Add Button Overlay (Desktop on Hover) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-lg shadow-sm hover:bg-[#063F45] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Creator Attribution */}
          <div className="flex items-center gap-1.5 text-xs text-[#687778] mb-1">
            <span className="text-[11px]">Made by</span>
            <button
              data-no-navigate="true"
              onClick={(e) => {
                e.stopPropagation();
                navigateToCreator(product.creatorId);
              }}
              className="font-medium text-[#07545A] hover:underline truncate max-w-[130px] sm:max-w-[160px] cursor-pointer"
            >
              {product.creatorName}
            </button>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm sm:text-base text-[#173B3D] line-clamp-2 leading-snug group-hover:text-[#07545A] transition-colors">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center gap-1 text-xs text-[#173B3D]/70 mt-1">
            <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
            <span className="font-semibold text-[#173B3D] tabular-nums">{product.rating}</span>
            <span className="text-[#687778]">({product.reviewCount})</span>
          </div>

          {/* Price & Mobile Add to Cart */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#07545A]/10">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-[#07545A] tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#687778] line-through tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Mobile-only Quick Add Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="sm:hidden p-1.5 rounded-lg bg-[#07545A] text-white active:scale-95 transition-transform"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
