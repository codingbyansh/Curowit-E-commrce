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
  PackageCheck,
  Palette,
  Send,
  Boxes,
  FileCheck,
  Navigation,
  Compass,
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
            showToast('Tracking Updated', `Live milestones refreshed for Order #${activeOrder.id}`);
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
      showToast('Order Found', `Tracking Order #${found.id} status`);
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
      case 'In Transit':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const rawStageIndex = getStageIndex(activeOrder?.status);
  // When activeOrder has Dispatched status and tracking shows transit or dispatch, compute effective index
  const stageIndex =
    rawStageIndex === 2
      ? supabaseMilestones.some((m) => m.status?.toLowerCase().includes('transit'))
        ? 3
        : 2
      : rawStageIndex;

  // Selected milestone for interactive timeline inspector
  const [selectedMilestoneStep, setSelectedMilestoneStep] = useState<number | null>(null);

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
        title: `Consignment Dispatched — ${carrier}`,
        location: `Regional Logistics Hub, ${originCity}`,
        date: stageIndex >= 2 ? 'Dispatched' : 'Pending',
        time: stageIndex >= 2 ? '07:30 PM' : 'Est. Next 24 hrs',
        isCompleted: stageIndex >= 2,
        isCurrent: stageIndex === 2,
        description: `Consignment manifest sealed with tamper-evident paper tape under AWB #${awbNumber}. Handed over to logistics carrier.`,
      },
      {
        title: `In Highway & Hub Transit — Linehaul Route`,
        location: `Central Sorting Facility, National Corridor`,
        date: stageIndex >= 3 ? 'In Transit' : 'Upcoming',
        time: stageIndex >= 3 ? '04:15 AM' : 'Est. Next 48 hrs',
        isCompleted: stageIndex >= 3,
        isCurrent: stageIndex === 3,
        description: `Package departed gateway hub and traveling through surface transit network towards ${destCity}.`,
      },
      {
        title: 'Out for Delivery & Doorstep Handover',
        location: `Local Delivery Facility, ${destCity}`,
        date: stageIndex >= 4 ? (stageIndex >= 5 ? 'Delivered' : 'Today') : estimatedDelivery,
        time: stageIndex >= 4 ? '02:18 PM' : '9:00 AM - 6:00 PM',
        isCompleted: stageIndex >= 5,
        isCurrent: stageIndex === 4,
        description:
          stageIndex >= 5
            ? `Successfully delivered to ${activeOrder.shippingAddress.fullName} with contactless verification.`
            : `Package assigned to local delivery associate for safe doorstep handover.`,
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
              <span>Real-Time Artisan Order Tracking</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#07545A] font-display tracking-tight mb-2">
              Track Your Handcrafted Order
            </h1>
            <p className="text-xs sm:text-sm text-[#173B3D]/75 leading-relaxed mb-6">
              Enter your Order ID to track every slow-crafted milestone in real-time. Includes live courier movement, artisan studio notes, and instant status updates.
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

                    {/* Live status badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                      <span>Live Status Active</span>
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

              {/* ========================================================
                  3-PILLAR LOGISTICS STATUS STRIP (DISPATCH, TRANSIT, DELIVERY)
                  ======================================================== */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. DISPATCH STATUS CARD */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    stageIndex >= 2
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-2xs'
                      : stageIndex === 1
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-2xs'
                      : 'bg-white border-[#07545A]/10 text-[#173B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687778] flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dispatch Status</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        stageIndex >= 2
                          ? 'bg-blue-600 text-white'
                          : stageIndex === 1
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#07545A]/15 text-[#07545A]'
                      }`}
                    >
                      {stageIndex >= 2 ? 'Dispatched' : stageIndex === 1 ? 'In Crafting' : 'Confirmed'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#07545A]">
                      {stageIndex >= 2 ? 'Dispatched from Atelier Hub' : 'Artisan Crafting at Bench'}
                    </p>
                    <p className="text-[#687778] text-[11px] leading-relaxed">
                      AWB #{awbNumber} · Tamper-evident kraft seal
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                      <Boxes className="w-3 h-3" />
                      <span>Biodegradable Eco Packaging</span>
                    </div>
                  </div>
                </div>

                {/* 2. TRANSIT STATUS CARD */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    stageIndex >= 3
                      ? 'bg-teal-50/80 border-teal-200 text-teal-900 shadow-2xs'
                      : stageIndex === 2
                      ? 'bg-blue-50/60 border-blue-200 text-blue-900 shadow-2xs'
                      : 'bg-white border-[#07545A]/10 text-[#173B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687778] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Transit Status</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        stageIndex >= 3
                          ? 'bg-teal-600 text-white animate-pulse'
                          : stageIndex === 2
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#07545A]/15 text-[#07545A]'
                      }`}
                    >
                      {stageIndex >= 3 ? 'In Transit' : stageIndex === 2 ? 'Courier Handover' : 'Pending'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#07545A]">
                      {carrier}
                    </p>
                    <p className="text-[#687778] text-[11px] leading-relaxed">
                      Linehaul surface transit towards {activeOrder.shippingAddress.city}
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
                      <Navigation className="w-3 h-3" />
                      <span>Live Hub Routing Synced</span>
                    </div>
                  </div>
                </div>

                {/* 3. DELIVERY STATUS CARD */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    stageIndex >= 5
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs'
                      : stageIndex === 4
                      ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs'
                      : 'bg-white border-[#07545A]/10 text-[#173B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#687778] flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Status</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        stageIndex >= 5
                          ? 'bg-emerald-600 text-white'
                          : stageIndex === 4
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-[#07545A]/15 text-[#07545A]'
                      }`}
                    >
                      {stageIndex >= 5 ? 'Delivered' : stageIndex === 4 ? 'Out for Delivery' : 'Estimated'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#07545A]">
                      {stageIndex >= 5 ? 'Doorstep Handover Complete' : `ETA: ${estimatedDelivery}`}
                    </p>
                    <p className="text-[#687778] text-[11px] leading-relaxed truncate">
                      To: {activeOrder.shippingAddress.fullName} ({activeOrder.shippingAddress.city})
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <Home className="w-3 h-3" />
                      <span>Contactless Verification Protocol</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  ENHANCED VISUAL PROGRESS TIMELINE (STEP-BASED MILESTONES)
                  ======================================================== */}
              <div className="mt-8 pt-6 border-t border-[#07545A]/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#07545A] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F2A900]" />
                      <span>Visual Progress Timeline · Step-Based Milestones</span>
                    </h3>
                    <p className="text-[11px] text-[#687778] mt-0.5">
                      Click any milestone to inspect technical dispatch, courier transit, or doorstep delivery details
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] text-[#07545A] bg-[#07545A]/10 px-2.5 py-1 rounded-lg font-bold">
                      Progress: {stageIndex >= 5 ? '100%' : `${Math.round((Math.max(0, stageIndex) / 5) * 100)}%`}
                    </span>
                  </div>
                </div>

                {activeOrder.status === 'Cancelled' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Order Marked as Cancelled</span>
                      <span>Artisan production was halted. If payment was deducted, refund processes in 3-5 business days.</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Visual Milestones Track */}
                    <div className="relative py-2">
                      {/* Background Connector Track */}
                      <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-1.5 bg-[#07545A]/15 rounded-full z-0" />

                      {/* Animated Progress Fill Track */}
                      <div
                        className="hidden lg:block absolute top-[28px] left-[5%] h-1.5 bg-gradient-to-r from-[#07545A] via-[#0E7A85] to-[#F2A900] rounded-full transition-all duration-700 z-0"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(90, (Math.max(0, stageIndex) / 5) * 90)
                          )}%`,
                        }}
                      />

                      {/* 6 Step-Based Milestones */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
                        {[
                          {
                            step: 1,
                            title: 'Order Confirmed',
                            category: 'Atelier Assigned',
                            desc: 'Specifications queued',
                            icon: FileCheck,
                            idx: 0,
                            phaseType: 'order',
                          },
                          {
                            step: 2,
                            title: 'Slow Crafting',
                            category: 'Maker Bench',
                            desc: 'Hand-shaped & cured',
                            icon: Palette,
                            idx: 1,
                            phaseType: 'craft',
                          },
                          {
                            step: 3,
                            title: 'Dispatched',
                            category: 'Dispatch Milestone',
                            desc: `Sealed under AWB`,
                            icon: PackageCheck,
                            idx: 2,
                            phaseType: 'dispatch',
                          },
                          {
                            step: 4,
                            title: 'In Transit',
                            category: 'Transit Milestone',
                            desc: 'Linehaul corridor',
                            icon: Truck,
                            idx: 3,
                            phaseType: 'transit',
                          },
                          {
                            step: 5,
                            title: 'Out for Delivery',
                            category: 'Local Courier',
                            desc: 'Assigned to courier',
                            icon: Send,
                            idx: 4,
                            phaseType: 'delivery',
                          },
                          {
                            step: 6,
                            title: 'Delivered',
                            category: 'Delivery Milestone',
                            desc: 'Doorstep handover',
                            icon: BadgeCheck,
                            idx: 5,
                            phaseType: 'delivered',
                          },
                        ].map((milestone) => {
                          const Icon = milestone.icon;
                          const isDone = stageIndex >= milestone.idx;
                          const isCurrent = stageIndex === milestone.idx;
                          const isSelected = selectedMilestoneStep === milestone.step;

                          return (
                            <div
                              key={milestone.title}
                              onClick={() =>
                                setSelectedMilestoneStep(
                                  selectedMilestoneStep === milestone.step ? null : milestone.step
                                )
                              }
                              className={`flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-[#07545A]/10 border-[#07545A] shadow-md scale-102'
                                  : isCurrent
                                  ? 'bg-[#F2A900]/10 border-[#F2A900] shadow-xs'
                                  : isDone
                                  ? 'bg-white/80 border-[#07545A]/20 hover:bg-white'
                                  : 'bg-white/40 border-[#07545A]/10 hover:bg-white/70'
                              }`}
                            >
                              {/* Milestone Node Icon Badge */}
                              <div className="relative mb-2.5">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                    isCurrent
                                      ? 'bg-gradient-to-tr from-[#07545A] to-[#0A6B74] text-[#F2A900] ring-4 ring-[#F2A900]/50 animate-pulse'
                                      : isDone
                                      ? 'bg-[#07545A] text-[#FFF8EA]'
                                      : 'bg-white text-[#07545A]/40 border-2 border-[#07545A]/20'
                                  }`}
                                >
                                  <Icon className="w-6 h-6" />
                                </div>

                                {/* Step Number Pill */}
                                <span
                                  className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                    isDone
                                      ? 'bg-[#F2A900] text-[#173B3D] border-white shadow-2xs'
                                      : 'bg-[#07545A]/20 text-[#07545A] border-white'
                                  }`}
                                >
                                  {milestone.step}
                                </span>
                              </div>

                              {/* Title & Category */}
                              <span
                                className={`block text-xs font-black leading-tight ${
                                  isDone ? 'text-[#07545A]' : 'text-[#687778]'
                                }`}
                              >
                                {milestone.title}
                              </span>

                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-md ${
                                  milestone.phaseType === 'dispatch'
                                    ? 'bg-blue-100 text-blue-800'
                                    : milestone.phaseType === 'transit'
                                    ? 'bg-teal-100 text-teal-800'
                                    : milestone.phaseType === 'delivery' || milestone.phaseType === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-[#07545A]/10 text-[#07545A]'
                                }`}
                              >
                                {milestone.category}
                              </span>

                              <span className="text-[10px] text-[#687778] mt-1 line-clamp-1">
                                {milestone.desc}
                              </span>

                              {/* Status Tag */}
                              <div className="mt-2">
                                {isCurrent ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#F2A900] bg-[#07545A] px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F2A900] animate-ping" />
                                    <span>Active</span>
                                  </span>
                                ) : isDone ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>Done</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-medium text-[#687778]/70">
                                    Upcoming
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Milestone Inspector Drawer (Shows when a step is clicked) */}
                    {selectedMilestoneStep && (
                      <div className="mt-4 p-4 rounded-2xl bg-white border border-[#07545A]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#07545A] text-[#F2A900] flex items-center justify-center font-black">
                            #{selectedMilestoneStep}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#07545A]">
                              {selectedMilestoneStep === 1 && 'Step 1: Order Confirmed & Craft Allocation'}
                              {selectedMilestoneStep === 2 && 'Step 2: Slow Handcrafting & Studio Bench'}
                              {selectedMilestoneStep === 3 && 'Step 3: Dispatched & Consignment Sealed under AWB'}
                              {selectedMilestoneStep === 4 && 'Step 4: Surface Courier Transit via National Corridor'}
                              {selectedMilestoneStep === 5 && 'Step 5: Assigned to Local Delivery Hub & Out for Delivery'}
                              {selectedMilestoneStep === 6 && 'Step 6: Verified Doorstep Delivery Completed'}
                            </h4>
                            <p className="text-[11px] text-[#687778]">
                              {selectedMilestoneStep === 1 && `Order registered at Atelier with payment confirmed. Materials prepared.`}
                              {selectedMilestoneStep === 2 && `Master artisan individually hand-crafting piece according to slow-craft standards.`}
                              {selectedMilestoneStep === 3 && `Packed in plastic-free kraft box, sealed under AWB #${awbNumber}, handed to ${carrier}.`}
                              {selectedMilestoneStep === 4 && `Surface linehaul movement between logistics hubs. Real-time GPS stream active.`}
                              {selectedMilestoneStep === 5 && `Arrived at destination city (${activeOrder.shippingAddress.city}). Local dispatch associate scheduled.`}
                              {selectedMilestoneStep === 6 && `Contactless handover with signature verification at destination address.`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedMilestoneStep(null)}
                          className="text-xs font-bold text-[#07545A] hover:underline cursor-pointer shrink-0"
                        >
                          Close Details
                        </button>
                      </div>
                    )}
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
                        Verified milestones updated continuously from artisan studio to delivery
                      </span>
                    </div>

                    <div className="text-right">
                      {isLoadingTracking && (
                        <span className="text-[11px] text-[#07545A] font-bold animate-pulse">
                          Updating...
                        </span>
                      )}
                      {lastRefreshedAt && !isLoadingTracking && (
                        <span className="text-[10px] text-[#687778]">
                          Updated at {lastRefreshedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Milestones list with Lucide Icons and Status Category Badges */}
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#07545A]/15">
                    {displayMilestones.map((evt, idx) => {
                      const lowerTitle = (evt.title || '').toLowerCase();
                      const isDispatchEvt = lowerTitle.includes('dispatch') || lowerTitle.includes('handed');
                      const isTransitEvt = lowerTitle.includes('transit') || lowerTitle.includes('highway') || lowerTitle.includes('corridor');
                      const isDeliveryEvt = lowerTitle.includes('delivery') || lowerTitle.includes('doorstep');
                      const isCraftEvt = lowerTitle.includes('craft') || lowerTitle.includes('atelier');

                      const MilestoneIcon = isDispatchEvt
                        ? PackageCheck
                        : isTransitEvt
                        ? Truck
                        : isDeliveryEvt
                        ? BadgeCheck
                        : isCraftEvt
                        ? Palette
                        : FileCheck;

                      return (
                        <div key={evt.id || idx} className="relative pl-11 flex flex-col gap-1">
                          {/* Lucide Icon Node */}
                          <div
                            className={`absolute left-0 top-0.5 w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                              evt.isCurrent
                                ? 'bg-[#07545A] text-[#F2A900] border-[#07545A] ring-4 ring-[#F2A900]/30 shadow-xs'
                                : evt.isCompleted
                                ? 'bg-white text-[#07545A] border-[#07545A]/30 shadow-2xs'
                                : 'bg-white/60 text-[#687778]/50 border-gray-200'
                            }`}
                          >
                            <MilestoneIcon className="w-4 h-4" />
                          </div>

                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-[#07545A]">
                                {evt.title}
                              </h4>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isDispatchEvt
                                    ? 'bg-blue-100 text-blue-800'
                                    : isTransitEvt
                                    ? 'bg-teal-100 text-teal-800'
                                    : isDeliveryEvt
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-[#07545A]/10 text-[#07545A]'
                                }`}
                              >
                                {isDispatchEvt
                                  ? 'Dispatch'
                                  : isTransitEvt
                                  ? 'Transit'
                                  : isDeliveryEvt
                                  ? 'Delivery'
                                  : 'Milestone'}
                              </span>
                            </div>

                            <span className="text-[11px] text-[#687778] tabular-nums font-mono">
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
                      );
                    })}
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
