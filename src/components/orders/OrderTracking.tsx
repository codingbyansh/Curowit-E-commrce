import React, { useState, useEffect } from 'react';
import { useStore, Order } from '../../context/StoreContext';
import {
  fetchOrderTrackingFromSupabase,
  SupabaseTrackingRecord,
  supabase,
  mapSupabaseToOrder,
} from '../../supabase';
import { CurowitLogo } from '../common/CurowitLogo';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Copy,
  Printer,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  FileText,
  BadgeCheck,
  Radio,
  ShoppingBag,
  HelpCircle,
  CreditCard,
  User,
  Phone,
  Home,
} from 'lucide-react';

interface LogisticsMilestone {
  id?: string;
  title: string;
  location: string;
  date: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
  description: string;
  carrier?: string;
  awb?: string;
}

export const OrderTracking: React.FC = () => {
  const {
    orders,
    userOrders,
    user,
    trackingOrderId,
    setTrackingOrderId,
    setActiveView,
    navigateToProduct,
    showToast,
  } = useStore();

  const [searchInput, setSearchInput] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [supabaseMilestones, setSupabaseMilestones] = useState<SupabaseTrackingRecord[]>([]);
  const [isLoadingTracking, setIsLoadingTracking] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  // 1. Initial selection based on trackingOrderId or first available order
  useEffect(() => {
    if (trackingOrderId) {
      const match = orders.find(
        (o) =>
          o.id.toUpperCase() === trackingOrderId.toUpperCase() ||
          o.id.toUpperCase().replace(/^CW-/, '') === trackingOrderId.toUpperCase().replace(/^CW-/, '')
      );
      if (match) {
        setActiveOrder(match);
        setSearchInput(match.id);
        return;
      }
    }

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

  // Keep activeOrder synced if global store orders update (e.g. from Admin CMS)
  useEffect(() => {
    if (activeOrder) {
      const updated = orders.find((o) => o.id === activeOrder.id);
      if (updated && (updated.status !== activeOrder.status || updated.courierPartner !== activeOrder.courierPartner || updated.trackingAwb !== activeOrder.trackingAwb)) {
        setActiveOrder(updated);
      }
    }
  }, [orders, activeOrder]);

  // 2. Fetch tracking events from Supabase 'order_tracking' table whenever activeOrder changes
  useEffect(() => {
    if (!activeOrder?.id) {
      setSupabaseMilestones([]);
      return;
    }

    let isMounted = true;
    setIsLoadingTracking(true);

    const loadTrackingData = async () => {
      try {
        const records = await fetchOrderTrackingFromSupabase(activeOrder.id);
        if (!isMounted) return;
        setSupabaseMilestones(records);
        setLastRefreshedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Error fetching Supabase tracking records:', err);
      } finally {
        if (isMounted) setIsLoadingTracking(false);
      }
    };

    loadTrackingData();

    // Set up realtime channel subscription for this specific order on 'order_tracking'
    const trackingChannel = supabase
      .channel(`order_tracking_realtime_${activeOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_tracking',
          filter: `order_id=eq.${activeOrder.id}`,
        },
        async () => {
          if (!isMounted) return;
          const fresh = await fetchOrderTrackingFromSupabase(activeOrder.id);
          if (isMounted) {
            setSupabaseMilestones(fresh);
            setLastRefreshedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            showToast('Tracking Updated', `New milestone synced from Supabase for Order #${activeOrder.id}`);
          }
        }
      )
      .subscribe();

    // Also listen to direct updates on this order in 'orders' table
    const orderChannel = supabase
      .channel(`order_realtime_${activeOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${activeOrder.id}`,
        },
        (payload) => {
          if (!isMounted) return;
          const mapped = mapSupabaseToOrder(payload.new);
          setActiveOrder((prev) => (prev ? { ...prev, ...mapped } : mapped));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(trackingChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [activeOrder?.id]);

  // Handle Order ID Search Form
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
      showToast('Order Found', `Tracking Order #${found.id} from Supabase database`);
    } else {
      showToast(
        'Order Not Found',
        `No record matching "${searchInput}". Please double check your Order ID (e.g. CW-1024).`,
        'error'
      );
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', `${label}: ${text}`);
  };

  // Stage mapping
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

  // Logistics carrier & AWB
  const carrier = activeOrder?.courierPartner || 'Delhivery Eco Surface Logistics';
  const awbNumber =
    activeOrder?.trackingAwb ||
    (activeOrder
      ? `DLV-${activeOrder.id.replace(/\D/g, '') || '9142'}`
      : 'DLV-9142');

  const estimatedDelivery = activeOrder?.estimatedDelivery || '3-5 Business Days';

  // Compute final logistics events to display:
  // If Supabase order_tracking has records, map those. Otherwise build standard roadmap.
  const displayMilestones: LogisticsMilestone[] = (() => {
    if (supabaseMilestones.length > 0) {
      return supabaseMilestones.map((m, idx) => ({
        id: m.id,
        title: m.title || `Status: ${m.status}`,
        location: m.location || 'Curowit Logistics Network',
        date: m.date || 'Recent',
        time: m.time || '',
        isCompleted: true,
        isCurrent: idx === supabaseMilestones.length - 1,
        description: m.description || '',
        carrier: m.carrier || carrier,
        awb: m.awb_number || awbNumber,
      }));
    }

    if (!activeOrder) return [];

    const originCity = activeOrder.items[0]?.product.creatorName?.includes('Aanya')
      ? 'Bengaluru, KA'
      : 'Jaipur, RJ';
    const destCity = activeOrder.shippingAddress.city || 'Destination City';

    return [
      {
        title: 'Order Confirmed & Atelier Assigned',
        location: `Curowit Handcraft Atelier, ${originCity}`,
        date: activeOrder.date,
        time: '10:14 AM',
        isCompleted: stageIndex >= 0,
        isCurrent: stageIndex === 0,
        description: 'Payment authorized. Master artisan received craft specifications and started preparation.',
      },
      {
        title: 'Slow Handcrafting & Studio Inspection',
        location: `Artisan Workshop Studio, ${originCity}`,
        date: activeOrder.date,
        time: '03:45 PM',
        isCompleted: stageIndex >= 1,
        isCurrent: stageIndex === 1,
        description: 'Piece individually shaped, cured, and checked. Plastic-free eco kraft box & handwritten maker note prepared.',
      },
      {
        title: `Handed to Courier — ${carrier}`,
        location: `Regional Logistics Hub, ${originCity}`,
        date: stageIndex >= 2 ? 'In Transit' : 'Upcoming',
        time: stageIndex >= 2 ? '07:30 PM' : 'Est. Next 24 hrs',
        isCompleted: stageIndex >= 2,
        isCurrent: stageIndex === 2,
        description: `Consignment manifest sealed with tamper-evident paper tape under AWB #${awbNumber}. In transit to ${destCity}.`,
      },
      {
        title: 'Out for Delivery & Doorstep Handover',
        location: `Local Delivery Facility, ${destCity}`,
        date: stageIndex >= 3 ? 'Delivered' : estimatedDelivery,
        time: stageIndex >= 3 ? '02:18 PM' : '9:00 AM - 6:00 PM',
        isCompleted: stageIndex >= 3,
        isCurrent: stageIndex === 3,
        description:
          stageIndex >= 3
            ? `Successfully delivered to ${activeOrder.shippingAddress.fullName} with contactless verification.`
            : `Package will be assigned to a local delivery associate for safe doorstep delivery.`,
      },
    ];
  })();

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-16 text-[#173B3D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            HERO SEARCH & TRACKING LOOKUP HEADER
            ======================================================== */}
        <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-10 border border-[#07545A]/12 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#07545A]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#F2A900]/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07545A]/10 text-[#07545A] text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Truck className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Supabase Real-Time Order Tracking</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#07545A] font-display tracking-tight mb-2">
              Track Your Handcrafted Order
            </h1>
            <p className="text-xs sm:text-sm text-[#173B3D]/75 leading-relaxed mb-6">
              Enter your Order ID to track every slow-crafted milestone synced in real-time from our Supabase database. Includes live courier movement, artisan studio notes, and instant status updates.
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
                {(userOrders.length > 0 ? userOrders : orders.slice(0, 4)).map((ord) => (
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
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : activeOrder.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : activeOrder.status === 'Crafting'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : activeOrder.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-[#07545A]/10 text-[#07545A] border-[#07545A]/20'
                      }`}
                    >
                      {activeOrder.status === 'Delivered' && <BadgeCheck className="w-3.5 h-3.5" />}
                      {activeOrder.status === 'Dispatched' && <Truck className="w-3.5 h-3.5" />}
                      {activeOrder.status === 'Crafting' && <Clock className="w-3.5 h-3.5" />}
                      {activeOrder.status === 'Confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {activeOrder.status === 'Cancelled' && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{activeOrder.status}</span>
                    </span>

                    {/* Supabase live badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                      <span>Supabase Synced</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#687778]">
                    Placed on <span className="font-semibold text-[#173B3D]">{activeOrder.date}</span> · Total:{' '}
                    <span className="font-bold text-[#07545A]">₹{activeOrder.total}</span> · Paid via{' '}
                    <span className="font-semibold text-[#173B3D]">{activeOrder.paymentMethod}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Official Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/?track=${activeOrder.id}`;
                      handleCopy(shareUrl, 'Tracking Link');
                    }}
                    className="px-4 py-2 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Share Tracking</span>
                  </button>
                </div>
              </div>

              {/* Courier Partner & AWB Info Strip */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-[#07545A]/10 text-xs">
                <div>
                  <span className="text-[#687778] block text-[11px] mb-0.5">Courier Partner</span>
                  <div className="font-bold text-[#07545A] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#F2A900]" />
                    <span>{carrier}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#687778] block text-[11px] mb-0.5">Tracking AWB</span>
                  <div className="font-mono font-bold text-[#173B3D] flex items-center gap-2">
                    <span>{awbNumber}</span>
                    <button
                      onClick={() => handleCopy(awbNumber, 'Tracking AWB')}
                      className="p-1 text-[#07545A]/50 hover:text-[#07545A] cursor-pointer"
                      title="Copy AWB"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#687778] block text-[11px] mb-0.5">Estimated Delivery</span>
                  <div className="font-bold text-[#173B3D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#E97868]" />
                    <span>{estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  STEPPER PROGRESS BAR
                  ======================================================== */}
              <div className="mt-8 pt-6 border-t border-[#07545A]/10">
                <h3 className="text-xs font-bold text-[#687778] uppercase tracking-wider mb-6">
                  Artisan & Delivery Progress
                </h3>

                {activeOrder.status === 'Cancelled' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Order Marked as Cancelled</span>
                      <span>Artisan production was halted. If payment was deducted, refund processes in 3-5 business days.</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Stepper Line */}
                    <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-8 right-8 h-1 bg-[#07545A]/15 z-0" />
                    <div
                      className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-8 h-1 bg-[#07545A] transition-all duration-700 z-0"
                      style={{
                        width: `${Math.max(0, Math.min(100, (stageIndex / 3) * 100))}%`,
                      }}
                    />

                    {/* 4 Stages */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                      {[
                        { title: 'Confirmed', desc: 'Atelier Assigned', icon: CheckCircle2, idx: 0 },
                        { title: 'Crafting', desc: 'Maker at Bench', icon: Clock, idx: 1 },
                        { title: 'Dispatched', desc: 'In Courier Transit', icon: Truck, idx: 2 },
                        { title: 'Delivered', desc: 'At Your Door', icon: BadgeCheck, idx: 3 },
                      ].map((stg) => {
                        const Icon = stg.icon;
                        const isDone = stageIndex >= stg.idx;
                        const isCurrent = stageIndex === stg.idx;

                        return (
                          <div
                            key={stg.title}
                            className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 sm:p-0 rounded-2xl sm:rounded-none ${
                              isCurrent ? 'bg-[#07545A]/5 sm:bg-transparent' : ''
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs shrink-0 ${
                                isDone
                                  ? 'bg-[#07545A] text-[#FFF8EA]'
                                  : 'bg-white text-[#07545A]/40 border-2 border-[#07545A]/20'
                              } ${isCurrent ? 'ring-4 ring-[#F2A900]/40 animate-pulse' : ''}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <div className="text-left sm:text-center">
                              <span
                                className={`block text-xs font-bold ${
                                  isDone ? 'text-[#07545A]' : 'text-[#687778]'
                                }`}
                              >
                                {stg.title}
                              </span>
                              <span className="text-[10px] text-[#687778] block">
                                {stg.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                TWO-COLUMN LAYOUT: DETAILED MILESTONES & ORDER SUMMARY
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT 2 COLS: SUPABASE MILESTONE TIMELINE */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/15 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#07545A]/10">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#07545A] font-display">
                        Detailed Activity Timeline
                      </h2>
                      <span className="text-[11px] text-[#687778]">
                        Data streamed directly from Supabase <code className="bg-[#07545A]/10 px-1.5 py-0.5 rounded text-[10px] text-[#07545A]">order_tracking</code> table
                      </span>
                    </div>

                    <div className="text-right">
                      {isLoadingTracking && (
                        <span className="text-[11px] text-[#07545A] font-bold animate-pulse">
                          Syncing...
                        </span>
                      )}
                      {lastRefreshedAt && !isLoadingTracking && (
                        <span className="text-[10px] text-[#687778]">
                          Updated at {lastRefreshedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#07545A]/15">
                    {displayMilestones.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative pl-9 flex flex-col gap-1">
                        {/* Dot */}
                        <div
                          className={`absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
                            evt.isCurrent
                              ? 'bg-[#F2A900] border-[#07545A] ring-4 ring-[#F2A900]/30 animate-pulse'
                              : evt.isCompleted
                              ? 'bg-[#07545A] border-white'
                              : 'bg-white border-[#07545A]/30'
                          }`}
                        />

                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#07545A]">
                            {evt.title}
                          </h4>
                          <span className="text-[11px] text-[#687778] tabular-nums">
                            {evt.date} · {evt.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-[#687778]">
                          <MapPin className="w-3 h-3 text-[#07545A]/60 shrink-0" />
                          <span>{evt.location}</span>
                        </div>

                        <p className="text-xs text-[#173B3D]/80 leading-relaxed mt-1 bg-white/70 p-3 rounded-xl border border-[#07545A]/8">
                          {evt.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packaging & Slow Craft Note */}
                <div className="bg-[#07545A] text-[#FFF8EA] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs text-[#F2A900] font-bold mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Artisan Handcraft Assurance</span>
                      </div>
                      <h4 className="text-base font-bold font-display mb-1">
                        Plastic-Free & Thoughtfully Packaged
                      </h4>
                      <p className="text-xs text-[#FFF8EA]/80 max-w-xl leading-relaxed">
                        Every package is assembled by independent creators using biodegradable honeycomb kraft cushioning, paper tape, and an authentic handwritten thank-you postcard with the maker's signature.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COL: RECIPIENT & ITEMS SUMMARY */}
              <div className="space-y-6">
                {/* Delivery Address Card */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/15 shadow-sm">
                  <h3 className="text-xs font-bold text-[#687778] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#07545A]" />
                    <span>Shipping Destination</span>
                  </h3>

                  <div className="text-xs space-y-1 text-[#173B3D]">
                    <p className="font-bold text-sm text-[#07545A]">
                      {activeOrder.shippingAddress.fullName}
                    </p>
                    <p className="text-[#687778]">{activeOrder.shippingAddress.phone}</p>
                    <p className="pt-2 leading-relaxed">
                      {activeOrder.shippingAddress.street}
                    </p>
                    <p className="font-medium">
                      {activeOrder.shippingAddress.city} - {activeOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>

                {/* Items in Order Card */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/15 shadow-sm">
                  <h3 className="text-xs font-bold text-[#687778] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#07545A]" />
                    <span>Ordered Items ({activeOrder.items.length})</span>
                  </h3>

                  <div className="space-y-3 divide-y divide-[#07545A]/10">
                    {activeOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${idx > 0 ? 'pt-3' : ''}`}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#07545A]/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => navigateToProduct(item.product.id)}
                            className="text-xs font-bold text-[#07545A] truncate hover:underline cursor-pointer"
                          >
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-[#687778] block truncate">
                            By {item.product.creatorName}
                          </span>
                          {item.personalizationText && (
                            <span className="text-[10px] text-[#E97868] italic block">
                              Note: "{item.personalizationText}"
                            </span>
                          )}
                          <div className="flex items-center justify-between text-xs font-bold mt-1">
                            <span className="text-[#687778] text-[11px]">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-[#07545A]">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#07545A]/10 flex items-center justify-between text-xs font-bold">
                    <span>Order Total</span>
                    <span className="text-base font-extrabold text-[#07545A]">
                      ₹{activeOrder.total}
                    </span>
                  </div>
                </div>

                {/* Support Box */}
                <div className="bg-[#FFF8EA] rounded-3xl p-6 border border-[#07545A]/15 text-center">
                  <HelpCircle className="w-8 h-8 text-[#07545A]/40 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-[#07545A] mb-1">
                    Need Help With Your Package?
                  </h4>
                  <p className="text-[11px] text-[#687778] mb-3">
                    Our maker support team answers within 2 business hours.
                  </p>
                  <button
                    onClick={() => showToast('Support Request', 'Connecting to Curowit Care Desk...')}
                    className="w-full py-2 bg-[#F7EBD7] hover:bg-[#07545A]/10 text-[#07545A] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            OFFICIAL INVOICE MODAL
            ======================================================== */}
        {isInvoiceModalOpen && activeOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFF8EA] rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#07545A]/20 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#07545A]/15 pb-4">
                <CurowitLogo size="md" />
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#07545A]/10 text-[#07545A] text-xs font-bold hover:bg-[#07545A]/20 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex justify-between items-start text-xs">
                <div>
                  <h3 className="font-extrabold text-sm text-[#07545A]">TAX INVOICE</h3>
                  <p className="text-[#687778]">Invoice No: INV-{activeOrder.id}</p>
                  <p className="text-[#687778]">Date: {activeOrder.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#07545A]">Curowit Creative Platform</span>
                  <p className="text-[11px] text-[#687778]">GSTIN: 29AAAFC0000A1Z5</p>
                  <p className="text-[11px] text-[#687778]">Bengaluru, India</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#07545A]/10 text-xs">
                <span className="font-bold text-[#07545A] block mb-1">Billed & Shipped To:</span>
                <p className="font-semibold">{activeOrder.shippingAddress.fullName}</p>
                <p className="text-[#687778]">{activeOrder.shippingAddress.phone}</p>
                <p>{activeOrder.shippingAddress.street}</p>
                <p>{activeOrder.shippingAddress.city} - {activeOrder.shippingAddress.postalCode}</p>
              </div>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#07545A]/20 text-[#687778]">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#07545A]/10">
                  {activeOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5">
                        <span className="font-bold text-[#07545A] block">{it.product.name}</span>
                        <span className="text-[10px] text-[#687778]">Artisan: {it.product.creatorName}</span>
                      </td>
                      <td className="py-2.5 text-center">{it.quantity}</td>
                      <td className="py-2.5 text-right">₹{it.product.price}</td>
                      <td className="py-2.5 text-right font-bold">₹{it.product.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-[#07545A]/20 pt-4 flex justify-between items-center text-sm font-bold">
                <span>Grand Total Paid</span>
                <span className="text-xl text-[#07545A]">₹{activeOrder.total}</span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
