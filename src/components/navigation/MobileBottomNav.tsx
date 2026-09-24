import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    wishlist,
    user,
    setIsAuthModalOpen,
  } = useStore();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => {
        setActiveView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: Compass,
      action: () => {
        setActiveView('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : undefined,
      action: () => {
        setActiveView('wishlist');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      action: () => {
        setActiveView('cart');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      action: () => {
        if (user.isLoggedIn) {
          setActiveView('account');
        } else {
          setIsAuthModalOpen(true);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF8EA]/95 backdrop-blur-md border-t border-[#07545A]/15 shadow-lg px-2 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 h-full min-h-[44px] transition-colors cursor-pointer ${
                isActive ? 'text-[#07545A]' : 'text-[#173B3D]/70 hover:text-[#07545A]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#E97868] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#07545A]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
