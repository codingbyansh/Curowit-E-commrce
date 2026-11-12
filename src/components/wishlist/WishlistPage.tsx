import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS, Product } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import {
  Heart,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Check,
  RefreshCw,
  Smartphone,
  Laptop,
  Sparkles,
  Info,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
    addToCart,
    setActiveView,
    products,
    user,
    setIsAuthModalOpen,
    wishlistSyncStatus,
    showToast,
  } = useStore();

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [movingAllToCart, setMovingAllToCart] = useState(false);

  const catalog = products && products.length > 0 ? products : PRODUCTS;
  const savedProducts = catalog.filter((p) => wishlist.includes(p.id));

  // Handle Move All to Cart
  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    setMovingAllToCart(true);
    let addedCount = 0;
    savedProducts.forEach((p) => {
      if (p.inStock) {
        addToCart(p, 1);
        addedCount++;
      }
    });
    setTimeout(() => {
      setMovingAllToCart(false);
      showToast(
        'Added to Bag!',
        `Moved ${addedCount} handcrafted ${addedCount === 1 ? 'piece' : 'pieces'} into your shopping bag.`
      );
    }, 300);
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-28 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Real-Time Sync Indicator */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#07545A]/12">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-[#E97868] text-[#E97868]" />
                <span>Saved Wishlist ({savedProducts.length})</span>
              </span>

              {/* Real-time Cloud Sync Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  wishlistSyncStatus === 'synced'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : wishlistSyncStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="Wishlist updates sync immediately across your open tabs and devices"
              >
                <span className="relative flex h-2 w-2">
                  {wishlistSyncStatus === 'synced' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  {wishlistSyncStatus === 'syncing' && (
                    <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-amber-500 border-t-transparent"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      wishlistSyncStatus === 'synced'
                        ? 'bg-emerald-600'
                        : wishlistSyncStatus === 'syncing'
                        ? 'bg-amber-500'
                        : 'bg-stone-400'
                    }`}
                  ></span>
                </span>
                <span>
                  {wishlistSyncStatus === 'synced'
                    ? 'Real-Time Cloud Synced'
                    : wishlistSyncStatus === 'syncing'
                    ? 'Syncing across devices...'
                    : 'Offline Cache Active'}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Handcrafted Treasures You’re Saving
            </h1>

            <p className="text-xs sm:text-sm text-[#173B3D]/75 mt-1.5 flex items-center gap-2 flex-wrap">
              <span>Pieces saved here remain synchronized in real time across your devices.</span>
              {user.isLoggedIn ? (
                <span className="text-[#07545A] font-medium inline-flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Linked to {user.email || user.name}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[#07545A] font-bold underline hover:text-[#063F45] cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#E97868]" />
                  <span>Sign in to access from any phone or laptop</span>
                </button>
              )}
            </p>
          </div>

          {/* Action Toolbar */}
          {savedProducts.length > 0 && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                disabled={movingAllToCart}
                className="px-4 py-2.5 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl hover:bg-[#063F45] transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{movingAllToCart ? 'Moving to Bag...' : 'Move All to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                className="px-3 py-2.5 bg-white text-[#173B3D]/70 hover:text-rose-600 border border-[#07545A]/15 text-xs font-semibold rounded-xl hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Clear all saved pieces"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear Wishlist Confirmation Modal */}
        {isConfirmClearOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/20 p-6 max-w-sm w-full shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#07545A] font-display">Clear your wishlist?</h3>
                <p className="text-xs text-[#173B3D]/70 mt-1">
                  This will remove all {savedProducts.length} saved handmade pieces across all your devices.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#173B3D]/70 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearWishlist();
                    setIsConfirmClearOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer shadow-xs"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Cards Grid or Empty State */}
        {savedProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {savedProducts.map((p) => (
                <div key={p.id} className="relative group flex flex-col">
                  {/* Standard Product Card */}
                  <ProductCard product={p} />

                  {/* Quick Action Overlay for Wishlist Page */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);
                        showToast('Added to Bag', p.name);
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#07545A]/10 hover:bg-[#07545A] text-[#07545A] hover:text-[#FFF8EA] text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(p.id)}
                      className="p-1.5 bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border border-[#07545A]/10"
                      title="Remove from wishlist"
                      aria-label={`Remove ${p.name} from wishlist`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync Explainer Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8EA] border border-[#07545A]/15 flex items-start sm:items-center gap-3 text-xs text-[#173B3D]/80">
              <div className="w-8 h-8 rounded-full bg-[#07545A]/10 text-[#07545A] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <strong className="text-[#07545A] font-bold block sm:inline mr-1">
                  Instant Multi-Device Sync:
                </strong>
                Any item you save or remove here instantly updates across your computer, phone, and tablet sessions in real time.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#FFF8EA] rounded-3xl border border-[#07545A]/10 max-w-lg mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F7EBD7] text-[#E97868] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#07545A] font-display mb-2">
              Save the pieces you love.
            </h2>
            <p className="text-xs text-[#173B3D]/70 max-w-sm mx-auto mb-6">
              Tap the heart icon on any handmade creation to save it to your personal craft wishlist. Your saved pieces sync live across all your devices.
            </p>
            <button
              onClick={() => {
                setActiveView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl hover:bg-[#063F45] transition-colors cursor-pointer"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
