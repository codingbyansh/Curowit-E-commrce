import React from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, setActiveView } = useStore();

  const savedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display">
            Your Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1">
            Handcrafted pieces you’re keeping an eye on.
          </p>
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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
              Tap the heart icon on any handmade creation to save it to your personal craft wishlist.
            </p>
            <button
              onClick={() => {
                setActiveView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl hover:bg-[#063F45] transition-colors cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
