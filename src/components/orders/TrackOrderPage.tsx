import React, { useState, useEffect } from 'react';
import { OrderTracking } from './OrderTracking';
export { OrderTracking };
import { useStore, Order } from '../../context/StoreContext';
import { CurowitLogo } from '../common/CurowitLogo';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Copy,
  Printer,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  X,
  CreditCard,
  User,
  Phone,
  FileText,
  BadgeCheck,
  HelpCircle,
  Ban,
} from 'lucide-react';

interface LogisticsEvent {
  title: string;
  location: string;
  date: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
  description: string;
}

export const TrackOrderPage: React.FC = () => {
  const {
    orders,
    userOrders,
    user,
    trackingOrderId,
    setTrackingOrderId,
    updateOrder,
    setActiveView,
    navigateToProduct,
    showToast,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [showSimulator, setShowSimulator] = useState(false);

  // Sync selected order based on trackingOrderId or fallback
  useEffect(() => {
    if (trackingOrderId) {
      const found = orders.find(
        (o) =>
          o.id.toUpperCase() === trackingOrderId.toUpperCase() ||
          o.id.toUpperCase().replace(/^CW-/, '') === trackingOrderId.toUpperCase().replace(/^CW-/, '')
      );
      if (found) {
        setActiveOrder(found);
        setSearchInput(found.id);
        return;
      }
    }

    // Default to the user's most recent order if available and none selected
    if (userOrders.length > 0 && !activeOrder) {
      setActiveOrder(userOrders[0]);
      setSearchInput(userOrders[0].id);
      setTrackingOrderId(userOrders[0].id);
    } else if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
      setSearchInput(orders[0].id);
      setTrackingOrderId(orders[0].id);
    }
  }, [trackingOrderId, orders, userOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.id.toUpperCase() === query ||
        o.id.toUpperCase().replace(/^CW-/, '') === query.replace(/^CW-/, '') ||
        o.shippingAddress.phone.replace(/\D/g, '') === query.replace(/\D/g, '') ||
        (o.userEmail && o.userEmail.toUpperCase() === query)
    );

    if (found) {
      setActiveOrder(found);
      setTrackingOrderId(found.id);
      showToast('Order Found', `Tracking Order #${found.id}`);
    } else {
      showToast('Order Not Found', `No order matching "${searchInput}" was found. Please verify the ID.`, 'error');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', `${label}: ${text}`);
  };

  const handleSimulateStatus = (newStatus: Order['status']) => {
    if (!activeOrder) return;
    updateOrder(activeOrder.id, { status: newStatus });
    setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    showToast('Status Updated', `Order #${activeOrder.id} status changed to ${newStatus}`);
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    updateOrder(activeOrder.id, { status: 'Cancelled' });
    setActiveOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
    setIsCancelModalOpen(false);
    showToast('Order Cancelled', `Order #${activeOrder.id} has been marked as cancelled.`);
  };

  // Determine stage progression
  const getStageIndex = (status?: string): number => {
    switch (status) {
      case 'Confirmed':
        return 0;
      case 'Crafting':
        return 1;
      case 'Dispatched':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const stageIndex = getStageIndex(activeOrder?.status);

  // Derive courier partner & AWB
  const carrier = activeOrder?.courierPartner || 'Delhivery Eco Surface Logistics';
  const awbNumber =
    activeOrder?.trackingAwb ||
    (activeOrder
      ? `DLV-${activeOrder.id.replace(/\D/g, '') || '9241'}${activeOrder.total % 1000}`
      : 'DLV-924102');

  // Derive realistic estimated delivery
  const estimatedDelivery = (() => {
    if (activeOrder?.estimatedDelivery) return activeOrder.estimatedDelivery;
    return 'Wed, 15 Oct - Fri, 17 Oct 2026';
  })();

  // Build realistic courier activity feed
  const generateLogisticsFeed = (order: Order, stageIdx: number): LogisticsEvent[] => {
    const originCity = order.items[0]?.product.creatorName?.includes('Aanya')
      ? 'Bengaluru, KA'
      : order.items[0]?.product.creatorName?.includes('Priya')
      ? 'Udaipur, RJ'
      : 'Jaipur, RJ';
    const destCity = order.shippingAddress.city || 'Destination City';

    const events: LogisticsEvent[] = [
      {
        title: 'Order Confirmed & Atelier Assigned',
        location: `Curowit Handcraft Atelier, ${originCity}`,
        date: order.date,
        time: '10:14 AM',
        isCompleted: stageIdx >= 0,
        isCurrent: stageIdx === 0,
        description: 'Payment authorized. Master artisan received craft specifications and started preparation.',
      },
      {
        title: 'Slow Handcrafting & Quality Inspection',
        location: `Artisan Workshop Studio, ${originCity}`,
        date: order.date,
        time: '03:45 PM',
        isCompleted: stageIdx >= 1,
        isCurrent: stageIdx === 1,
        description: 'Piece individually shaped, cured, and checked. Plastic-free eco kraft box & handwritten maker note prepared.',
      },
      {
        title: `Handed to Courier — ${carrier}`,
        location: `Regional Logistics Hub, ${originCity}`,
        date: stageIdx >= 2 ? 'Next Day' : 'Upcoming',
        time: stageIdx >= 2 ? '07:30 PM' : 'Est. Next 24 hrs',
        isCompleted: stageIdx >= 2,
        isCurrent: stageIdx === 2,
        description: `Consignment manifest sealed with tamper-evident paper tape under AWB #${awbNumber}. In transit to ${destCity}.`,
      },
      {
        title: 'Out for Delivery & Doorstep Handover',
        location: `Local Delivery Facility, ${destCity}`,
        date: stageIdx >= 3 ? 'Delivered' : estimatedDelivery,
        time: stageIdx >= 3 ? '02:18 PM' : '9:00 AM - 6:00 PM',
        isCompleted: stageIdx >= 3,
        isCurrent: stageIdx === 3,
        description:
          stageIdx >= 3
            ? `Successfully delivered to ${order.shippingAddress.fullName} with contactless verification.`
            : `Package will be assigned to a local delivery associate for safe doorstep delivery.`,
      },
    ];

    return events;
  };

  const logisticsEvents = activeOrder ? generateLogisticsFeed(activeOrder, stageIndex) : [];

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-16 text-[#173B3D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            HERO SEARCH & TRACKING LOOKUP HEADER
            ======================================================== */}
        <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-10 border border-[#07545A]/12 shadow-sm mb-8 relative overflow-hidden">
          {/* Subtle background flourishes */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#07545A]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#F2A900]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07545A]/10 text-[#07545A] text-xs font-bold mb-3">
              <Truck className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Real-Time Artisan & Courier Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#07545A] font-display tracking-tight mb-2">
              Track Your Handcrafted Order
            </h1>
            <p className="text-xs sm:text-sm text-[#173B3D]/75 leading-relaxed mb-6">
              Follow every slow-crafted milestone from the independent creator's bench to your doorstep. Includes live logistics updates, packaging notes, and official invoices.
            </p>

            {/* Order Lookup Search Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#07545A]/50" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Order ID (e.g. CW-1024 or 1024) or Phone"
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white rounded-2xl border-2 border-[#07545A]/20 focus:border-[#07545A] focus:outline-none transition-colors shadow-2xs text-[#173B3D] font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Order Selector Chips */}
            {(userOrders.length > 0 || orders.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#687778] font-medium">Quick Select:</span>
                {(userOrders.length > 0 ? userOrders : orders.slice(0, 3)).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setActiveOrder(ord);
                      setTrackingOrderId(ord.id);
                      setSearchInput(ord.id);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      activeOrder?.id === ord.id
                        ? 'bg-[#07545A] text-[#FFF8EA] shadow-2xs'
                        : 'bg-[#F7EBD7] text-[#07545A] hover:bg-[#07545A]/10'
                    }`}
                  >
                    #{ord.id} ({ord.status})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            IF NO ORDER FOUND OR SELECTED
            ======================================================== */}
        {!activeOrder ? (
          <div className="bg-[#FFF8EA] rounded-3xl p-12 text-center border border-[#07545A]/10 shadow-xs max-w-lg mx-auto">
            <Package className="w-12 h-12 text-[#07545A]/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#173B3D] font-display mb-2">
              No Order Selected
            </h3>
            <p className="text-xs text-[#687778] mb-6">
              Enter your Order ID above or sign in to your Curowit account to track your orders.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setActiveView('shop')}
                className="px-5 py-2.5 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl hover:bg-[#063F45] cursor-pointer"
              >
                Browse Artisan Catalog
              </button>
              {user.isLoggedIn ? (
                <button
                  onClick={() => setActiveView('account')}
                  className="px-5 py-2.5 bg-[#F7EBD7] text-[#07545A] text-xs font-bold rounded-xl hover:bg-[#07545A]/10 cursor-pointer"
                >
                  Go to My Account
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('signin')}
                  className="px-5 py-2.5 bg-[#F7EBD7] text-[#07545A] text-xs font-bold rounded-xl hover:bg-[#07545A]/10 cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ========================================================
                MAIN ORDER SUMMARY & STATUS BANNER
                ======================================================== */}
            <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/15 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#07545A]/10">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xl sm:text-2xl font-black text-[#07545A] font-mono tracking-tight">
                      Order #{activeOrder.id}
                    </span>
                    <button
                      onClick={() => handleCopy(activeOrder.id, 'Order ID')}
                      className="p-1.5 text-[#07545A]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-lg transition-colors cursor-pointer"
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${
                        activeOrder.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : activeOrder.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : activeOrder.status === 'Crafting'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : activeOrder.status === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{activeOrder.status}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#687778]">
                    <span>Placed on {activeOrder.date}</span>
                    <span>·</span>
                    <span>Carrier: <strong className="text-[#173B3D]">{carrier}</strong></span>
                    <span>·</span>
                    <span className="font-mono">
                      AWB:{' '}
                      <button
                        onClick={() => handleCopy(awbNumber, 'Tracking AWB')}
                        className="text-[#07545A] font-bold hover:underline cursor-pointer"
                      >
                        {awbNumber}
                      </button>
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7EBD7] hover:bg-[#07545A]/10 text-[#07545A] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        `${window.location.origin}?track=${activeOrder.id}`,
                        'Tracking Link'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#07545A]/20 hover:bg-[#F7EBD7] text-[#173B3D] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Share Tracking</span>
                  </button>

                  {/* Testing Simulator Toggle */}
                  <button
                    onClick={() => setShowSimulator((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#E97868] hover:bg-[#E97868]/10 transition-colors cursor-pointer"
                    title="Simulate progression stages"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{showSimulator ? 'Hide Controls' : 'Simulate Stage'}</span>
                  </button>
                </div>
              </div>

              {/* Testing Simulator Toolbar (Collapsible) */}
              {showSimulator && (
                <div className="mt-4 p-4 rounded-2xl bg-[#F7EBD7] border border-[#07545A]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F2A900]" />
                    <span className="font-bold text-[#07545A]">Simulate Stage Progression (Live Test):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['Confirmed', 'Crafting', 'Dispatched', 'Delivered'] as Order['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleSimulateStatus(st)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                            activeOrder.status === st
                              ? 'bg-[#07545A] text-[#FFF8EA]'
                              : 'bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/20'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  INTERACTIVE MILESTONE PROGRESS STEPPER
                  ======================================================== */}
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {[
                    {
                      label: 'Order Confirmed',
                      sub: 'Atelier Assigned',
                      icon: ShoppingBag,
                      step: 0,
                    },
                    {
                      label: 'Handcrafting',
                      sub: 'In Artisan Studio',
                      icon: Sparkles,
                      step: 1,
                    },
                    {
                      label: 'Dispatched',
                      sub: 'Eco Packed in Transit',
                      icon: Truck,
                      step: 2,
                    },
                    {
                      label: 'Delivered',
                      sub: 'At Doorstep',
                      icon: CheckCircle2,
                      step: 3,
                    },
                  ].map((m, idx) => {
                    const Icon = m.icon;
                    const isDone = stageIndex >= m.step && activeOrder.status !== 'Cancelled';
                    const isCurrent = stageIndex === m.step && activeOrder.status !== 'Cancelled';

                    return (
                      <div key={m.label} className="relative flex flex-col items-center text-center">
                        {/* Connecting Horizontal Line */}
                        {idx > 0 && (
                          <div
                            className={`hidden md:block absolute top-5 -left-1/2 w-full h-[3px] -z-0 transition-colors ${
                              isDone ? 'bg-[#07545A]' : 'bg-[#07545A]/15'
                            }`}
                          />
                        )}

                        {/* Step Icon Badge */}
                        <div
                          className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shadow-2xs mb-3 ${
                            isDone
                              ? 'bg-[#07545A] text-[#FFF8EA]'
                              : 'bg-white text-[#173B3D]/40 border-2 border-[#07545A]/20'
                          } ${isCurrent ? 'ring-4 ring-[#F2A900]/40 scale-105' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <span
                          className={`text-xs font-bold leading-tight block ${
                            isDone ? 'text-[#07545A]' : 'text-[#173B3D]/50'
                          }`}
                        >
                          {m.label}
                        </span>
                        <span className="text-[11px] text-[#687778] mt-0.5">
                          {m.sub}
                        </span>

                        {isCurrent && (
                          <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2A900] text-[#07545A] animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {activeOrder.status === 'Cancelled' && (
                  <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">This order was cancelled.</strong>
                      <span>If you were charged, a full refund has been credited back to your original payment method.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery ETA Alert Box */}
              <div className="mt-6 p-4 rounded-2xl bg-[#F7EBD7] border border-[#07545A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#07545A] text-[#FFF8EA] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#F2A900]" />
                  </div>
                  <div>
                    <span className="text-[#687778] block">Estimated Delivery Window:</span>
                    <strong className="text-sm font-bold text-[#07545A]">
                      {activeOrder.status === 'Delivered'
                        ? 'Package Delivered Successfully'
                        : estimatedDelivery}
                    </strong>
                  </div>
                </div>

                <div className="text-right sm:text-right text-xs">
                  <span className="text-[#687778] block">Destination:</span>
                  <strong className="text-[#173B3D]">
                    {activeOrder.shippingAddress.city} - {activeOrder.shippingAddress.postalCode}
                  </strong>
                </div>
              </div>
            </div>

            {/* ========================================================
                TWO COLUMN: LOGISTICS FEED & ORDER DETAILS
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Courier Milestone Activity Log (7 cols) */}
              <div className="lg:col-span-7 bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/12 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#07545A]/10">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#07545A]" />
                    <h2 className="text-base sm:text-lg font-bold text-[#07545A] font-display">
                      Courier Logistics Activity Log
                    </h2>
                  </div>
                  <span className="text-xs text-[#687778] font-mono">
                    AWB: {awbNumber}
                  </span>
                </div>

                {/* Vertical Timeline Feed */}
                <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#07545A]/15">
                  {logisticsEvents.map((event, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          event.isCompleted
                            ? 'bg-[#07545A] border-[#07545A] text-[#FFF8EA]'
                            : 'bg-white border-[#07545A]/30 text-transparent'
                        }`}
                      >
                        {event.isCompleted && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <h4
                          className={`text-sm font-bold ${
                            event.isCompleted ? 'text-[#07545A]' : 'text-[#173B3D]/60'
                          }`}
                        >
                          {event.title}
                        </h4>
                        <div className="text-[11px] text-[#687778] font-mono shrink-0">
                          {event.date} · {event.time}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs text-[#E97868] font-medium mb-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{event.location}</span>
                      </div>

                      <p className="text-xs text-[#173B3D]/75 leading-relaxed bg-[#F7EBD7]/50 p-3 rounded-xl border border-[#07545A]/10">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Packaging & Craft Pledge Box */}
                <div className="pt-4 border-t border-[#07545A]/10 flex items-start gap-3 text-xs text-[#687778] bg-[#F7EBD7]/30 p-4 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-[#3F704B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#173B3D] block font-bold">
                      Zero-Plastic Eco Packaging Guarantee
                    </strong>
                    <span>
                      Every Curowit parcel is packed with recycled biodegradable kraft honeycomb wrap, natural water-activated paper tape, and includes a handwritten note from the creator.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered Items & Financial Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Ordered Items Card */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/12 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#07545A]/10">
                    <h3 className="text-sm font-bold text-[#07545A] font-display">
                      Handcrafted Items ({activeOrder.items.reduce((s, i) => s + i.quantity, 0)})
                    </h3>
                    <span className="text-xs font-bold text-[#687778]">
                      ₹{activeOrder.total}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {activeOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 bg-[#F7EBD7]/40 p-3 rounded-2xl border border-[#07545A]/10"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-[#07545A]/10 cursor-pointer"
                          onClick={() => navigateToProduct(item.product.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => navigateToProduct(item.product.id)}
                            className="text-xs font-bold text-[#173B3D] truncate hover:text-[#07545A] cursor-pointer"
                          >
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-[#687778] block">
                            By {item.product.creatorName}
                          </span>
                          <div className="flex items-center justify-between mt-1 text-xs">
                            <span className="text-[#687778]">
                              Qty: {item.quantity} × ₹{item.product.price}
                            </span>
                            <span className="font-bold text-[#07545A] tabular-nums">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                          {item.personalizationText && (
                            <div className="mt-1 text-[11px] text-[#3F704B] bg-[#3F704B]/10 px-2 py-0.5 rounded-md italic">
                              Note: "{item.personalizationText}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Price Breakdown */}
                  <div className="pt-3 border-t border-[#07545A]/10 space-y-2 text-xs">
                    <div className="flex justify-between text-[#687778]">
                      <span>Items Subtotal:</span>
                      <span className="tabular-nums font-semibold text-[#173B3D]">
                        ₹{activeOrder.total}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#687778]">
                      <span>Plastic-Free Eco Packaging:</span>
                      <span className="font-semibold text-[#3F704B]">FREE</span>
                    </div>
                    <div className="flex justify-between text-[#687778]">
                      <span>Artisan Direct Courier:</span>
                      <span className="font-semibold text-[#3F704B]">FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#07545A]/10 text-sm font-bold text-[#07545A]">
                      <span>{activeOrder.paymentStatus === 'Cash on Delivery' ? 'Amount Due on Delivery:' : 'Total Amount Paid:'}</span>
                      <span className="tabular-nums">₹{activeOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Contact Card */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/12 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#07545A]/10">
                    <MapPin className="w-4 h-4 text-[#07545A]" />
                    <h3 className="font-bold text-[#07545A]">Delivery Address</h3>
                  </div>

                  <div>
                    <strong className="text-sm font-bold text-[#173B3D] block">
                      {activeOrder.shippingAddress.fullName}
                    </strong>
                    <span className="text-[#687778] block mt-0.5">
                      {activeOrder.shippingAddress.phone}
                    </span>
                    <p className="text-[#173B3D]/80 mt-1 leading-relaxed">
                      {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city} -{' '}
                      {activeOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>

                {/* Payment Information Card */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/12 shadow-sm space-y-3 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#07545A]/10">
                    <CreditCard className="w-4 h-4 text-[#07545A]" />
                    <h3 className="font-bold text-[#07545A]">Payment Information</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#687778]">Method:</span>
                      <span className="font-semibold text-[#07545A]">
                        {activeOrder.paymentMethod || 'Razorpay Online UPI/Card'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#687778]">Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          activeOrder.paymentStatus === 'Cash on Delivery'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activeOrder.paymentStatus || 'Paid'}
                      </span>
                    </div>
                    {activeOrder.razorpayPaymentId && (
                      <div className="flex justify-between items-center pt-1 border-t border-[#07545A]/10">
                        <span className="text-[#687778]">Razorpay ID:</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#3F704B]">
                          <span>{activeOrder.razorpayPaymentId}</span>
                          <button
                            onClick={() => handleCopy(activeOrder.razorpayPaymentId!, 'Razorpay ID')}
                            className="p-1 hover:text-[#07545A] cursor-pointer"
                            title="Copy Razorpay Payment ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancellation & Support Actions */}
                <div className="bg-[#FFF8EA] rounded-3xl p-5 border border-[#07545A]/12 shadow-sm flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#07545A]">Need Help with This Order?</span>
                    <button
                      onClick={() =>
                        showToast(
                          'Artisan Concierge Notified',
                          `Support inquiry opened for Order #${activeOrder.id}. We'll contact you within 2 hours.`
                        )
                      }
                      className="text-[#E97868] font-bold hover:underline cursor-pointer"
                    >
                      Raise Ticket
                    </button>
                  </div>

                  {/* Allow Cancel if in Confirmed or Crafting stage */}
                  {(activeOrder.status === 'Confirmed' || activeOrder.status === 'Crafting') && (
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="w-full mt-2 py-2.5 rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Request Order Cancellation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          PRINTABLE TAX INVOICE MODAL
          ======================================================== */}
      {isInvoiceModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative my-8 border border-slate-200">
            {/* Header actions */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Official Artisan Tax Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl hover:bg-[#063F45] cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="space-y-6 text-xs text-slate-700 font-sans" id="printable-invoice">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#07545A]">CUROWIT</h2>
                  <p className="text-[11px] text-slate-500">Home of Independent Creatives</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 29AABCC4821M1ZX</p>
                  <p className="text-[11px] text-slate-500">Support: care@curowit.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-slate-800">INVOICE</h3>
                  <p className="font-mono text-xs">#{activeOrder.id}</p>
                  <p className="text-[11px] text-slate-500">Date: {activeOrder.date}</p>
                  {activeOrder.razorpayPaymentId && (
                    <p className="text-[10px] text-teal-700 font-mono mt-1">
                      Razorpay Ref: {activeOrder.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">Billed & Shipped To:</strong>
                  <p className="font-semibold text-slate-800">{activeOrder.shippingAddress.fullName}</p>
                  <p className="text-slate-600">{activeOrder.shippingAddress.phone}</p>
                  <p className="text-slate-600">
                    {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city} -{' '}
                    {activeOrder.shippingAddress.postalCode}
                  </p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">Dispatch Atelier:</strong>
                  <p className="font-semibold text-slate-800">
                    {activeOrder.items[0]?.product.creatorName || 'Curowit Artisan Collective'}
                  </p>
                  <p className="text-slate-600">Carrier: {carrier}</p>
                  <p className="text-slate-600 font-mono">AWB: {awbNumber}</p>
                  <p className="text-slate-600">Mode: Plastic-Free Eco Courier</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <strong className="block text-slate-900 font-semibold">{it.product.name}</strong>
                        <span className="text-[10px] text-slate-500">By {it.product.creatorName}</span>
                      </td>
                      <td className="py-2.5 text-center">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono">₹{it.product.price}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">
                        ₹{it.product.price * it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{activeOrder.total}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Eco Packaging & Craft Care:</span>
                  <span className="text-emerald-700 font-bold">FREE (₹0)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery & Logistics:</span>
                  <span className="text-emerald-700 font-bold">FREE (₹0)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-base text-teal-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono">₹{activeOrder.total}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                <p>Thank you for directly backing independent handmade artistry across India.</p>
                <p className="mt-0.5">This is a computer generated invoice and requires no physical signature.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CANCEL ORDER CONFIRMATION MODAL
          ======================================================== */}
      {isCancelModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFF8EA] rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#07545A]/20 shadow-2xl space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-[#07545A] font-display">
              Cancel Order #{activeOrder.id}?
            </h3>
            <p className="text-center text-[#687778]">
              This order has not been dispatched yet. If you proceed, the artisan will be notified to halt production and your payment will be refunded.
            </p>

            <div>
              <label className="font-bold text-[#173B3D] block mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#07545A]/20 text-[#173B3D] outline-none"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Need different product">Need a different craft piece</option>
                <option value="Delivery time too long">Delivery window is too long</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-white border border-[#07545A]/20 text-[#173B3D] font-bold rounded-xl hover:bg-[#F7EBD7] cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
