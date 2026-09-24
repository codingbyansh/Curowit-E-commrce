import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../../data/mockData';
import {
  Heart,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Share2,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateToCreator,
    setActiveView,
    showToast,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#F7EBD7] py-20 text-center">
        <p className="text-sm text-[#173B3D]/70 mb-4">No product selected</p>
        <button
          onClick={() => setActiveView('shop')}
          className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(selectedProduct.id);
  const gallery = selectedProduct.gallery?.length ? selectedProduct.gallery : [selectedProduct.image];

  // Related products from same category or creator
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.creatorId === selectedProduct.creatorId)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, personalizationText);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, personalizationText);
    setActiveView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'Share this handmade creation with friends');
    } else {
      showToast('Share link ready');
    }
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-4 sm:py-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => setActiveView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full text-[#07545A] hover:bg-[#07545A]/10 transition-colors cursor-pointer"
            aria-label="Share product"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Main Section (Desktop 2-Col, Mobile Stack) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-3xl overflow-hidden bg-[#FFF8EA] border border-[#07545A]/10 shadow-xs">
              <img
                src={gallery[activeImageIndex] || selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Discount / Tag */}
              {selectedProduct.discountBadge && (
                <div className="absolute top-4 left-4 z-10 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] border border-[#07545A]/15 text-xs font-bold px-3 py-1 rounded-lg shadow-2xs">
                  {selectedProduct.discountBadge}
                </div>
              )}

              {/* Floating Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  isFavorited
                    ? 'bg-[#E97868] text-white shadow-sm'
                    : 'bg-[#FFF8EA]/90 text-[#173B3D]/70 hover:text-[#E97868] hover:bg-[#FFF8EA]'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-[#FFF8EA] border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#07545A] ring-2 ring-[#07545A]/20 scale-102'
                        : 'border-[#07545A]/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 shadow-xs space-y-6">
            <div>
              {/* Creator Attribution */}
              <div
                onClick={() => navigateToCreator(selectedProduct.creatorId)}
                className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#F7EBD7] hover:bg-[#07545A]/10 transition-colors cursor-pointer mb-3 group"
              >
                <img
                  src={selectedProduct.creatorAvatar}
                  alt={selectedProduct.creatorName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#07545A]/20"
                />
                <span className="text-xs text-[#173B3D]/80">
                  Made by <strong className="text-[#07545A] group-hover:underline">{selectedProduct.creatorName}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#173B3D] font-display leading-tight">
                {selectedProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center gap-1 text-[#F2A900]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-[#173B3D] tabular-nums">{selectedProduct.rating}</span>
                </div>
                <span className="text-[#687778]">·</span>
                <span className="text-[#687778]">{selectedProduct.reviewCount} verified creator reviews</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-3 border-t border-[#07545A]/10">
              <span className="text-3xl font-bold text-[#07545A] tabular-nums">
                ₹{selectedProduct.price.toLocaleString('en-IN')}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-sm text-[#687778] line-through tabular-nums">
                  ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs font-semibold text-[#3F704B] ml-auto">
                {selectedProduct.inStock ? 'In Stock · Ready to Dispatch' : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#173B3D]/80 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Personalization if available */}
            {selectedProduct.personalizationAvailable && (
              <div className="p-3.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#07545A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>Free Personalization</span>
                </div>
                <input
                  type="text"
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  placeholder={selectedProduct.personalizationPlaceholder || 'Add custom note or monogram name'}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#FFF8EA] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                />
              </div>
            )}

            {/* Quantity Stepper & Actions (Desktop) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#173B3D] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 rounded-lg text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#07545A] text-[#FFF8EA] font-semibold text-xs hover:bg-[#063F45] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Creative Cart</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-4 rounded-xl bg-[#F2A900] text-[#07545A] font-bold text-xs hover:bg-[#E69A16] transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Instant Buy Now
              </button>
            </div>

            {/* Product Specifications & Craft Details */}
            <div className="border-t border-[#07545A]/10 pt-4 space-y-2.5 text-xs text-[#173B3D]/80">
              {selectedProduct.materials && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Materials:</span>
                  <span className="font-medium text-right text-[#173B3D]">
                    {selectedProduct.materials.join(', ')}
                  </span>
                </div>
              )}
              {selectedProduct.dimensions && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Dimensions:</span>
                  <span className="font-medium text-right text-[#173B3D]">
                    {selectedProduct.dimensions}
                  </span>
                </div>
              )}
              {selectedProduct.careInstructions && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Care:</span>
                  <span className="font-medium text-right text-[#173B3D] max-w-[200px]">
                    {selectedProduct.careInstructions}
                  </span>
                </div>
              )}
            </div>

            {/* Delivery & Trust Guarantee Strip */}
            <div className="border-t border-[#07545A]/10 pt-4 space-y-2 text-xs text-[#173B3D]/80">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#07545A] shrink-0 mt-0.5" />
                <span>{selectedProduct.shippingInfo}</span>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-[#07545A] shrink-0 mt-0.5" />
                <span>{selectedProduct.returnsInfo}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3F704B] shrink-0 mt-0.5" />
                <span>Handcrafted with non-toxic, sustainable materials.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creative Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-[#07545A]/10">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3F704B] block mb-1">
                More from {selectedProduct.category}
              </span>
              <h2 className="text-2xl font-bold text-[#07545A] font-display">
                You May Also Cherish
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Purchase Bar (Per Prompt Requirement 26) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#FFF8EA] border-t border-[#07545A]/15 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-[#687778] block">Handmade Price</span>
          <span className="text-base font-bold text-[#07545A] tabular-nums">
            ₹{selectedProduct.price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2 rounded-xl bg-[#F2A900] text-[#07545A] text-xs font-bold hover:bg-[#E69A16] transition-colors cursor-pointer active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
