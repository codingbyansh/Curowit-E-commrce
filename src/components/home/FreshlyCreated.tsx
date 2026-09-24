import React, { useState } from 'react';
import { PRODUCTS, Product } from '../../data/mockData';
import { ProductCard } from '../product/ProductCard';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Creations' },
  { id: 'crochet', label: 'Crochet' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'home', label: 'Home Decor' },
  { id: 'gifts', label: 'Gifts' },
];

export const FreshlyCreated: React.FC = () => {
  const { setActiveView, setSelectedCategory } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'crochet') return p.category.includes('Crochet');
    if (activeTab === 'jewellery') return p.category.includes('Jewellery');
    if (activeTab === 'home') return p.category.includes('Home');
    if (activeTab === 'gifts') return p.category.includes('Cards') || p.category.includes('Accessories');
    return true;
  }).slice(0, 8);

  return (
    <section className="py-12 sm:py-16 bg-[#FFF8EA] border-t border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Just Finished</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Freshly Created
            </h2>
            <p className="text-sm text-[#173B3D]/70 mt-1">
              Recently completed pieces from creator workbenches across the country.
            </p>
          </div>

          {/* Interactive filter tabs (per frontend design rule: functional buttons with segmented background) */}
          <div className="flex items-center gap-1 p-1 bg-[#F7EBD7] rounded-xl overflow-x-auto max-w-full">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs'
                    : 'text-[#173B3D]/70 hover:text-[#07545A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setActiveView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 text-[#07545A] font-semibold text-xs sm:text-sm hover:bg-[#07545A] hover:text-[#FFF8EA] transition-all cursor-pointer shadow-2xs group"
          >
            <span>View Full Creative Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
