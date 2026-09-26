import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  PRODUCTS,
  CREATORS,
  Creator,
  Workshop,
  WORKSHOPS,
  Story,
  STORIES,
} from '../data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
  personalizationText?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Confirmed' | 'Crafting' | 'Dispatched' | 'Delivered';
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export interface HeroBannerSlide {
  id: number;
  image: string;
  alt: string;
  action: 'shop-handmade' | 'shop-creators' | 'explore-all';
}

export interface TickerItem {
  id: number;
  shortText: string;
  longText: string;
  icon: string;
  bgGradient: string;
  sparkleColor: string;
  highlightTag?: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

const normalizeImageUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^\/src\/assets\/images\//, '/images/');
};

export const DEFAULT_HERO_SLIDES: HeroBannerSlide[] = [
  {
    id: 0,
    image: '/images/hero_banner_handmade_slide1_1790433156236.jpg',
    alt: 'Curowit: Made by Hand. Made with Heart. Discover unique handmade products created by independent artists and makers.',
    action: 'shop-handmade',
  },
  {
    id: 1,
    image: '/images/hero_banner_creators_slide2_1790433170531.jpg',
    alt: 'Curowit: Meet the Creators Behind the Magic. Discover unique work from independent creators and support creativity directly.',
    action: 'shop-creators',
  },
  {
    id: 2,
    image: '/images/hero_banner_everything_slide3_1790433182303.jpg',
    alt: 'Curowit: Everything Creative. All in One Place. Shop Curowit products and discover curated creative tools, supplies, DIY kits.',
    action: 'explore-all',
  },
];

export const DEFAULT_ANNOUNCEMENTS: TickerItem[] = [
  {
    id: 0,
    shortText: 'Discover Something Creative',
    longText: 'Discover Something Creative — 1,200+ Handcrafted Pieces from India’s Top Artisan Studios',
    icon: '✨',
    bgGradient: 'from-[#07545A] via-[#0A6B74] to-[#159BB5]',
    sparkleColor: '#FFC83D',
    highlightTag: 'Direct Studio Support',
  },
  {
    id: 1,
    shortText: 'Made by Independent Creators',
    longText: 'Made by Independent Creators — 100% Verified Makers · Thoughtful Slow-Crafted Quality',
    icon: '🎨',
    bgGradient: 'from-[#8C3A19] via-[#B85324] to-[#D97706]',
    sparkleColor: '#FDE68A',
    highlightTag: 'Artisan Verified',
  },
  {
    id: 2,
    shortText: 'Handmade. Unique. Yours.',
    longText: 'Handmade. Unique. Yours. — Every Creation Has a Face, a Name, and a Personal Story',
    icon: '💛',
    bgGradient: 'from-[#144233] via-[#1E5C46] to-[#2D7A5C]',
    sparkleColor: '#FEF08A',
    highlightTag: 'Eco Conscious',
  },
  {
    id: 3,
    shortText: 'Explore Handmade & Creative Finds',
    longText: 'Explore Handmade & Creative Finds — Heirloom Crochet, Botanical Candles, Resin Jewellery & Art',
    icon: '🧵',
    bgGradient: 'from-[#0E3547] via-[#095273] to-[#0284C7]',
    sparkleColor: '#93C5FD',
    highlightTag: 'New Arrivals',
  },
];

interface StoreContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedProduct: Product | null;
  selectedCreatorId: string | null;
  setSelectedCreatorId: (id: string | null) => void;
  selectedCreator: Creator | null;

  // Reactive Collections (CMS Enabled)
  products: Product[];
  creators: Creator[];
  workshops: Workshop[];
  stories: Story[];
  heroSlides: HeroBannerSlide[];
  announcements: TickerItem[];

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, personalization?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  cartTotal: number;

  // Wishlist
  wishlist: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Auth & Account
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  user: UserProfile;
  loginDemo: (email?: string, name?: string) => void;
  logout: () => void;
  orders: Order[];
  placeOrder: (shippingDetails: Order['shippingAddress'], paymentMethod: string) => Order;

  // Notification Toast
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Navigation helpers
  navigateToProduct: (productId: string) => void;
  navigateToCreator: (creatorId: string) => void;
  navigateToCategory: (categoryName: string) => void;

  // Admin CMS & Security
  isAdminAuthenticated: boolean;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  adminLogin: (passkey: string) => boolean;
  adminLogout: () => void;

  // CMS Mutators
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCreator: (creator: Omit<Creator, 'id'> & { id?: string }) => void;
  updateCreator: (id: string, updated: Partial<Creator>) => void;
  deleteCreator: (id: string) => void;

  addWorkshop: (workshop: Omit<Workshop, 'id'> & { id?: string }) => void;
  updateWorkshop: (id: string, updated: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;

  addStory: (story: Omit<Story, 'id'> & { id?: string }) => void;
  updateStory: (id: string, updated: Partial<Story>) => void;
  deleteStory: (id: string) => void;

  updateOrder: (id: string, updated: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  updateHeroSlides: (slides: HeroBannerSlide[]) => void;
  updateAnnouncements: (items: TickerItem[]) => void;
  resetAllDataToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const MASTER_PASSKEY = 'ansh@siya';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('curowit_admin_auth') === 'granted_ansh_siya';
    } catch {
      return false;
    }
  });

  // Persistent Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_products_v4');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => ({
          ...p,
          image: normalizeImageUrl(p.image),
          creatorAvatar: normalizeImageUrl(p.creatorAvatar),
          gallery: (p.gallery || []).map(normalizeImageUrl),
        }));
      }
    } catch {}
    return PRODUCTS;
  });

  // Persistent Creators
  const [creators, setCreators] = useState<Creator[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_creators_v4');
      if (saved) {
        const parsed: Creator[] = JSON.parse(saved);
        return parsed.map((c) => ({ ...c, avatar: normalizeImageUrl(c.avatar) }));
      }
    } catch {}
    return CREATORS;
  });

  // Persistent Workshops
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_workshops_v4');
      if (saved) {
        const parsed: Workshop[] = JSON.parse(saved);
        return parsed.map((w) => ({ ...w, image: normalizeImageUrl(w.image) }));
      }
    } catch {}
    return WORKSHOPS;
  });

  // Persistent Stories
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_stories_v4');
      if (saved) {
        const parsed: Story[] = JSON.parse(saved);
        return parsed.map((s) => ({ ...s, image: normalizeImageUrl(s.image) }));
      }
    } catch {}
    return STORIES;
  });

  // Persistent Hero Slides
  const [heroSlides, setHeroSlides] = useState<HeroBannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_hero_slides_v4');
      if (saved) {
        const parsed: HeroBannerSlide[] = JSON.parse(saved);
        return parsed.map((s) => ({ ...s, image: normalizeImageUrl(s.image) }));
      }
    } catch {}
    return DEFAULT_HERO_SLIDES;
  });

  // Persistent Announcements
  const [announcements, setAnnouncements] = useState<TickerItem[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_announcements_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ANNOUNCEMENTS;
  });

  // Persistent Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          product: {
            ...item.product,
            image: normalizeImageUrl(item.product.image),
            creatorAvatar: normalizeImageUrl(item.product.creatorAvatar),
            gallery: (item.product.gallery || []).map(normalizeImageUrl),
          },
        }));
      }
    } catch {}
    return [
      {
        product: products[0] || PRODUCTS[0],
        quantity: 1,
        personalizationText: 'For Maya ♡',
      },
    ];
  });

  // Persistent Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [PRODUCTS[1]?.id || 'prod-2', PRODUCTS[2]?.id || 'prod-3'];
  });

  // User profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curowit_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'Aanya Verma',
      email: 'aanya.creative@curowit.com',
      phone: '+91 98765 43210',
      isLoggedIn: true,
    };
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map((order) => ({
          ...order,
          items: (order.items || []).map((item) => ({
            ...item,
            product: {
              ...item.product,
              image: normalizeImageUrl(item.product.image),
              creatorAvatar: normalizeImageUrl(item.product.creatorAvatar),
              gallery: (item.product.gallery || []).map(normalizeImageUrl),
            },
          })),
        }));
      }
    } catch {}
    return [
      {
        id: 'CW-8924',
        date: '20 Sep 2026',
        items: [
          {
            product: PRODUCTS[1],
            quantity: 1,
          },
        ],
        total: 699,
        status: 'Delivered',
        shippingAddress: {
          fullName: 'Aanya Verma',
          phone: '+91 98765 43210',
          street: '42 Lotus Bloom Lane, Indiranagar',
          city: 'Bengaluru, Karnataka',
          postalCode: '560038',
        },
      },
      {
        id: 'CW-9142',
        date: '25 Sep 2026',
        items: [
          {
            product: PRODUCTS[0],
            quantity: 1,
            personalizationText: 'Maya ♡',
          },
          {
            product: PRODUCTS[2],
            quantity: 1,
          },
        ],
        total: 1848,
        status: 'Crafting',
        shippingAddress: {
          fullName: 'Rahul Sharma',
          phone: '+91 91234 56789',
          street: '15 Heritage Square, Bandra West',
          city: 'Mumbai, Maharashtra',
          postalCode: '400050',
        },
      },
    ];
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem('curowit_products_v4', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_creators_v4', JSON.stringify(creators));
    } catch {}
  }, [creators]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_workshops_v4', JSON.stringify(workshops));
    } catch {}
  }, [workshops]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_stories_v4', JSON.stringify(stories));
    } catch {}
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_hero_slides_v4', JSON.stringify(heroSlides));
    } catch {}
  }, [heroSlides]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_announcements_v2', JSON.stringify(announcements));
    } catch {}
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Functions
  const addToCart = (product: Product, quantity = 1, personalization?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          personalizationText: personalization || next[existingIndex].personalizationText,
        };
        return next;
      }
      return [...prev, { product, quantity, personalizationText: personalization }];
    });
    showToast(`Added to your creative cart`, product.name);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        const product = products.find((p) => p.id === productId) || PRODUCTS.find((p) => p.id === productId);
        showToast('Saved to wishlist', product?.name);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 50;
  const cartTotal = cartSubtotal + shippingFee;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;
  const selectedCreator = creators.find((c) => c.id === selectedCreatorId) || null;

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveView('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginDemo = (email = 'aanya.creative@curowit.com', name = 'Aanya Verma') => {
    setUser({
      name,
      email,
      phone: '+91 98765 43210',
      isLoggedIn: true,
    });
    setIsAuthModalOpen(false);
    showToast('Signed in successfully', `Welcome back to Curowit, ${name}`);
  };

  const logout = () => {
    setUser({
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    });
    showToast('Signed out of Curowit');
  };

  const placeOrder = (shippingDetails: Order['shippingAddress'], paymentMethod: string): Order => {
    const newOrder: Order = {
      id: `CW-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cart],
      total: cartTotal,
      status: 'Confirmed',
      shippingAddress: shippingDetails,
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // ==========================================
  // ADMIN CMS & SECURITY PASSKEY IMPLEMENTATION
  // ==========================================
  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  const adminLogin = (passkey: string): boolean => {
    if (passkey.trim() === MASTER_PASSKEY) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('curowit_admin_auth', 'granted_ansh_siya');
      } catch {}
      setIsAdminModalOpen(false);
      setActiveView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Admin Master Panel Unlocked', 'Authenticated as Owner (Ansh & Siya)');
      return true;
    } else {
      showToast('Access Denied', 'Invalid security passkey', 'error');
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('curowit_admin_auth');
    } catch {}
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Admin Panel Locked', 'Security session terminated');
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    const newProduct: Product = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Product Created', `Added "${newProduct.name}" to storefront catalog`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Product Updated', 'Changes reflected live across storefront');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast('Product Removed', 'Removed from store catalog');
  };

  // Creator CRUD
  const addCreator = (creatorData: Omit<Creator, 'id'> & { id?: string }) => {
    const newCreator: Creator = {
      ...creatorData,
      id: creatorData.id || `creator-${Date.now()}`,
    };
    setCreators((prev) => [...prev, newCreator]);
    showToast('Artisan Added', `Added "${newCreator.name}" to creator roster`);
  };

  const updateCreator = (id: string, updated: Partial<Creator>) => {
    setCreators((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Artisan Updated', 'Profile and craft data refreshed');
  };

  const deleteCreator = (id: string) => {
    setCreators((prev) => prev.filter((item) => item.id !== id));
    showToast('Artisan Removed', 'Creator removed from roster');
  };

  // Workshop CRUD
  const addWorkshop = (workshopData: Omit<Workshop, 'id'> & { id?: string }) => {
    const newWorkshop: Workshop = {
      ...workshopData,
      id: workshopData.id || `ws-${Date.now()}`,
    };
    setWorkshops((prev) => [...prev, newWorkshop]);
    showToast('Workshop Created', `Added "${newWorkshop.title}"`);
  };

  const updateWorkshop = (id: string, updated: Partial<Workshop>) => {
    setWorkshops((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Workshop Updated', 'Details updated live');
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((item) => item.id !== id));
    showToast('Workshop Removed', 'Workshop deleted');
  };

  // Story CRUD
  const addStory = (storyData: Omit<Story, 'id'> & { id?: string }) => {
    const newStory: Story = {
      ...storyData,
      id: storyData.id || `story-${Date.now()}`,
    };
    setStories((prev) => [newStory, ...prev]);
    showToast('Story Published', `Published "${newStory.title}"`);
  };

  const updateStory = (id: string, updated: Partial<Story>) => {
    setStories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Story Updated', 'Story article updated live');
  };

  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((item) => item.id !== id));
    showToast('Story Removed', 'Story deleted');
  };

  // Order Management
  const updateOrder = (id: string, updated: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updated } : order))
    );
    showToast('Order Updated', `Order ${id} status updated`);
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    showToast('Order Deleted', `Order ${id} removed from system`);
  };

  // Hero & Announcement mutators
  const updateHeroSlides = (slides: HeroBannerSlide[]) => {
    setHeroSlides(slides);
    showToast('Hero Banners Saved', 'Homepage hero updated');
  };

  const updateAnnouncements = (items: TickerItem[]) => {
    setAnnouncements(items);
    showToast('Announcements Saved', 'Top ticker bar updated');
  };

  // Reset to initial seed
  const resetAllDataToDefaults = () => {
    setProducts(PRODUCTS);
    setCreators(CREATORS);
    setWorkshops(WORKSHOPS);
    setStories(STORIES);
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setAnnouncements(DEFAULT_ANNOUNCEMENTS);
    localStorage.removeItem('curowit_products_v4');
    localStorage.removeItem('curowit_creators_v4');
    localStorage.removeItem('curowit_workshops_v4');
    localStorage.removeItem('curowit_stories_v4');
    localStorage.removeItem('curowit_hero_slides_v4');
    localStorage.removeItem('curowit_announcements_v2');
    showToast('Reset Complete', 'Restored all original website content and mock data');
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        selectedCreatorId,
        setSelectedCreatorId,
        selectedCreator,
        products,
        creators,
        workshops,
        stories,
        heroSlides,
        announcements,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingFee,
        cartTotal,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isSearchOpen,
        setIsSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        user,
        loginDemo,
        logout,
        orders,
        placeOrder,
        toasts,
        showToast,
        removeToast,
        navigateToProduct,
        navigateToCreator,
        navigateToCategory,

        // Admin CMS
        isAdminAuthenticated,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
        adminLogin,
        adminLogout,
        addProduct,
        updateProduct,
        deleteProduct,
        addCreator,
        updateCreator,
        deleteCreator,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        addStory,
        updateStory,
        deleteStory,
        updateOrder,
        deleteOrder,
        updateHeroSlides,
        updateAnnouncements,
        resetAllDataToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
