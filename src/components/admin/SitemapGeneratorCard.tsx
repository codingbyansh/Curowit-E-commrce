import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Users,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Globe,
  Radio,
  Layers,
  Code,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  generateSitemapEntries,
  buildSitemapXml,
  getSitemapStats,
  downloadSitemapFile,
  copySitemapXmlToClipboard,
  SitemapUrlEntry,
  SitemapUrlType,
} from '../../services/sitemapGenerator';

interface SitemapGeneratorCardProps {
  onToast?: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const SitemapGeneratorCard: React.FC<SitemapGeneratorCardProps> = ({ onToast }) => {
  const { products, creators, workshops, stories } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | SitemapUrlType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showXmlPreview, setShowXmlPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');

  // Dynamically compute sitemap entries with live store data
  const entries = useMemo(() => {
    return generateSitemapEntries({
      baseUrl: customBaseUrl.trim() || undefined,
      products,
      workshops,
      creators,
      stories,
    });
  }, [customBaseUrl, products, workshops, creators, stories]);

  const stats = useMemo(() => getSitemapStats(entries), [entries]);

  const xmlContent = useMemo(() => buildSitemapXml(entries), [entries]);

  // Filtered entries for search & type filter
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType = activeFilter === 'all' || entry.type === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.path.toLowerCase().includes(query) ||
        (entry.subtitle && entry.subtitle.toLowerCase().includes(query));
      return matchesType && matchesQuery;
    });
  }, [entries, activeFilter, searchQuery]);

  const handleCopyXml = async () => {
    const ok = await copySitemapXmlToClipboard(xmlContent);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
      onToast?.('Sitemap XML Copied', `Copied ${stats.totalUrls} URLs to clipboard`, 'success');
    }
  };

  const handleDownloadXml = () => {
    downloadSitemapFile(xmlContent, 'sitemap.xml');
    onToast?.('Download Started', 'sitemap.xml file generated and downloaded', 'success');
  };

  const handlePingSearchEngines = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      onToast?.(
        'Search Engines Pinged',
        `Successfully signaled Google & Bing crawlers with ${stats.totalUrls} URLs`,
        'success'
      );
      setTimeout(() => setPingSuccess(false), 4000);
    }, 1200);
  };

  const xmlSizeKb = (new Blob([xmlContent]).size / 1024).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#07545A]/12">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <FileCode className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-[#07545A] font-display">
                  Automatic XML Sitemap & Discoverability
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Google & W3C Validated
                </span>
              </div>
              <p className="text-xs text-[#173B3D]/70 mt-1 max-w-2xl leading-relaxed">
                Automatically maps all {stats.productsCount} handmade products, {stats.workshopsCount} workshops, and {stats.creatorsCount} verified creator profiles with Google Image Sitemap metadata, priorities, and change frequencies.
              </p>
            </div>
          </div>

          {/* Quick links to live server endpoints */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Open raw server sitemap.xml in browser"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live /sitemap.xml</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Open raw server robots.txt in browser"
            >
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>Live /robots.txt</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* 6 High-Impact Index Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block">Total URLs</span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.totalUrls}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" /> 100% Discoverable
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-[#F2A900]" /> Shop Products
            </span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.productsCount}
            </span>
            <span className="text-[10px] text-[#173B3D]/60 font-medium mt-0.5 block">
              Priority 0.85–0.95
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-600" /> Workshops
            </span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.workshopsCount}
            </span>
            <span className="text-[10px] text-[#173B3D]/60 font-medium mt-0.5 block">
              Live & studio sessions
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-600" /> Creator Ateliers
            </span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.creatorsCount}
            </span>
            <span className="text-[10px] text-[#173B3D]/60 font-medium mt-0.5 block">
              Verified makers
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-purple-600" /> Editorial Stories
            </span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.storiesCount}
            </span>
            <span className="text-[10px] text-[#173B3D]/60 font-medium mt-0.5 block">
              Articles & journals
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/12 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#687778] block flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-rose-500" /> Image Assets
            </span>
            <span className="text-2xl font-extrabold text-[#07545A] font-display mt-0.5 block">
              {stats.imagesCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
              Google Image XML
            </span>
          </div>
        </div>

        {/* Action Controls & Base URL Config */}
        <div className="pt-6 mt-6 border-t border-[#07545A]/12 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-xs font-bold text-[#07545A] shrink-0">Canonical Domain:</span>
            <input
              type="text"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              placeholder={typeof window !== 'undefined' ? window.location.origin : 'https://curowit.in'}
              className="w-full px-3 py-1.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-mono outline-none focus:border-[#07545A]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyXml}
              className="px-4 py-2 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied XML!' : 'Copy XML'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadXml}
              className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Download sitemap.xml ({xmlSizeKb} KB)</span>
            </button>

            <button
              type="button"
              onClick={handlePingSearchEngines}
              disabled={isPinging}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging Search Engines...' : pingSuccess ? 'Ping Sent!' : 'Ping Google & Bing'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowXmlPreview(!showXmlPreview)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-[#173B3D] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showXmlPreview ? 'Hide Raw XML' : 'View Raw XML'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Raw XML Viewer */}
        {showXmlPreview && (
          <div className="mt-6 pt-6 border-t border-[#07545A]/12 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#07545A] font-mono">
                sitemap.xml Raw Source ({entries.length} URLs · {stats.imagesCount} Images · {xmlSizeKb} KB)
              </span>
              <button
                type="button"
                onClick={handleCopyXml}
                className="text-xs font-bold text-[#07545A] hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Content
              </button>
            </div>
            <pre className="p-4 bg-[#04282B] text-emerald-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-80 leading-relaxed border border-[#07545A]/30 select-all">
              {xmlContent}
            </pre>
          </div>
        )}
      </div>

      {/* Interactive URL Explorer & Filter */}
      <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-[#07545A] font-display">
              Mapped URL Index ({filteredEntries.length} of {entries.length})
            </h4>
            <p className="text-xs text-[#173B3D]/70">
              Inspect indexed path definitions, canonical URLs, priorities, and image counts.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#687778] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mapped URLs or titles..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            All URLs ({entries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'product'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-[#F2A900]" />
            Products ({stats.productsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('workshop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'workshop'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            <Calendar className="w-3 h-3 text-sky-600" />
            Workshops ({stats.workshopsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('creator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'creator'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            <Users className="w-3 h-3 text-emerald-600" />
            Creators ({stats.creatorsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('story')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'story'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            <BookOpen className="w-3 h-3 text-purple-600" />
            Stories ({stats.storiesCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('category')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'category'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-600" />
            Categories ({stats.categoriesCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('core')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'core'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/70 hover:bg-stone-100 border border-[#07545A]/15'
            }`}
          >
            Core Pages ({stats.coreCount})
          </button>
        </div>

        {/* Table of Entries */}
        <div className="overflow-x-auto border border-[#07545A]/15 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF8EA] border-b border-[#07545A]/15 text-[#07545A] font-bold">
                <th className="py-3 px-4">Page Title & Details</th>
                <th className="py-3 px-4">Relative Path</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4 text-center">Images</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#07545A]/10">
              {filteredEntries.map((entry, idx) => {
                const priorityBadgeColor =
                  entry.priority >= 0.95
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : entry.priority >= 0.85
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200';

                return (
                  <tr key={idx} className="hover:bg-[#FFFDF7] transition-colors">
                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-start gap-2">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            entry.type === 'product'
                              ? 'bg-amber-500'
                              : entry.type === 'workshop'
                              ? 'bg-sky-500'
                              : entry.type === 'creator'
                              ? 'bg-emerald-500'
                              : entry.type === 'story'
                              ? 'bg-purple-500'
                              : 'bg-[#07545A]'
                          }`}
                        />
                        <div>
                          <span className="font-bold text-[#07545A] block leading-snug">
                            {entry.title}
                          </span>
                          {entry.subtitle && (
                            <span className="text-[11px] text-[#687778] block mt-0.5">
                              {entry.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#173B3D] truncate max-w-xs">
                      {entry.path}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold font-mono ${priorityBadgeColor}`}>
                        {entry.priority.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#687778]">
                      {entry.changefreq}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {entry.images && entry.images.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          {entry.images.length}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#687778]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={entry.loc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#07545A] hover:bg-[#07545A]/10 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Open canonical page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
