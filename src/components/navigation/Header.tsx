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
          <div className="flex items-center justify-between gap-4">
            {/* Left Group: Brand Logo & Navigation with Guaranteed Spacing */}
            <div className="flex items-center gap-7 md:gap-8 lg:gap-12 min-w-0">
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
                <CurowitLogo variant="horizontal" size="md" />
              </div>

              {/* Zone 2: Navigation Links (Desktop) - Bold & Visible with Roomy Spacing */}
              <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-[#173B3D]">
                {navLinks.map((link) => {
                  const isActive = activeView === link.view;
                  return (
                    <button
                      key={link.view}
                      onClick={() => {
                        setActiveView(link.view);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`relative py-1 text-sm lg:text-[15px] font-bold tracking-normal transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-[#07545A] font-extrabold'
                          : 'text-[#173B3D] hover:text-[#07545A]'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#07545A] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Zone 3: Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer"
                aria-label="Search products"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button with Live Notification Badge */}
              <button
                onClick={() => {
                  setActiveView('wishlist');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative p-2 text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer group"
                aria-label={`View Wishlist (${wishlistCount} items)`}
                title="Wishlist"
              >
                <Heart className="w-5 h-5 transition-transform group-hover:scale-105" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#E97868] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs border-2 border-[#F7EBD7] animate-in zoom-in-50 duration-200"
                    aria-label={`${wishlistCount} items in wishlist`}
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Account Button (Desktop) */}
              <button
                onClick={() => {
                  if (user.isLoggedIn) {
                    setActiveView('account');
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 p-2 text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer"
                aria-label="Account"
                title={user.isLoggedIn ? user.name : 'Sign In'}
              >
                <User className="w-5 h-5" />
                {user.isLoggedIn && (
                  <span className="hidden xl:inline text-xs font-medium text-[#173B3D]">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Cart Icon Button (Compact & Elegant for Mobile & Laptop) */}
              <button
                onClick={() => {
                  setActiveView('cart');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative p-2 text-[#173B3D]/80 hover:text-[#07545A] hover:bg-[#07545A]/5 rounded-full transition-colors cursor-pointer group"
                aria-label={`View Cart (${cartCount} items)`}
                title="Cart"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#07545A] text-[#FFF8EA] text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs border-2 border-[#F7EBD7] animate-in zoom-in-50 duration-200"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
