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
} from 'lucide-react';
import { foundingCreatorService } from '../../services/foundingCreatorService';
import { syncEventBus } from '../../lib/foundingCreatorSync';
import {
  CreatorProfile,
  CreatorApplication,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
} from '../../types/foundingCreator';

interface FoundingCreatorsAdminSectionProps {
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const FoundingCreatorsAdminSection: React.FC<FoundingCreatorsAdminSectionProps> = ({
  showToast,
}) => {
  const [subTab, setSubTab] = useState<
    'overview' | 'applications' | 'directory' | 'products' | 'orders' | 'payouts'
  >('overview');

  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [profiles, setProfiles] = useState<CreatorProfile[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [orders, setOrders] = useState<CreatorOrderItem[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);

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

  const loadData = async (manualToast = false) => {
    try {
      setIsSyncing(true);
      const [syncedApps, syncedProfiles] = await Promise.all([
        foundingCreatorService.fetchAllApplicationsAsync(),
        foundingCreatorService.fetchAllProfilesAsync(),
      ]);
      setApplications(syncedApps);
      setProfiles(syncedProfiles);
      setProducts(foundingCreatorService.getAllProducts());
      setOrders(foundingCreatorService.getAllOrderItems());
      setPayouts(foundingCreatorService.getAllPayouts());
      setLastSyncedTime(new Date().toLocaleTimeString());
      if (manualToast) {
        showToast('Database Synchronized', `Fetched ${syncedApps.length} applications from central database.`, 'success');
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      setApplications(foundingCreatorService.getAllApplications());
      setProfiles(foundingCreatorService.getAllProfiles());
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
      if (event === 'APPLICATION_UPDATED' || event === 'PROFILE_UPDATED') {
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
    const success = foundingCreatorService.approveApplication(appId, 'Curowit Admin', 'Approved via Admin CRM.');
    if (success) {
      await loadData();
      setSelectedApp(null);
      showToast('Creator Approved!', `Application ${appId} approved and creator account activated.`, 'success');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingAppId || !rejectionReason.trim()) return;
    foundingCreatorService.rejectApplication(rejectingAppId, rejectionReason.trim(), 'Curowit Admin');
    await loadData();
    setRejectingAppId(null);
    setRejectionReason('');
    setSelectedApp(null);
    showToast('Application Rejected', 'Applicant updated and rejection notice recorded.', 'info');
  };

  const handleConfirmRequestInfo = async () => {
    if (!requestingInfoAppId || !infoRequestText.trim()) return;
    foundingCreatorService.requestMoreInformation(requestingInfoAppId, infoRequestText.trim());
    await loadData();
    setRequestingInfoAppId(null);
    setInfoRequestText('');
    setSelectedApp(null);
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
                </div>
              </div>

              <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  {p.accountStatus}
                </span>
                <button
                  onClick={() => setViewingCreator(p)}
                  className="font-bold text-[#07545A] hover:underline"
                >
                  View Profile →
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
                    <td className="p-3 font-mono text-[11px]">{p.payoutDestination}</td>
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
                    Submitted Portfolio Imagery ({selectedApp.portfolioFiles.length})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedApp.portfolioFiles.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl overflow-hidden border h-24 block relative group bg-stone-100"
                        title={f.name}
                      >
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </a>
                    ))}
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
    </div>
  );
};
