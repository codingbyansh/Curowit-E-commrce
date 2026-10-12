import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CATEGORIES } from './data/mockData';
import { Header } from './components/navigation/Header';
import { BreadcrumbNav } from './components/navigation/BreadcrumbNav';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { Footer } from './components/layout/Footer';

// Homepage Sections
import { HeroCarousel } from './components/home/HeroCarousel';
import { CategorySection } from './components/home/CategorySection';
import { TrendingSection } from './components/home/TrendingSection';
import { FeaturedEditorial } from './components/home/FeaturedEditorial';
import { CreatorSpotlight } from './components/home/CreatorSpotlight';
import { WorkshopsSection } from './components/home/WorkshopsSection';
import { WhyCurowit } from './components/home/WhyCurowit';
import { CreativeStories } from './components/home/CreativeStories';
import { NewsletterSection } from './components/home/NewsletterSection';

// Subviews
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { CreatorPage } from './components/creator/CreatorPage';
import { CreatorsListPage } from './components/creator/CreatorsListPage';
import { WorkshopsPage } from './components/workshops/WorkshopsPage';
import { StoriesPage } from './components/stories/StoriesPage';
import { AccountPage } from './components/account/AccountPage';
import { SignInPage } from './components/auth/SignInPage';
import { AdminCMSPage } from './components/admin/AdminCMSPage';
import { OrderTracking } from './components/orders/OrderTracking';
import { FoundingCreatorPortal } from './components/foundingcreator/FoundingCreatorPortal';

// Overlays & Utilities
import { SearchDrawer } from './components/common/SearchDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { RaiseTicketButton } from './components/common/RaiseTicketButton';
import { AdminPasskeyModal } from './components/admin/AdminPasskeyModal';

const upsertMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const DynamicMetadataManager: React.FC = () => {
  const { activeView, selectedProduct, selectedCreator, selectedCategory, searchQuery } = useStore();

  useEffect(() => {
    let title = 'Curowit — Home of Creatives';
    let description =
      'Discover handmade products, creative gifts, independent creators and unique artistic experiences on Curowit.';
    let ogType = 'website';
    let jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Curowit',
      url: window.location.origin,
      description,
    };

    switch (activeView) {
      case 'home': {
        title = 'Curowit — Home of Creatives | Handmade Artisan Marketplace';
        description =
          'Discover handmade products, creative gifts, independent creators and unique artistic experiences on Curowit. Shop slow-crafted crochet, botanical candles, ceramics, and DIY kits.';
        break;
      }
      case 'shop': {
        const matchedCat =
          selectedCategory !== 'all'
            ? CATEGORIES.find(
                (c) =>
                  c.id === selectedCategory ||
                  c.slug === selectedCategory ||
                  c.name.toLowerCase() === selectedCategory.toLowerCase()
              )
            : undefined;

        if (searchQuery.trim()) {
          title = `Search "${searchQuery.trim()}" - Shop - Curowit`;
          description = `Explore handmade artisan creations matching "${searchQuery.trim()}" on Curowit — crafted with heart by independent makers.`;
        } else if (matchedCat) {
          title = `${matchedCat.name} - Shop - Curowit`;
          description = `${matchedCat.description} Shop authentic ${matchedCat.name.toLowerCase()} handcrafted by verified artisans on Curowit.`;
        } else {
          title = 'Shop - Curowit';
          description =
            'Browse 1,200+ handcrafted crochet plushies, botanical soy candles, pressed floral resin jewellery, studio pottery, and DIY craft kits on Curowit.';
        }
        break;
      }
      case 'product': {
        if (selectedProduct) {
          title = `${selectedProduct.name} - Curowit`;
          const cleanDesc = selectedProduct.description.slice(0, 120).trim();
          description = `${cleanDesc}${selectedProduct.description.length > 120 ? '...' : ''} Handcrafted by ${selectedProduct.creatorName} on Curowit.`;
          ogType = 'product';
          jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: selectedProduct.name,
            description: selectedProduct.description,
            image: selectedProduct.image.startsWith('http')
              ? selectedProduct.image
              : `${window.location.origin}${selectedProduct.image}`,
            brand: {
              '@type': 'Brand',
              name: selectedProduct.creatorName,
            },
            offers: {
              '@type': 'Offer',
              price: String(selectedProduct.price),
              priceCurrency: 'INR',
              availability: selectedProduct.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(selectedProduct.rating),
              reviewCount: String(selectedProduct.reviewCount),
            },
          };
        } else {
          title = 'Product Details - Curowit';
          description = 'Explore handcrafted product details, materials, and artisan story on Curowit.';
        }
        break;
      }
      case 'creator': {
        if (selectedCreator) {
          title = `${selectedCreator.name} - Curowit`;
          description = `Explore original handmade creations by ${selectedCreator.name} (${selectedCreator.specialty}) from ${selectedCreator.location} on Curowit.`;
        } else {
          title = 'Maker Studio - Curowit';
          description = 'Discover independent artisan studios and their handmade collections on Curowit.';
        }
        break;
      }
      case 'creators': {
        title = 'Creators - Curowit';
        description =
          'Meet the verified independent makers, potters, fiber artists, and botanical chandlers behind every handmade piece on Curowit.';
        break;
      }
      case 'workshops': {
        title = 'Workshops - Curowit';
        description =
          'Join interactive live online and studio craft workshops led by master Indian artisans. Learn crochet, botanical candle pouring, watercolor, and pottery.';
        break;
      }
      case 'stories': {
        title = 'Stories - Curowit';
        description =
          'Read behind-the-scenes studio journals, slow-craft essays, and inspiring maker journeys from the Curowit creative community.';
        break;
      }
      case 'cart': {
        title = 'Shopping Bag - Curowit';
        description =
          'Review your handcrafted selections, add custom gift notes, and complete your plastic-free eco-packaged order on Curowit.';
        break;
      }
      case 'wishlist': {
        title = 'Wishlist - Curowit';
        description =
          'View and manage your saved handmade treasures and favorite artisan creations on Curowit.';
        break;
      }
      case 'account': {
        title = 'My Account - Curowit';
        description =
          'Track your handmade orders, manage your Curowit profile, and view your registered craft workshops.';
        break;
      }
      case 'signin': {
        title = 'Sign In & Checkout - Curowit';
        description =
          'Sign in to Curowit with Google or email to complete your handmade order, track dispatches, and support independent creators.';
        break;
      }
      case 'admin': {
        title = 'Master CMS - Curowit';
        description =
          'Curowit Storefront Content Management System for managing products, creators, workshops, stories, and hero campaigns.';
        break;
      }
      case 'track-order':
      case 'order-tracking':
      case 'track': {
        title = 'Track Order — Curowit';
        description =
          'Track your handcrafted orders with live AWB courier milestones, dispatch status, and delivery tracking on Curowit.';
        break;
      }
      case 'foundingcreator': {
        title = 'Founding Creator Program — Curowit | 70% Revenue Share';
        description =
          "Join Curowit's Founding Creator community. Showcase your handmade products, reach new patrons, and grow your creative business with 70% revenue share and 7-day payouts.";
        break;
      }
      default:
        break;
    }

    document.title = title;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:type', ogType);
    upsertMetaTag('property', 'og:url', window.location.origin + window.location.pathname);
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', description);

    let scriptEl = document.head.querySelector<HTMLScriptElement>('#curowit-structured-data');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'curowit-structured-data';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  }, [activeView, selectedProduct, selectedCreator, selectedCategory, searchQuery]);

  return null;
};

const MainContent: React.FC = () => {
  const { activeView, openAdminModal, navigateToProduct, setActiveView, selectedProduct } = useStore();

  // Deep linking: parse ?product=..., ?workshop=..., ?view=..., and routes on mount
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const prodParam = params.get('product');
      const wsParam = params.get('workshop');
      const viewParam = params.get('view');

      if (pathname.startsWith('/admincurowit')) {
        setActiveView('admin');
      } else if (pathname.startsWith('/admin')) {
        // Redirect legacy route /admin to /admincurowit
        window.history.replaceState(null, '', '/admincurowit');
        setActiveView('admin');
      } else if (pathname.startsWith('/foundingcreator')) {
        setActiveView('foundingcreator');
      } else if (pathname.startsWith('/track')) {
        setActiveView('track-order');
      } else if (prodParam) {
        navigateToProduct(prodParam);
      } else if (wsParam) {
        setActiveView('workshops');
      } else if (viewParam === 'admin' || viewParam === 'admincurowit') {
        window.history.replaceState(null, '', '/admincurowit');
        setActiveView('admin');
      } else if (viewParam) {
        setActiveView(viewParam);
      }
    } catch {}
  }, []);

  // Listen for browser Back/Forward popstate
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/admincurowit')) {
        setActiveView('admin');
      } else if (pathname.startsWith('/admin')) {
        window.history.replaceState(null, '', '/admincurowit');
        setActiveView('admin');
      } else if (pathname.startsWith('/foundingcreator')) {
        setActiveView('foundingcreator');
      } else if (pathname.startsWith('/track')) {
        setActiveView('track-order');
      } else if (pathname === '/' || pathname === '') {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveView]);

  // Synchronize browser URL bar with active view (e.g., /admincurowit and products)
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      if (activeView === 'admin') {
        if (pathname !== '/admincurowit') {
          window.history.pushState(null, '', '/admincurowit');
        }
      } else if (pathname === '/admincurowit' || pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    } catch {}
  }, [activeView]);

  // Synchronize browser URL bar with active shared product
  useEffect(() => {
    try {
      if (activeView === 'product' && selectedProduct) {
        const targetSearch = `?product=${encodeURIComponent(selectedProduct.id)}`;
        if (window.location.search !== targetSearch) {
          window.history.replaceState(null, '', `${window.location.pathname}${targetSearch}`);
        }
      } else if (activeView !== 'product' && window.location.search.includes('product=')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
  }, [activeView, selectedProduct]);

  // Global shortcut to open owner CMS portal (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.history.pushState(null, '', '/admincurowit');
        setActiveView('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-[#F4ECE1]">
        <AdminCMSPage />
        <AdminPasskeyModal />
        <ToastContainer />
      </div>
    );
  }

  if (activeView === 'foundingcreator' || activeView.startsWith('foundingcreator')) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] text-[#173B3D]">
        <FoundingCreatorPortal onNavigateHome={() => setActiveView('home')} />
        <ToastContainer />
        <AdminPasskeyModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7EBD7] text-[#173B3D]">
      <Header />
      <BreadcrumbNav />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HeroCarousel />
            <CategorySection />
            <TrendingSection />
            <FeaturedEditorial />
            <CreatorSpotlight />
            <WorkshopsSection />
            <WhyCurowit />
            <CreativeStories />
            <NewsletterSection />
          </>
        )}

        {activeView === 'shop' && <ShopPage />}
        {activeView === 'product' && <ProductDetailPage />}
        {activeView === 'cart' && <CartPage />}
        {activeView === 'wishlist' && <WishlistPage />}
        {activeView === 'creator' && <CreatorPage />}
        {activeView === 'creators' && <CreatorsListPage />}
        {activeView === 'workshops' && <WorkshopsPage />}
        {activeView === 'stories' && <StoriesPage />}
        {activeView === 'account' && <AccountPage />}
        {activeView === 'signin' && <SignInPage />}
        {(activeView === 'track-order' || activeView === 'order-tracking' || activeView === 'track') && (
          <OrderTracking />
        )}
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <SearchDrawer />
      <AuthModal />
      <ToastContainer />
      <RaiseTicketButton />
      <AdminPasskeyModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <DynamicMetadataManager />
      <MainContent />
    </StoreProvider>
  );
}
