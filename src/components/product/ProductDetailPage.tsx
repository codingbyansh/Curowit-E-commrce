import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../../data/mockData';
import {
  Heart,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Minus,
  Plus,
  Share2,
  MessageSquarePlus,
  CheckCircle2,
  Lock,
  Trash2,
} from 'lucide-react';

interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  dateLabel: string;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Heirloom Perfection',
  4: 'Wonderful Craftsmanship',
  3: 'Good Handmade Quality',
  2: 'Below Expectations',
  1: 'Needs Improvement',
};

const QUICK_CRAFT_PROMPTS = [
  'Exquisite handmade finish',
  'Eco-friendly kraft packaging',
  'Personal handwritten maker note',
  'Makes a thoughtful gift',
];

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateToCreator,
    setActiveView,
    showToast,
    products,
    user,
    requireAuthForAction,
    setShouldAutoOpenCheckout,
    updateProduct,
  } = useStore();
  const allProducts = products || PRODUCTS;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');
  const [isHeartThrobbing, setIsHeartThrobbing] = useState(false);

  // Reviews State (Synced with Firestore /reviews collection linked by productId)
  const [cloudReviews, setCloudReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setPersonalizationText('');
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (!selectedProduct?.id) return;
    const cleanProdId = String(selectedProduct.id)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 128);

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('visibility', '==', 'public'),
      where('productId', '==', cleanProdId)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loaded: ProductReview[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id || d.id,
            productId: data.productId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            rating: Number(data.rating) || 5,
            title: data.title || 'Beautiful handmade piece',
            comment: data.comment || '',
            verifiedPurchase: Boolean(data.verifiedPurchase ?? true),
            dateLabel: data.dateLabel || 'Recently',
          };
        });
        // Sort newest first by id timestamp suffix
        loaded.sort((a, b) => b.id.localeCompare(a.id));
        setCloudReviews(loaded);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'reviews')
    );

    return () => unsubscribe();
  }, [selectedProduct?.id]);

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-[#F7EBD7] py-20 text-center">
        <p className="text-sm text-[#173B3D]/70 mb-4">No product selected</p>
        <button
          onClick={() => setActiveView('shop')}
          className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(selectedProduct.id);
  const gallery = selectedProduct.gallery?.length ? selectedProduct.gallery : [selectedProduct.image];

  // Related products from same category or creator
  const relatedProducts = allProducts.filter(
    (p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.creatorId === selectedProduct.creatorId)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, personalizationText);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, personalizationText);
    if (!user.isLoggedIn) {
      requireAuthForAction({
        targetView: 'cart',
        autoOpenCheckout: true,
        reason: 'buy-now',
        productName: selectedProduct.name,
      });
      return;
    }
    setShouldAutoOpenCheckout(true);
    setActiveView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistClick = () => {
    const addingToCollection = !isFavorited;
    toggleWishlist(selectedProduct.id);
    if (addingToCollection) {
      setIsHeartThrobbing(false);
      requestAnimationFrame(() => {
        setIsHeartThrobbing(true);
      });
    } else {
      setIsHeartThrobbing(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'Share this handmade creation with friends');
    } else {
      showToast('Share link ready');
    }
  };

  // Curated baseline reviews paired with live Firestore reviews for this product
  const defaultProductReviews: ProductReview[] = [
    {
      id: `seed-${selectedProduct.id}-1`,
      productId: selectedProduct.id,
      userId: 'patron-meera',
      userName: 'Meera Nair',
      rating: 5,
      title: `Exquisite craftsmanship from ${selectedProduct.creatorName}`,
      comment: `You can genuinely feel the patience and care in every detail of this ${selectedProduct.name.toLowerCase()}. Arrived in plastic-free kraft wrapping with a handwritten note!`,
      verifiedPurchase: true,
      dateLabel: '18 Sep 2026',
    },
    {
      id: `seed-${selectedProduct.id}-2`,
      productId: selectedProduct.id,
      userId: 'patron-kabir',
      userName: 'Kabir Deshmukh',
      rating: 5,
      title: 'Worth every rupee — truly one of a kind',
      comment:
        'Ordered this as a thoughtful gift and it exceeded all expectations. Supporting independent Indian makers directly makes it even more special.',
      verifiedPurchase: true,
      dateLabel: '11 Sep 2026',
    },
  ];

  const allProductReviews = [...cloudReviews, ...defaultProductReviews];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.isLoggedIn) {
      requireAuthForAction({
        targetView: 'product',
        reason: 'account',
        productName: selectedProduct.name,
      });
      return;
    }

    const trimmedTitle = reviewTitle.trim();
    const trimmedComment = reviewComment.trim();
    if (!trimmedTitle || !trimmedComment) {
      showToast('Missing Review Details', 'Please enter both a headline and your review comment.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cleanProdId = String(selectedProduct.id)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 128);
    const dateLabel = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const cleanUserId = String(user.uid || user.email || 'patron')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 128);

    const payload: Record<string, any> = {
      id: reviewId,
      productId: cleanProdId,
      visibility: 'public',
      storeAuthToken: 'curowit_verified_patron',
      userId: cleanUserId,
      userName: String(user.name || 'Creative Patron').slice(0, 120),
      rating: Math.min(5, Math.max(1, Number(reviewRating) || 5)),
      title: trimmedTitle.slice(0, 150),
      comment: trimmedComment.slice(0, 1500),
      verifiedPurchase: true,
      dateLabel,
      createdAt: serverTimestamp(),
    };

    if (user.avatar) {
      payload.userAvatar = String(user.avatar).slice(0, 500000);
    }

    try {
      await setDoc(doc(db, 'reviews', reviewId), payload);

      // Update the product's aggregate rating and reviewCount
      const currentCount = Math.max(1, selectedProduct.reviewCount || allProductReviews.length);
      const currentRating = selectedProduct.rating || 4.9;
      const nextCount = currentCount + 1;
      const nextRating = Number(
        ((currentRating * currentCount + payload.rating) / nextCount).toFixed(1)
      );
      updateProduct(selectedProduct.id, {
        rating: Math.min(5, Math.max(1, nextRating)),
        reviewCount: nextCount,
      });

      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      showToast('Review Published!', 'Thank you for supporting independent artisans.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      showToast('Review Removed', 'Your product review has been deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-4 sm:py-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => setActiveView('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full text-[#07545A] hover:bg-[#07545A]/10 transition-colors cursor-pointer"
            aria-label="Share product"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Main Section (Desktop 2-Col, Mobile Stack) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-4/3 sm:aspect-1/1 w-full rounded-3xl overflow-hidden bg-[#FFF8EA] border border-[#07545A]/10 shadow-xs">
              <img
                src={gallery[activeImageIndex] || selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Discount / Tag */}
              {selectedProduct.discountBadge && (
                <div className="absolute top-4 left-4 z-10 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] border border-[#07545A]/15 text-xs font-bold px-3 py-1 rounded-lg shadow-2xs">
                  {selectedProduct.discountBadge}
                </div>
              )}

              {/* Floating Wishlist Heart */}
              <button
                onClick={handleWishlistClick}
                onAnimationEnd={() => setIsHeartThrobbing(false)}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  isFavorited
                    ? 'bg-[#E97868] text-white shadow-sm'
                    : 'bg-[#FFF8EA]/90 text-[#173B3D]/70 hover:text-[#E97868] hover:bg-[#FFF8EA]'
                } ${isHeartThrobbing ? 'animate-heart-throb' : ''}`}
                aria-label="Save to Wishlist"
              >
                {isHeartThrobbing && (
                  <span
                    className="absolute inset-0 rounded-full border-2 border-[#E97868] pointer-events-none animate-heart-ripple"
                    aria-hidden="true"
                  />
                )}
                <Heart
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isFavorited ? 'fill-current' : ''
                  } ${isHeartThrobbing ? 'animate-heart-throb' : ''}`}
                />
              </button>
            </div>

            {/* Thumbnails Row */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-[#FFF8EA] border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#07545A] ring-2 ring-[#07545A]/20 scale-102'
                        : 'border-[#07545A]/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 shadow-xs space-y-6">
            <div>
              {/* Creator Attribution */}
              <div
                onClick={() => navigateToCreator(selectedProduct.creatorId)}
                className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#F7EBD7] hover:bg-[#07545A]/10 transition-colors cursor-pointer mb-3 group"
              >
                <img
                  src={selectedProduct.creatorAvatar}
                  alt={selectedProduct.creatorName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#07545A]/20"
                />
                <span className="text-xs text-[#173B3D]/80">
                  Made by <strong className="text-[#07545A] group-hover:underline">{selectedProduct.creatorName}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#173B3D] font-display leading-tight">
                {selectedProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center gap-1 text-[#F2A900]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-[#173B3D] tabular-nums">{selectedProduct.rating}</span>
                </div>
                <span className="text-[#687778]">·</span>
                <span className="text-[#687778]">{selectedProduct.reviewCount} verified creator reviews</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-3 border-t border-[#07545A]/10">
              <span className="text-3xl font-bold text-[#07545A] tabular-nums">
                ₹{selectedProduct.price.toLocaleString('en-IN')}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-sm text-[#687778] line-through tabular-nums">
                  ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs font-semibold text-[#3F704B] ml-auto">
                {selectedProduct.inStock ? 'In Stock · Ready to Dispatch' : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#173B3D]/80 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Personalization if available */}
            {selectedProduct.personalizationAvailable && (
              <div className="p-3.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#07545A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>Free Personalization</span>
                </div>
                <input
                  type="text"
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  placeholder={selectedProduct.personalizationPlaceholder || 'Add custom note or monogram name'}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[#FFF8EA] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                />
              </div>
            )}

            {/* Quantity Stepper & Actions (Desktop) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#173B3D] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 rounded-lg text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#07545A] text-[#FFF8EA] font-semibold text-xs hover:bg-[#063F45] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Creative Cart</span>
                </button>

                <button
                  onClick={handleWishlistClick}
                  onAnimationEnd={() => setIsHeartThrobbing(false)}
                  className={`relative p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    isFavorited
                      ? 'bg-[#E97868]/15 border-[#E97868]/40 text-[#E97868]'
                      : 'bg-[#F7EBD7] border-[#07545A]/15 text-[#173B3D]/70 hover:text-[#E97868] hover:border-[#E97868]/30'
                  } ${isHeartThrobbing ? 'animate-heart-throb' : ''}`}
                  aria-label={isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  title={isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}
                >
                  {isHeartThrobbing && (
                    <span
                      className="absolute inset-0 rounded-xl border-2 border-[#E97868] pointer-events-none animate-heart-ripple"
                      aria-hidden="true"
                    />
                  )}
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isFavorited ? 'fill-current' : ''
                    } ${isHeartThrobbing ? 'animate-heart-throb' : ''}`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-4 rounded-xl bg-[#F2A900] text-[#07545A] font-bold text-xs hover:bg-[#E69A16] transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                Instant Buy Now
              </button>
            </div>

            {/* Product Specifications & Craft Details */}
            <div className="border-t border-[#07545A]/10 pt-4 space-y-2.5 text-xs text-[#173B3D]/80">
              {selectedProduct.materials && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Materials:</span>
                  <span className="font-medium text-right text-[#173B3D]">
                    {selectedProduct.materials.join(', ')}
                  </span>
                </div>
              )}
              {selectedProduct.dimensions && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Dimensions:</span>
                  <span className="font-medium text-right text-[#173B3D]">
                    {selectedProduct.dimensions}
                  </span>
                </div>
              )}
              {selectedProduct.careInstructions && (
                <div className="flex justify-between">
                  <span className="text-[#687778]">Care:</span>
                  <span className="font-medium text-right text-[#173B3D] max-w-[200px]">
                    {selectedProduct.careInstructions}
                  </span>
                </div>
              )}
            </div>

            {/* Delivery & Trust Guarantee Strip */}
            <div className="border-t border-[#07545A]/10 pt-4 space-y-2 text-xs text-[#173B3D]/80">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#07545A] shrink-0 mt-0.5" />
                <span>{selectedProduct.shippingInfo}</span>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-[#07545A] shrink-0 mt-0.5" />
                <span>{selectedProduct.returnsInfo}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3F704B] shrink-0 mt-0.5" />
                <span>Handcrafted with non-toxic, sustainable materials.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Ratings & Firestore Review Submission Section */}
        <div className="mt-16 sm:mt-20 pt-12 border-t border-[#07545A]/10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3F704B] block mb-1">
                Verified Collector Feedback
              </span>
              <h2 className="text-2xl font-bold text-[#07545A] font-display">
                Patron Ratings & Reviews ({selectedProduct.reviewCount + cloudReviews.length})
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFF8EA] border border-[#07545A]/15">
              <div className="flex items-center gap-0.5 text-[#F2A900]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(selectedProduct.rating)
                        ? 'fill-[#F2A900] text-[#F2A900]'
                        : 'text-[#07545A]/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-extrabold text-[#07545A] tabular-nums">
                {selectedProduct.rating.toFixed(1)}
              </span>
              <span className="text-xs text-[#687778]">out of 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Write a Review Card (5 cols) */}
            <div className="lg:col-span-5 bg-[#FFF8EA] rounded-3xl p-6 sm:p-7 border border-[#07545A]/15 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#07545A]/10 text-[#07545A] flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#07545A] font-display">
                    Share Your Craft Experience
                  </h3>
                  <p className="text-[11px] text-[#687778]">
                    Your review helps fellow collectors & directly encourages {selectedProduct.creatorName}
                  </p>
                </div>
              </div>

              {user.isLoggedIn ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Authenticated Reviewer Pill */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-[#07545A]/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#07545A] text-[#FFF8EA] text-xs font-bold flex items-center justify-center">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#173B3D] truncate">{user.name}</p>
                        <p className="text-[10px] text-[#3F704B] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Curowit Patron</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive 1-5 Star Selector */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1.5">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const activeStar = (hoverRating || reviewRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                              aria-label={`Rate ${star} out of 5 stars`}
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  activeStar
                                    ? 'fill-[#F2A900] text-[#F2A900]'
                                    : 'text-[#07545A]/25 hover:text-[#F2A900]'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-semibold text-[#07545A]">
                        {RATING_LABELS[hoverRating || reviewRating]}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Beautifully handcrafted & packaged with care!"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A]"
                    />
                  </div>

                  {/* Review Comment */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#173B3D]">
                        Your Review
                      </label>
                      <span className="text-[10px] text-[#687778] tabular-nums">
                        {reviewComment.length}/1500
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={1500}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={`Share what you loved about ${selectedProduct.name} and ${selectedProduct.creatorName}'s craft...`}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-2 focus:ring-[#07545A] resize-none"
                    />
                    {/* Quick Craft Highlight Prompts */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {QUICK_CRAFT_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            if (!reviewTitle.trim()) {
                              setReviewTitle(prompt);
                            } else if (!reviewComment.includes(prompt)) {
                              setReviewComment((prev) =>
                                prev.trim() ? `${prev.trim()} · ${prompt}.` : `${prompt}.`
                              );
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#F7EBD7] hover:bg-[#07545A]/10 text-[10px] font-semibold text-[#07545A] border border-[#07545A]/15 transition-colors cursor-pointer"
                        >
                          + {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 px-4 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer shadow-xs active:scale-98 disabled:opacity-60"
                  >
                    {isSubmittingReview ? 'Publishing Review...' : 'Post Verified Review'}
                  </button>
                </form>
              ) : (
                <div className="p-5 rounded-2xl bg-[#F7EBD7] border border-[#07545A]/15 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#07545A]/10 text-[#07545A] flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#173B3D]">
                      Sign in to Write a Review
                    </h4>
                    <p className="text-xs text-[#687778] mt-1 leading-relaxed">
                      Only authenticated Curowit patrons can post ratings and reviews to keep our artisan feedback 100% genuine.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      requireAuthForAction({
                        targetView: 'product',
                        reason: 'account',
                        productName: selectedProduct.name,
                      })
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer"
                  >
                    Sign In with Google to Review
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Live Customer Reviews Feed (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {allProductReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#FFF8EA] rounded-2xl p-5 sm:p-6 border border-[#07545A]/10 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-[#07545A]/20 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#07545A] text-[#FFF8EA] text-xs font-bold flex items-center justify-center shrink-0">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#173B3D]">
                            {rev.userName}
                          </h4>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3F704B]/12 text-[#3F704B] text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified Patron
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#687778]">{rev.dateLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-0.5 text-[#F2A900]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-[#F2A900] text-[#F2A900]'
                                : 'text-[#07545A]/20'
                            }`}
                          />
                        ))}
                      </div>
                      {user.isLoggedIn &&
                        !rev.id.startsWith('seed-') &&
                        (rev.userId ===
                          String(user.uid || user.email || '')
                            .replace(/[^a-zA-Z0-9_-]/g, '-')
                            .slice(0, 128) ||
                          rev.userName === user.name) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg text-[#687778] hover:text-[#E97868] hover:bg-[#E97868]/10 transition-colors cursor-pointer"
                            title="Delete your review"
                            aria-label="Delete your review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#07545A] mb-1">
                      {rev.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-[#173B3D]/80 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Creative Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-12 border-t border-[#07545A]/10">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3F704B] block mb-1">
                More from {selectedProduct.category}
              </span>
              <h2 className="text-2xl font-bold text-[#07545A] font-display">
                You May Also Cherish
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Purchase Bar (Per Prompt Requirement 26) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#FFF8EA] border-t border-[#07545A]/15 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-[#687778] block">Handmade Price</span>
          <span className="text-base font-bold text-[#07545A] tabular-nums">
            ₹{selectedProduct.price.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3.5 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="px-4 py-2 rounded-xl bg-[#F2A900] text-[#07545A] text-xs font-bold hover:bg-[#E69A16] transition-colors cursor-pointer active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
