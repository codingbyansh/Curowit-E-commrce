import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS, CATEGORIES, Product } from '../../data/mockData';

export const SearchDrawer: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigateToProduct, setSelectedCategory, setActiveView } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches = [
    'crochet bunny',
    'pressed daisy earrings',
    'botanical candle',
    'ceramic mug',
    'seed paper cards',
    'diy embroidery kit',
  ];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const searchResults: Product[] = searchTerm.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    navigateToProduct(productId);
  };

  const handleSelectCategory = (catId: string) => {
    setIsSearchOpen(false);
    setSelectedCategory(catId);
    setActiveView('shop');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7EBD7]/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Search Bar */}
      <div className="bg-[#FFF8EA] border-b border-[#07545A]/15 px-4 sm:px-6 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Search className="w-5 h-5 text-[#07545A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search handmade pieces, creators, gifts, materials..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[#173B3D] placeholder:text-[#687778] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-[#687778] hover:text-[#173B3D] hover:bg-[#07545A]/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#07545A] bg-[#07545A]/10 hover:bg-[#07545A] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
        {searchTerm.trim() ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#687778]">
                Found {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-[#FFF8EA] border border-[#07545A]/10 hover:border-[#07545A]/30 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover bg-[#F7EBD7] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#687778] block">By {p.creatorName}</span>
                      <h4 className="text-sm font-semibold text-[#173B3D] group-hover:text-[#07545A] transition-colors truncate">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-[#07545A] tabular-nums">
                          ₹{p.price}
                        </span>
                        <span className="text-[11px] text-[#687778]">· {p.category}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#07545A]/40 group-hover:text-[#07545A] transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#173B3D]/70 mb-2">No creative finds found matching "{searchTerm}"</p>
                <p className="text-xs text-[#687778]">Try searching for crochet, candle, earrings, or ceramics.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="px-3.5 py-1.5 rounded-full bg-[#FFF8EA] border border-[#07545A]/15 text-xs font-medium text-[#173B3D] hover:bg-[#07545A] hover:text-white transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Explore Categories */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#687778] block mb-3">
                Browse Categories
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFF8EA] border border-[#07545A]/10 text-left hover:border-[#07545A] transition-colors cursor-pointer group"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-md object-cover shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-[#173B3D] group-hover:text-[#07545A] block truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-[#687778]">
                        {cat.itemCount} items
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
