import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Package,
  TrendingUp,
  CreditCard,
  Truck,
  ExternalLink,
  Eye,
  Check,
  AlertTriangle,
  FileQuestion,
  Building2,
  Send,
  Download,
  Filter,
  RefreshCw,
  HelpCircle,
  Copy,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import { syncEventBus } from '../../lib/foundingCreatorSync';
import {
  CreatorProfile,
  CreatorApplication,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
  CreatorPaymentMethod,
  CreatorSupportTicket,
} from '../../types/foundingCreator';

interface FoundingCreatorsAdminSectionProps {
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const FoundingCreatorsAdminSection: React.FC<FoundingCreatorsAdminSectionProps> = ({
  showToast,
}) => {
  const [subTab, setSubTab] = useState<
    'overview' | 'applications' | 'directory' | 'products' | 'orders' | 'payouts' | 'support'
  >('overview');

  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [orders, setOrders] = useState<CreatorOrderItem[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<CreatorPaymentMethod[]>([]);
  const [tickets, setTickets] = useState<CreatorSupportTicket[]>([]);

  // Support tickets management state
  const [selectedTicket, setSelectedTicket] = useState<CreatorSupportTicket | null>(null);
  const [adminTicketReply, setAdminTicketReply] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [ticketSearch, setTicketSearch] = useState('');

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Search & filter states
  const [appSearch, setAppSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<CreatorApplication | null>(null);

  // Rejection modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Request info modal
  const [requestingInfoAppId, setRequestingInfoAppId] = useState<string | null>(null);
  const [infoRequestText, setInfoRequestText] = useState('');

  // Payout settlement modal
  const [settlingPayout, setSettlingPayout] = useState<CreatorPayout | null>(null);
  const [utrNumber, setUtrNumber] = useState('');

  // Selected Creator Profile Modal
  const [viewingCreator, setViewingCreator] = useState<CreatorProfile | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editVerified, setEditVerified] = useState<boolean>(false);
  const [editCreatorShare, setEditCreatorShare] = useState<number>(70);
  const [isUpdatingCreator, setIsUpdatingCreator] = useState<boolean>(false);

  const handleOpenCreatorDossier = (creator: CreatorProfile) => {
    setViewingCreator(creator);
    setEditStatus(creator.accountStatus || 'pending');
    setEditVerified(Boolean(creator.isVerified));
    setEditCreatorShare(creator.creatorSharePercentage || 70);
  };

  const handleSaveCreatorEdits = async () => {
    if (!viewingCreator) return;
    setIsUpdatingCreator(true);
    try {
      const updated = await foundingCreatorService.updateCreatorProfile({
        id: viewingCreator.id,
        creatorId: viewingCreator.creatorId,
        email: viewingCreator.email,
        accountStatus: editStatus as any,
        isVerified: editVerified,
        creatorSharePercentage: Number(editCreatorShare),
        commissionPercentage: 100 - Number(editCreatorShare),
      });
      if (updated) {
        setViewingCreator(updated);
        await loadData();
        showToast('Creator Updated!', 'Changes successfully persisted to backend and synchronized.', 'success');
      }
    } catch {
      showToast('Error', 'Failed to save creator updates to backend.', 'error');
    } finally {
      setIsUpdatingCreator(false);
    }
  };

  const loadData = async (manualToast = false) => {
    try {
      setIsSyncing(true);
      const [syncedApps, syncedProfiles, syncedPaymentMethods, syncedTickets] = await Promise.all([
        foundingCreatorService.fetchAllApplicationsAsync(),
        foundingCreatorService.fetchAllProfilesAsync(),
        foundingCreatorService.fetchAllPaymentMethodsAsync(),
        foundingCreatorService.fetchAllTicketsAsync(),
      ]);
      setApplications(syncedApps);
      setProfiles(syncedProfiles);
      setPaymentMethods(syncedPaymentMethods);
      setTickets(syncedTickets);
      setProducts(foundingCreatorService.getAllProducts());
      setOrders(foundingCreatorService.getAllOrderItems());
      setPayouts(foundingCreatorService.getAllPayouts());
      setLastSyncedTime(new Date().toLocaleTimeString());
      if (manualToast) {
        showToast('Database Synchronized', `Fetched ${syncedApps.length} applications, ${syncedPaymentMethods.length} payment records, and ${syncedTickets.length} support tickets.`, 'success');
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      setApplications(foundingCreatorService.getAllApplications());
      setProfiles(foundingCreatorService.getAllProfiles());
      setPaymentMethods(foundingCreatorService.getAllPaymentMethods());
      setTickets(foundingCreatorService.getAllTickets());
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-poll database every 4 seconds so submissions in any tab/device appear immediately
    const pollInterval = setInterval(() => {
      loadData();
    }, 4000);

    // Also listen to reactive sync event bus
    const unsubscribe = syncEventBus.subscribe((event) => {
      if (
        event === 'APPLICATION_UPDATED' ||
        event === 'PROFILE_UPDATED' ||
        event === 'PAYMENT_METHODS_UPDATED' ||
        event === 'TICKETS_UPDATED'
      ) {
        loadData();
      }
    });

    return () => {
      clearInterval(pollInterval);
      unsubscribe();
    };
  }, []);

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    const q = appSearch.toLowerCase().trim();
    const matchesQ =
      !q ||
      a.applicantName.toLowerCase().includes(q) ||
      a.applicantEmail.toLowerCase().includes(q) ||
      a.applicationId.toLowerCase().includes(q) ||
      (a.brandName || '').toLowerCase().includes(q);

    const matchesF = appFilter === 'all' || a.applicationStatus === appFilter;
    return matchesQ && matchesF;
  });

  // Action handlers
  const handleApproveApp = async (appId: string) => {
    setIsSyncing(true);
    const success = await foundingCreatorService.approveApplication(appId, 'Curowit Admin', 'Approved via Admin CRM.');
    if (success) {
      await loadData();
      setSelectedApp(null);
      showToast('Creator Approved!', `Application ${appId} approved and creator account activated.`, 'success');
    }
    setIsSyncing(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectingAppId || !rejectionReason.trim()) return;
    setIsSyncing(true);
    await foundingCreatorService.rejectApplication(rejectingAppId, rejectionReason.trim(), 'Curowit Admin');
    await loadData();
    setRejectingAppId(null);
    setRejectionReason('');
    setSelectedApp(null);
    setIsSyncing(false);
    showToast('Application Rejected', 'Applicant updated and rejection notice recorded.', 'info');
  };

  const handleConfirmRequestInfo = async () => {
    if (!requestingInfoAppId || !infoRequestText.trim()) return;
    setIsSyncing(true);
    await foundingCreatorService.requestMoreInformation(requestingInfoAppId, infoRequestText.trim());
    await loadData();
    setRequestingInfoAppId(null);
    setInfoRequestText('');
    setSelectedApp(null);
    setIsSyncing(false);
    showToast('Information Requested', 'Applicant notified to update application.', 'info');
  };

  const handleApproveProduct = (productId: string) => {
    foundingCreatorService.approveProduct(productId);
    loadData();
    showToast('Product Published to Storefront!', 'The product is now visible in the main catalog.', 'success');
  };

  const handleSettlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingPayout || !utrNumber.trim()) return;

    foundingCreatorService.recordAdminPayoutSettlement(settlingPayout.payoutId, utrNumber.trim());
    loadData();
    showToast('Payout Marked Paid!', `Settlement reference ${utrNumber} saved and creator notified.`, 'success');
    setSettlingPayout(null);
    setUtrNumber('');
  };

  const pendingAppsCount = applications.filter((a) => a.applicationStatus === 'pending_review').length;
  const pendingProductsCount = products.filter((p) => p.status === 'submitted').length;
  const pendingPayoutsCount = payouts.filter((p) => p.payoutStatus === 'requested').length;
  const approvedCreatorsCount = profiles.filter((p) => p.accountStatus === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Bar */}
      <div className="bg-[#FFF8EA] p-5 rounded-3xl border border-[#07545A]/15 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-2 py-0.5 rounded-full">
              Creator-Commerce Program
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              70/30 Commercial Split
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#07545A] font-display">
            Founding Creator Management CRM
          </h2>
          <p className="text-xs text-[#173B3D]/70">
            Audit applicant portfolios, review product listings, monitor 7-day fulfillment, and reconcile manual payouts.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'overview'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSubTab('applications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'applications'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            <span>Applications</span>
            {pendingAppsCount > 0 && (
              <span className="bg-[#E97868] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingAppsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('directory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'directory'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            Creators ({approvedCreatorsCount})
          </button>
          <button
            onClick={() => setSubTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'products'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            <span>Product Queue</span>
            {pendingProductsCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingProductsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('payouts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'payouts'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            <span>7-Day Payouts</span>
            {pendingPayoutsCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingPayoutsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'orders'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            Creator Orders ({orders.length})
          </button>
          <button
            onClick={() => setSubTab('support')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'support'
                ? 'bg-[#07545A] text-[#FFF8EA]'
                : 'bg-white text-[#173B3D]/75 hover:bg-[#FFF8EA]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Desk</span>
            {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length}
              </span>
            )}
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] transition-all cursor-pointer flex items-center gap-1.5 border border-[#07545A]/20"
            title={lastSyncedTime ? `Last synced at ${lastSyncedTime}` : 'Sync with database and server'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
              <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                Active Approved Creators
              </span>
              <div className="text-2xl font-black text-[#07545A] font-display">
                {approvedCreatorsCount}
              </div>
              <span className="text-[10px] text-[#173B3D]/70 mt-1 block">
                {profiles.length} total registered
              </span>
            </div>

            <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
              <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                Pending Applications
              </span>
              <div className="text-2xl font-black text-[#E97868] font-display">
                {pendingAppsCount}
              </div>
              <span className="text-[10px] text-[#173B3D]/70 mt-1 block">Awaiting curation review</span>
            </div>

            <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
              <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                Product Review Queue
              </span>
              <div className="text-2xl font-black text-amber-700 font-display">
                {pendingProductsCount}
              </div>
              <span className="text-[10px] text-[#173B3D]/70 mt-1 block">Ready for storefront approval</span>
            </div>

            <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/12 shadow-2xs">
              <span className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                Pending Payout Requests
              </span>
              <div className="text-2xl font-black text-emerald-800 font-display">
                {pendingPayoutsCount}
              </div>
              <span className="text-[10px] text-[#173B3D]/70 mt-1 block">Requires manual UTR settlement</span>
            </div>
          </div>

          {/* Quick Action Tables in Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Applications Queue */}
            <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#07545A] font-display">
                  Recent Applications ({applications.length})
                </h4>
                <button
                  onClick={() => setSubTab('applications')}
                  className="text-xs font-bold text-[#07545A] hover:underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="divide-y divide-[#07545A]/10 text-xs">
                {applications.length === 0 ? (
                  <div className="py-6 text-center text-[#173B3D]/70 space-y-1">
                    <p className="font-semibold text-xs text-[#07545A]">No Applications in Queue</p>
                    <p className="text-[11px] text-[#687778]">
                      Default mock creators removed. Submissions via the Founding Creator form sync here automatically for review.
                    </p>
                  </div>
                ) : (
                  applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-[#07545A] block">{app.applicantName}</span>
                        <span className="text-[10px] text-[#687778]">
                          {app.brandName ? `${app.brandName} · ` : ''}{app.city}, {app.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          app.applicationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.applicationStatus === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {app.applicationStatus.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2 py-1 bg-white text-[#07545A] rounded-lg border border-[#07545A]/20 font-bold hover:bg-[#07545A]/10 cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Payouts Queue */}
            <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#07545A] font-display">
                  Payout Settlements
                </h4>
                <button
                  onClick={() => setSubTab('payouts')}
                  className="text-xs font-bold text-[#07545A] hover:underline"
                >
                  Review Payouts →
                </button>
              </div>

              <div className="divide-y divide-[#07545A]/10 text-xs">
                {payouts.slice(0, 3).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#07545A] block">{p.creatorName}</span>
                      <span className="text-[10px] text-[#687778]">
                        {p.payoutDestination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#07545A]">₹{p.payoutAmount}</span>
                      {p.payoutStatus === 'requested' ? (
                        <button
                          onClick={() => setSettlingPayout(p)}
                          className="px-2 py-1 bg-[#07545A] text-[#FFF8EA] rounded-lg font-bold hover:bg-[#063F45]"
                        >
                          Settle
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: APPLICATIONS QUEUE */}
      {subTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF8EA] p-4 rounded-2xl border border-[#07545A]/15">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/50" />
                <input
                  type="text"
                  placeholder="Search by name, email, brand, or ID..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#07545A]/20 rounded-xl text-xs outline-none"
                />
              </div>

              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#07545A]/20 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="under_review">Under Review</option>
                <option value="additional_info_required">Info Required</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-[#07545A] font-bold text-[10px] uppercase border-b border-[#07545A]/15">
                <tr>
                  <th className="p-3">Application ID</th>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Contact & City</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#07545A]/10 bg-white">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-[#173B3D]/70 bg-[#FFFDF7]">
                      <div className="max-w-md mx-auto space-y-2">
                        <Users className="w-8 h-8 text-[#07545A]/30 mx-auto" />
                        <h4 className="font-bold text-sm text-[#07545A] font-display">
                          {applications.length === 0 ? 'No Creator Applications Yet' : 'No Applications Match Filter'}
                        </h4>
                        <p className="text-xs text-[#173B3D]/70">
                          {applications.length === 0
                            ? 'Default demo creators have been removed. When an artisan fills out the Founding Creator form, their application will automatically sync here for approval.'
                            : 'Try adjusting your search keywords or status filter.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FFF8EA]/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#07545A]">{a.applicationId}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#173B3D] block">{a.applicantName}</span>
                        {a.brandName && (
                          <span className="text-[10px] text-[#687778]">{a.brandName}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="block text-[#173B3D]">{a.applicantEmail}</span>
                        <span className="text-[10px] text-[#687778]">{a.city}, {a.state}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] font-medium">{a.categories.join(', ')}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          a.applicationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.applicationStatus === 'pending_review'
                            ? 'bg-amber-100 text-amber-800'
                            : a.applicationStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.applicationStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(a)}
                            className="px-2.5 py-1 bg-[#FFF8EA] text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/20 rounded-lg font-bold text-xs cursor-pointer"
                          >
                            Review Dossier
                          </button>
                          {a.applicationStatus !== 'approved' && (
                            <button
                              onClick={() => handleApproveApp(a.applicationId)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                              title="Approve Creator"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CREATOR DIRECTORY */}
      {subTab === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.length === 0 ? (
            <div className="col-span-full bg-[#FFF8EA] p-10 rounded-3xl border border-[#07545A]/15 text-center space-y-2">
              <Users className="w-10 h-10 text-[#07545A]/30 mx-auto" />
              <h4 className="font-bold text-[#07545A] text-sm font-display">No Approved Founding Creators Yet</h4>
              <p className="text-xs text-[#173B3D]/70 max-w-md mx-auto">
                Default creators removed. When you approve an applicant from the Applications queue, their creator profile will appear here in the directory.
              </p>
            </div>
          ) : profiles.map((p) => (
            <div
              key={p.id}
              className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#07545A]/20 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#07545A] text-[#FFF8EA] font-bold flex items-center justify-center shrink-0">
                        {p.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[#07545A]">{p.fullName}</h4>
                      <span className="text-[10px] text-[#687778] block">{p.brandName || p.creatorType}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#07545A]">{p.creatorId}</span>
                </div>

                <div className="pt-3 space-y-1 text-xs text-[#173B3D]/80">
                  <div>
                    <span className="text-[10px] text-[#687778] uppercase">Location: </span>
                    <span>{p.city}, {p.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#687778] uppercase">Email: </span>
                    <span>{p.email}</span>
                  </div>
                  <p className="text-[11px] text-[#173B3D]/70 line-clamp-2 mt-1">{p.bio}</p>

                  {/* Payment Details Sync Block */}
                  {(() => {
                    const pm = paymentMethods.find((m) => m.creatorId === p.id || m.creatorId === p.creatorId);
                    return (
                      <div className="mt-2.5 p-2.5 bg-white/90 rounded-2xl border border-[#07545A]/12 text-[11px] space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#07545A] flex items-center gap-1.5 text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-[#07545A]" />
                            <span>Payment Details</span>
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                              pm ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pm ? `${pm.methodType} Active` : 'Not Added'}
                          </span>
                        </div>
                        {pm ? (
                          <div className="text-[#173B3D]/85 text-[10.5px] leading-tight space-y-0.5 pt-0.5">
                            {pm.upiId && (
                              <p>
                                <strong>UPI:</strong> <span className="font-mono text-[#07545A]">{pm.upiId}</span>
                              </p>
                            )}
                            {pm.bankName && (
                              <p>
                                <strong>Bank:</strong> {pm.bankName} {pm.maskedAccountNumber ? `(${pm.maskedAccountNumber})` : ''}
                              </p>
                            )}
                            {pm.ifscCode && (
                              <p>
                                <strong>IFSC:</strong> <span className="font-mono">{pm.ifscCode}</span>
                              </p>
                            )}
                            {pm.accountHolderName && (
                              <p>
                                <strong>Holder:</strong> {pm.accountHolderName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#173B3D]/50 italic pt-0.5">
                            Creator has not configured payout destination yet.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  {p.accountStatus}
                </span>
                <button
                  onClick={() => handleOpenCreatorDossier(p)}
                  className="font-bold text-[#07545A] hover:underline cursor-pointer"
                >
                  View Profile & Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: PRODUCT REVIEW QUEUE */}
      {subTab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#FFF8EA] rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-stone-100 overflow-hidden relative">
                    <img
                      src={prod.images[0]?.publicUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/90 shadow-xs border">
                        {prod.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold text-[#E97868] uppercase block">
                      By {prod.creatorName} ({prod.creatorBrand})
                    </span>
                    <h4 className="font-bold text-sm text-[#07545A] leading-tight">{prod.title}</h4>
                    <p className="text-xs text-[#173B3D]/70 line-clamp-2">{prod.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-black text-sm text-[#07545A]">₹{prod.price}</span>
                      <span className="text-xs text-[#687778]">Stock: {prod.inventoryQuantity}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-[#07545A]/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#687778]">{prod.sku}</span>
                  {prod.status !== 'published' ? (
                    <button
                      onClick={() => handleApproveProduct(prod.productId)}
                      className="px-3 py-1 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Live on Store
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: PAYOUTS RECONCILIATION */}
      {subTab === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/15 shadow-2xs">
            <h3 className="font-bold text-base text-[#07545A] font-display">
              Creator 7-Day Settlement Payouts Queue
            </h3>
            <p className="text-xs text-[#173B3D]/70">
              Process manual payouts via UPI / IMPS and record the banking UTR transaction reference.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8EA] text-[#07545A] font-bold text-[10px] uppercase border-b border-[#07545A]/15">
                <tr>
                  <th className="p-3">Payout ID</th>
                  <th className="p-3">Creator Name</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Transaction UTR</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#07545A]/10">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 font-mono font-bold text-[#07545A]">{p.payoutId}</td>
                    <td className="p-3 font-semibold">{p.creatorName}</td>
                    <td className="p-3 text-[11px]">
                      {(() => {
                        const pm = paymentMethods.find((m) => m.creatorId === p.creatorId);
                        if (pm) {
                          return (
                            <div>
                              {pm.upiId && <span className="font-mono text-[#07545A] font-bold block">UPI: {pm.upiId}</span>}
                              {pm.bankName && <span className="text-[10px] text-[#687778] block">{pm.bankName} {pm.maskedAccountNumber ? `(${pm.maskedAccountNumber})` : ''} · {pm.ifscCode}</span>}
                              {!pm.upiId && !pm.bankName && <span className="font-mono">{p.payoutDestination}</span>}
                            </div>
                          );
                        }
                        return <span className="font-mono">{p.payoutDestination}</span>;
                      })()}
                    </td>
                    <td className="p-3 font-bold text-base text-[#07545A]">₹{p.payoutAmount}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        p.payoutStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.payoutStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#687778]">
                      {p.transactionReference || 'Pending UTR'}
                    </td>
                    <td className="p-3 text-right">
                      {p.payoutStatus !== 'paid' ? (
                        <button
                          onClick={() => setSettlingPayout(p)}
                          className="px-3 py-1 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] rounded-xl font-bold text-xs cursor-pointer"
                        >
                          Enter UTR & Pay
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CREATOR ORDERS */}
      {subTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8EA] text-[#07545A] font-bold text-[10px] uppercase border-b border-[#07545A]/15">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Product</th>
                <th className="p-3">Creator Share (70%)</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3">Carrier & Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#07545A]/10">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono font-bold text-[#07545A]">#{o.orderId}</td>
                  <td className="p-3">
                    <span className="font-bold block">{o.productTitle}</span>
                    <span className="text-[10px] text-[#687778]">Qty: {o.quantity}</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-800">₹{o.creatorShare}</td>
                  <td className="p-3">{o.customerCity || 'Domestic'}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                      {o.fulfilmentStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#687778]">
                    {o.courierPartner || 'Delhivery'}: {o.trackingNumber || 'Pending AWB'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 7: CREATOR SUPPORT TICKETS & QUERY RESOLUTION (SUPPORT DESK) */}
      {subTab === 'support' && (
        <div className="space-y-4">
          {/* Header controls: Search & Status Filters */}
          <div className="bg-[#FFF8EA] p-4 rounded-3xl border border-[#07545A]/15 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search ticket ID, creator, subject..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#07545A]/20 rounded-xl text-xs outline-none focus:border-[#07545A]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All (${tickets.length})` },
                { id: 'open', label: `Open (${tickets.filter((t) => t.status === 'open').length})` },
                { id: 'in_progress', label: `In Progress (${tickets.filter((t) => t.status === 'in_progress').length})` },
                { id: 'resolved', label: `Resolved (${tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTicketStatusFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    ticketStatusFilter === f.id
                      ? 'bg-[#07545A] text-[#FFF8EA]'
                      : 'bg-white text-[#173B3D]/70 hover:bg-[#FFF8EA]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Tickets List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {(() => {
                const filtered = tickets.filter((t) => {
                  const q = ticketSearch.toLowerCase().trim();
                  const matchesQ =
                    !q ||
                    t.ticketId.toLowerCase().includes(q) ||
                    t.subject.toLowerCase().includes(q) ||
                    (t.creatorName || '').toLowerCase().includes(q) ||
                    (t.creatorEmail || '').toLowerCase().includes(q);
                  const matchesS =
                    ticketStatusFilter === 'all'
                      ? true
                      : ticketStatusFilter === 'resolved'
                      ? t.status === 'resolved' || t.status === 'closed'
                      : t.status === ticketStatusFilter;
                  return matchesQ && matchesS;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 bg-white rounded-3xl border border-[#07545A]/15 text-center text-xs text-[#173B3D]/60 space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-[#07545A]/40" />
                      <p className="font-semibold text-[#07545A]">No Support Tickets Found</p>
                      <p className="text-[11px]">When founding creators raise query tickets in their dashboard, they appear here instantly with real-time sync.</p>
                    </div>
                  );
                }

                return filtered.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'bg-[#FFF8EA] border-[#07545A] shadow-md ring-1 ring-[#07545A]/20'
                          : 'bg-white border-[#07545A]/15 hover:border-[#07545A]/35 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#07545A] text-[10.5px]">
                              {t.ticketId}
                            </span>
                            <span className="text-[10px] text-[#687778]">·</span>
                            <span className="text-[10px] uppercase font-bold text-[#687778] tracking-wider">
                              {t.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#07545A] line-clamp-1 mt-0.5">
                            {t.subject}
                          </h4>
                          <span className="text-[11px] text-[#173B3D]/70 block">
                            By {t.creatorName || 'Artisan Creator'} {t.creatorEmail ? `(${t.creatorEmail})` : ''}
                          </span>
                        </div>

                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            t.status === 'open'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#173B3D]/80 line-clamp-2 bg-[#FAF6EE] p-2 rounded-xl">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#687778] pt-1">
                        <span>{new Date(t.createdAt).toLocaleDateString('en-GB')} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-semibold text-[#07545A] flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.messages?.length || 1} message{t.messages?.length === 1 ? '' : 's'}</span>
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Right Column: Ticket Conversation Thread & Query Solver */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#07545A]/15 shadow-2xs p-5 flex flex-col justify-between min-h-[500px]">
              {selectedTicket ? (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  <div>
                    {/* Ticket Header */}
                    <div className="pb-3 border-b border-[#07545A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#07545A]">
                            {selectedTicket.ticketId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              selectedTicket.status === 'open'
                                ? 'bg-amber-100 text-amber-800'
                                : selectedTicket.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {selectedTicket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-[#07545A] font-display mt-0.5">
                          {selectedTicket.subject}
                        </h3>
                        <p className="text-[11px] text-[#173B3D]/70">
                          Creator: <strong>{selectedTicket.creatorName || 'Artisan Creator'}</strong> · {selectedTicket.creatorEmail || 'No email provided'}
                        </p>
                      </div>

                      {/* Quick Status Toggles */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {selectedTicket.status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = foundingCreatorService.resolveSupportTicket(
                                selectedTicket.id,
                                'Ticket marked as resolved by Curowit Support Administrator.',
                                'resolved'
                              );
                              if (updated) {
                                setSelectedTicket(updated);
                                loadData();
                                showToast('Ticket Resolved', `${selectedTicket.ticketId} marked as resolved.`, 'success');
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Quick Resolve</span>
                          </button>
                        )}
                        {selectedTicket.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = foundingCreatorService.resolveSupportTicket(
                                selectedTicket.id,
                                'Curowit Support is actively reviewing your query.',
                                'in_progress'
                              );
                              if (updated) {
                                setSelectedTicket(updated);
                                loadData();
                                showToast('Status Updated', 'Ticket moved to In Progress.', 'info');
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>In Progress</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Conversation Message Feed */}
                    <div className="py-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages.map((m) => {
                          const isAdmin = m.senderType === 'admin';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1 text-[10px] text-[#687778] mb-1">
                                <span className="font-bold text-[#07545A]">{m.senderName}</span>
                                <span>·</span>
                                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div
                                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                                  isAdmin
                                    ? 'bg-[#07545A] text-[#FFF8EA] rounded-tr-none'
                                    : 'bg-[#FFF8EA] text-[#173B3D] border border-[#07545A]/15 rounded-tl-none'
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 bg-[#FFF8EA] rounded-2xl text-xs text-[#173B3D]/80">
                          {selectedTicket.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Reply & Query Solver Composer */}
                  <div className="pt-3 border-t border-[#07545A]/10 space-y-2.5">
                    <label className="text-xs font-bold text-[#07545A] block">
                      Send Reply & Solve Creator Query:
                    </label>
                    <textarea
                      rows={3}
                      value={adminTicketReply}
                      onChange={(e) => setAdminTicketReply(e.target.value)}
                      placeholder="Type official admin response, guidance, or resolution details here..."
                      className="w-full p-3 bg-[#FAF7F2] border border-[#07545A]/20 rounded-2xl text-xs outline-none focus:border-[#07545A] focus:bg-white transition-all"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-[#173B3D]/60">
                        Response immediately synchronizes to Creator Dashboard notifications.
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!adminTicketReply.trim()}
                          onClick={() => {
                            if (!adminTicketReply.trim()) return;
                            const updated = foundingCreatorService.resolveSupportTicket(
                              selectedTicket.id,
                              adminTicketReply.trim(),
                              'in_progress'
                            );
                            if (updated) {
                              setSelectedTicket(updated);
                              setAdminTicketReply('');
                              loadData();
                              showToast('Reply Sent', 'Creator received your response.', 'success');
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-[#07545A]/30 text-[#07545A] hover:bg-[#07545A]/5 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reply Only
                        </button>

                        <button
                          type="button"
                          disabled={!adminTicketReply.trim()}
                          onClick={() => {
                            if (!adminTicketReply.trim()) return;
                            const updated = foundingCreatorService.resolveSupportTicket(
                              selectedTicket.id,
                              adminTicketReply.trim(),
                              'resolved'
                            );
                            if (updated) {
                              setSelectedTicket(updated);
                              setAdminTicketReply('');
                              loadData();
                              showToast('Query Solved & Resolved', 'Ticket marked as resolved and creator notified.', 'success');
                            }
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply & Mark Resolved</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#173B3D]/60 space-y-2">
                  <HelpCircle className="w-10 h-10 text-[#07545A]/30" />
                  <h4 className="font-bold text-sm text-[#07545A]">Select a Support Ticket</h4>
                  <p className="text-xs max-w-sm">
                    Click any ticket on the left to read creator inquiry, inspect craft details, and send synchronized replies to resolve the query.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION DOSSIER REVIEW */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 max-w-2xl w-full shadow-2xl my-8 space-y-4 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[#07545A]/10">
              <div>
                <span className="text-[10px] font-bold font-mono text-[#07545A]">
                  {selectedApp.applicationId}
                </span>
                <h3 className="text-lg font-bold text-[#07545A] font-display">
                  {selectedApp.applicantName} {selectedApp.brandName ? `(${selectedApp.brandName})` : ''}
                </h3>
                <span className="text-[11px] text-[#687778]">
                  {selectedApp.city}, {selectedApp.state} · {selectedApp.applicantEmail} · {selectedApp.applicantPhone}
                </span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Creator Type & Contact Card */}
              <div className="p-3 bg-white border border-[#07545A]/15 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Type</span>
                  <span className="font-bold text-[#07545A]">{selectedApp.creatorType || 'Individual'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Pincode</span>
                  <span className="font-bold text-[#07545A]">{selectedApp.pincode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Craft Method</span>
                  <span className="font-bold text-[#07545A] capitalize">{selectedApp.craftMethod || 'Handmade'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Lead Time</span>
                  <span className="font-bold text-[#07545A]">{selectedApp.leadTime || '3-5 days'}</span>
                </div>
              </div>

              {/* Craft Specifications Grid */}
              <div className="p-3 bg-[#FFF8EA] border border-[#07545A]/15 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Experience</span>
                  <span className="font-bold text-[#173B3D]">{selectedApp.yearsExperience || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Monthly Capacity</span>
                  <span className="font-bold text-[#173B3D]">{selectedApp.monthlyCapacity || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Custom Orders?</span>
                  <span className="font-bold text-emerald-800">{selectedApp.acceptsCustomOrders ? 'Accepted ✓' : 'No'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Sells Elsewhere</span>
                  <span className="font-bold text-[#173B3D] truncate">{selectedApp.sellsElsewhere || 'None'}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#07545A] block mb-1">Craft Categories:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.categories.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-[#FFF8EA] text-[#07545A] rounded-lg border text-[11px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#07545A] block mb-1">Artisan Bio / Introduction:</span>
                <p className="p-3 bg-white border rounded-xl text-[#173B3D]/80 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.intro || 'No introduction provided.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#07545A] block mb-1">Craft Work & Technique Description:</span>
                <p className="p-3 bg-white border rounded-xl text-[#173B3D]/80 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.craftDescription}
                </p>
              </div>

              {/* Social and Portfolio Web Links */}
              {((selectedApp.portfolioLinks && selectedApp.portfolioLinks.length > 0)) && (
                <div>
                  <span className="font-bold text-[#07545A] block mb-1">Online Portfolios & Links:</span>
                  <div className="space-y-1">
                    {selectedApp.portfolioLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.startsWith('http') ? link : `https://${link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#07545A] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Images preview */}
              {selectedApp.portfolioFiles.length > 0 && (
                <div>
                  <span className="font-bold text-[#07545A] block mb-2">
                    Submitted Portfolio Imagery & Files ({selectedApp.portfolioFiles.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedApp.portfolioFiles.map((f, i) => {
                      const isPdf = f.name?.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf';
                      return (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl overflow-hidden border border-[#07545A]/15 h-24 block relative group bg-[#FFFDF7] p-1.5 hover:shadow-xs transition-all"
                          title={f.name}
                        >
                          {isPdf ? (
                            <div className="w-full h-full rounded-lg bg-rose-50 text-rose-700 flex flex-col items-center justify-center p-2 text-center">
                              <Download className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold truncate max-w-full block">{f.name}</span>
                              <span className="text-[9px] uppercase tracking-wider text-rose-600 font-bold">PDF Document</span>
                            </div>
                          ) : (
                            <img
                              src={f.url}
                              alt={f.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                (e.target as HTMLElement).parentElement!.classList.add('bg-stone-100');
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold rounded-xl gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectingAppId(selectedApp.applicationId)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                >
                  Reject...
                </button>
                <button
                  onClick={() => setRequestingInfoAppId(selectedApp.applicationId)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold"
                >
                  Request Info...
                </button>
              </div>

              {selectedApp.applicationStatus !== 'approved' && (
                <button
                  onClick={() => handleApproveApp(selectedApp.applicationId)}
                  className="px-5 py-2 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold shadow-xs"
                >
                  Approve Founding Creator
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT APPLICATION REASON */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-3 text-xs">
            <h4 className="font-bold text-[#07545A] text-sm">Provide Rejection Reason</h4>
            <p className="text-[#173B3D]/70">
              Please explain why the application does not currently meet our slow-craft standards.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Products appear factory sourced rather than handmade studio craft..."
              className="w-full p-2.5 border rounded-xl text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingAppId(null)}
                className="px-3 py-1.5 text-stone-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SETTLE PAYOUT UTR */}
      {settlingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <h4 className="font-bold text-[#07545A] text-sm">Record Payout Settlement</h4>
            <div className="p-3 bg-[#FFF8EA] rounded-xl space-y-1">
              <div>Creator: <strong>{settlingPayout.creatorName}</strong></div>
              <div>Amount: <strong className="text-emerald-800 font-bold">₹{settlingPayout.payoutAmount}</strong></div>
              <div>Destination: <span className="font-mono">{settlingPayout.payoutDestination}</span></div>
            </div>

            <form onSubmit={handleSettlePayout} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#07545A] block mb-1">
                  Bank / UPI Transaction Reference (UTR) *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR-HDFC-9948210385"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingPayout(null)}
                  className="px-3 py-1.5 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#07545A] text-[#FFF8EA] rounded-xl font-bold"
                >
                  Mark Settled & Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW FULL CREATOR PROFILE & PAYMENT DOSSIER */}
      {viewingCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-6 max-w-2xl w-full shadow-2xl my-8 space-y-4 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[#07545A]/10">
              <div className="flex items-center gap-3">
                {viewingCreator.avatarUrl ? (
                  <img
                    src={viewingCreator.avatarUrl}
                    alt={viewingCreator.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#07545A]/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#07545A] text-[#FFF8EA] font-bold flex items-center justify-center text-base">
                    {viewingCreator.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#07545A] font-display">
                    {viewingCreator.fullName} {viewingCreator.brandName ? `(${viewingCreator.brandName})` : ''}
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-[#07545A] block">
                    ID: {viewingCreator.creatorId} · Status: <span className="uppercase text-emerald-800 font-bold">{viewingCreator.accountStatus}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingCreator(null)}
                className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Contact info grid */}
              <div className="p-3 bg-white border border-[#07545A]/15 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Email</span>
                  <span className="font-bold text-[#07545A] truncate block">{viewingCreator.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Phone</span>
                  <span className="font-bold text-[#07545A]">{viewingCreator.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Location</span>
                  <span className="font-bold text-[#07545A]">{viewingCreator.city}, {viewingCreator.state}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#687778] uppercase font-bold block">Current Split</span>
                  <span className="font-bold text-emerald-800">{viewingCreator.creatorSharePercentage || 70}% Direct Share</span>
                </div>
              </div>

              {/* Admin Modification & Governance Panel */}
              <div className="p-4 bg-white border-2 border-[#07545A]/20 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#07545A]/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#07545A]" />
                    <span className="font-bold text-sm text-[#07545A]">Admin Governance & Permissions</span>
                  </div>
                  <span className="text-[10px] text-[#687778] font-medium">Syncs directly to backend database</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Account Status */}
                  <div>
                    <label className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                      Creator Account Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#07545A]/20 rounded-xl text-xs font-semibold text-[#07545A] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                    >
                      <option value="approved">Approved & Active</option>
                      <option value="pending">Pending Review</option>
                      <option value="rejected">Rejected / Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Verification Badge */}
                  <div>
                    <label className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                      Artisan Verification
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditVerified(!editVerified)}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        editVerified
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-stone-50 border-stone-300 text-stone-600'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${editVerified ? 'text-emerald-700' : 'text-stone-400'}`} />
                      <span>{editVerified ? 'Verified Artisan' : 'Unverified'}</span>
                    </button>
                  </div>

                  {/* Commission Split */}
                  <div>
                    <label className="text-[10px] font-bold text-[#687778] uppercase block mb-1">
                      Creator Revenue Split (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="95"
                        value={editCreatorShare}
                        onChange={(e) => setEditCreatorShare(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#07545A]/20 rounded-xl text-xs font-semibold text-[#07545A] focus:outline-none focus:ring-1 focus:ring-[#07545A]"
                      />
                      <span className="text-xs font-bold text-[#687778]">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#687778]">
                    Platform fee: {100 - Number(editCreatorShare || 70)}% · Creator receives: {Number(editCreatorShare || 70)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCreatorEdits}
                    disabled={isUpdatingCreator}
                    className="px-4 py-1.5 bg-[#07545A] text-[#FFF8EA] font-bold text-xs rounded-xl hover:bg-[#063F45] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {isUpdatingCreator ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save to Backend Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verified Payment Details Card */}
              {(() => {
                const pm = paymentMethods.find((m) => m.creatorId === viewingCreator.id || m.creatorId === viewingCreator.creatorId);
                return (
                  <div className="p-4 bg-[#FFF8EA] border border-[#07545A]/20 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#07545A] flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#07545A]" />
                        <span>Registered Settlement Details (For 7-Day Payouts)</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        pm ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pm ? `${pm.methodType} Configured` : 'No Bank/UPI Details'}
                      </span>
                    </div>

                    {pm ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-[#07545A]/10">
                        {pm.upiId && (
                          <div className="flex items-center justify-between col-span-1 sm:col-span-2 bg-[#FAF7F2] p-2 rounded-lg">
                            <div>
                              <span className="text-[10px] text-[#687778] uppercase font-bold block">UPI ID</span>
                              <span className="font-mono font-bold text-sm text-[#07545A]">{pm.upiId}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(pm.upiId || '');
                                showToast('Copied', 'UPI ID copied to clipboard.', 'success');
                              }}
                              className="px-2.5 py-1 bg-white border rounded-lg text-[10px] font-bold text-[#07545A] hover:bg-[#FFF8EA] cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy UPI</span>
                            </button>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-[#687778] uppercase font-bold block">Account Holder Name</span>
                          <span className="font-bold text-[#173B3D]">{pm.accountHolderName || viewingCreator.fullName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#687778] uppercase font-bold block">Bank Name</span>
                          <span className="font-bold text-[#173B3D]">{pm.bankName || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#687778] uppercase font-bold block">Account Number</span>
                          <span className="font-mono font-bold text-[#173B3D]">{pm.maskedAccountNumber || 'Configured'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#687778] uppercase font-bold block">IFSC Code</span>
                          <span className="font-mono font-bold text-[#07545A]">{pm.ifscCode || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#173B3D]/70 italic">
                        This creator has not configured their payment details in the Creator Dashboard. When they submit UPI or bank info, it will appear here immediately.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Bio */}
              <div>
                <span className="font-bold text-[#07545A] block mb-1">Artisan Bio:</span>
                <p className="p-3 bg-white border rounded-xl text-[#173B3D]/80 leading-relaxed whitespace-pre-wrap">
                  {viewingCreator.bio || 'No bio specified.'}
                </p>
              </div>

              {/* Creator Live Products summary */}
              <div>
                <span className="font-bold text-[#07545A] block mb-1">
                  Products in Catalog ({products.filter((pr) => pr.creatorId === viewingCreator.id || pr.creatorId === viewingCreator.creatorId).length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {products
                    .filter((pr) => pr.creatorId === viewingCreator.id || pr.creatorId === viewingCreator.creatorId)
                    .map((pr) => (
                      <div key={pr.id} className="p-2.5 bg-white border rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold truncate max-w-[150px]">{pr.title}</span>
                        <span className="font-bold text-emerald-800 tabular-nums">₹{pr.price}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-end">
              <button
                onClick={() => setViewingCreator(null)}
                className="px-5 py-2 bg-[#07545A] text-[#FFF8EA] rounded-xl font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
