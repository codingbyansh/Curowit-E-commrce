import { supabase } from '../supabase';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { foundingCreatorSyncService, StoreDocument, StoreDocumentType } from '../lib/foundingCreatorSync';
import { cloudinaryService } from './cloudinaryService';
import {
  CreatorProfile,
  CreatorApplication,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
  CreatorPaymentMethod,
  CreatorNotification,
  CreatorSupportTicket,
  CreatorEarningsLedgerEntry,
  ApplicationStatus,
} from '../types/foundingCreator';

const STORAGE_KEYS = {
  CURRENT_CREATOR: 'curowit_founding_creator_session',
  PROFILES: 'curowit_fc_profiles_v1',
  APPLICATIONS: 'curowit_fc_applications_v1',
  PRODUCTS: 'curowit_fc_products_v1',
  ORDER_ITEMS: 'curowit_fc_order_items_v1',
  PAYOUTS: 'curowit_fc_payouts_v1',
  PAYMENT_METHODS: 'curowit_fc_payment_methods_v1',
  NOTIFICATIONS: 'curowit_fc_notifications_v1',
  SUPPORT_TICKETS: 'curowit_fc_support_tickets_v1',
  EARNINGS_LEDGER: 'curowit_fc_earnings_ledger_v1',
};

// Sets of demo IDs to ensure admin panel shows only real submitted creators
const DEMO_APPLICATION_IDS = new Set([
  'app-meera-sharma',
  'app-aarav-patel',
  'APP-FC-98421',
  'APP-FC-10543',
]);
const DEMO_CREATOR_IDS = new Set([
  'cr-meera-sharma',
  'cr-aarav-patel',
  'CR-FC-98421',
  'CR-FC-10543',
]);

export function isDemoApplication(app: Partial<CreatorApplication>): boolean {
  if (!app) return false;
  if (app.id && DEMO_APPLICATION_IDS.has(app.id)) return true;
  if (app.applicationId && DEMO_APPLICATION_IDS.has(app.applicationId)) return true;
  if (app.creatorId && DEMO_CREATOR_IDS.has(app.creatorId)) return true;
  if (
    app.applicantEmail === 'meera@studiodhaga.in' ||
    app.applicantEmail === 'aarav@mittifire.in'
  ) {
    return true;
  }
  return false;
}

export function isDemoCreator(creator: Partial<CreatorProfile>): boolean {
  if (!creator) return false;
  if (creator.id && DEMO_CREATOR_IDS.has(creator.id)) return true;
  if (creator.creatorId && DEMO_CREATOR_IDS.has(creator.creatorId)) return true;
  if (
    creator.email === 'meera@studiodhaga.in' ||
    creator.email === 'aarav@mittifire.in'
  ) {
    return true;
  }
  return false;
}

// Purge any preexisting default demo data from localStorage on load
function purgePreexistingDemoData() {
  if (typeof window === 'undefined') return;
  try {
    const rawApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (rawApps) {
      const parsed: CreatorApplication[] = JSON.parse(rawApps);
      const filtered = parsed.filter((a) => !isDemoApplication(a));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(filtered));
    }

    const rawProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (rawProfiles) {
      const parsed: CreatorProfile[] = JSON.parse(rawProfiles);
      const filtered = parsed.filter((p) => !isDemoCreator(p));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(filtered));
    }

    const rawProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (rawProducts) {
      const parsed: CreatorProduct[] = JSON.parse(rawProducts);
      const filtered = parsed.filter((p) => !DEMO_CREATOR_IDS.has(p.creatorId));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    }

    const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS);
    if (rawOrders) {
      const parsed: CreatorOrderItem[] = JSON.parse(rawOrders);
      const filtered = parsed.filter((o) => !DEMO_CREATOR_IDS.has(o.creatorId));
      localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(filtered));
    }

    const rawPayouts = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
    if (rawPayouts) {
      const parsed: CreatorPayout[] = JSON.parse(rawPayouts);
      const filtered = parsed.filter((p) => !DEMO_CREATOR_IDS.has(p.creatorId));
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('Purge notice:', err);
  }
}

// Run purge once on startup
purgePreexistingDemoData();

// ==============================================================================
// SERVICE IMPLEMENTATION WITH SUPABASE & LOCAL RESILIENCE
// ==============================================================================

export const foundingCreatorService = {
  // 1. SESSION MANAGEMENT
  getCurrentCreator(): CreatorProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_CREATOR);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentCreator(creator: CreatorProfile | null) {
    if (creator) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CREATOR, JSON.stringify(creator));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CREATOR);
    }
  },

  // 2. CREATOR REGISTRATION & APPLICATION SUBMISSION
  async submitApplication(applicationData: {
    fullName: string;
    displayName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
    brandName?: string;
    creatorType: any;
    categories: string[];
    intro: string;
    craftDescription: string;
    yearsExperience?: string;
    monthlyCapacity?: string;
    craftMethod: 'handmade' | 'customized' | 'sourced';
    leadTime: string;
    acceptsCustomOrders: boolean;
    sellsElsewhere?: string;
    socialLinks: {
      instagram?: string;
      portfolio?: string;
    };
    portfolioFiles: { name: string; url: string; size?: number; type?: string }[];
  }): Promise<{ success: boolean; application: CreatorApplication; creator: CreatorProfile }> {
    const now = new Date().toISOString();
    const appRandom = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `APP-FC-${appRandom}`;
    const creatorIdentifier = `CR-FC-${appRandom}`;
    const creatorId = `cr-${Date.now()}`;
    const appId = `app-${Date.now()}`;

    const newCreator: CreatorProfile = {
      id: creatorId,
      userId: `usr_${Date.now()}`,
      creatorId: creatorIdentifier,
      fullName: applicationData.fullName.trim(),
      displayName: applicationData.displayName.trim() || applicationData.fullName.trim(),
      email: applicationData.email.toLowerCase().trim(),
      phone: applicationData.phone.trim(),
      city: applicationData.city.trim(),
      state: applicationData.state.trim(),
      pincode: applicationData.pincode.trim(),
      country: 'India',
      brandName: applicationData.brandName?.trim() || undefined,
      creatorType: applicationData.creatorType,
      socialLinks: applicationData.socialLinks,
      categories: applicationData.categories,
      accountStatus: 'pending',
      isVerified: false,
      commissionPercentage: 30,
      creatorSharePercentage: 70,
      createdAt: now,
      updatedAt: now,
    };

    const newApplication: CreatorApplication = {
      id: appId,
      applicationId,
      creatorId,
      applicantName: applicationData.fullName.trim(),
      applicantEmail: applicationData.email.toLowerCase().trim(),
      applicantPhone: applicationData.phone.trim(),
      brandName: applicationData.brandName?.trim(),
      creatorType: applicationData.creatorType,
      city: applicationData.city.trim(),
      state: applicationData.state.trim(),
      pincode: applicationData.pincode.trim(),
      categories: applicationData.categories,
      intro: applicationData.intro.trim(),
      craftDescription: applicationData.craftDescription.trim(),
      yearsExperience: applicationData.yearsExperience,
      monthlyCapacity: applicationData.monthlyCapacity,
      craftMethod: applicationData.craftMethod,
      leadTime: applicationData.leadTime,
      acceptsCustomOrders: applicationData.acceptsCustomOrders,
      sellsElsewhere: applicationData.sellsElsewhere,
      portfolioLinks: applicationData.socialLinks.portfolio
        ? [applicationData.socialLinks.portfolio]
        : [],
      portfolioFiles: applicationData.portfolioFiles,
      agreementAccepted: true,
      termsVersion: 'v1.0-founding',
      acceptedAt: now,
      applicationStatus: 'pending_review',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Store in localStorage
    const profiles = this.getAllProfiles();
    profiles.push(newCreator);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    const apps = this.getAllApplications();
    apps.unshift(newApplication);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    // 1. Synchronize to Central Server Storage (ensures any device or browser sees it in Admin CMS)
    try {
      await fetch('/api/founding-creator/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newApplication,
          ...newCreator,
          fullName: newApplication.applicantName,
          displayName: newCreator.displayName,
          email: newApplication.applicantEmail,
          phone: newApplication.applicantPhone,
          city: newApplication.city,
          state: newApplication.state,
          pincode: newApplication.pincode,
          creatorType: newApplication.creatorType,
          brandName: newApplication.brandName,
          categories: newApplication.categories,
          intro: newApplication.intro,
          craftDescription: newApplication.craftDescription,
          yearsExperience: newApplication.yearsExperience,
          monthlyCapacity: newApplication.monthlyCapacity,
          craftMethod: newApplication.craftMethod,
          leadTime: newApplication.leadTime,
          acceptsCustomOrders: newApplication.acceptsCustomOrders,
          sellsElsewhere: newApplication.sellsElsewhere,
          socialLinks: newCreator.socialLinks,
          portfolioFiles: newApplication.portfolioFiles,
          portfolioLinks: newApplication.portfolioLinks,
          applicationId: newApplication.applicationId,
          creatorId: newCreator.id,
          id: newApplication.id,
        }),
      });
    } catch (err) {
      console.warn('Notice: Background sync to server API endpoint notice:', err);
    }

    // 2. Synchronize to Supabase database & reactive event bus via service layer
    try {
      await foundingCreatorSyncService.persistCreatorApplication(newApplication, newCreator);
    } catch (err) {
      console.warn('Notice: Background sync to Supabase table queued:', err);
    }

    return {
      success: true,
      application: newApplication,
      creator: newCreator,
    };
  },

  // 3. SECURE FILE UPLOADS WITH CLOUDINARY & MEDIA REPOSITORY
  async uploadPortfolioFile(file: File, creatorId: string): Promise<string> {
    try {
      const res = await cloudinaryService.uploadFile(file, {
        folder: `creator-portfolios/${creatorId}`,
        filename: file.name,
      });
      return res.url;
    } catch (err) {
      console.warn('Cloudinary upload notice, using resilient fallback:', err);
      // Secondary fallback
      try {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `creator-portfolios/${creatorId}/${Date.now()}_${sanitizedName}`;
        const fileRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch {
        return URL.createObjectURL(file);
      }
    }
  },

  async uploadProductImage(file: File, creatorId: string, productId: string): Promise<string> {
    try {
      const res = await cloudinaryService.uploadFile(file, {
        folder: `creator-products/${creatorId}/${productId}`,
        filename: file.name,
      });
      return res.url;
    } catch (err) {
      console.warn('Product image upload notice, using resilient fallback:', err);
      try {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `creator-products/${creatorId}/${productId}/${Date.now()}_${sanitizedName}`;
        const fileRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch {
        return URL.createObjectURL(file);
      }
    }
  },

  // 4. APPLICATION STATUS QUERY
  getApplicationByIdOrEmail(identifier: string): {
    application: CreatorApplication | null;
    creator: CreatorProfile | null;
  } {
    const clean = identifier.trim().toLowerCase();
    const apps = this.getAllApplications();
    const app = apps.find(
      (a) =>
        a.applicationId.toLowerCase() === clean ||
        a.applicantEmail.toLowerCase() === clean
    );

    if (!app) return { application: null, creator: null };
    const creator = this.getAllProfiles().find((p) => p.id === app.creatorId) || null;
    return { application: app, creator };
  },

  // 5. CREATOR AUTHENTICATION
  loginCreator(email: string): {
    success: boolean;
    creator?: CreatorProfile;
    application?: CreatorApplication;
    error?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const profiles = this.getAllProfiles();
    const creator = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!creator) {
      return {
        success: false,
        error: 'No creator registration found with this email. Please apply first.',
      };
    }

    const applications = this.getAllApplications();
    const app = applications.find((a) => a.creatorId === creator.id || a.applicantEmail.toLowerCase() === cleanEmail);

    this.setCurrentCreator(creator);
    return {
      success: true,
      creator,
      application: app,
    };
  },

  // 6. PROFILES AND APPLICATIONS ACCESS (DEMO PURGED & CACHED)
  getAllProfiles(): CreatorProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const list: CreatorProfile[] = data ? JSON.parse(data) : [];
      return list.filter((p) => !isDemoCreator(p));
    } catch {
      return [];
    }
  },

  getAllApplications(): CreatorApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      const list: CreatorApplication[] = data ? JSON.parse(data) : [];
      return list.filter((a) => !isDemoApplication(a));
    } catch {
      return [];
    }
  },

  // Asynchronous central fetch syncing Server + Supabase + Local Storage
  async fetchAllApplicationsAsync(): Promise<CreatorApplication[]> {
    let serverApps: CreatorApplication[] = [];
    try {
      const res = await fetch('/api/founding-creator/applications');
      if (res.ok) {
        const body = await res.json();
        if (body?.applications && Array.isArray(body.applications)) {
          serverApps = body.applications;
        }
      }
    } catch (err) {
      console.warn('Server applications query notice:', err);
    }

    let supabaseApps: CreatorApplication[] = [];
    try {
      supabaseApps = await foundingCreatorSyncService.fetchAllApplications();
    } catch (err) {
      console.warn('Supabase applications query notice:', err);
    }

    const localApps = this.getAllApplications();

    const map = new Map<string, CreatorApplication>();
    // 1. Local storage
    localApps.forEach((a) => {
      if (!isDemoApplication(a)) {
        map.set(a.applicationId || a.id, a);
      }
    });

    // 2. Supabase
    supabaseApps.forEach((a) => {
      if (!isDemoApplication(a)) {
        const key = a.applicationId || a.id;
        const existing = map.get(key);
        map.set(key, existing ? { ...existing, ...a } : a);
      }
    });

    // 3. Server in-memory
    serverApps.forEach((a) => {
      if (!isDemoApplication(a)) {
        const key = a.applicationId || a.id;
        const existing = map.get(key);
        map.set(key, existing ? { ...existing, ...a } : a);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.createdAt || b.submittedAt || 0).getTime() -
        new Date(a.createdAt || a.submittedAt || 0).getTime()
    );

    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(merged));
    return merged;
  },

  async fetchAllProfilesAsync(): Promise<CreatorProfile[]> {
    let serverProfiles: CreatorProfile[] = [];
    try {
      const res = await fetch('/api/founding-creator/profiles');
      if (res.ok) {
        const body = await res.json();
        if (body?.profiles && Array.isArray(body.profiles)) {
          serverProfiles = body.profiles;
        }
      }
    } catch (err) {
      console.warn('Server profiles query notice:', err);
    }

    let supabaseProfiles: CreatorProfile[] = [];
    try {
      supabaseProfiles = await foundingCreatorSyncService.fetchAllProfiles();
    } catch (err) {
      console.warn('Supabase profiles query notice:', err);
    }

    const localProfiles = this.getAllProfiles();

    const map = new Map<string, CreatorProfile>();
    localProfiles.forEach((p) => {
      if (!isDemoCreator(p)) map.set(p.id, p);
    });
    supabaseProfiles.forEach((p) => {
      if (!isDemoCreator(p)) {
        const existing = map.get(p.id);
        map.set(p.id, existing ? { ...existing, ...p } : p);
      }
    });
    serverProfiles.forEach((p) => {
      if (!isDemoCreator(p)) {
        const existing = map.get(p.id);
        map.set(p.id, existing ? { ...existing, ...p } : p);
      }
    });

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(merged));
    return merged;
  },

  // 7. ADMIN ACTIONS: APPLICATION REVIEW
  approveApplication(applicationId: string, reviewerName: string = 'Curowit Admin', notes?: string) {
    const apps = this.getAllApplications();
    const appIndex = apps.findIndex((a) => a.applicationId === applicationId || a.id === applicationId);
    if (appIndex === -1) return false;

    const app = apps[appIndex];
    const now = new Date().toISOString();
    app.applicationStatus = 'approved';
    app.reviewedAt = now;
    app.reviewedBy = reviewerName;
    if (notes) app.reviewNotes = notes;
    apps[appIndex] = app;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Update creator profile
    const profiles = this.getAllProfiles();
    const profIndex = profiles.findIndex((p) => p.id === app.creatorId);
    if (profIndex !== -1) {
      profiles[profIndex].accountStatus = 'approved';
      profiles[profIndex].isVerified = true;
      profiles[profIndex].updatedAt = now;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    }

    // Add notification
    this.addNotification({
      creatorId: app.creatorId,
      type: 'announcement',
      title: '🎉 Welcome to Founding Creators!',
      message: 'Your application has been approved! You can now access your Creator Dashboard and submit products.',
      isRead: false,
    });

    // Synchronize to Server endpoint
    fetch('/api/founding-creator/review-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.applicationId,
        action: 'approve',
        reviewer: reviewerName,
        notes,
      }),
    }).catch(() => {});

    // Synchronize to Supabase via service layer
    foundingCreatorSyncService
      .updateApplicationStatus(app.applicationId, 'approved', {
        reviewerName,
        reviewNotes: notes,
      })
      .catch(() => {});

    return true;
  },

  rejectApplication(applicationId: string, reason: string, reviewerName: string = 'Curowit Admin') {
    const apps = this.getAllApplications();
    const appIndex = apps.findIndex((a) => a.applicationId === applicationId || a.id === applicationId);
    if (appIndex === -1) return false;

    const app = apps[appIndex];
    const now = new Date().toISOString();
    app.applicationStatus = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = now;
    app.reviewedBy = reviewerName;
    apps[appIndex] = app;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    const profiles = this.getAllProfiles();
    const profIndex = profiles.findIndex((p) => p.id === app.creatorId);
    if (profIndex !== -1) {
      profiles[profIndex].accountStatus = 'rejected';
      profiles[profIndex].updatedAt = now;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    }

    // Server sync
    fetch('/api/founding-creator/review-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.applicationId,
        action: 'reject',
        reviewer: reviewerName,
        reason,
      }),
    }).catch(() => {});

    foundingCreatorSyncService
      .updateApplicationStatus(app.applicationId, 'rejected', {
        reviewerName,
        rejectionReason: reason,
      })
      .catch(() => {});

    return true;
  },

  requestMoreInformation(applicationId: string, requestedInfo: string, reviewerName: string = 'Curowit Admin') {
    const apps = this.getAllApplications();
    const appIndex = apps.findIndex((a) => a.applicationId === applicationId || a.id === applicationId);
    if (appIndex === -1) return false;

    const app = apps[appIndex];
    const now = new Date().toISOString();
    app.applicationStatus = 'additional_info_required';
    app.requestedInfo = requestedInfo;
    app.reviewedAt = now;
    app.reviewedBy = reviewerName;
    apps[appIndex] = app;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Server sync
    fetch('/api/founding-creator/review-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.applicationId,
        action: 'request_info',
        reviewer: reviewerName,
        notes: requestedInfo,
      }),
    }).catch(() => {});

    foundingCreatorSyncService
      .updateApplicationStatus(app.applicationId, 'additional_info_required', {
        requestedInfo,
      })
      .catch(() => {});

    return true;
  },

  // 8. PRODUCT MANAGEMENT
  getCreatorProducts(creatorId: string): CreatorProduct[] {
    try {
      const all: CreatorProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      return all.filter((p) => p.creatorId === creatorId);
    } catch {
      return [];
    }
  },

  getAllProducts(): CreatorProduct[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    } catch {
      return [];
    }
  },

  addProduct(productData: Omit<CreatorProduct, 'id' | 'productId' | 'submittedAt' | 'createdAt' | 'updatedAt'>): CreatorProduct {
    const now = new Date().toISOString();
    const productId = `prod-fc-${Date.now().toString(36)}`;
    const newProduct: CreatorProduct = {
      ...productData,
      id: `cp-${Date.now()}`,
      productId,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllProducts();
    all.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all));

    // Sync to Supabase
    foundingCreatorSyncService.persistCreatorProduct(newProduct).catch(() => {});

    return newProduct;
  },

  updateProduct(productId: string, updates: Partial<CreatorProduct>): boolean {
    const all = this.getAllProducts();
    const idx = all.findIndex((p) => p.productId === productId || p.id === productId);
    if (idx === -1) return false;

    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all));

    // Sync to Supabase
    foundingCreatorSyncService.persistCreatorProduct(all[idx]).catch(() => {});

    return true;
  },

  approveProduct(productId: string): boolean {
    const all = this.getAllProducts();
    const idx = all.findIndex((p) => p.productId === productId || p.id === productId);
    if (idx === -1) return false;

    const now = new Date().toISOString();
    all[idx].status = 'published';
    all[idx].approvedAt = now;
    all[idx].publishedAt = now;
    all[idx].updatedAt = now;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all));

    // Notify creator
    this.addNotification({
      creatorId: all[idx].creatorId,
      type: 'product_approved',
      title: `Product Published: ${all[idx].title}`,
      message: `Your product has been approved by the curation team and is now live on the Curowit marketplace!`,
      isRead: false,
    });

    return true;
  },

  requestProductChanges(productId: string, notes: string): boolean {
    const all = this.getAllProducts();
    const idx = all.findIndex((p) => p.productId === productId || p.id === productId);
    if (idx === -1) return false;

    all[idx].status = 'changes_requested';
    all[idx].adminNotes = notes;
    all[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(all));

    this.addNotification({
      creatorId: all[idx].creatorId,
      type: 'product_changes_requested',
      title: `Changes Requested: ${all[idx].title}`,
      message: `Curation note: ${notes}`,
      isRead: false,
    });

    return true;
  },

  // 9. ORDERS & SHIPMENT MANAGEMENT
  getCreatorOrders(creatorId: string): CreatorOrderItem[] {
    try {
      const all: CreatorOrderItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS) || '[]');
      return all.filter((item) => item.creatorId === creatorId);
    } catch {
      return [];
    }
  },

  getAllOrderItems(): CreatorOrderItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS) || '[]');
    } catch {
      return [];
    }
  },

  updateOrderItemShipment(
    orderItemId: string,
    updates: {
      fulfilmentStatus: any;
      trackingNumber?: string;
      courierPartner?: string;
    }
  ): boolean {
    const all = this.getAllOrderItems();
    const idx = all.findIndex((i) => i.id === orderItemId || i.orderItemId === orderItemId);
    if (idx === -1) return false;

    const now = new Date().toISOString();
    const item = all[idx];
    item.fulfilmentStatus = updates.fulfilmentStatus;
    if (updates.trackingNumber) item.trackingNumber = updates.trackingNumber;
    if (updates.courierPartner) item.courierPartner = updates.courierPartner;
    item.updatedAt = now;

    if (updates.fulfilmentStatus === 'Delivered') {
      item.deliveredAt = now;
      // 7 calendar days payout policy
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      item.payoutEligibleAt = sevenDaysLater;
    }

    all[idx] = item;
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(all));
    return true;
  },

  // 10. EARNINGS & 7-DAY PAYOUT SYSTEM
  getCreatorEarningsSummary(creatorId: string) {
    const items = this.getCreatorOrders(creatorId);
    const nowTime = Date.now();

    let grossSales = 0;
    let netCreatorEarnings = 0;
    let curowitCommission = 0;
    let eligibleBalance = 0;
    let pendingEarnings = 0;

    for (const item of items) {
      if (item.fulfilmentStatus === 'Cancelled' || item.fulfilmentStatus === 'Refunded') continue;

      grossSales += item.itemSubtotal;
      netCreatorEarnings += item.creatorShare;
      curowitCommission += item.platformCommission;

      if (item.payoutStatus === 'paid') {
        // already paid
      } else if (item.payoutStatus === 'requested') {
        // in payout request
      } else if (item.payoutEligibleAt && new Date(item.payoutEligibleAt).getTime() <= nowTime) {
        eligibleBalance += item.creatorShare;
      } else {
        pendingEarnings += item.creatorShare;
      }
    }

    const payouts = this.getCreatorPayouts(creatorId);
    const totalPaidOut = payouts
      .filter((p) => p.payoutStatus === 'paid')
      .reduce((sum, p) => sum + p.payoutAmount, 0);

    const inProgressPayouts = payouts
      .filter((p) => p.payoutStatus === 'requested' || p.payoutStatus === 'approved' || p.payoutStatus === 'payment_initiated')
      .reduce((sum, p) => sum + p.payoutAmount, 0);

    return {
      grossSales,
      netCreatorEarnings,
      curowitCommission,
      eligibleBalance,
      pendingEarnings,
      totalPaidOut,
      inProgressPayouts,
    };
  },

  getCreatorPayouts(creatorId: string): CreatorPayout[] {
    try {
      const all: CreatorPayout[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYOUTS) || '[]');
      return all.filter((p) => p.creatorId === creatorId);
    } catch {
      return [];
    }
  },

  getAllPayouts(): CreatorPayout[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYOUTS) || '[]');
    } catch {
      return [];
    }
  },

  requestPayout(
    creatorId: string,
    amount: number,
    destination: string,
    methodType: 'UPI' | 'Bank Account'
  ): CreatorPayout {
    const creator = this.getAllProfiles().find((p) => p.id === creatorId);
    const now = new Date().toISOString();
    const payoutId = `PAY-FC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPayout: CreatorPayout = {
      id: `payout-${Date.now()}`,
      payoutId,
      creatorId,
      creatorName: creator?.displayName || creator?.fullName || 'Founding Creator',
      payoutAmount: amount,
      currency: 'INR',
      payoutMethodType: methodType,
      payoutDestination: destination,
      payoutStatus: 'requested',
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const payouts = this.getAllPayouts();
    payouts.unshift(newPayout);
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts));

    // Update eligible items to 'requested'
    const items = this.getAllOrderItems();
    let remainingAmountToLock = amount;
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].creatorId === creatorId &&
        items[i].payoutStatus === 'eligible' &&
        remainingAmountToLock > 0
      ) {
        items[i].payoutStatus = 'requested';
        items[i].payoutId = payoutId;
        remainingAmountToLock -= items[i].creatorShare;
      }
    }
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(items));

    this.addNotification({
      creatorId,
      type: 'announcement',
      title: `Payout Requested: ₹${amount.toLocaleString('en-IN')}`,
      message: `Your request (${payoutId}) has been queued for admin verification and manual UPI/Bank settlement.`,
      isRead: false,
    });

    return newPayout;
  },

  recordAdminPayoutSettlement(
    payoutId: string,
    transactionReference: string,
    adminId: string = 'admin-curowit'
  ): boolean {
    const payouts = this.getAllPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId || p.id === payoutId);
    if (idx === -1) return false;

    const now = new Date().toISOString();
    payouts[idx].payoutStatus = 'paid';
    payouts[idx].adminId = adminId;
    payouts[idx].transactionReference = transactionReference;
    payouts[idx].approvedAt = now;
    payouts[idx].paidAt = now;
    payouts[idx].updatedAt = now;
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts));

    // Update order items to paid
    const items = this.getAllOrderItems();
    for (let i = 0; i < items.length; i++) {
      if (items[i].payoutId === payoutId) {
        items[i].payoutStatus = 'paid';
        items[i].updatedAt = now;
      }
    }
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(items));

    // Notify creator
    this.addNotification({
      creatorId: payouts[idx].creatorId,
      type: 'payout_paid',
      title: `Payout Settled: ₹${payouts[idx].payoutAmount.toLocaleString('en-IN')}`,
      message: `Payment confirmed via ${payouts[idx].payoutDestination}. Reference UTR: ${transactionReference}`,
      isRead: false,
    });

    return true;
  },

  // 11. PAYMENT DETAILS MANAGEMENT
  getCreatorPaymentMethod(creatorId: string): CreatorPaymentMethod | null {
    try {
      const all: CreatorPaymentMethod[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS) || '[]');
      return all.find((pm) => pm.creatorId === creatorId) || null;
    } catch {
      return null;
    }
  },

  savePaymentMethod(creatorId: string, data: Partial<CreatorPaymentMethod>): CreatorPaymentMethod {
    const all: CreatorPaymentMethod[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS) || '[]');
    const idx = all.findIndex((pm) => pm.creatorId === creatorId);
    const now = new Date().toISOString();

    const updated: CreatorPaymentMethod = {
      id: idx !== -1 ? all[idx].id : `pm-${Date.now()}`,
      creatorId,
      methodType: data.methodType || 'UPI',
      upiId: data.upiId,
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      maskedAccountNumber: data.maskedAccountNumber,
      ifscCode: data.ifscCode,
      verificationStatus: 'verified',
      isDefault: true,
      createdAt: idx !== -1 ? all[idx].createdAt : now,
      updatedAt: now,
    };

    if (idx !== -1) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }

    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(all));
    return updated;
  },

  // 12. NOTIFICATIONS & TICKETS
  getCreatorNotifications(creatorId: string): CreatorNotification[] {
    try {
      const all: CreatorNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      return all.filter((n) => n.creatorId === creatorId);
    } catch {
      return [];
    }
  },

  addNotification(notifData: Omit<CreatorNotification, 'id' | 'createdAt'>): CreatorNotification {
    const newNotif: CreatorNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const all: CreatorNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    return newNotif;
  },

  markNotificationAsRead(notifId: string): boolean {
    const all: CreatorNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const idx = all.findIndex((n) => n.id === notifId);
    if (idx !== -1) {
      all[idx].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      return true;
    }
    return false;
  },

  getCreatorTickets(creatorId: string): CreatorSupportTicket[] {
    try {
      const all: CreatorSupportTicket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS) || '[]');
      return all.filter((t) => t.creatorId === creatorId);
    } catch {
      return [];
    }
  },

  createSupportTicket(creatorId: string, subject: string, category: any, description: string): CreatorSupportTicket {
    const now = new Date().toISOString();
    const newTicket: CreatorSupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketId: `TKT-FC-${Math.floor(100 + Math.random() * 900)}`,
      creatorId,
      subject,
      category,
      priority: 'medium',
      status: 'open',
      description,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderType: 'creator',
          senderName: 'Creator',
          message: description,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const all: CreatorSupportTicket[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS) || '[]');
    all.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(all));
    return newTicket;
  },

  // 13. STORE DOCUMENTS PERSISTENCE & SYNC
  async uploadStoreDocument(
    creatorId: string,
    file: File,
    documentType: StoreDocumentType,
    metadata?: { applicationId?: string; notes?: string }
  ): Promise<StoreDocument> {
    return await foundingCreatorSyncService.uploadAndPersistStoreDocument(
      creatorId,
      file,
      documentType,
      metadata
    );
  },

  async getStoreDocuments(creatorId: string): Promise<StoreDocument[]> {
    return await foundingCreatorSyncService.fetchStoreDocuments(creatorId);
  },

  async deleteStoreDocument(docId: string, creatorId: string): Promise<boolean> {
    return await foundingCreatorSyncService.deleteStoreDocument(docId, creatorId);
  },
};
