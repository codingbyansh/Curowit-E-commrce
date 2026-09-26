import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/navigation/Header';
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

// Overlays & Utilities
import { SearchDrawer } from './components/common/SearchDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { RaiseTicketButton } from './components/common/RaiseTicketButton';

const MainContent: React.FC = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7EBD7] text-[#173B3D]">
      <Header />

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
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <SearchDrawer />
      <AuthModal />
      <ToastContainer />
      <RaiseTicketButton />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
