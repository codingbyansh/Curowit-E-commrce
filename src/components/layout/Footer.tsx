import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CurowitLogo } from '../common/CurowitLogo';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Instagram,
  Youtube,
  Twitter,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, showToast, openAdminModal } = useStore();

  const handleNavClick = (view: any) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStaticClick = (title: string) => {
    showToast(title, 'Information updated for the latest creator guidelines.');
  };

  return (
    <footer className="relative bg-[#07545A] text-[#FFF8EA] pb-32 sm:pb-28 md:pb-16 overflow-hidden select-none">
      {/* ========================================================
          Aesthetic Curvy Background Top Wave Transition
          ======================================================== */}
      <div className="w-full bg-[#FFF8EA] leading-none">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-5 sm:h-8 block text-[#07545A] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C380,48 760,12 1120,38 C1280,50 1380,30 1440,0 L1440,48 L0,48 Z" />
        </svg>
      </div>

      {/* Ambient Radial Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0A6D75]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#042B30]/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Single-Line Trust Badges Strip */}
        <div className="py-3 sm:py-4 mb-6 border-b border-[#FFF8EA]/12 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F7EBD7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F2A900] shrink-0" />
            <span className="font-semibold text-[#FFF8EA]">Authentic Craft Guarantee</span>
            <span className="text-[#FFF8EA]/40 hidden md:inline">· 100% verified makers</span>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F2A900] shrink-0" />
            <span className="font-semibold text-[#FFF8EA]">Safe Plastic-Free Transit</span>
            <span className="text-[#FFF8EA]/40 hidden md:inline">· Eco kraft packaging</span>
          </div>

          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#F2A900] shrink-0" />
            <span className="font-semibold text-[#FFF8EA]">7-Day Easy Support</span>
            <span className="text-[#FFF8EA]/40 hidden md:inline">· Hassle-free replacement</span>
          </div>
        </div>

        {/* Short, Sleek 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-6 border-b border-[#FFF8EA]/12">
          {/* Brand Info & Mission */}
          <div className="col-span-2 md:col-span-1">
            <div
              onClick={() => handleNavClick('home')}
              className="cursor-pointer inline-block mb-2"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('home')}
            >
              <CurowitLogo variant="horizontal" theme="light" size="sm" />
            </div>

            <p className="text-xs text-[#F7EBD7]/75 leading-relaxed max-w-xs mb-3">
              Home of independent creators. Celebrating handmade artistry and heirloom craft pieces across India.
            </p>

            <div className="flex items-center gap-2 text-[#F7EBD7]/80">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Instagram: @curowit', 'Official community channel');
                }}
                className="w-7 h-7 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="#youtube"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('YouTube: Curowit Studios', 'Maker documentaries and tutorials');
                }}
                className="w-7 h-7 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Twitter: @curowit', 'Maker announcements');
                }}
                className="w-7 h-7 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-[#F2A900] mb-2.5">
              Shop Craft
            </h4>
            <ul className="space-y-1.5 text-xs text-[#F7EBD7]/80">
              <li>
                <button
                  onClick={() => handleCategoryClick('jewellery')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Jewellery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('crochet')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Crochet & Knits
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('home-decor')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Decor & Pottery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('art-paintings')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Art & Paintings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: DISCOVER */}
          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-[#F2A900] mb-2.5">
              Discover
            </h4>
            <ul className="space-y-1.5 text-xs text-[#F7EBD7]/80">
              <li>
                <button
                  onClick={() => handleNavClick('creators')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Artisans & Makers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('workshops')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Craft Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('stories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Creator Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Collections
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT & POLICIES */}
          <div>
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-[#F2A900] mb-2.5">
              Curowit
            </h4>
            <ul className="space-y-1.5 text-xs text-[#F7EBD7]/80">
              <li>
                <button
                  onClick={() => handleStaticClick('About Curowit')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Our Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleStaticClick('Become a Creator')}
                  className="hover:text-white transition-colors cursor-pointer text-[#F2A900] font-semibold"
                >
                  Become a Creator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleStaticClick('Shipping Guidelines')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping & Packaging
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleStaticClick('Privacy Policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy & Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip with Full Visibility Clearance */}
        <div className="pt-6 mt-4 border-t border-[#FFF8EA]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF8EA] gap-3">
          <div className="text-center sm:text-left flex flex-col">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-sm text-[#FFF8EA] tracking-wide">
                © {new Date().getFullYear()} CUROWIT · Home of Creatives. All rights reserved.
              </span>
              {/* Hidden Admin Passkey Trigger on Footer */}
              <button
                onClick={openAdminModal}
                className="opacity-25 hover:opacity-100 p-1 text-[#FFF8EA] hover:text-[#F2A900] transition-opacity cursor-pointer inline-flex items-center"
                title="Owner CMS Access"
                aria-label="Staff Passkey Portal"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-[#F7EBD7]/70 mt-0.5 block">
              Empowering independent handmade artisans across India.
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#F7EBD7] bg-[#053A3F] px-4 py-1.5 rounded-full border border-[#FFF8EA]/15 shadow-2xs">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-[#E97868] text-[#E97868]" />
            <span>for mindful homes everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
