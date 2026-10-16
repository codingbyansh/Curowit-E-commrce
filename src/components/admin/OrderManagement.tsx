import React, { useState } from 'react';
import { useStore, Order } from '../../context/StoreContext';
import {
  fetchOrdersFromSupabase,
  fetchOrderTrackingFromSupabase,
  updateOrderStatusInSupabase,
  SupabaseTrackingRecord,
  deleteOrderFromSupabase,
} from '../../supabase';
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  BadgeCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  Sparkles,
  MapPin,
  ChevronDown,
  Phone,
  User,
  ShoppingBag,
  CreditCard,
  Radio,
  FileText,
  X,
  Check,
  Send,
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrder, deleteOrder, showToast, navigateToTrackOrder } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');
  const [isSyncing, setIsSyncing] = useState(false);

  // Status update modal state
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<Order | null>(null);
  const [targetStatus, setTargetStatus] = useState<Order['status']>('Crafting');
  const [carrierInput, setCarrierInput] = useState('Delhivery Eco Surface Logistics');
  const [awbInput, setAwbInput] = useState('');
  const [locationInput, setLocationInput] = useState('Curowit Fulfillment Hub, Bengaluru');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Timeline inspection modal
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [inspectMilestones, setInspectMilestones] = useState<SupabaseTrackingRecord[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesQuery =
      order.id.toLowerCase().includes(q) ||
      order.shippingAddress.fullName.toLowerCase().includes(q) ||
      order.shippingAddress.phone.toLowerCase().includes(q) ||
      order.shippingAddress.city.toLowerCase().includes(q) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(q)) ||
      (order.trackingAwb && order.trackingAwb.toLowerCase().includes(q));

    return matchesStatus && matchesQuery;
  });

  // Calculate order stats
  const totalCount = orders.length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const craftingCount = orders.filter((o) => o.status === 'Crafting').length;
  const dispatchedCount = orders.filter((o) => o.status === 'Dispatched').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Manual refresh from database
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const freshOrders = await fetchOrdersFromSupabase();
      if (freshOrders && freshOrders.length > 0) {
        freshOrders.forEach((fo) => {
          updateOrder(fo.id, fo);
        });
        showToast('Sync Complete', `Synced ${freshOrders.length} orders from cloud database`);
      } else {
        showToast('Database Live', 'All orders are currently in sync with database');
      }
    } catch (err) {
      showToast('Sync Notice', 'Failed to retrieve cloud orders', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', `${label}: ${text}`);
  };

  // Open modal for detailed status update
  const openStatusUpdateModal = (order: Order, newStatus?: Order['status']) => {
    setSelectedOrderForUpdate(order);
    const next =
      newStatus ||
      (order.status === 'Confirmed'
        ? 'Crafting'
        : order.status === 'Crafting'
        ? 'Dispatched'
        : order.status === 'Dispatched'
        ? 'Delivered'
        : 'Delivered');

    setTargetStatus(next);
    setCarrierInput(order.courierPartner || 'Delhivery Eco Surface Logistics');
    setAwbInput(
      order.trackingAwb ||
        `DLV-${order.id.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`
    );

    const defaultLocations: Record<string, string> = {
      Confirmed: 'Curowit Fulfillment Hub, Bengaluru',
      Crafting: 'Artisan Workshop Studio, Karnataka',
      Dispatched: 'Regional Logistics Hub, Bengaluru',
      Delivered: `${order.shippingAddress.city || 'Local'} Delivery Facility`,
      Cancelled: 'Curowit Fulfillment Hub',
    };
    setLocationInput(defaultLocations[next] || 'Curowit Logistics Center');

    const defaultNotes: Record<string, string> = {
      Confirmed: 'Order accepted. Creator assigned materials and started preparation.',
      Crafting: 'Artisan handcrafting piece. Eco honeycomb packaging prepared.',
      Dispatched: `Consignment sealed and handed over to courier. In transit to ${order.shippingAddress.city}.`,
      Delivered: `Parcel delivered to ${order.shippingAddress.fullName} with contactless verification.`,
      Cancelled: 'Order cancelled by administrator.',
    };
    setDescriptionInput(defaultNotes[next] || '');
  };

  // Commit status update to Supabase & Store
  const handleConfirmStatusUpdate = async () => {
    if (!selectedOrderForUpdate) return;
    setIsUpdatingStatus(true);

    try {
      const trackingMeta = {
        carrier: carrierInput.trim() || 'Delhivery Eco Surface Logistics',
        awb: awbInput.trim() || `DLV-${selectedOrderForUpdate.id.replace(/\D/g, '')}`,
        location: locationInput.trim() || 'Curowit Logistics Hub',
        description: descriptionInput.trim(),
      };

      // 1. Direct call to Supabase
      await updateOrderStatusInSupabase(
        selectedOrderForUpdate.id,
        targetStatus,
        trackingMeta
      );

      // 2. Update in store context (which also triggers local sync & toasts)
      updateOrder(
        selectedOrderForUpdate.id,
        {
          status: targetStatus,
          courierPartner: trackingMeta.carrier,
          trackingAwb: trackingMeta.awb,
        },
        trackingMeta
      );

      showToast(
        'Order Synced',
        `Order #${selectedOrderForUpdate.id} updated to ${targetStatus} and tracking milestone saved.`
      );

      setSelectedOrderForUpdate(null);
    } catch (err) {
      console.warn('Status update error:', err);
      showToast('Error', 'Failed to update order status in database', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Supabase tracking timeline inspector
  const openTrackingInspector = async (orderId: string) => {
    setInspectOrderId(orderId);
    setIsLoadingMilestones(true);
    try {
      const records = await fetchOrderTrackingFromSupabase(orderId);
      setInspectMilestones(records);
    } catch (err) {
      console.warn('Error fetching order_tracking records:', err);
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          REALTIME LIVE STATUS BANNER & HEADER
          ======================================================== */}
      <div className="bg-[#FFF8EA] rounded-3xl p-5 sm:p-6 border border-[#07545A]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-extrabold text-[#07545A] font-display">
              Realtime Order Management
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Active
            </span>
          </div>
          <p className="text-xs text-[#173B3D]/70 max-w-2xl leading-relaxed">
            All order status changes made here update order and tracking records instantly. Customers viewing the tracking page receive live updates in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          ORDER STATS SUMMARY TILES
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-xs'
              : 'bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/12 hover:border-[#07545A]/30'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Total Orders
          </span>
          <span className="text-xl font-black mt-1 block">{totalCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('Confirmed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Confirmed'
              ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-xs'
              : 'bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/12 hover:border-[#07545A]/30'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Confirmed
          </span>
          <span className="text-xl font-black mt-1 block text-sky-600">{confirmedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('Crafting')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Crafting'
              ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-xs'
              : 'bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/12 hover:border-[#07545A]/30'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Crafting
          </span>
          <span className="text-xl font-black mt-1 block text-amber-600">{craftingCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('Dispatched')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Dispatched'
              ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-xs'
              : 'bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/12 hover:border-[#07545A]/30'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Dispatched
          </span>
          <span className="text-xl font-black mt-1 block text-blue-600">{dispatchedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('Delivered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Delivered'
              ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-xs'
              : 'bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/12 hover:border-[#07545A]/30'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Delivered
          </span>
          <span className="text-xl font-black mt-1 block text-emerald-600">{deliveredCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF8EA] text-[#173B3D] border border-[#07545A]/12">
          <span className="text-[10px] font-bold uppercase tracking-wider block text-[#687778]">
            Total Revenue
          </span>
          <span className="text-xl font-black mt-1 block text-[#07545A]">₹{totalRevenue}</span>
        </div>
      </div>

      {/* ========================================================
          SEARCH & FILTER STRIP
          ======================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFF8EA] p-4 rounded-2xl border border-[#07545A]/12 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07545A]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, customer, phone, city, or AWB..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-white border border-[#07545A]/20 rounded-xl focus:border-[#07545A] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(['All', 'Confirmed', 'Crafting', 'Dispatched', 'Delivered', 'Cancelled'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'bg-white text-[#07545A] border border-[#07545A]/15 hover:bg-[#F7EBD7]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* ========================================================
          ORDER CARDS LIST
          ======================================================== */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#FFF8EA] rounded-3xl p-12 text-center border border-[#07545A]/10 shadow-xs">
          <Package className="w-12 h-12 text-[#07545A]/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#173B3D] mb-1">No Orders Match Filter</h3>
          <p className="text-xs text-[#687778]">
            Try adjusting your search criteria or select 'All' status filter above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const courier = order.courierPartner || 'Delhivery Eco Surface Logistics';
            const awb = order.trackingAwb || `DLV-${order.id.replace(/\D/g, '') || '9142'}`;

            return (
              <div
                key={order.id}
                className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 p-5 sm:p-6 shadow-xs hover:border-[#07545A]/30 transition-all space-y-4"
              >
                {/* Header row: ID, Date, Status pill, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#07545A]/10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-xl">
                      #{order.id}
                    </span>
                    <button
                      onClick={() => handleCopy(order.id, 'Order ID')}
                      className="p-1 text-[#07545A]/50 hover:text-[#07545A] cursor-pointer"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs text-[#687778]">{order.date}</span>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : order.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : order.status === 'Crafting'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-stone-100 text-stone-800 border-stone-300'
                      }`}
                    >
                      {order.status === 'Delivered' && <BadgeCheck className="w-3 h-3" />}
                      {order.status === 'Dispatched' && <Truck className="w-3 h-3" />}
                      {order.status === 'Crafting' && <Clock className="w-3 h-3" />}
                      {order.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3" />}
                      {order.status === 'Cancelled' && <AlertCircle className="w-3 h-3" />}
                      <span>{order.status}</span>
                    </span>

                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                      Realtime Synced
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#687778] block">
                        Order Total
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#07545A]">
                        ₹{order.total}
                      </span>
                    </div>

                    <button
                      onClick={() => navigateToTrackOrder(order.id)}
                      className="px-3 py-1.5 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Open user tracking view"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Track View</span>
                    </button>
                  </div>
                </div>

                {/* Middle Grid: Customer & Delivery, Courier Partner, Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer & Address */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/10 space-y-1">
                    <span className="font-bold text-[11px] text-[#687778] uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#07545A]" />
                      <span>Customer & Address</span>
                    </span>
                    <p className="font-bold text-[#07545A]">{order.shippingAddress.fullName}</p>
                    <p className="text-[#687778]">{order.shippingAddress.phone}</p>
                    {order.userEmail && <p className="text-[#687778]">{order.userEmail}</p>}
                    <p className="pt-1 text-[#173B3D]/80">
                      {order.shippingAddress.street}, {order.shippingAddress.city} -{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                  </div>

                  {/* Logistics Info & Courier */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/10 space-y-1.5">
                    <span className="font-bold text-[11px] text-[#687778] uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#07545A]" />
                      <span>Logistics Details</span>
                    </span>
                    <div>
                      <span className="text-[#687778] text-[10px] block">Carrier:</span>
                      <span className="font-bold text-[#173B3D]">{courier}</span>
                    </div>
                    <div>
                      <span className="text-[#687778] text-[10px] block">Tracking AWB:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-[#07545A]">
                        <span>{awb}</span>
                        <button
                          onClick={() => handleCopy(awb, 'AWB')}
                          className="p-1 hover:text-[#07545A] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-[#687778]">
                      <CreditCard className="w-3 h-3" />
                      <span>
                        {order.paymentMethod || 'Razorpay UPI'} ·{' '}
                        <strong className="text-[#07545A]">{order.paymentStatus || 'Paid'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items Ordered List */}
                  <div className="bg-white p-3.5 rounded-2xl border border-[#07545A]/10 space-y-2">
                    <span className="font-bold text-[11px] text-[#687778] uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-[#07545A]" />
                      <span>Items ({order.items.length})</span>
                    </span>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img
                            src={it.product.image}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-[#07545A]/10 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold block truncate text-[11px]">
                              {it.product.name}
                            </span>
                            <span className="text-[10px] text-[#687778]">
                              x{it.quantity} · ₹{it.product.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Trigger Status Updates synced to Supabase */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#07545A]/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[#687778] mr-1">Trigger Update:</span>

                    {/* Quick stage transition triggers */}
                    {order.status !== 'Confirmed' && (
                      <button
                        onClick={() => openStatusUpdateModal(order, 'Confirmed')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Confirmed
                      </button>
                    )}

                    {order.status !== 'Crafting' && (
                      <button
                        onClick={() => openStatusUpdateModal(order, 'Crafting')}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Crafting
                      </button>
                    )}

                    {order.status !== 'Dispatched' && (
                      <button
                        onClick={() => openStatusUpdateModal(order, 'Dispatched')}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Dispatched
                      </button>
                    )}

                    {order.status !== 'Delivered' && (
                      <button
                        onClick={() => openStatusUpdateModal(order, 'Delivered')}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Delivered
                      </button>
                    )}

                    {order.status !== 'Cancelled' && (
                      <button
                        onClick={() => openStatusUpdateModal(order, 'Cancelled')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View live tracking history */}
                    <button
                      onClick={() => openTrackingInspector(order.id)}
                      className="px-3 py-1.5 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      View Tracking Timeline
                    </button>

                    {/* Delete order */}
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Delete order #${order.id}? This will remove it from database orders and tracking records.`
                          )
                        ) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete order permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: STATUS UPDATE WITH SUPABASE MILESTONE DISPATCH
          ======================================================== */}
      {selectedOrderForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFF8EA] rounded-3xl max-w-lg w-full p-6 border border-[#07545A]/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#07545A]/15">
              <div>
                <h3 className="font-extrabold text-base text-[#07545A] font-display">
                  Update Status & Save Milestone
                </h3>
                <span className="text-xs text-[#687778]">
                  Order #{selectedOrderForUpdate.id} · Customer: {selectedOrderForUpdate.shippingAddress.fullName}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForUpdate(null)}
                className="p-1.5 text-[#07545A]/60 hover:text-[#07545A] rounded-xl hover:bg-[#07545A]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* New Status selector */}
              <div>
                <label className="block font-bold text-[#07545A] mb-1.5">
                  Target Status Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Confirmed', 'Crafting', 'Dispatched', 'Delivered', 'Cancelled'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setTargetStatus(st);
                          const defaultLocations: Record<string, string> = {
                            Confirmed: 'Curowit Fulfillment Hub, Bengaluru',
                            Crafting: 'Artisan Workshop Studio, Karnataka',
                            Dispatched: 'Regional Logistics Hub, Bengaluru',
                            Delivered: `${selectedOrderForUpdate.shippingAddress.city || 'Local'} Delivery Facility`,
                            Cancelled: 'Curowit Fulfillment Hub',
                          };
                          setLocationInput(defaultLocations[st] || 'Curowit Logistics Center');
                        }}
                        className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                          targetStatus === st
                            ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A]'
                            : 'bg-white text-[#07545A] border-[#07545A]/20 hover:bg-[#F7EBD7]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Courier Partner & AWB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#07545A] mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#07545A]/20 font-medium outline-none focus:border-[#07545A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#07545A] mb-1">AWB Consignment No.</label>
                  <input
                    type="text"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[#07545A]/20 font-mono font-medium outline-none focus:border-[#07545A]"
                  />
                </div>
              </div>

              {/* Milestone Location */}
              <div>
                <label className="block font-bold text-[#07545A] mb-1">
                  Current Hub / Milestone Location
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Curowit Fulfillment Hub, Bengaluru"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#07545A]/20 font-medium outline-none focus:border-[#07545A]"
                />
              </div>

              {/* Custom Milestone Description */}
              <div>
                <label className="block font-bold text-[#07545A] mb-1">
                  Logistics Milestone Note (Shown to Customer)
                </label>
                <textarea
                  rows={2}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="e.g. Package inspected, barcoded and placed on outbound express shuttle."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#07545A]/20 font-medium outline-none focus:border-[#07545A]"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
                <strong>Database Sync:</strong> This action updates both the primary order record and creates a timestamped entry in the live tracking audit log.
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-[#07545A]/15">
              <button
                type="button"
                onClick={() => setSelectedOrderForUpdate(null)}
                className="px-4 py-2 bg-white text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl hover:bg-[#F7EBD7] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusUpdate}
                className="px-5 py-2 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUpdatingStatus ? 'Syncing...' : 'Save & Update Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SUPABASE ORDER TRACKING INSPECTOR
          ======================================================== */}
      {inspectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFF8EA] rounded-3xl max-w-lg w-full p-6 border border-[#07545A]/20 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#07545A]/15">
              <div>
                <h3 className="font-extrabold text-base text-[#07545A] font-display">
                  Live Order Tracking Records
                </h3>
                <span className="text-xs text-[#687778]">
                  Order #{inspectOrderId}
                </span>
              </div>
              <button
                onClick={() => setInspectOrderId(null)}
                className="p-1.5 text-[#07545A]/60 hover:text-[#07545A] rounded-xl hover:bg-[#07545A]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingMilestones ? (
              <div className="py-8 text-center text-xs text-[#07545A] font-bold animate-pulse">
                Loading tracking records...
              </div>
            ) : inspectMilestones.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#687778]">
                No explicit milestones saved yet. Trigger a status update above to append milestone events!
              </div>
            ) : (
              <div className="space-y-3">
                {inspectMilestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-3 bg-white rounded-xl border border-[#07545A]/10 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[#07545A]">{m.title}</span>
                      <span className="text-[10px] text-[#687778]">
                        {m.date} · {m.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#687778] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#07545A]/60" />
                      <span>{m.location}</span>
                    </p>
                    <p className="text-[11px] text-[#173B3D]/80 pt-1 border-t border-[#07545A]/5">
                      {m.description}
                    </p>
                    {m.carrier && (
                      <span className="text-[10px] text-[#687778] block">
                        Carrier: {m.carrier} · AWB: {m.awb_number}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setInspectOrderId(null)}
                className="px-4 py-2 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
