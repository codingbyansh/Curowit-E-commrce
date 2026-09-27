import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
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

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface Order {
  id: string;
  date: string;
  userEmail?: string;
  userId?: string;
  items: CartItem[];
  total: number;
  status: 'Confirmed' | 'Crafting' | 'Dispatched' | 'Delivered';
  paymentMethod?: string;
  paymentStatus?: 'Paid' | 'Cash on Delivery';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  provider?: 'google' | 'email';
  isLoggedIn: boolean;
}

export interface AuthRedirectIntent {
  targetView: string;
  autoOpenCheckout?: boolean;
  reason?: 'checkout' | 'buy-now' | 'workshop' | 'account';
  productName?: string;
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

const normalizeImageUrl = (url?: string, fallback = '/images/hero_handmade_1790260978568.jpg'): string => {
  if (!url) return fallback;
  // Detect base64 strings that were previously truncated by .slice(0, 750000) or .slice(0, 700000)
  if (url.startsWith('data:') && (url.length === 750000 || url.length === 700000 || url.length === 500000)) {
    return fallback;
  }
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
  isAuthLoading: boolean;
  user: UserProfile;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, name?: string, phone?: string) => void;
  loginDemo: (email?: string, name?: string) => void;
  logout: () => Promise<void>;
  authRedirectIntent: AuthRedirectIntent | null;
  setAuthRedirectIntent: (intent: AuthRedirectIntent | null) => void;
  requireAuthForAction: (intent: AuthRedirectIntent) => void;
  shouldAutoOpenCheckout: boolean;
  setShouldAutoOpenCheckout: (open: boolean) => void;
  orders: Order[];
  userOrders: Order[];
  addresses: SavedAddress[];
  saveAddress: (addr: Omit<SavedAddress, 'id'> & { id?: string }) => void;
  deleteAddress: (id: string) => void;
  placeOrder: (
    shippingDetails: Order['shippingAddress'],
    paymentMethod: string,
    paymentMeta?: {
      finalTotal?: number;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      paymentStatus?: 'Paid' | 'Cash on Delivery';
    }
  ) => Order;

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

  // Persistent Cart (starts empty until user adds a product)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_cart_v2');
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
    return [];
  });

  // Persistent Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_wishlist_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // User profile (synced with Firebase Authentication + localStorage; no guest Aanya Verma fallback)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authRedirectIntent, setAuthRedirectIntent] = useState<AuthRedirectIntent | null>(null);
  const [shouldAutoOpenCheckout, setShouldAutoOpenCheckout] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curowit_user_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.isLoggedIn &&
          parsed.email &&
          parsed.email !== 'aanya.creative@curowit.com' &&
          parsed.name !== 'Aanya Verma'
        ) {
          return parsed;
        }
      }
    } catch {}
    return {
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    };
  });

  // Orders (starts empty — no pre-populated demo orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_orders_v3');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed
          .filter((order) => order.id !== 'CW-8924' && order.id !== 'CW-9142')
          .map((order) => ({
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
    return [];
  });

  // Saved addresses per user (starts empty — no pre-populated demo address)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!user.isLoggedIn || (!user.email && !user.uid)) {
      setAddresses([]);
      return;
    }
    const key = `curowit_addresses_v1_${(user.email || user.uid || '').toLowerCase()}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    }
  }, [user.isLoggedIn, user.email, user.uid]);

  const saveAddress = (addrData: Omit<SavedAddress, 'id'> & { id?: string }) => {
    if (!user.isLoggedIn) return;
    const key = `curowit_addresses_v1_${(user.email || user.uid || '').toLowerCase()}`;
    const newAddr: SavedAddress = {
      id: addrData.id || `addr-${Date.now()}`,
      label: addrData.label || 'Delivery Address',
      fullName: addrData.fullName.trim(),
      phone: addrData.phone.trim(),
      street: addrData.street.trim(),
      city: addrData.city.trim(),
      postalCode: addrData.postalCode.trim(),
    };
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== newAddr.id);
      const next = [newAddr, ...filtered];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteAddress = (id: string) => {
    if (!user.isLoggedIn) return;
    const key = `curowit_addresses_v1_${(user.email || user.uid || '').toLowerCase()}`;
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('Address Removed');
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const hasSeededCloudRef = useRef(false);

  // Payload sanitizers matching firebase-blueprint.json & firestore.rules
  const buildProductPayload = (p: Product) => {
    const payload: Record<string, any> = {
      id: String(p.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
      visibility: 'public',
      cmsAccessKey: MASTER_PASSKEY,
      name: String(p.name || 'Handmade Creation').slice(0, 200),
      category: String(p.category || 'Handmade').slice(0, 100),
      price: Math.max(0, Number(p.price) || 0),
      rating: Math.min(5, Math.max(0, Number(p.rating) || 4.9)),
      reviewCount: Math.max(0, Number(p.reviewCount) || 0),
      creatorId: String(p.creatorId || 'siya').slice(0, 128),
      creatorName: String(p.creatorName || "Siya's Creations").slice(0, 120),
      creatorAvatar: normalizeImageUrl(p.creatorAvatar || '/images/hero_creators_1790260990626.jpg').slice(0, 500000),
      creatorSpecialty: String(p.creatorSpecialty || 'Handmade Artisan').slice(0, 200),
      image: normalizeImageUrl(p.image || '/images/hero_handmade_1790260978568.jpg').slice(0, 700000),
      gallery: (p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]).slice(0, 10).map((g) => normalizeImageUrl(g).slice(0, 700000)),
      description: String(p.description || '').slice(0, 2000),
      materials: (p.materials || ['Handmade Craft Material']).slice(0, 10).map((m) => String(m).slice(0, 200)),
      shippingInfo: String(p.shippingInfo || 'Dispatched in 2-3 business days.').slice(0, 500),
      returnsInfo: String(p.returnsInfo || '7-day easy replacement.').slice(0, 500),
      inStock: Boolean(p.inStock ?? true),
      tags: (p.tags || ['handmade']).slice(0, 10).map((t) => String(t).slice(0, 80)),
      updatedAt: serverTimestamp(),
    };
    if (typeof p.originalPrice === 'number' && p.originalPrice >= 0) payload.originalPrice = p.originalPrice;
    if (p.discountBadge) payload.discountBadge = String(p.discountBadge).slice(0, 60);
    if (p.dimensions) payload.dimensions = String(p.dimensions).slice(0, 200);
    if (p.careInstructions) payload.careInstructions = String(p.careInstructions).slice(0, 500);
    if (typeof p.featured === 'boolean') payload.featured = p.featured;
    if (typeof p.trending === 'boolean') payload.trending = p.trending;
    if (typeof p.newArrival === 'boolean') payload.newArrival = p.newArrival;
    if (typeof p.personalizationAvailable === 'boolean') payload.personalizationAvailable = p.personalizationAvailable;
    if (p.personalizationPlaceholder) payload.personalizationPlaceholder = String(p.personalizationPlaceholder).slice(0, 250);
    return payload;
  };

  const buildCreatorPayload = (c: Creator) => {
    const payload: Record<string, any> = {
      id: String(c.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
      visibility: 'public',
      cmsAccessKey: MASTER_PASSKEY,
      name: String(c.name || 'Artisan').slice(0, 120),
      handle: String(c.handle || '@artisan').slice(0, 80),
      avatar: normalizeImageUrl(c.avatar || '/images/hero_creators_1790260990626.jpg').slice(0, 700000),
      bio: String(c.bio || c.story || '').slice(0, 2000),
      specialty: String(c.specialty || 'Handmade Craft').slice(0, 200),
      location: String(c.location || 'India').slice(0, 120),
      rating: Math.min(5, Math.max(0, Number(c.rating) || 4.9)),
      salesCount: Math.max(0, Number(c.salesCount) || 0),
      joinedYear: String(c.joinedYear || '2025').slice(0, 16),
      story: String(c.story || c.bio || '').slice(0, 2000),
      updatedAt: serverTimestamp(),
    };
    if (c.badge) payload.badge = String(c.badge).slice(0, 80);
    return payload;
  };

  const buildWorkshopPayload = (w: Workshop) => {
    const payload: Record<string, any> = {
      id: String(w.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
      visibility: 'public',
      cmsAccessKey: MASTER_PASSKEY,
      title: String(w.title || 'Craft Workshop').slice(0, 200),
      creatorName: String(w.creatorName || 'Curowit Artisan').slice(0, 120),
      date: String(w.date || 'Upcoming').slice(0, 80),
      time: String(w.time || '4:00 PM IST').slice(0, 80),
      duration: String(w.duration || '2 Hours').slice(0, 60),
      format: w.format === 'Studio Offline' ? 'Studio Offline' : 'Live Online',
      price: Math.max(0, Number(w.price) || 0),
      seatsLeft: Math.max(0, Number(w.seatsLeft) || 0),
      image: normalizeImageUrl(w.image || '/images/hero_handmade_1790260978568.jpg').slice(0, 700000),
      description: String(w.description || '').slice(0, 2000),
      updatedAt: serverTimestamp(),
    };
    if (w.location) payload.location = String(w.location).slice(0, 200);
    return payload;
  };

  const buildStoryPayload = (s: Story) => ({
    id: String(s.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
    visibility: 'public',
    cmsAccessKey: MASTER_PASSKEY,
    title: String(s.title || 'Studio Story').slice(0, 200),
    subtitle: String(s.subtitle || 'Studio Journal').slice(0, 150),
    author: String(s.author || 'Curowit Editorial').slice(0, 120),
    date: String(s.date || 'Sep 2026').slice(0, 60),
    readTime: String(s.readTime || '4 min read').slice(0, 40),
    tag: String(s.tag || 'Craft Journey').slice(0, 80),
    image: normalizeImageUrl(s.image || '/images/hero_creators_1790260990626.jpg').slice(0, 700000),
    excerpt: String(s.excerpt || '').slice(0, 2000),
    updatedAt: serverTimestamp(),
  });

  const buildHeroSlidePayload = (s: HeroBannerSlide, index: number) => {
    const fallbackSlideImage =
      DEFAULT_HERO_SLIDES[index]?.image || DEFAULT_HERO_SLIDES[0].image;
    const cleanImage = normalizeImageUrl(s.image, fallbackSlideImage);
    return {
      id: typeof s.id === 'number' ? s.id : index,
      visibility: 'public',
      cmsAccessKey: MASTER_PASSKEY,
      image: cleanImage.length <= 750000 ? cleanImage : fallbackSlideImage,
      alt: String(s.alt || 'Curowit Campaign Banner').slice(0, 300),
      action: ['shop-handmade', 'shop-creators', 'explore-all'].includes(s.action)
        ? s.action
        : 'explore-all',
      updatedAt: serverTimestamp(),
    };
  };

  const buildAnnouncementPayload = (a: TickerItem, index: number) => {
    const payload: Record<string, any> = {
      id: typeof a.id === 'number' ? a.id : index,
      visibility: 'public',
      cmsAccessKey: MASTER_PASSKEY,
      shortText: String(a.shortText || 'Discover Curowit').slice(0, 150),
      longText: String(a.longText || a.shortText || 'Discover Curowit').slice(0, 300),
      icon: String(a.icon || '✨').slice(0, 20),
      bgGradient: String(a.bgGradient || 'from-[#07545A] via-[#0A6B74] to-[#159BB5]').slice(0, 120),
      sparkleColor: String(a.sparkleColor || '#FFC83D').slice(0, 30),
      updatedAt: serverTimestamp(),
    };
    if (a.highlightTag) payload.highlightTag = String(a.highlightTag).slice(0, 80);
    return payload;
  };

  // Real-time Firestore listeners for public storefront synchronization across all devices
  useEffect(() => {
    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), where('visibility', '==', 'public')),
      async (snapshot) => {
        if (snapshot.empty && !hasSeededCloudRef.current) {
          hasSeededCloudRef.current = true;
          try {
            await Promise.all(
              PRODUCTS.map((p) => {
                const payload = buildProductPayload(p);
                return setDoc(doc(db, 'products', payload.id), payload);
              })
            );
            await Promise.all(
              CREATORS.map((c) => {
                const payload = buildCreatorPayload(c);
                return setDoc(doc(db, 'creators', payload.id), payload);
              })
            );
            await Promise.all(
              WORKSHOPS.map((w) => {
                const payload = buildWorkshopPayload(w);
                return setDoc(doc(db, 'workshops', payload.id), payload);
              })
            );
            await Promise.all(
              STORIES.map((s) => {
                const payload = buildStoryPayload(s);
                return setDoc(doc(db, 'stories', payload.id), payload);
              })
            );
            await Promise.all(
              DEFAULT_HERO_SLIDES.map((s, idx) => {
                const payload = buildHeroSlidePayload(s, idx);
                return setDoc(doc(db, 'hero_slides', `slide-${payload.id}`), payload);
              })
            );
            await Promise.all(
              DEFAULT_ANNOUNCEMENTS.map((a, idx) => {
                const payload = buildAnnouncementPayload(a, idx);
                return setDoc(doc(db, 'announcements', `ann-${payload.id}`), payload);
              })
            );
          } catch (error) {
            console.error('Initial cloud seed error:', error);
          }
          return;
        }
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => {
            const data = d.data() as Product;
            return {
              ...data,
              image: normalizeImageUrl(data.image),
              creatorAvatar: normalizeImageUrl(data.creatorAvatar),
              gallery: (data.gallery || []).map(normalizeImageUrl),
            };
          });
          setProducts(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'products')
    );

    const unsubCreators = onSnapshot(
      query(collection(db, 'creators'), where('visibility', '==', 'public')),
      (snapshot) => {
        if (!snapshot.empty) {
          setCreators(
            snapshot.docs.map((d) => {
              const data = d.data() as Creator;
              return { ...data, avatar: normalizeImageUrl(data.avatar) };
            })
          );
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'creators')
    );

    const unsubWorkshops = onSnapshot(
      query(collection(db, 'workshops'), where('visibility', '==', 'public')),
      (snapshot) => {
        if (!snapshot.empty) {
          setWorkshops(
            snapshot.docs.map((d) => {
              const data = d.data() as Workshop;
              return { ...data, image: normalizeImageUrl(data.image) };
            })
          );
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'workshops')
    );

    const unsubStories = onSnapshot(
      query(collection(db, 'stories'), where('visibility', '==', 'public')),
      (snapshot) => {
        if (!snapshot.empty) {
          setStories(
            snapshot.docs.map((d) => {
              const data = d.data() as Story;
              return { ...data, image: normalizeImageUrl(data.image) };
            })
          );
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'stories')
    );

    const unsubHeroSlides = onSnapshot(
      query(collection(db, 'hero_slides'), where('visibility', '==', 'public')),
      (snapshot) => {
        if (!snapshot.empty) {
          let needsRepair = false;
          const loaded = snapshot.docs
            .map((d, idx) => {
              const data = d.data() as HeroBannerSlide;
              const fallbackImg =
                DEFAULT_HERO_SLIDES[idx]?.image || DEFAULT_HERO_SLIDES[0].image;
              const wasTruncated =
                typeof data.image === 'string' &&
                data.image.startsWith('data:') &&
                data.image.length >= 749000;
              if (wasTruncated) {
                needsRepair = true;
              }
              return {
                ...data,
                image: wasTruncated
                  ? fallbackImg
                  : normalizeImageUrl(data.image, fallbackImg),
              };
            })
            .sort((a, b) => a.id - b.id);
          setHeroSlides(loaded);

          // Automatically heal any previously truncated hero slide in Firestore
          if (needsRepair) {
            loaded.forEach((s, idx) => {
              const payload = buildHeroSlidePayload(s, idx);
              setDoc(doc(db, 'hero_slides', `slide-${payload.id}`), payload).catch(() => {});
            });
          }
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'hero_slides')
    );

    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), where('visibility', '==', 'public')),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs
            .map((d) => d.data() as TickerItem)
            .sort((a, b) => a.id - b.id);
          setAnnouncements(loaded);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'announcements')
    );

    return () => {
      unsubProducts();
      unsubCreators();
      unsubWorkshops();
      unsubStories();
      unsubHeroSlides();
      unsubAnnouncements();
    };
  }, []);

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
      localStorage.setItem('curowit_cart_v2', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_wishlist_v2', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_user_v3', JSON.stringify(user));
    } catch {}
  }, [user]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser((prev) => ({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name || firebaseUser.email?.split('@')[0] || 'Creative Patron',
          email: firebaseUser.email || prev.email || '',
          phone: firebaseUser.phoneNumber || prev.phone || '',
          avatar: firebaseUser.photoURL || prev.avatar,
          provider: 'google',
          isLoggedIn: true,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('curowit_orders_v3', JSON.stringify(orders));
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

  const completePostAuthRedirect = (signedInName: string) => {
    setIsAuthModalOpen(false);
    if (authRedirectIntent) {
      const { targetView, autoOpenCheckout } = authRedirectIntent;
      setAuthRedirectIntent(null);
      if (autoOpenCheckout) {
        setShouldAutoOpenCheckout(true);
      }
      setActiveView(targetView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(
        `Welcome, ${signedInName}!`,
        autoOpenCheckout
          ? 'Your creative cart is ready — complete delivery details below.'
          : 'You are now signed in to Curowit.'
      );
    } else {
      if (activeView === 'signin') {
        setActiveView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      showToast('Signed in successfully', `Welcome to Curowit, ${signedInName}`);
    }
  };

  const requireAuthForAction = (intent: AuthRedirectIntent) => {
    setAuthRedirectIntent(intent);
    setIsAuthModalOpen(false);
    setActiveView('signin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, googleProvider);
      const fbUser = credential.user;
      const displayName =
        fbUser.displayName || fbUser.email?.split('@')[0] || 'Creative Patron';
      const profile: UserProfile = {
        uid: fbUser.uid,
        name: displayName,
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        avatar: fbUser.photoURL || undefined,
        provider: 'google',
        isLoggedIn: true,
      };
      setUser(profile);
      completePostAuthRedirect(displayName);
      return true;
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-In Cancelled', 'The sign-in window was closed before completing.', 'info');
      } else if (code === 'auth/popup-blocked') {
        showToast('Popup Blocked', 'Please allow popups for this site or use Email Sign-In below.', 'error');
      } else {
        showToast('Google Sign-In Notice', error?.message || 'Unable to complete Google sign-in.', 'error');
      }
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithEmail = (email: string, name?: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const derivedName =
      name?.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()) ||
      'Creative Patron';
    const deterministicUid = `patron-${cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)}`;
    const profile: UserProfile = {
      uid: deterministicUid,
      name: derivedName,
      email: cleanEmail,
      phone: phone?.trim() || '',
      provider: 'email',
      isLoggedIn: true,
    };
    setUser(profile);
    completePostAuthRedirect(derivedName);
  };

  const loginDemo = (email = '', name = '') => {
    if (!email.trim()) return;
    loginWithEmail(email, name, '');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser({
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    });
    localStorage.removeItem('curowit_user_v2');
    localStorage.removeItem('curowit_user_v3');
    if (activeView === 'account') {
      setActiveView('home');
    }
    showToast('Signed out of Curowit');
  };

  // Filter orders belonging specifically to the currently signed-in user
  const userOrders = user.isLoggedIn
    ? orders.filter((o) => {
        if (user.email && o.userEmail) {
          return o.userEmail.toLowerCase() === user.email.toLowerCase();
        }
        if (user.uid && o.userId) {
          return o.userId === user.uid;
        }
        return false;
      })
    : [];

  const placeOrder = (
    shippingDetails: Order['shippingAddress'],
    paymentMethod: string,
    paymentMeta?: {
      finalTotal?: number;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      paymentStatus?: 'Paid' | 'Cash on Delivery';
    }
  ): Order => {
    const orderId = `CW-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const resolvedTotal = paymentMeta?.finalTotal ?? cartTotal;
    const newOrder: Order = {
      id: orderId,
      date: orderDate,
      userEmail: user.email || undefined,
      userId: user.uid || undefined,
      items: [...cart],
      total: resolvedTotal,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus:
        paymentMeta?.paymentStatus || (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid'),
      razorpayPaymentId: paymentMeta?.razorpayPaymentId,
      razorpayOrderId: paymentMeta?.razorpayOrderId,
      shippingAddress: shippingDetails,
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Save the delivery address to the user's address book if not already present
    if (user.isLoggedIn && shippingDetails.street && shippingDetails.city) {
      saveAddress({
        label: 'Delivery Address',
        fullName: shippingDetails.fullName || user.name,
        phone: shippingDetails.phone || user.phone,
        street: shippingDetails.street,
        city: shippingDetails.city,
        postalCode: shippingDetails.postalCode,
      });
    }

    // Sync new customer order to Firestore so Admin CMS sees it across all devices
    const itemsSummary = cart
      .map((i) => `${i.product.name} (x${i.quantity})`)
      .join(', ')
      .slice(0, 1000);
    setDoc(doc(db, 'orders', orderId), {
      id: orderId,
      cmsAccessKey: MASTER_PASSKEY,
      date: orderDate,
      total: Math.max(0, Number(cartTotal) || 0),
      status: 'Confirmed',
      customerName: String(shippingDetails.fullName || user.name || 'Customer').slice(0, 120),
      city: String(shippingDetails.city || 'India').slice(0, 120),
      itemsSummary: itemsSummary || 'Handmade Order',
      updatedAt: serverTimestamp(),
    }).catch(() => {});

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

  // Product CRUD (Synced globally via Firestore)
  const addProduct = (productData: Omit<Product, 'id'> & { id?: string }) => {
    const cleanId = (productData.id || `prod-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
    const newProduct: Product = {
      ...productData,
      id: cleanId,
    };
    setProducts((prev) => [newProduct, ...prev]);
    const payload = buildProductPayload(newProduct);
    setDoc(doc(db, 'products', cleanId), payload).catch((error) =>
      handleFirestoreError(error, OperationType.CREATE, `products/${cleanId}`)
    );
    showToast('Product Created', `Published "${newProduct.name}" globally across all devices`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    const existingItem = products.find((p) => p.id === id);
    const merged: Product = existingItem
      ? { ...existingItem, ...updated, id }
      : ({ ...updated, id } as Product);
    setProducts((prev) => prev.map((item) => (item.id === id ? merged : item)));
    const payload = buildProductPayload(merged);
    setDoc(doc(db, 'products', id), payload).catch((error) =>
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`)
    );
    showToast('Product Updated', 'Changes synced live across the public storefront');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'products', id)).catch((error) =>
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`)
    );
    showToast('Product Removed', 'Removed globally from storefront catalog');
  };

  // Creator CRUD (Synced globally via Firestore)
  const addCreator = (creatorData: Omit<Creator, 'id'> & { id?: string }) => {
    const cleanId = (creatorData.id || `creator-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
    const newCreator: Creator = {
      ...creatorData,
      id: cleanId,
    };
    setCreators((prev) => [...prev, newCreator]);
    const payload = buildCreatorPayload(newCreator);
    setDoc(doc(db, 'creators', cleanId), payload).catch((error) =>
      handleFirestoreError(error, OperationType.CREATE, `creators/${cleanId}`)
    );
    showToast('Artisan Added', `Published "${newCreator.name}" globally`);
  };

  const updateCreator = (id: string, updated: Partial<Creator>) => {
    const existingItem = creators.find((c) => c.id === id);
    const merged: Creator = existingItem
      ? { ...existingItem, ...updated, id }
      : ({ ...updated, id } as Creator);
    setCreators((prev) => prev.map((item) => (item.id === id ? merged : item)));
    const payload = buildCreatorPayload(merged);
    setDoc(doc(db, 'creators', id), payload).catch((error) =>
      handleFirestoreError(error, OperationType.UPDATE, `creators/${id}`)
    );
    showToast('Artisan Updated', 'Profile synced live across all devices');
  };

  const deleteCreator = (id: string) => {
    setCreators((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'creators', id)).catch((error) =>
      handleFirestoreError(error, OperationType.DELETE, `creators/${id}`)
    );
    showToast('Artisan Removed', 'Creator removed globally');
  };

  // Workshop CRUD (Synced globally via Firestore)
  const addWorkshop = (workshopData: Omit<Workshop, 'id'> & { id?: string }) => {
    const cleanId = (workshopData.id || `ws-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
    const newWorkshop: Workshop = {
      ...workshopData,
      id: cleanId,
    };
    setWorkshops((prev) => [...prev, newWorkshop]);
    const payload = buildWorkshopPayload(newWorkshop);
    setDoc(doc(db, 'workshops', cleanId), payload).catch((error) =>
      handleFirestoreError(error, OperationType.CREATE, `workshops/${cleanId}`)
    );
    showToast('Workshop Created', `Published "${newWorkshop.title}" globally`);
  };

  const updateWorkshop = (id: string, updated: Partial<Workshop>) => {
    const existingItem = workshops.find((w) => w.id === id);
    const merged: Workshop = existingItem
      ? { ...existingItem, ...updated, id }
      : ({ ...updated, id } as Workshop);
    setWorkshops((prev) => prev.map((item) => (item.id === id ? merged : item)));
    const payload = buildWorkshopPayload(merged);
    setDoc(doc(db, 'workshops', id), payload).catch((error) =>
      handleFirestoreError(error, OperationType.UPDATE, `workshops/${id}`)
    );
    showToast('Workshop Updated', 'Details synced live across all devices');
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'workshops', id)).catch((error) =>
      handleFirestoreError(error, OperationType.DELETE, `workshops/${id}`)
    );
    showToast('Workshop Removed', 'Workshop deleted globally');
  };

  // Story CRUD (Synced globally via Firestore)
  const addStory = (storyData: Omit<Story, 'id'> & { id?: string }) => {
    const cleanId = (storyData.id || `story-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
    const newStory: Story = {
      ...storyData,
      id: cleanId,
    };
    setStories((prev) => [newStory, ...prev]);
    const payload = buildStoryPayload(newStory);
    setDoc(doc(db, 'stories', cleanId), payload).catch((error) =>
      handleFirestoreError(error, OperationType.CREATE, `stories/${cleanId}`)
    );
    showToast('Story Published', `Published "${newStory.title}" globally`);
  };

  const updateStory = (id: string, updated: Partial<Story>) => {
    const existingItem = stories.find((s) => s.id === id);
    const merged: Story = existingItem
      ? { ...existingItem, ...updated, id }
      : ({ ...updated, id } as Story);
    setStories((prev) => prev.map((item) => (item.id === id ? merged : item)));
    const payload = buildStoryPayload(merged);
    setDoc(doc(db, 'stories', id), payload).catch((error) =>
      handleFirestoreError(error, OperationType.UPDATE, `stories/${id}`)
    );
    showToast('Story Updated', 'Story article synced live across all devices');
  };

  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'stories', id)).catch((error) =>
      handleFirestoreError(error, OperationType.DELETE, `stories/${id}`)
    );
    showToast('Story Removed', 'Story deleted globally');
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

  // Hero & Announcement mutators (Synced globally via Firestore)
  const updateHeroSlides = async (slides: HeroBannerSlide[]) => {
    setHeroSlides(slides);
    try {
      const existingSnap = await getDocs(
        query(collection(db, 'hero_slides'), where('visibility', '==', 'public'))
      );
      const nextIds = new Set(slides.map((s, idx) => `slide-${typeof s.id === 'number' ? s.id : idx}`));
      await Promise.all(
        existingSnap.docs
          .filter((d) => !nextIds.has(d.id))
          .map((d) => deleteDoc(doc(db, 'hero_slides', d.id)))
      );
      await Promise.all(
        slides.map((s, idx) => {
          const payload = buildHeroSlidePayload(s, idx);
          return setDoc(doc(db, 'hero_slides', `slide-${payload.id}`), payload);
        })
      );
      showToast('Hero Banners Saved', 'Homepage hero synced globally across all devices');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'hero_slides');
    }
  };

  const updateAnnouncements = async (items: TickerItem[]) => {
    setAnnouncements(items);
    try {
      const existingSnap = await getDocs(
        query(collection(db, 'announcements'), where('visibility', '==', 'public'))
      );
      const nextIds = new Set(items.map((a, idx) => `ann-${typeof a.id === 'number' ? a.id : idx}`));
      await Promise.all(
        existingSnap.docs
          .filter((d) => !nextIds.has(d.id))
          .map((d) => deleteDoc(doc(db, 'announcements', d.id)))
      );
      await Promise.all(
        items.map((a, idx) => {
          const payload = buildAnnouncementPayload(a, idx);
          return setDoc(doc(db, 'announcements', `ann-${payload.id}`), payload);
        })
      );
      showToast('Announcements Saved', 'Top ticker bar synced globally across all devices');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'announcements');
    }
  };

  // Reset to initial seed globally in Firestore
  const resetAllDataToDefaults = async () => {
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
    try {
      await Promise.all(
        PRODUCTS.map((p) => {
          const payload = buildProductPayload(p);
          return setDoc(doc(db, 'products', payload.id), payload);
        })
      );
      await Promise.all(
        CREATORS.map((c) => {
          const payload = buildCreatorPayload(c);
          return setDoc(doc(db, 'creators', payload.id), payload);
        })
      );
      await Promise.all(
        WORKSHOPS.map((w) => {
          const payload = buildWorkshopPayload(w);
          return setDoc(doc(db, 'workshops', payload.id), payload);
        })
      );
      await Promise.all(
        STORIES.map((s) => {
          const payload = buildStoryPayload(s);
          return setDoc(doc(db, 'stories', payload.id), payload);
        })
      );
      await Promise.all(
        DEFAULT_HERO_SLIDES.map((s, idx) => {
          const payload = buildHeroSlidePayload(s, idx);
          return setDoc(doc(db, 'hero_slides', `slide-${payload.id}`), payload);
        })
      );
      await Promise.all(
        DEFAULT_ANNOUNCEMENTS.map((a, idx) => {
          const payload = buildAnnouncementPayload(a, idx);
          return setDoc(doc(db, 'announcements', `ann-${payload.id}`), payload);
        })
      );
      showToast('Reset Complete', 'Restored all default storefront content across all devices');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'resetAllDataToDefaults');
    }
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
        isAuthLoading,
        user,
        loginWithGoogle,
        loginWithEmail,
        loginDemo,
        logout,
        authRedirectIntent,
        setAuthRedirectIntent,
        requireAuthForAction,
        shouldAutoOpenCheckout,
        setShouldAutoOpenCheckout,
        orders,
        userOrders,
        addresses,
        saveAddress,
        deleteAddress,
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
