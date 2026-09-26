import React, { useState } from 'react';
import { useStore, HeroBannerSlide, TickerItem, Order } from '../../context/StoreContext';
import { Product, Creator, Workshop, Story, CATEGORIES } from '../../data/mockData';
import {
  ShieldCheck,
  Lock,
  LogOut,
  ExternalLink,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  ShoppingBag,
  Users,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Eye,
  KeyRound,
  Filter,
  Upload,
} from 'lucide-react';

export const AdminCMSPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    setActiveView,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrder,
    deleteOrder,
    creators,
    addCreator,
    updateCreator,
    deleteCreator,
    workshops,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    stories,
    addStory,
    updateStory,
    deleteStory,
    heroSlides,
    updateHeroSlides,
    announcements,
    updateAnnouncements,
    resetAllDataToDefaults,
    showToast,
  } = useStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'creators' | 'workshops' | 'stories' | 'banners'
  >('products');

  // Search & Filter State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals for Editing/Adding
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [isNewCreatorModalOpen, setIsNewCreatorModalOpen] = useState(false);

  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isNewWorkshopModalOpen, setIsNewWorkshopModalOpen] = useState(false);

  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  // Passkey prompt state if accessed directly while unauthenticated
  const [directPasskey, setDirectPasskey] = useState('');
  const [directError, setDirectError] = useState('');

  // Reset confirmation modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // If not authenticated, show strict security barrier
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7EBD7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFDF7] p-8 rounded-3xl border-2 border-[#07545A]/25 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#07545A] text-[#F2A900] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E97868] bg-[#E97868]/10 px-3 py-1 rounded-full inline-block mb-2">
            Restricted Admin Area
          </span>
          <h2 className="text-2xl font-bold text-[#07545A] font-display mb-2">
            Master CMS Portal
          </h2>
          <p className="text-xs text-[#173B3D]/70 mb-6">
            Authentication required to modify storefront content, manage orders, and update maker catalogs.
          </p>

          {directError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{directError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = adminLogin(directPasskey);
              if (!ok) setDirectError('Access Denied: Invalid Security Passkey');
            }}
            className="space-y-4"
          >
            <div className="relative text-left">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#07545A]/60">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={directPasskey}
                onChange={(e) => {
                  setDirectPasskey(e.target.value);
                  setDirectError('');
                }}
                placeholder="Enter master passkey..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-[#FFF8EA] text-[#07545A] font-semibold text-sm rounded-xl border border-[#07545A]/25 focus:border-[#07545A] focus:ring-2 focus:ring-[#07545A]/20 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#07545A] text-[#FFF8EA] font-bold text-sm rounded-xl shadow-md hover:bg-[#064247] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Master CMS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="w-full py-2 text-xs font-semibold text-[#173B3D]/60 hover:text-[#07545A] transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.creatorName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    return (
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status.toLowerCase().includes(orderSearch.toLowerCase())
    );
  });

  return (
    <div className="bg-[#F4ECE1] min-h-screen pb-28 md:pb-20 select-none text-[#173B3D]">
      {/* ========================================================
          CMS Top Navigation Bar
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#07545A] text-[#FFF8EA] shadow-md border-b border-[#0A6B74]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8EA] text-[#07545A] flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#3F704B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold font-display text-base sm:text-lg tracking-wide">
                  Curowit Master CMS
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-[#F2A900] text-[#07545A] px-2 py-0.5 rounded-full">
                  Owner Active
                </span>
              </div>
              <p className="text-[11px] text-[#FFF8EA]/70 hidden sm:block">
                Logged in as Ansh & Siya · Realtime Storefront Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8EA]/10 hover:bg-[#FFF8EA]/20 text-[#FFF8EA] rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Inspect live storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Reset all store data to original factory seed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Defaults</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E97868] hover:bg-[#D96555] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Lock CMS and exit session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock CMS</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-[#0A6B74]/60">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Products & Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('creators')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'creators'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Artisans & Makers ({creators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workshops')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'workshops'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Workshops ({workshops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stories'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Editorial Stories ({stories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'banners'
                ? 'border-[#F2A900] text-[#F2A900] bg-white/5'
                : 'border-transparent text-[#FFF8EA]/75 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hero & Announcements</span>
          </button>
        </div>
      </header>

      {/* Main CMS Work Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ========================================================
            TAB 1: PRODUCTS & CATALOG MANAGER
            ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF8EA] p-4 sm:p-5 rounded-3xl border border-[#07545A]/12 shadow-xs">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07545A]/60" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products, creators, categories..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A] outline-none"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl text-[#07545A] outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Product Button */}
              <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table / Grid */}
            <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#07545A]/5 border-b border-[#07545A]/10 text-[#07545A] font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Price</th>
                      <th className="py-3.5 px-3">Artisan</th>
                      <th className="py-3.5 px-3">Stock Status</th>
                      <th className="py-3.5 px-3">Badges</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#07545A]/10">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-[#07545A]/15 shrink-0 bg-white"
                            />
                            <div>
                              <span className="font-bold text-[#07545A] block leading-tight line-clamp-1">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-[#173B3D]/60 block mt-0.5">
                                ID: {p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#173B3D] capitalize">
                          {p.category.replace('-', ' ')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#07545A]">₹{p.price}</span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-[#173B3D]/50 line-through block">
                              ₹{p.originalPrice}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-[#173B3D] block">{p.creatorName}</span>
                          <span className="text-[10px] text-[#687778]">{p.creatorSpecialty}</span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              p.inStock
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {p.trending && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                                Trending
                              </span>
                            )}
                            {p.featured && (
                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-[#07545A] hover:bg-[#07545A]/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ORDERS MANAGER
            ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF8EA] p-4 sm:p-5 rounded-3xl border border-[#07545A]/12 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07545A]/60" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order ID, customer name, status..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-[#FFFDF7] border border-[#07545A]/20 rounded-xl focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A] outline-none"
                />
              </div>

              <div className="text-xs text-[#07545A] font-bold">
                Total Orders: <span className="text-[#E97868]">{orders.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 p-5 shadow-xs flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-sm text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-xl">
                        {order.id}
                      </span>
                      <span className="text-xs text-[#173B3D]/60">{order.date}</span>
                      <span
                        className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : order.status === 'Dispatched'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : order.status === 'Crafting'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#173B3D]">
                      <span className="font-bold">{order.shippingAddress.fullName}</span> ·{' '}
                      <span>{order.shippingAddress.phone}</span>
                      <p className="text-[11px] text-[#173B3D]/70 mt-0.5">
                        {order.shippingAddress.street}, {order.shippingAddress.city} -{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#07545A]/10">
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#FFFDF7] p-2 rounded-xl border border-[#07545A]/10 text-xs"
                        >
                          <img
                            src={it.product.image}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-[#07545A]/10"
                          />
                          <div>
                            <span className="font-semibold block truncate max-w-[150px]">
                              {it.product.name}
                            </span>
                            <span className="text-[10px] text-[#687778]">
                              Qty: {it.quantity} · ₹{it.product.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update controls & Total */}
                  <div className="flex flex-col justify-between items-end gap-4 shrink-0 border-t md:border-t-0 md:border-l border-[#07545A]/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#687778] block">
                        Total Amount
                      </span>
                      <span className="text-xl font-extrabold text-[#07545A]">
                        ₹{order.total}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrder(order.id, {
                            status: e.target.value as Order['status'],
                          })
                        }
                        className="px-3 py-1.5 text-xs font-bold bg-[#FFFDF7] border border-[#07545A]/25 rounded-xl text-[#07545A] outline-none cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Crafting">Crafting</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>

                      <button
                        onClick={() => {
                          if (confirm(`Delete order ${order.id}?`)) deleteOrder(order.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ARTISANS & MAKERS MANAGER
            ======================================================== */}
        {activeTab === 'creators' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#FFF8EA] p-4 sm:p-5 rounded-3xl border border-[#07545A]/12 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-[#07545A] font-display">
                  Artisans Roster ({creators.length})
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Update maker bios, avatars, specialties, and handmade piece counters.
                </p>
              </div>
              <button
                onClick={() => setIsNewCreatorModalOpen(true)}
                className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Artisan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {creators.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#07545A]/15 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-[#07545A] text-base leading-tight">
                          {c.name}
                        </h4>
                        <span className="text-xs text-[#E97868] font-medium block">
                          {c.specialty}
                        </span>
                        <span className="text-[10px] text-[#687778]">{c.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#173B3D]/80 line-clamp-3 italic mb-3">
                      "{c.bio || c.story}"
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-[#07545A] py-2 border-t border-[#07545A]/10">
                      <span>★ {c.rating} Rating</span>
                      <span>{c.salesCount}+ Handcrafted</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingCreator(c)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove artisan ${c.name}?`)) deleteCreator(c.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: WORKSHOPS MANAGER
            ======================================================== */}
        {activeTab === 'workshops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#FFF8EA] p-4 sm:p-5 rounded-3xl border border-[#07545A]/12 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-[#07545A] font-display">
                  Craft Workshops ({workshops.length})
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Update live online and studio craft sessions, pricing, and available seats.
                </p>
              </div>
              <button
                onClick={() => setIsNewWorkshopModalOpen(true)}
                className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Workshop</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workshops.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <img src={ws.image} alt={ws.title} className="w-full h-36 object-cover" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F704B] bg-[#FFF8EA] px-2 py-0.5 rounded-full border border-[#07545A]/15">
                          {ws.format}
                        </span>
                        <span className="text-xs font-extrabold text-[#07545A]">
                          ₹{ws.price}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#07545A] text-base leading-tight mb-1">
                        {ws.title}
                      </h4>
                      <p className="text-xs text-[#687778] mb-2">Hosted by {ws.creatorName}</p>
                      <p className="text-xs text-[#173B3D]/80 line-clamp-2">{ws.description}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#E97868]">
                        {ws.seatsLeft} seats remaining
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingWorkshop(ws)}
                          className="p-1.5 text-[#07545A] hover:bg-[#07545A]/10 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${ws.title}"?`)) deleteWorkshop(ws.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: STORIES & EDITORIAL MANAGER
            ======================================================== */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#FFF8EA] p-4 sm:p-5 rounded-3xl border border-[#07545A]/12 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-[#07545A] font-display">
                  Editorial Stories ({stories.length})
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Manage artisan journeys, craft philosophies, and studio documentation.
                </p>
              </div>
              <button
                onClick={() => setIsNewStoryModalOpen(true)}
                className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Story</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stories.map((st) => (
                <div
                  key={st.id}
                  className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/12 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <img src={st.image} alt={st.title} className="w-full h-36 object-cover" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#E97868] uppercase block mb-1">
                        {st.tag} · {st.readTime}
                      </span>
                      <h4 className="font-bold text-[#07545A] text-base leading-tight mb-2">
                        {st.title}
                      </h4>
                      <p className="text-xs text-[#173B3D]/80 line-clamp-3">{st.excerpt}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                      <span className="text-xs text-[#687778] font-medium">By {st.author}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingStory(st)}
                          className="p-1.5 text-[#07545A] hover:bg-[#07545A]/10 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${st.title}"?`)) deleteStory(st.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: HERO BANNERS & ANNOUNCEMENTS
            ======================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            {/* Hero Carousel Slides */}
            <div className="bg-[#FFF8EA] p-5 sm:p-6 rounded-3xl border border-[#07545A]/15 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#07545A]/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#07545A] font-display">
                    Homepage Hero Slides ({heroSlides.length})
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Upload custom banner images directly from your device or paste image URLs. Reflects live on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSlide: HeroBannerSlide = {
                      id: Date.now(),
                      image: '/hero-1.jpg',
                      alt: 'Curowit: Handcrafted Treasures & Mindful Artisan Works',
                      action: 'shop-handmade',
                    };
                    updateHeroSlides([...heroSlides, newSlide]);
                    showToast('Slide Added', `Added Slide ${heroSlides.length + 1} to hero carousel`);
                  }}
                  className="px-4 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Slide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#07545A]/15 space-y-3.5 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="space-y-3">
                      {/* Top Header with Delete */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase bg-[#07545A] text-[#FFF8EA] px-2.5 py-0.5 rounded-full inline-block">
                          Slide {idx + 1}
                        </span>
                        {heroSlides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete Slide ${idx + 1}?`)) {
                                const next = heroSlides.filter((_, i) => i !== idx);
                                updateHeroSlides(next);
                                showToast('Slide Removed', `Deleted Slide ${idx + 1}`);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Image Preview Frame */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#07545A]/15 bg-stone-100 group">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="w-full h-full object-cover"
                        />
                        {/* Hover Overlay with Upload Trigger */}
                        <label className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold gap-1 transition-opacity cursor-pointer">
                          <Upload className="w-5 h-5 text-[#F2A900]" />
                          <span>Upload New Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvt) => {
                                  const base64 = uploadEvt.target?.result as string;
                                  if (base64) {
                                    const next = [...heroSlides];
                                    next[idx] = { ...slide, image: base64 };
                                    updateHeroSlides(next);
                                    showToast('Image Uploaded', `Slide ${idx + 1} updated`);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Direct Upload Button */}
                      <div>
                        <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-[#F2A900]" />
                          <span>Upload Image from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (uploadEvt) => {
                                  const base64 = uploadEvt.target?.result as string;
                                  if (base64) {
                                    const next = [...heroSlides];
                                    next[idx] = { ...slide, image: base64 };
                                    updateHeroSlides(next);
                                    showToast('Image Uploaded', `Slide ${idx + 1} updated`);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="text-[11px] font-bold text-[#07545A] block mb-1">
                          Or Image URL
                        </label>
                        <input
                          type="text"
                          value={slide.image.startsWith('data:') ? '(Uploaded Device Image)' : slide.image}
                          onChange={(e) => {
                            const next = [...heroSlides];
                            next[idx] = { ...slide, image: e.target.value };
                            updateHeroSlides(next);
                          }}
                          placeholder="/hero-1.jpg or https://..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FFF8EA] border border-[#07545A]/20 rounded-lg outline-none font-mono text-[11px]"
                        />
                      </div>

                      {/* Target Action */}
                      <div>
                        <label className="text-[11px] font-bold text-[#07545A] block mb-1">
                          On Click Destination
                        </label>
                        <select
                          value={slide.action}
                          onChange={(e) => {
                            const next = [...heroSlides];
                            next[idx] = { ...slide, action: e.target.value as any };
                            updateHeroSlides(next);
                          }}
                          className="w-full px-3 py-1.5 text-xs bg-[#FFF8EA] border border-[#07545A]/20 rounded-lg outline-none font-semibold text-[#07545A] cursor-pointer"
                        >
                          <option value="shop-handmade">Shop Handmade Creations</option>
                          <option value="shop-creators">Meet Artisans & Makers</option>
                          <option value="explore-all">Explore All Collections</option>
                        </select>
                      </div>

                      {/* Alt text / Caption */}
                      <div>
                        <label className="text-[11px] font-bold text-[#07545A] block mb-1">
                          Caption / Accessible Description
                        </label>
                        <textarea
                          rows={2}
                          value={slide.alt}
                          onChange={(e) => {
                            const next = [...heroSlides];
                            next[idx] = { ...slide, alt: e.target.value };
                            updateHeroSlides(next);
                          }}
                          className="w-full px-3 py-1.5 text-xs bg-[#FFF8EA] border border-[#07545A]/20 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Slide Card Placeholder */}
                <button
                  type="button"
                  onClick={() => {
                    const newSlide: HeroBannerSlide = {
                      id: Date.now(),
                      image: '/hero-1.jpg',
                      alt: 'Curowit: Handcrafted Treasures & Mindful Artisan Works',
                      action: 'shop-handmade',
                    };
                    updateHeroSlides([...heroSlides, newSlide]);
                    showToast('Slide Added', `Added Slide ${heroSlides.length + 1} to hero carousel`);
                  }}
                  className="min-h-[300px] border-2 border-dashed border-[#07545A]/25 hover:border-[#07545A] rounded-2xl bg-[#FFF8EA]/50 hover:bg-[#FFF8EA] transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#07545A]/10 group-hover:bg-[#07545A] group-hover:text-[#FFF8EA] text-[#07545A] flex items-center justify-center transition-all mb-2">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[#07545A] text-sm block">Add Another Slide</span>
                  <span className="text-[11px] text-[#173B3D]/60 mt-0.5">
                    Upload image or set custom banner
                  </span>
                </button>
              </div>
            </div>

            {/* Top Announcement Bar */}
            <div className="bg-[#FFF8EA] p-5 sm:p-6 rounded-3xl border border-[#07545A]/15 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#07545A]/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#07545A] font-display">
                    Top Announcement Bar Messages
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Live rotating promotional banner on the very top of the storefront.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {announcements.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#FFFDF7] rounded-xl border border-[#07545A]/15 flex flex-col sm:flex-row items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#07545A]/10 flex items-center justify-center text-sm shrink-0">
                      {item.icon}
                    </span>
                    <div className="flex-1 w-full space-y-1">
                      <input
                        type="text"
                        value={item.longText}
                        onChange={(e) => {
                          const next = [...announcements];
                          next[idx] = { ...item, longText: e.target.value, shortText: e.target.value.split('—')[0] || e.target.value };
                          updateAnnouncements(next);
                        }}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-[#FFF8EA] border border-[#07545A]/20 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          EDIT PRODUCT MODAL
          ======================================================== */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(updated) => {
            updateProduct(editingProduct.id, updated);
            setEditingProduct(null);
          }}
        />
      )}

      {/* ========================================================
          ADD NEW PRODUCT MODAL
          ======================================================== */}
      {isNewProductModalOpen && (
        <ProductEditModal
          isNew
          onClose={() => setIsNewProductModalOpen(false)}
          onSave={(newProd) => {
            addProduct(newProd);
            setIsNewProductModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          CREATOR EDIT / ADD MODAL
          ======================================================== */}
      {editingCreator && (
        <CreatorEditModal
          creator={editingCreator}
          onClose={() => setEditingCreator(null)}
          onSave={(updated) => {
            updateCreator(editingCreator.id, updated);
            setEditingCreator(null);
          }}
        />
      )}

      {isNewCreatorModalOpen && (
        <CreatorEditModal
          isNew
          onClose={() => setIsNewCreatorModalOpen(false)}
          onSave={(newC) => {
            addCreator(newC);
            setIsNewCreatorModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          WORKSHOP EDIT / ADD MODAL
          ======================================================== */}
      {editingWorkshop && (
        <WorkshopEditModal
          workshop={editingWorkshop}
          onClose={() => setEditingWorkshop(null)}
          onSave={(updated) => {
            updateWorkshop(editingWorkshop.id, updated);
            setEditingWorkshop(null);
          }}
        />
      )}

      {isNewWorkshopModalOpen && (
        <WorkshopEditModal
          isNew
          onClose={() => setIsNewWorkshopModalOpen(false)}
          onSave={(newWs) => {
            addWorkshop(newWs);
            setIsNewWorkshopModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          STORY EDIT / ADD MODAL
          ======================================================== */}
      {editingStory && (
        <StoryEditModal
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onSave={(updated) => {
            updateStory(editingStory.id, updated);
            setEditingStory(null);
          }}
        />
      )}

      {isNewStoryModalOpen && (
        <StoryEditModal
          isNew
          onClose={() => setIsNewStoryModalOpen(false)}
          onSave={(newSt) => {
            addStory(newSt);
            setIsNewStoryModalOpen(false);
          }}
        />
      )}

      {/* ========================================================
          RESET CONFIRMATION MODAL
          ======================================================== */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF7] rounded-3xl p-6 max-w-sm w-full border-2 border-red-300 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#07545A] font-display mb-1">
              Reset All Store Data?
            </h4>
            <p className="text-xs text-[#173B3D]/70 mb-5 leading-relaxed">
              This will restore all products, images, creators, and workshops to the initial factory seed data. Any custom products or edits you created will be reset.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-[#173B3D]/70 hover:bg-[#07545A]/5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllDataToDefaults();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// REUSABLE PRODUCT EDIT / CREATE MODAL COMPONENT
// ========================================================
interface ProductEditModalProps {
  product?: Product;
  isNew?: boolean;
  onClose: () => void;
  onSave: (prod: any) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isNew = false,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'jewellery');
  const [price, setPrice] = useState(product?.price || 499);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 699);
  const [image, setImage] = useState(product?.image || '/src/assets/images/hero_handmade_1790260978568.jpg');
  const [creatorName, setCreatorName] = useState(product?.creatorName || 'Siya Sharma');
  const [creatorSpecialty, setCreatorSpecialty] = useState(product?.creatorSpecialty || 'Handmade Artisan');
  const [description, setDescription] = useState(product?.description || '');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [trending, setTrending] = useState(product?.trending ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice) || undefined,
      image,
      creatorName,
      creatorSpecialty,
      description,
      inStock,
      trending,
      featured,
      rating: product?.rating || 4.9,
      reviewCount: product?.reviewCount || 12,
      creatorId: product?.creatorId || 'creator-1',
      creatorAvatar: product?.creatorAvatar || '/src/assets/images/hero_creators_1790260990626.jpg',
      gallery: product?.gallery || [image],
      materials: product?.materials || ['100% Organic Eco Cotton', 'Natural Dyes'],
      shippingInfo: product?.shippingInfo || 'Dispatched in 2-3 business days via plastic-free eco transit.',
      returnsInfo: product?.returnsInfo || '7-day easy craft exchange guarantee if damaged during transit.',
      tags: product?.tags || [category, 'Handmade', 'Artisan'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 sm:p-7 max-w-lg w-full shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#07545A]/10">
          <h3 className="text-xl font-bold text-[#07545A] font-display">
            {isNew ? 'Create New Artisan Product' : 'Edit Product'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] hover:bg-[#07545A]/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Image URL with live preview and device upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#07545A]">Product Image</label>
              <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#07545A] hover:text-[#064247] cursor-pointer bg-[#07545A]/5 px-2 py-0.5 rounded-lg border border-[#07545A]/15">
                <Upload className="w-3 h-3 text-[#F2A900]" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvt) => {
                        const base64 = uploadEvt.target?.result as string;
                        if (base64) setImage(base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex gap-3 items-center">
              <img
                src={image}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-xl border border-[#07545A]/20 bg-white shrink-0"
              />
              <input
                type="text"
                value={image.startsWith('data:') ? '(Uploaded Device Image)' : image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-mono text-[11px]"
                placeholder="/hero-1.jpg or https://..."
              />
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-semibold text-[#07545A]"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Creator Name & Specialty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Artisan Name</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Artisan Specialty</label>
              <input
                type="text"
                value={creatorSpecialty}
                onChange={(e) => setCreatorSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-[#07545A] rounded"
              />
              <span className="font-bold text-[#07545A]">In Stock</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
                className="w-4 h-4 text-[#07545A] rounded"
              />
              <span className="font-bold text-amber-800">Trending</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-[#07545A] rounded"
              />
              <span className="font-bold text-teal-800">Featured</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#07545A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#173B3D]/70 hover:bg-[#07545A]/5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              {isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// REUSABLE CREATOR EDIT / ADD MODAL COMPONENT
// ========================================================
interface CreatorEditModalProps {
  creator?: Creator;
  isNew?: boolean;
  onClose: () => void;
  onSave: (c: any) => void;
}

const CreatorEditModal: React.FC<CreatorEditModalProps> = ({
  creator,
  isNew = false,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(creator?.name || '');
  const [handle, setHandle] = useState(creator?.handle || '@');
  const [avatar, setAvatar] = useState(creator?.avatar || '/src/assets/images/hero_creators_1790260990626.jpg');
  const [specialty, setSpecialty] = useState(creator?.specialty || 'Studio Ceramics & Pottery');
  const [location, setLocation] = useState(creator?.location || 'Bengaluru, India');
  const [rating, setRating] = useState(creator?.rating || 4.9);
  const [salesCount, setSalesCount] = useState(creator?.salesCount || 120);
  const [badge, setBadge] = useState(creator?.badge || 'Master Artisan');
  const [story, setStory] = useState(creator?.story || creator?.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      handle,
      avatar,
      specialty,
      location,
      rating: Number(rating),
      salesCount: Number(salesCount),
      badge,
      story,
      bio: story,
      joinedYear: creator?.joinedYear || '2025',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 sm:p-7 max-w-lg w-full shadow-2xl my-8 text-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#07545A]/10">
          <h3 className="text-xl font-bold text-[#07545A] font-display">
            {isNew ? 'Add Artisan / Creator' : 'Edit Artisan Profile'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Avatar Photo URL</label>
            <div className="flex gap-3 items-center">
              <img
                src={avatar}
                alt="Avatar"
                className="w-12 h-12 object-cover rounded-xl border border-[#07545A]/20 bg-white shrink-0"
              />
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Social Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Artisan Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Studio Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Pieces Crafted</label>
              <input
                type="number"
                value={salesCount}
                onChange={(e) => setSalesCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#07545A] block mb-1">Artisan Story & Bio</label>
            <textarea
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-[#07545A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[#173B3D]/70 hover:bg-[#07545A]/5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] font-bold rounded-xl shadow-md cursor-pointer"
            >
              {isNew ? 'Add Artisan' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// REUSABLE WORKSHOP EDIT / ADD MODAL COMPONENT
// ========================================================
interface WorkshopEditModalProps {
  workshop?: Workshop;
  isNew?: boolean;
  onClose: () => void;
  onSave: (ws: any) => void;
}

const WorkshopEditModal: React.FC<WorkshopEditModalProps> = ({
  workshop,
  isNew = false,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(workshop?.title || '');
  const [creatorName, setCreatorName] = useState(workshop?.creatorName || 'Siya Sharma');
  const [date, setDate] = useState(workshop?.date || 'Sat, 10 Oct 2026');
  const [time, setTime] = useState(workshop?.time || '4:00 PM - 6:00 PM IST');
  const [duration, setDuration] = useState(workshop?.duration || '2 Hours');
  const [format, setFormat] = useState<'Live Online' | 'Studio Offline'>(workshop?.format || 'Live Online');
  const [price, setPrice] = useState(workshop?.price || 899);
  const [seatsLeft, setSeatsLeft] = useState(workshop?.seatsLeft || 8);
  const [image, setImage] = useState(workshop?.image || '/src/assets/images/hero_handmade_1790260978568.jpg');
  const [description, setDescription] = useState(workshop?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      creatorName,
      date,
      time,
      duration,
      format,
      price: Number(price),
      seatsLeft: Number(seatsLeft),
      image,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 sm:p-7 max-w-lg w-full shadow-2xl my-8 text-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#07545A]/10">
          <h3 className="text-xl font-bold text-[#07545A] font-display">
            {isNew ? 'Schedule New Workshop' : 'Edit Workshop Details'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Cover Image URL</label>
            <div className="flex gap-3 items-center">
              <img
                src={image}
                alt="Workshop preview"
                className="w-14 h-10 object-cover rounded-xl border border-[#07545A]/20 bg-white shrink-0"
              />
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#07545A] block mb-1">Workshop Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Instructor / Maker</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-semibold"
              >
                <option value="Live Online">Live Online</option>
                <option value="Studio Offline">Studio Offline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Ticket Fee (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Seats Remaining</label>
              <input
                type="number"
                value={seatsLeft}
                onChange={(e) => setSeatsLeft(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#07545A] block mb-1">Experience Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#07545A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[#173B3D]/70 hover:bg-[#07545A]/5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] font-bold rounded-xl shadow-md cursor-pointer"
            >
              {isNew ? 'Publish Workshop' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// REUSABLE STORY EDIT / ADD MODAL COMPONENT
// ========================================================
interface StoryEditModalProps {
  story?: Story;
  isNew?: boolean;
  onClose: () => void;
  onSave: (st: any) => void;
}

const StoryEditModal: React.FC<StoryEditModalProps> = ({
  story,
  isNew = false,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(story?.title || '');
  const [author, setAuthor] = useState(story?.author || 'Curowit Editorial');
  const [tag, setTag] = useState(story?.tag || 'Craft Journey');
  const [readTime, setReadTime] = useState(story?.readTime || '4 min read');
  const [image, setImage] = useState(story?.image || '/src/assets/images/hero_creators_1790260990626.jpg');
  const [excerpt, setExcerpt] = useState(story?.excerpt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      subtitle: story?.subtitle || 'Studio Journal',
      author,
      date: story?.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      readTime,
      tag,
      image,
      excerpt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 sm:p-7 max-w-lg w-full shadow-2xl my-8 text-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#07545A]/10">
          <h3 className="text-xl font-bold text-[#07545A] font-display">
            {isNew ? 'Publish Editorial Story' : 'Edit Story Article'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold text-[#07545A] block mb-1">Cover Image URL</label>
            <div className="flex gap-3 items-center">
              <img
                src={image}
                alt="Story preview"
                className="w-14 h-10 object-cover rounded-xl border border-[#07545A]/20 bg-white shrink-0"
              />
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#07545A] block mb-1">Story Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#07545A] block mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Category Tag</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#07545A] block mb-1">Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#07545A] block mb-1">Article Excerpt</label>
            <textarea
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFF8EA] border border-[#07545A]/20 rounded-xl outline-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-[#07545A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[#173B3D]/70 hover:bg-[#07545A]/5 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#07545A] hover:bg-[#064247] text-[#FFF8EA] font-bold rounded-xl shadow-md cursor-pointer"
            >
              {isNew ? 'Publish Story' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
