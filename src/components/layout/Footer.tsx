import React from 'react';
import { CurowitLogo } from '../common/CurowitLogo';
import { useStore } from '../../context/StoreContext';
import { Instagram, Youtube, Twitter, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategory, showToast } = useStore();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStaticClick = (title: string) => {
    showToast(`${title}`, 'Information page opened');
  };

  return (
    <footer className="bg-[#07545A] text-[#FFF8EA] pt-14 pb-20 md:pb-12 border-t border-[#063F45]">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-[#FFF8EA]/15">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EA]/10 flex items-center justify-center text-[#F2A900] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#FFF8EA]">Authentic Craft Guarantee</h4>
              <p className="text-xs text-[#F7EBD7]/70">100% verified independent Indian creators</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EA]/10 flex items-center justify-center text-[#F2A900] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#FFF8EA]">Careful Safe Transit</h4>
              <p className="text-xs text-[#F7EBD7]/70">Plastic-free protective kraft packaging</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EA]/10 flex items-center justify-center text-[#F2A900] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#FFF8EA]">7-Day Easy Support</h4>
              <p className="text-xs text-[#F7EBD7]/70">Hassle-free replacement if damaged</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12">
          {/* Brand Info & Mission (Cols 1 & 2 on tablet) */}
          <div className="col-span-2">
            <div
              onClick={() => handleNavClick('home')}
              className="cursor-pointer inline-block mb-4"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavClick('home')}
            >
              <CurowitLogo variant="horizontal" theme="light" size="lg" />
            </div>

            <p className="text-xs sm:text-sm text-[#F7EBD7]/80 leading-relaxed max-w-sm mb-6">
              Curowit is the home of creatives. A dedicated marketplace celebrating handmade artistry, heirloom craft pieces, and the passionate independent makers who bring them to life.
            </p>

            <div className="flex items-center gap-3 text-[#F7EBD7]/80">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Instagram: @curowit', 'Official community channel');
                }}
                className="w-8 h-8 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('YouTube: Curowit Studios', 'Maker documentaries and tutorials');
                }}
                className="w-8 h-8 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Twitter: @curowit', 'Maker announcements');
                }}
                className="w-8 h-8 rounded-full bg-[#FFF8EA]/10 hover:bg-[#F2A900] hover:text-[#07545A] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F2A900] mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7EBD7]/80">
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
                  Home Decor
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
              <li>
                <button
                  onClick={() => handleCategoryClick('accessories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('candles')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Candles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('cards-gifts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cards & Gifts
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: DISCOVER */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F2A900] mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7EBD7]/80">
              <li>
                <button
                  onClick={() => handleNavClick('creators')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Independent Creators
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
                  New Arrivals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: CUROWIT & POLICIES */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#F2A900] mb-4">
              Curowit
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7EBD7]/80">
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
                  onClick={() => handleStaticClick('Return Policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Returns & Guarantee
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

        {/* Bottom Copyright & Craft Quote */}
        <div className="pt-8 border-t border-[#FFF8EA]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F7EBD7]/60 gap-3">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CUROWIT Technologies.</span>
            <span>·</span>
            <span>Home of Creatives.</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#F7EBD7]/70">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-[#E97868] text-[#E97868]" />
            <span>for independent creators everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
