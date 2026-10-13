import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ExternalLink,
  Search,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Download,
  Send,
  Building2,
  Copy,
  Check,
  Edit2,
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import {
  foundingCreatorSyncService,
  StoreDocument,
  StoreDocumentType,
  syncEventBus,
} from '../../lib/foundingCreatorSync';
import {
  CreatorProfile,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
  CreatorPaymentMethod,
  CreatorNotification,
  CreatorSupportTicket,
  FulfilmentStatus,
} from '../../types/foundingCreator';
import { CurowitLogo } from '../common/CurowitLogo';

interface FoundingCreatorDashboardProps {
  onNavigate: (view: string) => void;
}

type DashboardTab =
  | 'overview'
  | 'products'
  | 'new-product'
  | 'orders'
  | 'shipments'
  | 'earnings'
  | 'payouts'
  | 'payment-details'
  | 'documents'
  | 'profile'
  | 'notifications'
  | 'support'
  | 'policies';

export const FoundingCreatorDashboard: React.FC<FoundingCreatorDashboardProps> = ({ onNavigate }) => {
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Data states
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [orders, setOrders] = useState<CreatorOrderItem[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<CreatorPaymentMethod | null>(null);
  const [notifications, setNotifications] = useState<CreatorNotification[]>([]);
  const [tickets, setTickets] = useState<CreatorSupportTicket[]>([]);
  const [documents, setDocuments] = useState<StoreDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docTypeChoice, setDocTypeChoice] = useState<StoreDocumentType>('portfolio');
  const [docNotes, setDocNotes] = useState('');

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmountInput, setPayoutAmountInput] = useState('');
  const [payoutDestinationChoice, setPayoutDestinationChoice] = useState<'UPI' | 'Bank Account'>('UPI');

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Crochet & yarn crafts');
  const [newPrice, setNewPrice] = useState('');
  const [newComparePrice, setNewComparePrice] = useState('');
  const [newInventory, setNewInventory] = useState('5');
  const [newSku, setNewSku] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newPrepDays, setNewPrepDays] = useState('3');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productSubmitSuccess, setProductSubmitSuccess] = useState(false);

  // New Support ticket states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'products' | 'orders' | 'shipping' | 'payouts'>('orders');
  const [ticketDesc, setTicketDesc] = useState('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const current = foundingCreatorService.getCurrentCreator();
    if (!current) {
      onNavigate('foundingcreator-login');
      return;
    }
    setCreator(current);
    refreshData(current.id);

    // Subscribe to reactive database sync events
    const unsubscribe = syncEventBus.subscribe(() => {
      refreshData(current.id);
    });

    return unsubscribe;
  }, []);

  const refreshData = (creatorId: string) => {
    setProducts(foundingCreatorService.getCreatorProducts(creatorId));
    setOrders(foundingCreatorService.getCreatorOrders(creatorId));
    setPayouts(foundingCreatorService.getCreatorPayouts(creatorId));
    setPaymentMethod(foundingCreatorService.getCreatorPaymentMethod(creatorId));
    setNotifications(foundingCreatorService.getCreatorNotifications(creatorId));
    setTickets(foundingCreatorService.getCreatorTickets(creatorId));
    foundingCreatorSyncService.fetchStoreDocuments(creatorId).then(setDocuments);
  };

  if (!creator) return null;

  const earnings = foundingCreatorService.getCreatorEarningsSummary(creator.id);

  // Handlers
  const handleLogout = () => {
    foundingCreatorService.setCurrentCreator(null);
    onNavigate('foundingcreator-login');
  };

  const handleStoreDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !creator) return;

    setIsUploadingDoc(true);
    try {
      for (const file of Array.from(files)) {
        await foundingCreatorSyncService.uploadAndPersistStoreDocument(
          creator.id,
          file,
          docTypeChoice,
          { notes: docNotes }
        );
      }
      showToast('Store document uploaded successfully.');
      const updatedDocs = await foundingCreatorSyncService.fetchStoreDocuments(creator.id);
      setDocuments(updatedDocs);
      setDocNotes('');
    } catch (err: any) {
      showToast('Document upload notice: ' + (err.message || 'File recorded locally'));
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteStoreDocument = async (docId: string) => {
    if (!creator) return;
    await foundingCreatorSyncService.deleteStoreDocument(docId, creator.id);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast('Document removed.');
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingProductImage(true);
    try {
      for (const file of Array.from(files)) {
        const url = await foundingCreatorService.uploadProductImage(
          file,
          creator.id,
          `temp-${Date.now()}`
        );
        setProductImages((prev) => [...prev, url]);
      }
    } catch {
      showToast('Error uploading image');
    } finally {
      setIsUploadingProductImage(false);
      e.target.value = '';
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) {
      showToast('Please fill title and price');
      return;
    }

    const defaultImg =
      productImages.length > 0
        ? productImages[0]
        : 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80';

    const p = foundingCreatorService.addProduct({
      creatorId: creator.id,
      creatorName: creator.displayName || creator.fullName,
      creatorBrand: creator.brandName,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Handmade creation crafted with authentic natural materials.',
      category: newCategory,
      price: Number(newPrice),
      compareAtPrice: newComparePrice ? Number(newComparePrice) : undefined,
      inventoryQuantity: Number(newInventory) || 1,
      sku: newSku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`,
      materials: newMaterials.trim(),
      isHandmade: true,
      isCustomizable: false,
      preparationDays: Number(newPrepDays) || 3,
      shippingWeightGrams: 300,
      returnPolicy: '7-day replacement for transit damage',
      images: [
        {
          id: `img-${Date.now()}`,
          productId: 'pending',
          storagePath: 'creator-products',
          publicUrl: defaultImg,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
      status: 'submitted',
    });

    refreshData(creator.id);
    setProductSubmitSuccess(true);
    setTimeout(() => {
      setProductSubmitSuccess(false);
      setActiveTab('products');
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewComparePrice('');
      setProductImages([]);
    }, 1500);
  };

  const handleUpdateFulfilment = (orderItemId: string, nextStatus: FulfilmentStatus) => {
    foundingCreatorService.updateOrderItemShipment(orderItemId, {
      fulfilmentStatus: nextStatus,
    });
    refreshData(creator.id);
    showToast(`Order updated to: ${nextStatus}`);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmount = Number(payoutAmountInput);
    if (!reqAmount || reqAmount <= 0 || reqAmount > earnings.eligibleBalance) {
      showToast('Invalid payout amount or exceeds eligible balance');
      return;
    }

    const dest =
      payoutDestinationChoice === 'UPI'
        ? paymentMethod?.upiId || 'UPI: Pending setup'
        : `${paymentMethod?.bankName || 'Bank'} (${paymentMethod?.maskedAccountNumber || '•••• 0000'})`;

    foundingCreatorService.requestPayout(creator.id, reqAmount, dest, payoutDestinationChoice);
    refreshData(creator.id);
    setIsPayoutModalOpen(false);
    setPayoutAmountInput('');
    showToast(`Payout request for ₹${reqAmount.toLocaleString('en-IN')} submitted!`);
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const upi = form.upiId?.value?.trim();
    const holder = form.accountHolderName?.value?.trim();
    const bank = form.bankName?.value?.trim();
    const accNum = form.accountNumber?.value?.trim();
    const ifsc = form.ifscCode?.value?.trim();

    foundingCreatorService.savePaymentMethod(creator.id, {
      methodType: 'UPI',
      upiId: upi,
      accountHolderName: holder,
      bankName: bank,
      maskedAccountNumber: accNum ? `•••• •••• ${accNum.slice(-4)}` : undefined,
      ifscCode: ifsc,
    });

    refreshData(creator.id);
    showToast('Payment & Payout destination saved securely.');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    foundingCreatorService.createSupportTicket(
      creator.id,
      ticketSubject.trim(),
      ticketCategory,
      ticketDesc.trim()
    );

    refreshData(creator.id);
    setTicketSubject('');
    setTicketDesc('');
    showToast('Support ticket raised. Team will respond within 4 business hours.');
  };

  const handleExportCSV = () => {
    const headers = ['Order Item ID', 'Product', 'Gross Price', '70% Creator Share', '30% Commission', 'Status', 'Payout Status'];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.productTitle}"`,
      `"${o.itemSubtotal}"`,
      `"${o.creatorShare}"`,
      `"${o.platformCommission}"`,
      `"${o.fulfilmentStatus}"`,
      `"${o.payoutStatus}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `curowit-earnings-${creator.creatorId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Earnings CSV statement downloaded.');
  };

  return (
    <div className="min-h-screen bg-[#F4ECE1] text-[#173B3D] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#07545A] text-[#FFF8EA] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold animate-in slide-in-from-top-3 flex items-center gap-2 border border-[#FFF8EA]/20 max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-[#FFFDF7] border-b border-[#07545A]/15 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => onNavigate('home')}
              className="cursor-pointer hover:opacity-85 transition-opacity shrink-0"
              title="Return to Curowit store"
            >
              <CurowitLogo variant="horizontal" size="sm" />
            </button>
            <span className="text-[#07545A]/30 shrink-0">/</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs text-[#07545A] truncate max-w-[110px] sm:max-w-[200px]">
                {creator.brandName || creator.displayName}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Founding Creator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl text-[#173B3D]/70 hover:text-[#07545A] hover:bg-[#07545A]/10 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.isRead) && (
                <span className="w-2 h-2 rounded-full bg-[#E97868] absolute top-1.5 right-1.5" />
              )}
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-[#07545A] hover:underline"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-[#173B3D]/70 hover:text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Log out of Creator Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout (Sidebar + Content View) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Mobile / Tablet Horizontal Scrollable Quick Tabs */}
        <div className="md:hidden w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-1.5 px-1 bg-white/80 backdrop-blur-xs p-1.5 rounded-2xl border border-[#07545A]/15 shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'new-product', label: '+ Product', icon: Plus },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'shipments', label: 'Shipments', icon: Truck },
            { id: 'earnings', label: 'Earnings', icon: TrendingUp },
            { id: 'payouts', label: 'Payouts', icon: CreditCard },
            { id: 'documents', label: `Docs (${documents.length})`, icon: FileText },
            { id: 'payment-details', label: 'Payments', icon: Building2 },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'support', label: 'Support', icon: HelpCircle },
            { id: 'policies', label: 'Terms', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs'
                    : 'bg-[#FFF8EA] text-[#07545A] border border-[#07545A]/10 hover:bg-[#07545A]/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-3 space-y-1 shadow-2xs sticky top-22">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>My Products</span>
              </div>
              <span className="text-[10px] opacity-80">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('new-product')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'new-product'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Submit Product</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <span className="text-[10px] opacity-80">{orders.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('shipments')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'shipments'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Shipments</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'earnings'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Earnings (70%)</span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'payouts'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>7-Day Payouts</span>
              </div>
              {earnings.eligibleBalance > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('payment-details')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'payment-details'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Payment Details</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#07545A] text-[#FFF8EA]'
                  : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Store Documents</span>
              </div>
              <span className="text-[10px] opacity-80">{documents.length}</span>
            </button>

            <div className="pt-2 border-t border-[#07545A]/10 mt-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Artisan Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support Tickets</span>
              </button>

              <button
                onClick={() => setActiveTab('policies')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'policies'
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'text-[#173B3D]/80 hover:bg-[#FFF8EA] hover:text-[#07545A]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Agreements & Terms</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Creator Welcome Hero Card */}
              <div className="bg-gradient-to-r from-[#07545A] to-[#063F45] text-[#FFF8EA] p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2A900] bg-white/10 px-2 py-0.5 rounded-full">
                    Founding Cohort Member
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-display">
                    Welcome back, {creator.fullName}!
                  </h2>
                  <p className="text-xs text-[#FFF8EA]/80 max-w-md">
                    Manage your handcrafted atelier inventory, fulfill customer orders, and monitor your 7-day payout settlements.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('new-product')}
                    className="px-4 py-2.5 rounded-xl bg-[#FFF8EA] text-[#07545A] hover:bg-[#F2A900] hover:text-[#173B3D] text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Product</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                    Gross Order Value
                  </span>
                  <div className="text-xl font-bold text-[#07545A] font-display">
                    ₹{earnings.grossSales.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#173B3D]/60 mt-1 block">Total customer GMV</span>
                </div>

                <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                    Net Creator Share (70%)
                  </span>
                  <div className="text-xl font-bold text-emerald-800 font-display">
                    ₹{earnings.netCreatorEarnings.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-800/80 mt-1 block">Your earned portion</span>
                </div>

                <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                    Eligible for Payout
                  </span>
                  <div className="text-xl font-bold text-[#07545A] font-display flex items-baseline gap-1.5">
                    <span>₹{earnings.eligibleBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#173B3D]/60">7 days post delivery</span>
                    {earnings.eligibleBalance > 0 && (
                      <button
                        onClick={() => {
                          setPayoutAmountInput(String(earnings.eligibleBalance));
                          setIsPayoutModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#07545A] underline cursor-pointer"
                      >
                        Request
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                    Total Paid Out
                  </span>
                  <div className="text-xl font-bold text-[#173B3D] font-display">
                    ₹{earnings.totalPaidOut.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#173B3D]/60 mt-1 block">Transferred to UPI/Bank</span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/12 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#07545A] text-base font-display">
                      Recent Assigned Orders ({orders.length})
                    </h3>
                    <p className="text-xs text-[#173B3D]/70">
                      Buyer orders containing your creations for dispatch.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#07545A] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#173B3D]/60">
                    No orders received yet. Once your products are published, customer orders will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-[#07545A]/10">
                    {orders.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-10 h-10 rounded-xl object-cover border border-[#07545A]/15 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-[#07545A] truncate block">
                              {item.productTitle} (x{item.quantity})
                            </span>
                            <span className="text-[11px] text-[#173B3D]/70">
                              Order #{item.orderId} · Ship to: {item.customerCity || 'India'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-[#07545A] block">
                            ₹{item.creatorShare} (70%)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {item.fulfilmentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
                <div>
                  <h3 className="font-bold text-base text-[#07545A] font-display">
                    Artisan Catalog ({products.length})
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Your submitted and active marketplace listings.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('new-product')}
                  className="px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-[#FFFDF7] rounded-3xl border border-dashed border-[#07545A]/25 p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-[#07545A]/40 mx-auto" />
                  <h4 className="font-bold text-sm text-[#07545A]">No Products Submitted Yet</h4>
                  <p className="text-xs text-[#173B3D]/70 max-w-sm mx-auto">
                    Submit your first handmade creation to have it reviewed and published on the live Curowit marketplace.
                  </p>
                  <button
                    onClick={() => setActiveTab('new-product')}
                    className="px-4 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold cursor-pointer"
                  >
                    Submit Product Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="relative h-44 bg-[#FFF8EA] overflow-hidden">
                          <img
                            src={p.images[0]?.publicUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs uppercase tracking-wider ${
                              p.status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : p.status === 'submitted'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-1.5">
                          <span className="text-[10px] font-bold text-[#E97868] uppercase block">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-[#07545A] text-sm leading-tight line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-xs text-[#173B3D]/70 line-clamp-2">{p.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="font-extrabold text-sm text-[#07545A]">
                              ₹{p.price}
                            </span>
                            <span className="text-xs text-[#173B3D]/60 font-medium">
                              Stock: {p.inventoryQuantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FFF8EA]/50 border-t border-[#07545A]/10 text-[11px] text-[#173B3D]/70 flex items-center justify-between">
                        <span>SKU: {p.sku}</span>
                        <span>{p.preparationDays}d lead time</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADD NEW PRODUCT */}
          {activeTab === 'new-product' && (
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-2.5 py-0.5 rounded-full">
                  Curation Submission
                </span>
                <h3 className="text-xl font-bold text-[#07545A] font-display mt-1">
                  Submit a Handcrafted Creation for Storefront Review
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Approved products automatically publish to the Curowit marketplace under your 70% revenue share.
                </p>
              </div>

              {productSubmitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Product submitted to the curation queue successfully!</span>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Heirloom Organic Cotton Crochet Bunny"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-base sm:text-xs outline-none focus:border-[#07545A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-semibold"
                    >
                      <option value="Crochet & yarn crafts">Crochet & yarn crafts</option>
                      <option value="Handmade jewellery">Handmade jewellery</option>
                      <option value="Candles & home decor">Candles & home decor</option>
                      <option value="Bags & accessories">Bags & accessories</option>
                      <option value="Paintings & artwork">Paintings & artwork</option>
                      <option value="Personalized gifts">Personalized gifts</option>
                      <option value="DIY kits & creative supplies">DIY kits & creative supplies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#07545A] block mb-1">
                    Description & Craft Story *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe how this piece is made, material choices, and care instructions..."
                    className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-base sm:text-xs outline-none focus:border-[#07545A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="1850"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">MRP / Compare (₹)</label>
                    <input
                      type="number"
                      value={newComparePrice}
                      onChange={(e) => setNewComparePrice(e.target.value)}
                      placeholder="2200"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Inventory / Stock *</label>
                    <input
                      type="number"
                      required
                      value={newInventory}
                      onChange={(e) => setNewInventory(e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      value={newPrepDays}
                      onChange={(e) => setNewPrepDays(e.target.value)}
                      placeholder="3"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Materials Used</label>
                    <input
                      type="text"
                      value={newMaterials}
                      onChange={(e) => setNewMaterials(e.target.value)}
                      placeholder="e.g. Organic Kapok Fiber, Natural Soy Wax"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">SKU / Code</label>
                    <input
                      type="text"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      placeholder="e.g. DHG-BNY-01"
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Product Images Upload */}
                <div className="space-y-2 pt-2 border-t border-[#07545A]/10">
                  <label className="text-xs font-bold text-[#07545A] block">
                    Product Imagery (High-Resolution Visuals)
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="file"
                      id="product-photo"
                      multiple
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-photo"
                      className="px-4 py-2 rounded-xl bg-[#FFF8EA] hover:bg-[#07545A]/10 text-[#07545A] border border-[#07545A]/20 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingProductImage ? 'Uploading...' : 'Upload Photos'}</span>
                    </label>

                    {productImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-[#07545A]/20"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 text-xs font-bold text-[#173B3D]/70 hover:text-[#07545A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit for Curation Approval</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#07545A] font-display">
                    Assigned Customer Orders ({orders.length})
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Orders assigned to your studio products.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#07545A] border border-[#07545A]/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#07545A]/5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#FFFDF7] rounded-3xl p-10 text-center text-xs text-[#173B3D]/60 border border-dashed border-[#07545A]/20">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#07545A]/10">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#07545A]">
                            Order #{order.orderId}
                          </span>
                          <span className="text-[10px] text-[#687778]">
                            Ref: {order.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {order.fulfilmentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {order.productImage && (
                            <img
                              src={order.productImage}
                              alt={order.productTitle}
                              className="w-12 h-12 rounded-xl object-cover border border-[#07545A]/20 shrink-0"
                            />
                          )}
                          <div>
                            <h4 className="font-bold text-xs text-[#07545A]">
                              {order.productTitle}
                            </h4>
                            <span className="text-[11px] text-[#173B3D]/70 block">
                              Qty: {order.quantity} · Price: ₹{order.itemPrice}
                            </span>
                            <span className="text-[10px] text-[#687778]">
                              Destination: {order.customerCity || 'Domestic'} ({order.customerPincode || 'India'})
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#687778] uppercase block">Your 70% Share</span>
                          <span className="text-base font-bold text-[#07545A] font-display">
                            ₹{order.creatorShare.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons to update status */}
                      <div className="pt-2 border-t border-[#07545A]/10 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] text-[#687778]">
                          Dispatch deadline: {new Date(order.dispatchDeadline).toLocaleDateString('en-GB')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {order.fulfilmentStatus === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateFulfilment(order.id, 'Preparing')}
                              className="px-2.5 py-1 bg-[#FFF8EA] text-[#07545A] border border-[#07545A]/20 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#07545A]/10"
                            >
                              Mark Preparing
                            </button>
                          )}
                          {order.fulfilmentStatus === 'Preparing' && (
                            <button
                              onClick={() => handleUpdateFulfilment(order.id, 'Ready to Ship')}
                              className="px-2.5 py-1 bg-[#FFF8EA] text-[#07545A] border border-[#07545A]/20 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#07545A]/10"
                            >
                              Mark Ready to Ship
                            </button>
                          )}
                          {order.fulfilmentStatus === 'Ready to Ship' && (
                            <button
                              onClick={() => handleUpdateFulfilment(order.id, 'Shipped')}
                              className="px-2.5 py-1 bg-[#07545A] text-[#FFF8EA] rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Mark Shipped
                            </button>
                          )}
                          {order.fulfilmentStatus === 'Shipped' && (
                            <button
                              onClick={() => handleUpdateFulfilment(order.id, 'Delivered')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Confirm Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SHIPMENTS */}
          {activeTab === 'shipments' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#07545A]/12 shadow-2xs space-y-1">
                <h3 className="font-bold text-base text-[#07545A] font-display">
                  Shipment & Eco-Logistics Coordination
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Track dispatch numbers and follow Curowit plastic-free packaging instructions.
                </p>
              </div>

              {/* Packaging standard notice */}
              <div className="p-4 rounded-2xl bg-[#FFF8EA] border border-[#07545A]/15 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#07545A]">
                  <Truck className="w-4 h-4" />
                  <span>Curowit Atelier Packaging Standards</span>
                </div>
                <p className="text-[#173B3D]/80 leading-relaxed text-[11px]">
                  All items must be wrapped in brown honeycomb paper wrap and sealed with water-activated paper tape. Plastic bubble wrap and thermocol are strictly prohibited.
                </p>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#07545A]">Order #{o.orderId}</span>
                      <h4 className="font-bold text-xs text-[#173B3D] mt-0.5">{o.productTitle}</h4>
                      <span className="text-[11px] text-[#687778]">
                        Courier: {o.courierPartner || 'Delhivery'} · AWB: {o.trackingNumber || 'Pending AWB'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {o.fulfilmentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#07545A]/12 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#07545A] font-display">
                    Earnings Breakdown & 70/30 Ledger
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Transparent transaction reports. 70% direct creator share.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#07545A] border border-[#07545A]/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#07545A]/5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Statement</span>
                </button>
              </div>

              {/* 7-Day payout explanation banner */}
              <div className="p-4 rounded-2xl bg-[#FFF8EA] border border-[#07545A]/15 text-xs flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#07545A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#07545A]">7-Day Post-Delivery Settlement Rule</span>
                  <p className="text-[#173B3D]/75 leading-relaxed text-[11px]">
                    Under the Founding Creator agreement, order proceeds enter your Eligible Balance exactly 7 calendar days after parcel delivery. Once eligible, you can request manual UPI or bank transfer.
                  </p>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF8EA] text-[#07545A] font-bold text-[10px] uppercase border-b border-[#07545A]/15">
                    <tr>
                      <th className="p-3">Order / Product</th>
                      <th className="p-3">Gross Selling</th>
                      <th className="p-3">70% Creator Net</th>
                      <th className="p-3">30% Platform Fee</th>
                      <th className="p-3">7-Day Eligibility</th>
                      <th className="p-3">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#07545A]/10">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FFF8EA]/30">
                        <td className="p-3">
                          <span className="font-bold block text-[#07545A]">{o.productTitle}</span>
                          <span className="text-[10px] text-[#687778]">#{o.orderId}</span>
                        </td>
                        <td className="p-3 font-semibold">₹{o.itemSubtotal}</td>
                        <td className="p-3 font-bold text-emerald-800">₹{o.creatorShare}</td>
                        <td className="p-3 text-[#687778]">₹{o.platformCommission}</td>
                        <td className="p-3 text-[11px]">
                          {o.payoutEligibleAt ? (
                            new Date(o.payoutEligibleAt).getTime() <= Date.now() ? (
                              <span className="text-emerald-700 font-bold">Eligible Now</span>
                            ) : (
                              <span className="text-[#687778]">
                                Eligible {new Date(o.payoutEligibleAt).toLocaleDateString('en-GB')}
                              </span>
                            )
                          ) : (
                            <span className="text-amber-800 italic">Pending Delivery</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            o.payoutStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.payoutStatus === 'eligible'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {o.payoutStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PAYOUTS */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="bg-[#FFFDF7] p-5 rounded-3xl border border-[#07545A]/12 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-[#07545A] font-display">
                    7-Day Settlement & Payout Requests
                  </h3>
                  <p className="text-xs text-[#173B3D]/70">
                    Withdraw matured balances to your registered UPI or Bank account.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-[#687778] uppercase block">Available Balance</span>
                    <span className="text-lg font-bold text-emerald-800 font-display">
                      ₹{earnings.eligibleBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    disabled={earnings.eligibleBalance <= 0}
                    onClick={() => {
                      setPayoutAmountInput(String(earnings.eligibleBalance));
                      setIsPayoutModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                  >
                    Request Payout
                  </button>
                </div>
              </div>

              {/* Payout History */}
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
                <div className="p-4 bg-[#FFF8EA] border-b border-[#07545A]/10 font-bold text-xs text-[#07545A]">
                  Payout Transfer Records ({payouts.length})
                </div>

                {payouts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#173B3D]/60">
                    No payout requests logged yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#07545A]/10 text-xs">
                    {payouts.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-mono font-bold text-[#07545A] block">{p.payoutId}</span>
                          <span className="text-[11px] text-[#173B3D]/70">
                            Destination: {p.payoutDestination}
                          </span>
                          {p.transactionReference && (
                            <span className="text-[10px] text-emerald-800 font-mono block mt-0.5">
                              UTR: {p.transactionReference}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-[#07545A] block">
                            ₹{p.payoutAmount.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            p.payoutStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.payoutStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT DETAILS */}
          {activeTab === 'payment-details' && (
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-2.5 py-0.5 rounded-full">
                  Payout Destination
                </span>
                <h3 className="text-xl font-bold text-[#07545A] font-display mt-1">
                  UPI & Bank Account Settings
                </h3>
                <p className="text-xs text-[#173B3D]/70">
                  Where you receive your 7-day post-delivery settlements. Sensitive bank information is masked.
                </p>
              </div>

              <form onSubmit={handleSavePaymentMethod} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-[#07545A] block mb-1">
                    Primary UPI ID (e.g. yourname@okhdfcbank / yourname@paytm) *
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    defaultValue={paymentMethod?.upiId || ''}
                    placeholder="creator@okhdfcbank"
                    className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-[#07545A]/10">
                  <span className="text-xs font-bold text-[#07545A] block mb-3">
                    Bank Account Transfer (IMPS / NEFT)
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#173B3D] block mb-1">
                        Account Holder Legal Name
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        defaultValue={paymentMethod?.accountHolderName || creator.fullName}
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#173B3D] block mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          defaultValue={paymentMethod?.bankName || 'HDFC Bank'}
                          className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#173B3D] block mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="ifscCode"
                          defaultValue={paymentMethod?.ifscCode || ''}
                          placeholder="HDFC0001234"
                          className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#173B3D] block mb-1">
                        Bank Account Number (Masked for protection)
                      </label>
                      <input
                        type="password"
                        name="accountNumber"
                        placeholder="Re-enter to update account number"
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-mono"
                      />
                      {paymentMethod?.maskedAccountNumber && (
                        <span className="text-[11px] text-[#687778] block mt-1">
                          Current on file: <strong>{paymentMethod.maskedAccountNumber}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Payment Destination
                </button>
              </form>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 sm:p-8 shadow-2xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-2.5 py-0.5 rounded-full">
                  Artisan Credentials
                </span>
                <h3 className="text-xl font-bold text-[#07545A] font-display mt-1">
                  Creator Profile & Studio Dossier
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 bg-[#FFF8EA]/50 rounded-xl">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block">Creator ID</span>
                  <span className="font-mono font-bold text-[#07545A]">{creator.creatorId}</span>
                </div>
                <div className="p-3 bg-[#FFF8EA]/50 rounded-xl">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block">Studio Brand</span>
                  <span className="font-bold text-[#07545A]">{creator.brandName || 'Independent'}</span>
                </div>
                <div className="p-3 bg-[#FFF8EA]/50 rounded-xl">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block">Email & Phone</span>
                  <span className="font-semibold text-[#173B3D]">{creator.email} · {creator.phone}</span>
                </div>
                <div className="p-3 bg-[#FFF8EA]/50 rounded-xl">
                  <span className="text-[10px] font-bold text-[#687778] uppercase block">Location</span>
                  <span className="font-semibold text-[#173B3D]">{creator.city}, {creator.state} - {creator.pincode}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FFF8EA]/30 rounded-2xl border border-[#07545A]/10 text-xs space-y-1">
                <span className="font-bold text-[#07545A] block">Artisan Bio:</span>
                <p className="text-[#173B3D]/80 leading-relaxed">{creator.bio}</p>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-[#07545A] font-display">
                Notifications & Atelier Alerts ({notifications.length})
              </h3>
              <div className="divide-y divide-[#07545A]/10">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3">
                    <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${n.isRead ? 'text-[#687778]' : 'text-[#E97868]'}`} />
                    <div className="space-y-0.5 flex-1">
                      <span className="font-bold text-xs text-[#07545A] block">{n.title}</span>
                      <p className="text-xs text-[#173B3D]/80">{n.message}</p>
                      <span className="text-[10px] text-[#687778]">
                        {new Date(n.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-base text-[#07545A] font-display">
                  Raise a Creator Support Ticket
                </h3>
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Courier paper tape request"
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-semibold"
                      >
                        <option value="orders">Orders & Fulfilment</option>
                        <option value="shipping">Shipping & Packaging</option>
                        <option value="payouts">Payouts & Settlements</option>
                        <option value="products">Product Approval</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#07545A] block mb-1">Description *</label>
                    <textarea
                      rows={2}
                      required
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Explain your question or request..."
                      className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold cursor-pointer"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>

              {/* Tickets List */}
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
                <div className="p-4 bg-[#FFF8EA] font-bold text-xs text-[#07545A]">
                  Ticket Conversation History ({tickets.length})
                </div>
                <div className="divide-y divide-[#07545A]/10 text-xs p-4 space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#07545A]">{t.subject}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {t.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-[#07545A]/20">
                        {t.messages.map((m) => (
                          <div key={m.id} className="text-[11px]">
                            <span className="font-bold text-[#07545A]">{m.senderName}: </span>
                            <span className="text-[#173B3D]/80">{m.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORE DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#07545A] text-base font-display flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#07545A]" />
                      <span>Artisan Atelier & Store Documents</span>
                    </h3>
                    <p className="text-xs text-[#173B3D]/70">
                      Upload portfolio proofs, studio registrations, bank statements, or craft certificates. Stored securely with real-time updates.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#07545A] bg-[#FFF8EA] px-3 py-1.5 rounded-full border border-[#07545A]/15 self-start sm:self-auto">
                    {documents.length} Document{documents.length === 1 ? '' : 's'} on Record
                  </span>
                </div>

                {/* Upload Document Box */}
                <div className="bg-[#FFF8EA]/50 rounded-2xl border border-dashed border-[#07545A]/25 p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Document Classification *
                      </label>
                      <select
                        value={docTypeChoice}
                        onChange={(e) => setDocTypeChoice(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-xs font-semibold outline-none focus:border-[#07545A]"
                      >
                        <option value="portfolio">Portfolio / Lookbook Image</option>
                        <option value="craft_certificate">Artisan / Craft Certificate</option>
                        <option value="identity_proof">Identity Verification Proof</option>
                        <option value="business_license">Business / GST Registration</option>
                        <option value="bank_proof">Bank Account Proof / Passbook</option>
                        <option value="studio_photograph">Studio Workshop Photograph</option>
                        <option value="product_catalog">Product Catalog / Spec Sheet</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#07545A] block mb-1">
                        Notes / Document Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={docNotes}
                        onChange={(e) => setDocNotes(e.target.value)}
                        placeholder="e.g. Master Weaver certificate, Studio Jaipur"
                        className="w-full px-3 py-2 bg-white border border-[#07545A]/20 rounded-xl text-base sm:text-xs outline-none focus:border-[#07545A]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <input
                      type="file"
                      id="store-doc-upload"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleStoreDocumentUpload}
                      className="hidden"
                      disabled={isUploadingDoc}
                    />
                    <label
                      htmlFor="store-doc-upload"
                      className="px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                    </label>
                    <span className="text-[11px] text-[#173B3D]/60">
                      Secured with end-to-end cloud storage encryption
                    </span>
                  </div>
                </div>

                {/* Documents Table / Grid */}
                {documents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#173B3D]/60 bg-[#FFF8EA]/20 rounded-2xl border border-stone-200">
                    No store documents uploaded yet. Add your studio photos, artisan IDs, or craft certificates above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-white border border-[#07545A]/15 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#FFF8EA] text-[#07545A] flex items-center justify-center shrink-0 border border-[#07545A]/10">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[#07545A] truncate block">
                                {doc.fileName}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-[#687778] tracking-wider block">
                                {doc.documentType.replace('_', ' ')}
                              </span>
                              {doc.notes && (
                                <span className="text-[11px] text-[#173B3D]/70 block truncate mt-0.5">
                                  {doc.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                              doc.verificationStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.verificationStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#07545A]/10 flex items-center justify-between text-[11px]">
                          <span className="text-[#173B3D]/60">
                            {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                          </span>
                          <div className="flex items-center gap-2">
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#07545A] hover:underline font-bold flex items-center gap-1"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteStoreDocument(doc.id)}
                              className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: POLICIES */}
          {activeTab === 'policies' && (
            <div className="bg-[#FFFDF7] rounded-3xl border border-[#07545A]/15 p-6 sm:p-8 shadow-2xs space-y-4 text-xs leading-relaxed">
              <h3 className="text-base font-bold text-[#07545A] font-display">
                Founding Creator Program Agreement (v1.0-founding)
              </h3>
              <div className="space-y-3 text-[#173B3D]/80">
                <p>
                  <strong>1. Commercial Share:</strong> The Founding Creator receives 70% of the customer retail price. Curowit retains a 30% platform commission covering hosting, payment processing, packaging standards, and marketplace curation.
                </p>
                <p>
                  <strong>2. 7-Day Settlement Policy:</strong> Payment eligibility matures 7 calendar days after delivery has been confirmed by the carrier. This covers return/transit damage dispute resolution.
                </p>
                <p>
                  <strong>3. Intellectual Property:</strong> Creators maintain full ownership of their creative concepts, designs, and brand identity.
                </p>
                <p>
                  <strong>4. Eco-Logistics Mandate:</strong> Only plastic-free packaging materials (paper tape, corrugated boxes, honeycomb wrap) may be used.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border-2 border-[#07545A]/25 p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h4 className="text-base font-bold text-[#07545A] font-display">
              Request 7-Day Settlement Withdrawal
            </h4>
            <p className="text-[#173B3D]/70 text-[11px]">
              Maximum eligible balance available: <strong>₹{earnings.eligibleBalance.toLocaleString('en-IN')}</strong>.
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#07545A] block mb-1">
                  Withdrawal Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={earnings.eligibleBalance}
                  value={payoutAmountInput}
                  onChange={(e) => setPayoutAmountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFDF7] border border-[#07545A]/25 rounded-xl font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#07545A] block mb-1">
                  Preferred Transfer Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutDestinationChoice('UPI')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      payoutDestinationChoice === 'UPI'
                        ? 'bg-[#07545A] text-white border-[#07545A]'
                        : 'bg-white text-[#173B3D] border-[#07545A]/20'
                    }`}
                  >
                    UPI Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutDestinationChoice('Bank Account')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      payoutDestinationChoice === 'Bank Account'
                        ? 'bg-[#07545A] text-white border-[#07545A]'
                        : 'bg-white text-[#173B3D] border-[#07545A]/20'
                    }`}
                  >
                    Bank IMPS
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#173B3D]/70 hover:text-[#07545A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold cursor-pointer shadow-xs"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
