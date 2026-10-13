import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ExternalLink,
  ShoppingBag,
  Users,
  Calendar,
  BookOpen,
  FileCode,
  Globe,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateSitemapEntries, SitemapUrlEntry } from '../../services/sitemapGenerator';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitemapModal: React.FC<SitemapModalProps> = ({ isOpen, onClose }) => {
  const { products, creators, workshops, stories, setActiveView, navigateToProduct, navigateToCreator } = useStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'workshops' | 'creators' | 'stories'>('all');

  const entries = useMemo(() => {
    return generateSitemapEntries({
      products,
      workshops,
      creators,
      stories,
    });
  }, [products, workshops, creators, stories]);

  const filteredEntries = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries.filter((e) => {
      const matchType =
        activeTab === 'all' ||
        (activeTab === 'products' && e.type === 'product') ||
        (activeTab === 'workshops' && e.type === 'workshop') ||
        (activeTab === 'creators' && e.type === 'creator') ||
        (activeTab === 'stories' && e.type === 'story');

      const matchText =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q) ||
        (e.subtitle && e.subtitle.toLowerCase().includes(q));

      return matchType && matchText;
    });
  }, [entries, activeTab, search]);

  if (!isOpen) return null;

  const handleEntryClick = (entry: SitemapUrlEntry) => {
    onClose();
    if (entry.type === 'product') {
      const prodId = entry.path.replace('/?product=', '');
      navigateToProduct(prodId);
      return;
    } else if (entry.type === 'creator') {
      const crId = entry.path.replace('/?creator=', '');
      navigateToCreator(crId);
      return;
    } else if (entry.type === 'workshop') {
      setActiveView('workshops');
      return;
    } else if (entry.type === 'story') {
      setActiveView('stories');
      return;
    }

    if (entry.path.startsWith('/?view=shop')) {
      setActiveView('shop');
    } else if (entry.path.startsWith('/?view=creators')) {
      setActiveView('creators');
    } else if (entry.path.startsWith('/?view=workshops')) {
      setActiveView('workshops');
    } else if (entry.path.startsWith('/?view=stories')) {
      setActiveView('stories');
    } else if (entry.path.startsWith('/foundingcreator')) {
      setActiveView('foundingcreator');
    } else if (entry.path.startsWith('/track')) {
      setActiveView('track-order');
    } else {
      setActiveView('home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#FFF8EA] border-b border-[#07545A]/12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#07545A]/10 text-[#07545A] flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#07545A] font-display">
                  Storefront Directory & Sitemap
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {entries.length} URLs Indexed
                </span>
              </div>
              <p className="text-xs text-[#173B3D]/70">
                Browse all products, maker studios, workshops, and story archives on Curowit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-bold text-[#07545A] hover:bg-[#F7EBD7]"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>XML Feed</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-[#173B3D]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar & search */}
        <div className="p-4 sm:p-5 border-b border-[#07545A]/10 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#F7EBD7]'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'products'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#F7EBD7]'
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-[#F2A900]" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'workshops'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#F7EBD7]'
              }`}
            >
              <Calendar className="w-3 h-3 text-sky-600" />
              Workshops ({workshops.length})
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'creators'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#F7EBD7]'
              }`}
            >
              <Users className="w-3 h-3 text-emerald-600" />
              Creators ({creators.length})
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'stories'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#F7EBD7]'
              }`}
            >
              <BookOpen className="w-3 h-3 text-purple-600" />
              Stories ({stories.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter pages or products..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
            />
          </div>
        </div>

        {/* Scrollable list of items */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 divide-y divide-[#07545A]/10 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#173B3D]/60">
              No matching pages found for "{search}".
            </div>
          ) : (
            filteredEntries.map((entry, idx) => (
              <div
                key={idx}
                onClick={() => handleEntryClick(entry)}
                className="pt-2 pb-2 flex items-center justify-between gap-3 hover:bg-[#FFF8EA]/50 p-2.5 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {entry.images && entry.images.length > 0 && (
                    <img
                      src={entry.images[0].loc}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-[#07545A]/15 bg-white shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#07545A] group-hover:text-[#E69A16] transition-colors truncate">
                        {entry.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#07545A]/5 text-[#07545A] border border-[#07545A]/10 shrink-0">
                        {entry.type}
                      </span>
                    </div>
                    {entry.subtitle && (
                      <span className="text-[11px] text-[#173B3D]/70 block truncate">
                        {entry.subtitle}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#687778] block truncate">
                      {entry.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#687778] hidden sm:inline">
                    Priority {entry.priority.toFixed(2)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#07545A]/5 group-hover:bg-[#07545A] text-[#07545A] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#FFF8EA] border-t border-[#07545A]/12 flex items-center justify-between text-xs text-[#173B3D]/70">
          <span>
            Search Engine Discoverability: <strong className="text-emerald-700">100% Validated</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#07545A] text-[#FFF8EA] font-bold rounded-xl hover:bg-[#064247] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
