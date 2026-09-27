import React, { useState, useEffect } from 'react';
import { useStore, Order } from '../../context/StoreContext';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { Minus, Plus, Trash2, Heart, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle2, Lock } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    shippingFee,
    cartTotal,
    toggleWishlist,
    setActiveView,
    placeOrder,
    user,
    addresses,
    requireAuthForAction,
    shouldAutoOpenCheckout,
    setShouldAutoOpenCheckout,
    showToast,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Checkout form state (starts blank unless user has a saved profile/address)
  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');

  useEffect(() => {
    if (user.isLoggedIn) {
      if (user.name) setFullName(user.name);
      if (user.phone) setPhone(user.phone);
      if (addresses.length > 0) {
        const primary = addresses[0];
        if (!street && primary.street) setStreet(primary.street);
        if (!city && primary.city) setCity(primary.city);
        if (!postalCode && primary.postalCode) setPostalCode(primary.postalCode);
        if (!phone && primary.phone) setPhone(primary.phone);
      }
    }
  }, [user, addresses]);

  useEffect(() => {
    if (shouldAutoOpenCheckout && user.isLoggedIn && cart.length > 0) {
      setIsCheckoutModalOpen(true);
      setShouldAutoOpenCheckout(false);
    }
  }, [shouldAutoOpenCheckout, user.isLoggedIn, cart.length, setShouldAutoOpenCheckout]);

  const handleProceedToCheckout = () => {
    if (!user.isLoggedIn) {
      requireAuthForAction({
        targetView: 'cart',
        autoOpenCheckout: true,
        reason: 'checkout',
      });
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'CUROWIT10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setPromoDiscount(discount);
      setPromoError('');
    } else {
      setPromoError('Try "CUROWIT10" for 10% off your first craft order');
    }
  };

  const finalTotal = Math.max(0, cartTotal - promoDiscount);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const shippingDetails = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    };

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      const order = placeOrder(shippingDetails, 'Cash on Delivery', {
        finalTotal,
        paymentStatus: 'Cash on Delivery',
      });
      setPlacedOrder(order);
      setIsCheckoutModalOpen(false);
      showToast(`Order #${order.id} Confirmed`, 'Cash on Delivery order placed successfully.');
      return;
    }

    // Razorpay Online Payment flow (UPI / GPay / Card / NetBanking)
    setIsProcessingPayment(true);
    await openRazorpayCheckout({
      amountInRupees: finalTotal,
      customerName: shippingDetails.fullName,
      customerEmail: user.email || '',
      customerPhone: shippingDetails.phone,
      description: `Curowit Handmade Order (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`,
      preferredMethod: paymentMethod === 'upi' ? 'upi' : 'card',
      notes: {
        city: shippingDetails.city,
        items: cart
          .map((i) => `${i.product.name} x${i.quantity}`)
          .join(', ')
          .slice(0, 200),
      },
      onSuccess: (payment) => {
        setIsProcessingPayment(false);
        const order = placeOrder(
          shippingDetails,
          paymentMethod === 'upi' ? 'Razorpay UPI' : 'Razorpay Card / NetBanking',
          {
            finalTotal,
            paymentStatus: 'Paid',
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpayOrderId: payment.razorpay_order_id,
          }
        );
        setPlacedOrder(order);
        setIsCheckoutModalOpen(false);
        showToast(
          'Razorpay Payment Successful!',
          `Payment ID: ${payment.razorpay_payment_id}`
        );
      },
      onDismiss: () => {
        setIsProcessingPayment(false);
        showToast('Payment Cancelled', 'You can resume Razorpay checkout anytime.', 'info');
      },
      onError: (errMsg) => {
        setIsProcessingPayment(false);
        showToast('Payment Failed', errMsg, 'error');
      },
    });
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#F7EBD7] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FFF8EA] max-w-lg w-full rounded-3xl p-8 border border-[#07545A]/15 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#3F704B]/15 text-[#3F704B] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#07545A] font-display mb-1">
            Order #{placedOrder.id} Confirmed!
          </h2>
          <p className="text-xs text-[#173B3D]/70 mb-6">
            The independent creator has received your craft order and is preparing it with care.
          </p>

          <div className="bg-[#F7EBD7] rounded-2xl p-4 text-left text-xs space-y-2 mb-6 border border-[#07545A]/10">
            <div className="flex justify-between font-semibold text-[#173B3D]">
              <span>Delivery to:</span>
              <span>{placedOrder.shippingAddress.fullName}</span>
            </div>
            <div className="text-[#687778]">
              {placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city} - {placedOrder.shippingAddress.postalCode}
            </div>
            {placedOrder.paymentMethod && (
              <div className="flex justify-between pt-2 border-t border-[#07545A]/10 text-[#173B3D]">
                <span>Payment Method:</span>
                <span className="font-semibold text-[#07545A]">
                  {placedOrder.paymentMethod} ({placedOrder.paymentStatus || 'Paid'})
                </span>
              </div>
            )}
            {placedOrder.razorpayPaymentId && (
              <div className="flex justify-between text-[#3F704B] font-medium">
                <span>Razorpay Payment ID:</span>
                <span className="font-mono text-[11px]">{placedOrder.razorpayPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#07545A]/10 font-bold text-[#07545A]">
              <span>{placedOrder.paymentStatus === 'Cash on Delivery' ? 'Amount Payable on Delivery:' : 'Amount Paid:'}</span>
              <span className="tabular-nums">₹{placedOrder.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setActiveView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-3 bg-[#F7EBD7] text-[#07545A] font-semibold text-xs rounded-xl hover:bg-[#07545A]/10 cursor-pointer"
            >
              View in My Orders
            </button>
            <button
              onClick={() => {
                setActiveView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-1 py-3 bg-[#07545A] text-[#FFF8EA] font-bold text-xs rounded-xl hover:bg-[#063F45] cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7EBD7] py-20 px-4 text-center flex items-center justify-center">
        <div className="bg-[#FFF8EA] max-w-md w-full rounded-3xl p-8 border border-[#07545A]/10 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F7EBD7] text-[#07545A] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#07545A] font-display mb-2">
            Your creative cart is waiting.
          </h2>
          <p className="text-xs text-[#173B3D]/70 mb-6">
            Support independent artists and fill your space with items made with patient hands and love.
          </p>
          <button
            onClick={() => {
              setActiveView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-3 bg-[#07545A] text-[#FFF8EA] font-semibold text-xs rounded-xl hover:bg-[#063F45] transition-colors cursor-pointer"
          >
            Explore Handmade Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-6 sm:py-10 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mb-2">
          Your Creative Cart
        </h1>
        <p className="text-xs sm:text-sm text-[#173B3D]/70 mb-8">
          You are directly supporting independent craft studios.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-2xs"
              >
                {/* Product Thumbnail & Basic Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-[#F7EBD7] shrink-0"
                  />
                  <div>
                    <span className="text-[11px] text-[#687778]">
                      By {item.product.creatorName}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-[#173B3D] leading-snug">
                      {item.product.name}
                    </h3>
                    <div className="text-xs font-bold text-[#07545A] mt-1 tabular-nums">
                      ₹{item.product.price} each
                    </div>
                    {item.personalizationText && (
                      <div className="text-[11px] text-[#3F704B] mt-1 italic">
                        Note: "{item.personalizationText}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#07545A]/10">
                  <div className="flex items-center rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#173B3D] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded text-[#173B3D] hover:bg-[#FFF8EA] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-bold text-[#07545A] block tabular-nums">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleWishlist(item.product.id)}
                      className="p-2 text-[#687778] hover:text-[#E97868] cursor-pointer"
                      title="Save for later"
                      aria-label="Save for later"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-[#687778] hover:text-red-600 cursor-pointer"
                      title="Remove"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box (4 cols) */}
          <div className="lg:col-span-4 bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/10 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#07545A] font-display">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={applyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Coupon (e.g. CUROWIT10)"
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/15 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl hover:bg-[#063F45] cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoDiscount > 0 && (
                <div className="text-[11px] text-[#3F704B] font-medium">
                  ✓ 10% First Order Coupon Applied!
                </div>
              )}
              {promoError && (
                <div className="text-[11px] text-[#E97868]">{promoError}</div>
              )}
            </form>

            <div className="space-y-2.5 text-xs text-[#173B3D]/80 border-t border-[#07545A]/10 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold tabular-nums">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Craft Delivery Fee</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-[#3F704B]">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-[#3F704B]">
                  <span>Craft Coupon Discount</span>
                  <span className="font-semibold tabular-nums">-₹{promoDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#07545A] pt-3 border-t border-[#07545A]/10">
                <span>Total Amount</span>
                <span className="tabular-nums">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-[#F2A900] text-[#07545A] font-bold text-xs hover:bg-[#E69A16] transition-colors cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-2"
            >
              {!user.isLoggedIn && <Lock className="w-3.5 h-3.5" />}
              <span>{user.isLoggedIn ? 'Proceed to Checkout' : 'Sign In with Google to Buy'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-[#687778] flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F704B]" />
              <span>Safe payments & direct creator payout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFF8EA] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#07545A]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#07545A] font-display mb-1">
              Dispatch & Delivery
            </h2>
            <p className="text-xs text-[#687778] mb-6">
              Enter where your handcrafted items should be carefully delivered.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#173B3D] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#173B3D] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#173B3D] block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#173B3D] block mb-1">City, State</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#173B3D] block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20 focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#173B3D]">Payment Method</label>
                  <span className="text-[10px] font-semibold text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded-full">
                    Secured by Razorpay
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'Razorpay UPI' },
                    { id: 'card', label: 'Razorpay Card' },
                    { id: 'cod', label: 'Cash on Deliv' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A]'
                          : 'bg-[#F7EBD7] text-[#173B3D] border-[#07545A]/15'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#07545A]/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#687778] block">Total Payable</span>
                  <span className="text-lg font-bold text-[#07545A] tabular-nums">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#173B3D] hover:bg-[#F7EBD7] cursor-pointer disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="px-6 py-2.5 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                  >
                    {isProcessingPayment
                      ? 'Opening Razorpay...'
                      : paymentMethod === 'cod'
                      ? 'Place COD Order'
                      : `Pay ₹${finalTotal.toLocaleString('en-IN')} via Razorpay`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Mobile Checkout CTA Bar (Per Prompt Requirement 29) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-[#FFF8EA] border-t border-[#07545A]/15 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-[#687778] block">Total Amount</span>
          <span className="text-base font-bold text-[#07545A] tabular-nums">
            ₹{finalTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleProceedToCheckout}
          className="px-5 py-2.5 rounded-xl bg-[#F2A900] text-[#07545A] text-xs font-bold hover:bg-[#E69A16] transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <span>{user.isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Buy'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
