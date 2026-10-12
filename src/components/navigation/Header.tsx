import React, { useState, useEffect } from 'react';
import { CurowitLogo } from '../common/CurowitLogo';
import { TopAnnouncementBar } from './TopAnnouncementBar';
import { useStore } from '../../context/StoreContext';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    wishlist,
    wishlistCount,
    setIsSearchOpen,
    setIsAuthModalOpen,
    user,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
    { label: 'Creators', view: 'creators' },
    { label: 'Workshops', view: 'workshops' },
    { label: 'Stories', view: 'stories' },
    { label: 'Track Order', view: 'track-order' },
  ];

  return (
    <>
      {/* Premium Animated Announcement Ticker Bar */}
      <TopAnnouncementBar />

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 w-full ${
          isScrolled
            ? 'bg-[#F7EBD7]/95 backdrop-blur-md shadow-xs border-b border-[#07545A]/10 py-2.5'
            : 'bg-[#F7EBD7] border-b border-[#07545A]/10 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
            {/* Left Group: Brand Logo & Navigation with Protected Boundaries */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-2.5 lg:gap-6 xl:gap-8 min-w-0 shrink overflow-hidden">
              {/* Zone 1: Brand Wordmark / Logo */}
              <div
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer transition-opacity hover:opacity-90 shrink-0 flex items-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setActiveView('home');
                }}
                aria-label="Curowit Home"
              >
                <CurowitLogo variant="horizontal" size="md" responsiveTagline />
              </div>

              {/* Zone 2: Navigation Links (Responsive: Compact on Tablet with Track Order, Full on Desktop) */}
              <nav className="hidden md:flex items-center gap-1 md:gap-1.5 lg:gap-3 xl:gap-5 text-[#173B3D] min-w-0 shrink overflow-hidden">
                {navLinks.map((link) => {
                  const isActive = activeView === link.view;
                  // On tablet (md:max-lg), hide Home and Stories to maintain balanced spacing while keeping Track Order
                  const isTabletHidden = link.view === 'home' || link.view === 'stories';
                  return (
                    <button
                      key={link.view}
                      onClick={() => {
                        setActiveView(link.view);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`relative py-1 px-1.5 lg:px-2 text-xs lg:text-[13px] xl:text-[15px] font-bold tracking-normal transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                        isTabletHidden ? 'hidden lg:inline-block' : 'inline-block'
                      } ${
                        isActive
                          ? 'text-[#07545A] font-extrabold'
                          : 'text-[#173B3D] hover:text-[#07545A]'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#07545A] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Zone 3: Actions (Search, Wishlist, Account, Cart) - Guaranteed No Overlap at Tablet & Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3.5 shrink-0 ml-auto z-10 flex-nowrap">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 flex items-center justify-center text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer shrink-0"
                aria-label="Search products"
                title="Search products"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
              </button>

              {/* Wishlist Button with Self-Contained Badge (Zero Horizontal Overflow) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveView('wishlist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 flex items-center justify-center text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer group shrink-0"
                  aria-label={`View Wishlist (${wishlistCount} items)`}
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform group-hover:scale-105" />
                </button>
                {wishlistCount > 0 && (
                  <span
                    className="pointer-events-none absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-[#E97868] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-2xs border border-[#F7EBD7] animate-in zoom-in-50 duration-200 z-10"
                    aria-label={`${wishlistCount} items in wishlist`}
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>

              {/* Account / Sign-In Button (Responsive Tablet & Desktop with Fixed Minimum Widths) */}
              <button
                onClick={() => {
                  if (user.isLoggedIn) {
                    setActiveView('account');
                  } else {
                    setActiveView('signin');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`hidden sm:inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  user.isLoggedIn
                    ? 'p-1.5 pr-2.5 sm:pr-3 text-[#173B3D] hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full'
                    : 'px-2.5 sm:px-3 md:px-3.5 py-1.5 rounded-full bg-[#07545A]/10 hover:bg-[#07545A] text-[#07545A] hover:text-[#FFF8EA] text-xs font-bold'
                }`}
                aria-label={user.isLoggedIn ? 'Account' : 'Sign In'}
                title={user.isLoggedIn ? user.name : 'Sign In to Curowit'}
              >
                {user.isLoggedIn ? (
                  <>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-[#07545A]/20 shrink-0"
                      />
                    ) : (
                      <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#07545A] text-[#FFF8EA] text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                    <span className="hidden xl:inline text-xs font-bold text-[#173B3D] max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-xs">Sign In</span>
                  </>
                )}
              </button>

              {/* Cart Icon Button (Fixed Width, Self-Contained Badge) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveView('cart');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 flex items-center justify-center text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer group shrink-0"
                  aria-label={`View Cart (${cartCount} items)`}
                  title="Cart"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform group-hover:scale-105" />
                </button>
                {cartCount > 0 && (
                  <span
                    className="pointer-events-none absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-[#07545A] text-[#FFF8EA] text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-2xs border border-[#F7EBD7] animate-in zoom-in-50 duration-200 z-10"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
