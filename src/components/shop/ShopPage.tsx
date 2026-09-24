import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS, CATEGORIES, CREATORS, Product } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { Filter, SlidersHorizontal, X, Check, Star } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useStore();

  const [sortOption, setSortOption] = useState<string>('recommended');
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyPersonalized, setOnlyPersonalized] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category
      if (selectedCategory !== 'all') {
        const cat = CATEGORIES.find((c) => c.id === selectedCategory);
        if (cat && !p.category.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])) {
          return false;
        }
      }

      // Creator
      if (selectedCreatorFilter !== 'all' && p.creatorId !== selectedCreatorFilter) {
        return false;
      }

      // Price
      if (p.price > priceMax) {
        return false;
      }

      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      // Stock
      if (onlyInStock && !p.inStock) {
        return false;
      }

      // Personalized
      if (onlyPersonalized && !p.personalizationAvailable) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      if (sortOption === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      // recommended
      return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    });
  }, [
    selectedCategory,
    selectedCreatorFilter,
    priceMax,
    minRating,
    onlyInStock,
    onlyPersonalized,
    sortOption,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCreatorFilter('all');
    setPriceMax(2000);
    setMinRating(0);
    setOnlyInStock(false);
    setOnlyPersonalized(false);
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCreatorFilter !== 'all' ? 1 : 0) +
    (priceMax < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (onlyPersonalized ? 1 : 0);

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs text-[#687778] mb-1">
            <span>Curowit</span> <span className="mx-1">/</span> <span className="text-[#07545A] font-semibold">Storefront</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#07545A] font-display">
            Shop All Creatives
          </h1>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl">
            Authentic, slow-crafted pieces from verified independent artisans across India.
          </p>
        </div>

        {/* Quick Category Chips Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs'
                : 'bg-[#FFF8EA] border border-[#07545A]/15 text-[#173B3D]/80 hover:border-[#07545A]'
            }`}
          >
            All Disciplines
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs'
                  : 'bg-[#FFF8EA] border border-[#07545A]/15 text-[#173B3D]/80 hover:border-[#07545A]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Control Toolbar */}
        <div className="flex items-center justify-between bg-[#FFF8EA] p-3 sm:p-4 rounded-2xl border border-[#07545A]/10 shadow-2xs mb-8">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 text-xs font-bold text-[#07545A] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#07545A] text-white text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <span className="text-xs text-[#687778]">
              Showing <strong className="text-[#173B3D] tabular-nums">{filteredProducts.length}</strong> creations
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#687778] hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#F7EBD7] text-xs font-semibold text-[#07545A] border border-[#07545A]/15 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#07545A] cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#07545A]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#07545A]">
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#E97868] hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Filter: Creator */}
            <div>
              <label className="text-xs font-bold text-[#173B3D] block mb-2">Creator</label>
              <select
                value={selectedCreatorFilter}
                onChange={(e) => setSelectedCreatorFilter(e.target.value)}
                className="w-full bg-[#F7EBD7] text-xs text-[#173B3D] rounded-xl p-2.5 border border-[#07545A]/15 focus:outline-none"
              >
                <option value="all">All Creators</option>
                {CREATORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Max Price */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#173B3D]">Max Price</span>
                <span className="font-bold text-[#07545A] tabular-nums">₹{priceMax}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#07545A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#687778] mt-1">
                <span>₹200</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Filter: Rating */}
            <div>
              <label className="text-xs font-bold text-[#173B3D] block mb-2">Minimum Rating</label>
              <div className="space-y-1.5">
                {[0, 4.5, 4.8].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(stars)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      minRating === stars
                        ? 'bg-[#07545A] text-[#FFF8EA]'
                        : 'bg-[#F7EBD7] text-[#173B3D] hover:bg-[#07545A]/10'
                    }`}
                  >
                    <span>{stars === 0 ? 'Any rating' : `${stars}★ & above`}</span>
                    {minRating === stars && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#07545A]/10">
              <label className="flex items-center gap-2.5 text-xs text-[#173B3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-[#07545A] text-[#07545A] focus:ring-0"
                />
                <span>In Stock only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-[#173B3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPersonalized}
                  onChange={(e) => setOnlyPersonalized(e.target.checked)}
                  className="rounded border-[#07545A] text-[#07545A] focus:ring-0"
                />
                <span>Personalization Available</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area (3 cols on desktop when sidebar present, 2 cols on mobile) */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-8">
                <div className="w-12 h-12 rounded-full bg-[#F7EBD7] text-[#07545A] flex items-center justify-center mx-auto mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#173B3D] mb-1 font-display">
                  No creations match your current filters
                </h3>
                <p className="text-xs text-[#687778] max-w-sm mx-auto mb-4">
                  Try adjusting the price range or clearing category filters to discover more items.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFF8EA] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 border-t border-[#07545A]/20 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#07545A]/10 mb-4">
              <span className="text-sm font-bold text-[#07545A]">Refine Creations</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-[#687778] hover:text-[#173B3D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Creator Filter */}
              <div>
                <label className="text-xs font-bold text-[#173B3D] block mb-1.5">Creator</label>
                <select
                  value={selectedCreatorFilter}
                  onChange={(e) => setSelectedCreatorFilter(e.target.value)}
                  className="w-full bg-[#F7EBD7] text-xs text-[#173B3D] rounded-xl p-2.5 border border-[#07545A]/15"
                >
                  <option value="all">All Creators</option>
                  {CREATORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#173B3D]">Max Price</span>
                  <span className="font-bold text-[#07545A] tabular-nums">₹{priceMax}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#07545A]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#07545A]/10">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 py-3 bg-[#F7EBD7] text-[#07545A] text-xs font-semibold rounded-xl text-center"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl text-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
