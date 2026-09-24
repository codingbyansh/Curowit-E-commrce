import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PRODUCTS, CREATORS, Creator } from '../data/mockData';

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

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info';
}

interface StoreContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedProduct: Product | null;
  selectedCreatorId: string | null;
  setSelectedCreatorId: (id: string | null) => void;
  selectedCreator: Creator | null;
  
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
  showToast: (title: string, description?: string) => void;
  removeToast: (id: string) => void;

  // Navigation helpers
  navigateToProduct: (productId: string) => void;
  navigateToCreator: (creatorId: string) => void;
  navigateToCategory: (categoryName: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Persistent Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('curowit_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Seed initial sample item for rich preview
    return [
      {
        product: PRODUCTS[0],
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
    } catch {
      // fallback
    }
    return [PRODUCTS[1].id, PRODUCTS[2].id];
  });

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curowit_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
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
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
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
    ];
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const showToast = (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
        const product = PRODUCTS.find((p) => p.id === productId);
        showToast('Saved to wishlist', product?.name);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Free delivery above ₹499
  const shippingFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 50;
  const cartTotal = cartSubtotal + shippingFee;

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId) || null;
  const selectedCreator = CREATORS.find((c) => c.id === selectedCreatorId) || null;

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
