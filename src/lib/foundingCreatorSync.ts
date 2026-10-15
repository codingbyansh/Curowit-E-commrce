import { supabase } from '../supabase';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cloudinaryService } from '../services/cloudinaryService';
import {
  CreatorProfile,
  CreatorApplication,
  CreatorProduct,
  CreatorOrderItem,
  CreatorPayout,
  CreatorPaymentMethod,
  CreatorNotification,
  CreatorSupportTicket,
  ApplicationStatus,
  ProductStatus,
  FulfilmentStatus,
} from '../types/foundingCreator';

// ==============================================================================
// TYPES & INTERFACES FOR EXTENDED STORE DOCUMENTS & ONBOARDING REACTIVITY
// ==============================================================================

export type StoreDocumentType =
  | 'portfolio'
  | 'identity_proof'
  | 'craft_certificate'
  | 'business_license'
  | 'bank_proof'
  | 'product_catalog'
  | 'studio_photograph';

export interface StoreDocument {
  id: string;
  creatorId: string;
  applicationId?: string;
  documentType: StoreDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  notes?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface OnboardingStatus {
  creatorId: string;
  applicationId: string;
  currentStep: number;
  maxStepReached: number;
  isDraft: boolean;
  status: ApplicationStatus;
  checklist: {
    personalDetailsCompleted: boolean;
    businessDetailsCompleted: boolean;
    portfolioUploaded: boolean;
    craftAuthenticityDeclared: boolean;
    policiesAccepted: boolean;
    identityVerified: boolean;
  };
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  updatedAt: string;
}

export type SyncEventType =
  | 'PROFILE_UPDATED'
  | 'APPLICATION_UPDATED'
  | 'ONBOARDING_STATUS_CHANGED'
  | 'DOCUMENTS_UPDATED'
  | 'PRODUCTS_UPDATED'
  | 'ORDERS_UPDATED'
  | 'PAYOUTS_UPDATED'
  | 'NOTIFICATIONS_UPDATED';

type SyncListener = (event: SyncEventType, payload?: any) => void;

// Local storage backup keys to ensure full offline resilience
const LOCAL_KEYS = {
  DOCUMENTS: 'curowit_fc_store_documents_v1',
  ONBOARDING: 'curowit_fc_onboarding_v1',
  PROFILES: 'curowit_fc_profiles_v1',
  APPLICATIONS: 'curowit_fc_applications_v1',
  PRODUCTS: 'curowit_fc_products_v1',
  ORDER_ITEMS: 'curowit_fc_order_items_v1',
  PAYOUTS: 'curowit_fc_payouts_v1',
  PAYMENT_METHODS: 'curowit_fc_payment_methods_v1',
  NOTIFICATIONS: 'curowit_fc_notifications_v1',
  SUPPORT_TICKETS: 'curowit_fc_support_tickets_v1',
  SESSION: 'curowit_founding_creator_session',
};

// ==============================================================================
// REACTIVE SUBSCRIBERS BUS
// ==============================================================================

class CreatorSyncEventEmitter {
  private listeners: Set<SyncListener> = new Set();

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(event: SyncEventType, payload?: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch (err) {
        console.warn('Sync listener notification notice:', err);
      }
    });
  }
}

export const syncEventBus = new CreatorSyncEventEmitter();

// ==============================================================================
// SERVICE LAYER: SUPABASE PERSISTENCE & REACTIVE SYNCHRONIZATION
// ==============================================================================

class FoundingCreatorSyncService {
  private realtimeChannel: any = null;
  private isRealtimeInitialized = false;

  constructor() {
    this.initRealtimeSubscription();
  }

  /**
   * Initializes Supabase Realtime channel to listen for remote database changes
   * across creator applications, profiles, store documents, and inventory.
   */
  public initRealtimeSubscription() {
    if (this.isRealtimeInitialized || typeof window === 'undefined') return;

    try {
      this.realtimeChannel = supabase
        .channel('founding_creators_realtime_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'creator_applications' },
          (payload) => {
            this.handleRemoteApplicationChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'creator_profiles' },
          (payload) => {
            this.handleRemoteProfileChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_documents' },
          (payload) => {
            this.handleRemoteDocumentChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'creator_products' },
          (payload) => {
            this.handleRemoteProductChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'creator_onboarding' },
          (payload) => {
            this.handleRemoteOnboardingChange(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isRealtimeInitialized = true;
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription notice (safe local fallback active):', err);
    }
  }

  // Remote event dispatch handlers
  private handleRemoteApplicationChange(payload: any) {
    const apps = this.getLocalApplications();
    const newRecord = payload.new;
    if (!newRecord) return;

    const mapped: CreatorApplication = this.mapSupabaseRowToApplication(newRecord);
    const idx = apps.findIndex((a) => a.id === mapped.id || a.applicationId === mapped.applicationId);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...mapped };
    } else {
      apps.unshift(mapped);
    }
    localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(apps));
    syncEventBus.notify('APPLICATION_UPDATED', mapped);
  }

  private handleRemoteProfileChange(payload: any) {
    const profiles = this.getLocalProfiles();
    const newRecord = payload.new;
    if (!newRecord) return;

    const mapped: CreatorProfile = this.mapSupabaseRowToProfile(newRecord);
    const idx = profiles.findIndex((p) => p.id === mapped.id || p.creatorId === mapped.creatorId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...mapped };
    } else {
      profiles.unshift(mapped);
    }
    localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(profiles));
    syncEventBus.notify('PROFILE_UPDATED', mapped);
  }

  private handleRemoteDocumentChange(payload: any) {
    const docs = this.getLocalDocuments();
    const newRecord = payload.new;
    if (!newRecord) return;

    const mapped: StoreDocument = this.mapSupabaseRowToDocument(newRecord);
    const idx = docs.findIndex((d) => d.id === mapped.id);
    if (idx !== -1) {
      docs[idx] = mapped;
    } else {
      docs.unshift(mapped);
    }
    localStorage.setItem(LOCAL_KEYS.DOCUMENTS, JSON.stringify(docs));
    syncEventBus.notify('DOCUMENTS_UPDATED', mapped);
  }

  private handleRemoteProductChange(payload: any) {
    const products = this.getLocalProducts();
    const newRecord = payload.new;
    if (!newRecord) return;

    const mapped: CreatorProduct = this.mapSupabaseRowToProduct(newRecord);
    const idx = products.findIndex((p) => p.id === mapped.id || p.productId === mapped.productId);
    if (idx !== -1) {
      products[idx] = mapped;
    } else {
      products.unshift(mapped);
    }
    localStorage.setItem(LOCAL_KEYS.PRODUCTS, JSON.stringify(products));
    syncEventBus.notify('PRODUCTS_UPDATED', mapped);
  }

  private handleRemoteOnboardingChange(payload: any) {
    const newRecord = payload.new;
    if (!newRecord) return;
    const mapped = this.mapSupabaseRowToOnboarding(newRecord);
    const onboardings = this.getLocalOnboardings();
    onboardings[mapped.creatorId] = mapped;
    localStorage.setItem(LOCAL_KEYS.ONBOARDING, JSON.stringify(onboardings));
    syncEventBus.notify('ONBOARDING_STATUS_CHANGED', mapped);
  }

  // ============================================================================
  // 1. CREATOR PROFILE SYNCHRONIZATION
  // ============================================================================

  public async persistCreatorProfile(profile: CreatorProfile): Promise<CreatorProfile> {
    const now = new Date().toISOString();
    const updatedProfile = { ...profile, updatedAt: now };

    // 1. Immediately write to local storage cache for instant UI reactivity
    const profiles = this.getLocalProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id || p.creatorId === profile.creatorId);
    if (idx !== -1) {
      profiles[idx] = updatedProfile;
    } else {
      profiles.unshift(updatedProfile);
    }
    localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(profiles));

    // Update active session if it's the current creator
    const current = this.getCurrentCreator();
    if (current && (current.id === profile.id || current.creatorId === profile.creatorId)) {
      localStorage.setItem(LOCAL_KEYS.SESSION, JSON.stringify(updatedProfile));
    }

    // 2. Broadcast reactive change
    syncEventBus.notify('PROFILE_UPDATED', updatedProfile);

    // 3. Persist to Supabase 'creator_profiles'
    try {
      const payload = {
        id: updatedProfile.id,
        user_id: updatedProfile.userId,
        creator_id: updatedProfile.creatorId,
        full_name: updatedProfile.fullName,
        display_name: updatedProfile.displayName,
        email: updatedProfile.email.toLowerCase(),
        phone: updatedProfile.phone,
        city: updatedProfile.city,
        state: updatedProfile.state,
        pincode: updatedProfile.pincode,
        country: updatedProfile.country || 'India',
        brand_name: updatedProfile.brandName || null,
        bio: updatedProfile.bio || null,
        creator_type: updatedProfile.creatorType,
        avatar_url: updatedProfile.avatarUrl || null,
        social_links: updatedProfile.socialLinks || {},
        categories: updatedProfile.categories || [],
        account_status: updatedProfile.accountStatus,
        is_verified: updatedProfile.isVerified,
        commission_percentage: updatedProfile.commissionPercentage,
        creator_share_percentage: updatedProfile.creatorSharePercentage,
        created_at: updatedProfile.createdAt,
        updated_at: updatedProfile.updatedAt,
      };

      const { error } = await supabase
        .from('creator_profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase creator_profiles sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase creator_profiles exception (cached locally):', err);
    }

    return updatedProfile;
  }

  public async fetchCreatorProfile(identifier: string): Promise<CreatorProfile | null> {
    const clean = identifier.trim().toLowerCase();

    // Try remote Supabase query
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .or(`id.eq.${identifier},creator_id.eq.${identifier},email.ilike.${clean}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const mapped = this.mapSupabaseRowToProfile(data);
        // Cache locally
        this.cacheProfile(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase profile query notice:', err);
    }

    // Fallback to local storage
    const local = this.getLocalProfiles().find(
      (p) =>
        p.id.toLowerCase() === clean ||
        p.creatorId.toLowerCase() === clean ||
        p.email.toLowerCase() === clean
    );
    return local || null;
  }

  // ============================================================================
  // 2. CREATOR APPLICATION & ONBOARDING SYNCHRONIZATION
  // ============================================================================

  public async persistCreatorApplication(
    application: CreatorApplication,
    creatorProfile?: CreatorProfile
  ): Promise<{ application: CreatorApplication; creator: CreatorProfile }> {
    const now = new Date().toISOString();
    const appWithTimestamp = {
      ...application,
      updatedAt: now,
      submittedAt: application.submittedAt || now,
    };

    // 1. Local storage update
    const apps = this.getLocalApplications();
    const idx = apps.findIndex(
      (a) => a.id === application.id || a.applicationId === application.applicationId
    );
    if (idx !== -1) {
      apps[idx] = appWithTimestamp;
    } else {
      apps.unshift(appWithTimestamp);
    }
    localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Save profile if provided
    let finalProfile = creatorProfile;
    if (finalProfile) {
      finalProfile = await this.persistCreatorProfile(finalProfile);
    } else {
      const existing = this.getLocalProfiles().find((p) => p.id === application.creatorId);
      if (existing) finalProfile = existing;
    }

    // 2. Save Onboarding Status Record
    await this.updateOnboardingStatus({
      creatorId: application.creatorId,
      applicationId: application.applicationId,
      currentStep: 4,
      maxStepReached: 4,
      isDraft: false,
      status: application.applicationStatus,
      checklist: {
        personalDetailsCompleted: true,
        businessDetailsCompleted: true,
        portfolioUploaded: (application.portfolioFiles && application.portfolioFiles.length > 0) || false,
        craftAuthenticityDeclared: true,
        policiesAccepted: application.agreementAccepted,
        identityVerified: application.applicationStatus === 'approved',
      },
      submittedAt: application.submittedAt || now,
      updatedAt: now,
    });

    // 3. Persist linked store documents if portfolio files are attached
    if (application.portfolioFiles && application.portfolioFiles.length > 0) {
      for (const file of application.portfolioFiles) {
        await this.persistStoreDocument({
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          creatorId: application.creatorId,
          applicationId: application.applicationId,
          documentType: 'portfolio',
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          mimeType: file.type || 'image/jpeg',
          verificationStatus: 'pending',
          uploadedAt: now,
          updatedAt: now,
        });
      }
    }

    // 4. Notify reactive bus
    syncEventBus.notify('APPLICATION_UPDATED', appWithTimestamp);

    // 5. Persist to Supabase 'creator_applications'
    try {
      const payload = {
        id: appWithTimestamp.id,
        application_id: appWithTimestamp.applicationId,
        creator_id: appWithTimestamp.creatorId,
        applicant_name: appWithTimestamp.applicantName,
        applicant_email: appWithTimestamp.applicantEmail.toLowerCase(),
        applicant_phone: appWithTimestamp.applicantPhone,
        brand_name: appWithTimestamp.brandName || null,
        creator_type: appWithTimestamp.creatorType,
        city: appWithTimestamp.city,
        state: appWithTimestamp.state,
        pincode: appWithTimestamp.pincode,
        categories: appWithTimestamp.categories,
        intro: appWithTimestamp.intro || '',
        craft_description: appWithTimestamp.craftDescription || '',
        years_experience: appWithTimestamp.yearsExperience || null,
        monthly_capacity: appWithTimestamp.monthlyCapacity || null,
        craft_method: appWithTimestamp.craftMethod || 'handmade',
        lead_time: appWithTimestamp.leadTime || '3-5 business days',
        accepts_custom_orders: appWithTimestamp.acceptsCustomOrders,
        sells_elsewhere: appWithTimestamp.sellsElsewhere || null,
        portfolio_links: appWithTimestamp.portfolioLinks || [],
        portfolio_files: appWithTimestamp.portfolioFiles || [],
        agreement_accepted: appWithTimestamp.agreementAccepted,
        terms_version: appWithTimestamp.termsVersion || 'v1.0-founding',
        accepted_at: appWithTimestamp.acceptedAt || now,
        application_status: appWithTimestamp.applicationStatus,
        rejection_reason: appWithTimestamp.rejectionReason || null,
        reviewed_by: appWithTimestamp.reviewedBy || null,
        reviewed_at: appWithTimestamp.reviewedAt || null,
        review_notes: appWithTimestamp.reviewNotes || null,
        requested_info: appWithTimestamp.requestedInfo || null,
        submitted_at: appWithTimestamp.submittedAt,
        created_at: appWithTimestamp.createdAt,
        updated_at: appWithTimestamp.updatedAt,
      };

      const { error } = await supabase
        .from('creator_applications')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase creator_applications sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase creator_applications exception:', err);
    }

    return {
      application: appWithTimestamp,
      creator: finalProfile!,
    };
  }

  public async fetchCreatorApplication(identifier: string): Promise<CreatorApplication | null> {
    const clean = identifier.trim().toLowerCase();

    // Supabase query
    try {
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .or(`id.eq.${identifier},application_id.ilike.${clean},applicant_email.ilike.${clean}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const mapped = this.mapSupabaseRowToApplication(data);
        this.cacheApplication(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase application query notice:', err);
    }

    // Local fallback
    const local = this.getLocalApplications().find(
      (a) =>
        a.id.toLowerCase() === clean ||
        a.applicationId.toLowerCase() === clean ||
        a.applicantEmail.toLowerCase() === clean
    );
    return local || null;
  }

  public async fetchAllApplications(): Promise<CreatorApplication[]> {
    try {
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((row) => this.mapSupabaseRowToApplication(row));
      }
    } catch (err) {
      console.warn('Supabase fetchAllApplications notice:', err);
    }
    return [];
  }

  public async fetchAllProfiles(): Promise<CreatorProfile[]> {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((row) => this.mapSupabaseRowToProfile(row));
      }
    } catch (err) {
      console.warn('Supabase fetchAllProfiles notice:', err);
    }
    return [];
  }

  public async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    metadata?: {
      reviewerName?: string;
      reviewNotes?: string;
      rejectionReason?: string;
      requestedInfo?: string;
    }
  ): Promise<boolean> {
    const apps = this.getLocalApplications();
    const idx = apps.findIndex((a) => a.applicationId === applicationId || a.id === applicationId);
    if (idx === -1) return false;

    const now = new Date().toISOString();
    const updated = {
      ...apps[idx],
      applicationStatus: newStatus,
      reviewedAt: now,
      reviewedBy: metadata?.reviewerName || 'Curowit Admin',
      reviewNotes: metadata?.reviewNotes || apps[idx].reviewNotes,
      rejectionReason: metadata?.rejectionReason || apps[idx].rejectionReason,
      requestedInfo: metadata?.requestedInfo || apps[idx].requestedInfo,
      updatedAt: now,
    };
    apps[idx] = updated;
    localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Also update creator profile
    const profiles = this.getLocalProfiles();
    const profIdx = profiles.findIndex((p) => p.id === updated.creatorId);
    if (profIdx !== -1) {
      if (newStatus === 'approved') {
        profiles[profIdx].accountStatus = 'approved';
        profiles[profIdx].isVerified = true;
      } else if (newStatus === 'rejected') {
        profiles[profIdx].accountStatus = 'rejected';
      }
      profiles[profIdx].updatedAt = now;
      localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(profiles));
      syncEventBus.notify('PROFILE_UPDATED', profiles[profIdx]);

      // Sync profile to Supabase
      this.persistCreatorProfile(profiles[profIdx]).catch(() => {});
    }

    // Update onboarding status
    const currentOnboarding = await this.fetchOnboardingStatus(updated.creatorId);
    if (currentOnboarding) {
      currentOnboarding.status = newStatus;
      currentOnboarding.reviewedAt = now;
      currentOnboarding.reviewNotes = metadata?.reviewNotes;
      if (newStatus === 'approved') {
        currentOnboarding.checklist.identityVerified = true;
      }
      this.updateOnboardingStatus(currentOnboarding).catch(() => {});
    }

    syncEventBus.notify('APPLICATION_UPDATED', updated);
    syncEventBus.notify('ONBOARDING_STATUS_CHANGED', { creatorId: updated.creatorId, status: newStatus });

    // Sync to Supabase
    try {
      const { error } = await supabase
        .from('creator_applications')
        .update({
          application_status: newStatus,
          reviewed_by: updated.reviewedBy,
          reviewed_at: updated.reviewedAt,
          review_notes: updated.reviewNotes,
          rejection_reason: updated.rejectionReason,
          requested_info: updated.requestedInfo,
          updated_at: now,
        })
        .or(`id.eq.${applicationId},application_id.eq.${applicationId}`);

      if (error) {
        console.warn('Supabase application status update notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase status update exception:', err);
    }

    return true;
  }

  // ============================================================================
  // 3. ONBOARDING STATUS MANAGEMENT & PERSISTENCE
  // ============================================================================

  public async updateOnboardingStatus(status: OnboardingStatus): Promise<OnboardingStatus> {
    const onboardings = this.getLocalOnboardings();
    onboardings[status.creatorId] = status;
    localStorage.setItem(LOCAL_KEYS.ONBOARDING, JSON.stringify(onboardings));

    syncEventBus.notify('ONBOARDING_STATUS_CHANGED', status);

    // Sync to Supabase 'creator_onboarding'
    try {
      const payload = {
        creator_id: status.creatorId,
        application_id: status.applicationId,
        current_step: status.currentStep,
        max_step_reached: status.maxStepReached,
        is_draft: status.isDraft,
        status: status.status,
        checklist: status.checklist,
        submitted_at: status.submittedAt || null,
        reviewed_at: status.reviewedAt || null,
        review_notes: status.reviewNotes || null,
        updated_at: status.updatedAt,
      };

      const { error } = await supabase
        .from('creator_onboarding')
        .upsert(payload, { onConflict: 'creator_id' });

      if (error) {
        console.warn('Supabase creator_onboarding sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase creator_onboarding exception:', err);
    }

    return status;
  }

  public async fetchOnboardingStatus(creatorId: string): Promise<OnboardingStatus | null> {
    try {
      const { data, error } = await supabase
        .from('creator_onboarding')
        .select('*')
        .eq('creator_id', creatorId)
        .maybeSingle();

      if (!error && data) {
        const mapped = this.mapSupabaseRowToOnboarding(data);
        const local = this.getLocalOnboardings();
        local[creatorId] = mapped;
        localStorage.setItem(LOCAL_KEYS.ONBOARDING, JSON.stringify(local));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase onboarding query notice:', err);
    }

    const localMap = this.getLocalOnboardings();
    if (localMap[creatorId]) return localMap[creatorId];

    // Build default if application exists
    const app = this.getLocalApplications().find((a) => a.creatorId === creatorId);
    if (app) {
      const generated: OnboardingStatus = {
        creatorId,
        applicationId: app.applicationId,
        currentStep: 4,
        maxStepReached: 4,
        isDraft: false,
        status: app.applicationStatus,
        checklist: {
          personalDetailsCompleted: true,
          businessDetailsCompleted: true,
          portfolioUploaded: Boolean(app.portfolioFiles && app.portfolioFiles.length > 0),
          craftAuthenticityDeclared: true,
          policiesAccepted: app.agreementAccepted,
          identityVerified: app.applicationStatus === 'approved',
        },
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt,
        reviewNotes: app.reviewNotes,
        updatedAt: app.updatedAt,
      };
      return generated;
    }

    return null;
  }

  // ============================================================================
  // 4. STORE DOCUMENTS REPOSITORY & SYNCHRONIZATION
  // ============================================================================

  /**
   * Upload file to Firebase Storage & persist metadata record in Supabase 'store_documents'
   */
  public async uploadAndPersistStoreDocument(
    creatorId: string,
    file: File,
    documentType: StoreDocumentType,
    metadata?: { applicationId?: string; notes?: string }
  ): Promise<StoreDocument> {
    const now = new Date().toISOString();
    let downloadUrl = '';

    // 1. Upload file via Cloudinary / Server Media pipeline
    try {
      const res = await cloudinaryService.uploadFile(file, {
        folder: `creator-store-documents/${creatorId}`,
        filename: file.name,
      });
      downloadUrl = res.url;
    } catch (uploadErr) {
      console.warn('Document upload notice, using fallback:', uploadErr);
      try {
        const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `creator-store-documents/${creatorId}/${Date.now()}_${sanitized}`;
        const fileRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, file);
        downloadUrl = await getDownloadURL(snapshot.ref);
      } catch {
        downloadUrl = URL.createObjectURL(file);
      }
    }

    // 2. Build StoreDocument model
    const docRecord: StoreDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      creatorId,
      applicationId: metadata?.applicationId,
      documentType,
      fileName: file.name,
      fileUrl: downloadUrl,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      verificationStatus: 'pending',
      notes: metadata?.notes,
      uploadedAt: now,
      updatedAt: now,
    };

    // 3. Persist
    return await this.persistStoreDocument(docRecord);
  }

  public async persistStoreDocument(doc: StoreDocument): Promise<StoreDocument> {
    // Local persistence
    const docs = this.getLocalDocuments();
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx !== -1) {
      docs[idx] = doc;
    } else {
      docs.unshift(doc);
    }
    localStorage.setItem(LOCAL_KEYS.DOCUMENTS, JSON.stringify(docs));

    // Notify listeners
    syncEventBus.notify('DOCUMENTS_UPDATED', doc);

    // Sync to Supabase 'store_documents'
    try {
      const payload = {
        id: doc.id,
        creator_id: doc.creatorId,
        application_id: doc.applicationId || null,
        document_type: doc.documentType,
        file_name: doc.fileName,
        file_url: doc.fileUrl,
        file_size: doc.fileSize || 0,
        mime_type: doc.mimeType || 'application/octet-stream',
        verification_status: doc.verificationStatus,
        rejection_reason: doc.rejectionReason || null,
        notes: doc.notes || null,
        uploaded_at: doc.uploadedAt,
        updated_at: doc.updatedAt,
      };

      const { error } = await supabase
        .from('store_documents')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase store_documents sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase store_documents exception:', err);
    }

    return doc;
  }

  public async fetchStoreDocuments(creatorId: string): Promise<StoreDocument[]> {
    // Try Supabase fetch
    try {
      const { data, error } = await supabase
        .from('store_documents')
        .select('*')
        .eq('creator_id', creatorId)
        .order('uploaded_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((row) => this.mapSupabaseRowToDocument(row));
        // Merge into local cache
        const local = this.getLocalDocuments().filter((d) => d.creatorId !== creatorId);
        localStorage.setItem(LOCAL_KEYS.DOCUMENTS, JSON.stringify([...mapped, ...local]));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase store_documents fetch notice:', err);
    }

    // Local fallback
    return this.getLocalDocuments().filter((d) => d.creatorId === creatorId);
  }

  public async deleteStoreDocument(docId: string, creatorId: string): Promise<boolean> {
    const docs = this.getLocalDocuments().filter((d) => d.id !== docId);
    localStorage.setItem(LOCAL_KEYS.DOCUMENTS, JSON.stringify(docs));

    syncEventBus.notify('DOCUMENTS_UPDATED', { deletedId: docId, creatorId });

    try {
      await supabase.from('store_documents').delete().eq('id', docId);
    } catch (err) {
      console.warn('Supabase store_documents delete notice:', err);
    }

    return true;
  }

  // ============================================================================
  // 5. PRODUCT CATALOG SYNCHRONIZATION
  // ============================================================================

  public async persistCreatorProduct(product: CreatorProduct): Promise<CreatorProduct> {
    const now = new Date().toISOString();
    const updated = { ...product, updatedAt: now };

    const products = this.getLocalProducts();
    const idx = products.findIndex((p) => p.id === product.id || p.productId === product.productId);
    if (idx !== -1) {
      products[idx] = updated;
    } else {
      products.unshift(updated);
    }
    localStorage.setItem(LOCAL_KEYS.PRODUCTS, JSON.stringify(products));

    syncEventBus.notify('PRODUCTS_UPDATED', updated);

    // Sync to Supabase 'creator_products'
    try {
      const payload = {
        id: updated.id,
        product_id: updated.productId,
        creator_id: updated.creatorId,
        creator_name: updated.creatorName || 'Artisan',
        title: updated.title,
        description: updated.description,
        category: updated.category,
        price: updated.price,
        compare_at_price: updated.compareAtPrice || null,
        inventory_quantity: updated.inventoryQuantity || 0,
        sku: updated.sku || '',
        is_handmade: updated.isHandmade ?? true,
        is_customizable: updated.isCustomizable ?? false,
        preparation_days: updated.preparationDays || 3,
        shipping_weight_grams: updated.shippingWeightGrams || 250,
        return_policy: updated.returnPolicy || '7-day replacement',
        images: updated.images || [],
        status: updated.status,
        admin_notes: updated.adminNotes || null,
        submitted_at: updated.submittedAt,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      };

      const { error } = await supabase
        .from('creator_products')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase creator_products sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase creator_products exception:', err);
    }

    return updated;
  }

  public async fetchCreatorProducts(creatorId?: string): Promise<CreatorProduct[]> {
    try {
      let query = supabase.from('creator_products').select('*');
      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((r) => this.mapSupabaseRowToProduct(r));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase products fetch notice:', err);
    }

    const local = this.getLocalProducts();
    return creatorId ? local.filter((p) => p.creatorId === creatorId) : local;
  }

  // ============================================================================
  // 6. ORDER ITEMS & FULFILLMENT SYNCHRONIZATION
  // ============================================================================

  public async updateFulfilment(
    orderItemId: string,
    updates: {
      fulfilmentStatus: FulfilmentStatus;
      trackingNumber?: string;
      courierPartner?: string;
    }
  ): Promise<boolean> {
    const items = this.getLocalOrderItems();
    const idx = items.findIndex((i) => i.id === orderItemId || i.orderItemId === orderItemId);
    if (idx === -1) return false;

    const now = new Date().toISOString();
    const item = items[idx];
    item.fulfilmentStatus = updates.fulfilmentStatus;
    if (updates.trackingNumber) item.trackingNumber = updates.trackingNumber;
    if (updates.courierPartner) item.courierPartner = updates.courierPartner;
    item.updatedAt = now;

    if (updates.fulfilmentStatus === 'Delivered') {
      item.deliveredAt = now;
      item.payoutEligibleAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    items[idx] = item;
    localStorage.setItem(LOCAL_KEYS.ORDER_ITEMS, JSON.stringify(items));
    syncEventBus.notify('ORDERS_UPDATED', item);

    // Sync to Supabase 'creator_order_items'
    try {
      await supabase
        .from('creator_order_items')
        .update({
          fulfilment_status: item.fulfilmentStatus,
          tracking_number: item.trackingNumber || null,
          courier_partner: item.courierPartner || null,
          delivered_at: item.deliveredAt || null,
          payout_eligible_at: item.payoutEligibleAt || null,
          updated_at: now,
        })
        .or(`id.eq.${orderItemId},order_item_id.eq.${orderItemId}`);
    } catch (err) {
      console.warn('Supabase order items update notice:', err);
    }

    return true;
  }

  // ============================================================================
  // 7. COMPREHENSIVE BI-DIRECTIONAL SYNC TRIGGER
  // ============================================================================

  /**
   * Pulls remote Supabase state and reconciles with local store for reactive updates
   */
  public async syncAllData(): Promise<void> {
    try {
      const [profilesRes, appsRes, docsRes, prodsRes] = await Promise.allSettled([
        supabase.from('creator_profiles').select('*').limit(100),
        supabase.from('creator_applications').select('*').limit(100),
        supabase.from('store_documents').select('*').limit(200),
        supabase.from('creator_products').select('*').limit(200),
      ]);

      if (profilesRes.status === 'fulfilled' && profilesRes.value.data) {
        const remoteProfiles = profilesRes.value.data.map(this.mapSupabaseRowToProfile);
        if (remoteProfiles.length > 0) {
          const merged = this.mergeById(this.getLocalProfiles(), remoteProfiles);
          localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(merged));
          syncEventBus.notify('PROFILE_UPDATED');
        }
      }

      if (appsRes.status === 'fulfilled' && appsRes.value.data) {
        const remoteApps = appsRes.value.data.map(this.mapSupabaseRowToApplication);
        if (remoteApps.length > 0) {
          const merged = this.mergeById(this.getLocalApplications(), remoteApps);
          localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(merged));
          syncEventBus.notify('APPLICATION_UPDATED');
        }
      }

      if (docsRes.status === 'fulfilled' && docsRes.value.data) {
        const remoteDocs = docsRes.value.data.map(this.mapSupabaseRowToDocument);
        if (remoteDocs.length > 0) {
          const merged = this.mergeById(this.getLocalDocuments(), remoteDocs);
          localStorage.setItem(LOCAL_KEYS.DOCUMENTS, JSON.stringify(merged));
          syncEventBus.notify('DOCUMENTS_UPDATED');
        }
      }

      if (prodsRes.status === 'fulfilled' && prodsRes.value.data) {
        const remoteProds = prodsRes.value.data.map(this.mapSupabaseRowToProduct);
        if (remoteProds.length > 0) {
          const merged = this.mergeById(this.getLocalProducts(), remoteProds);
          localStorage.setItem(LOCAL_KEYS.PRODUCTS, JSON.stringify(merged));
          syncEventBus.notify('PRODUCTS_UPDATED');
        }
      }
    } catch (err) {
      console.warn('Sync all notice:', err);
    }
  }

  // ============================================================================
  // LOCAL STORAGE ACCESSORS & HELPERS
  // ============================================================================

  public getCurrentCreator(): CreatorProfile | null {
    try {
      const data = localStorage.getItem(LOCAL_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public getLocalProfiles(): CreatorProfile[] {
    try {
      const list: CreatorProfile[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.PROFILES) || '[]');
      return list.filter((p) => p.id !== 'cr-meera-sharma' && p.id !== 'cr-aarav-patel' && p.creatorId !== 'CR-FC-98421' && p.creatorId !== 'CR-FC-10543');
    } catch {
      return [];
    }
  }

  public getLocalApplications(): CreatorApplication[] {
    try {
      const list: CreatorApplication[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.APPLICATIONS) || '[]');
      return list.filter((a) => a.applicationId !== 'APP-FC-98421' && a.applicationId !== 'APP-FC-10543' && a.id !== 'app-meera-sharma' && a.id !== 'app-aarav-patel');
    } catch {
      return [];
    }
  }

  public getLocalDocuments(): StoreDocument[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.DOCUMENTS) || '[]');
    } catch {
      return [];
    }
  }

  public getLocalProducts(): CreatorProduct[] {
    try {
      const list: CreatorProduct[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.PRODUCTS) || '[]');
      return list.filter((p) => p.creatorId !== 'cr-meera-sharma' && p.creatorId !== 'cr-aarav-patel');
    } catch {
      return [];
    }
  }

  public getLocalOrderItems(): CreatorOrderItem[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.ORDER_ITEMS) || '[]');
    } catch {
      return [];
    }
  }

  public getLocalPayouts(): CreatorPayout[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.PAYOUTS) || '[]');
    } catch {
      return [];
    }
  }

  public getLocalPaymentMethods(): CreatorPaymentMethod[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.PAYMENT_METHODS) || '[]');
    } catch {
      return [];
    }
  }

  public getLocalNotifications(): CreatorNotification[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.NOTIFICATIONS) || '[]');
    } catch {
      return [];
    }
  }

  public getLocalTickets(): CreatorSupportTicket[] {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.SUPPORT_TICKETS) || '[]');
    } catch {
      return [];
    }
  }

  private getLocalOnboardings(): Record<string, OnboardingStatus> {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEYS.ONBOARDING) || '{}');
    } catch {
      return {};
    }
  }

  private cacheProfile(profile: CreatorProfile) {
    const list = this.getLocalProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx !== -1) list[idx] = profile;
    else list.unshift(profile);
    localStorage.setItem(LOCAL_KEYS.PROFILES, JSON.stringify(list));
  }

  private cacheApplication(app: CreatorApplication) {
    const list = this.getLocalApplications();
    const idx = list.findIndex((a) => a.id === app.id);
    if (idx !== -1) list[idx] = app;
    else list.unshift(app);
    localStorage.setItem(LOCAL_KEYS.APPLICATIONS, JSON.stringify(list));
  }

  private mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
    const map = new Map<string, T>();
    local.forEach((item) => map.set(item.id, item));
    remote.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }

  // Row mappers from Supabase snake_case to TypeScript camelCase
  public mapSupabaseRowToProfile(row: any): CreatorProfile {
    return {
      id: row.id,
      userId: row.user_id || `usr_${row.id}`,
      creatorId: row.creator_id || `CR-${row.id}`,
      fullName: row.full_name || '',
      displayName: row.display_name || row.full_name || '',
      email: row.email || '',
      phone: row.phone || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      country: row.country || 'India',
      brandName: row.brand_name || undefined,
      bio: row.bio || undefined,
      creatorType: row.creator_type || 'Individual',
      avatarUrl: row.avatar_url || undefined,
      socialLinks: row.social_links || {},
      categories: Array.isArray(row.categories) ? row.categories : [],
      accountStatus: row.account_status || 'pending',
      isVerified: Boolean(row.is_verified),
      commissionPercentage: Number(row.commission_percentage) || 30,
      creatorSharePercentage: Number(row.creator_share_percentage) || 70,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  public mapSupabaseRowToApplication(row: any): CreatorApplication {
    return {
      id: row.id,
      applicationId: row.application_id || `APP-${row.id}`,
      creatorId: row.creator_id || row.id,
      applicantName: row.applicant_name || '',
      applicantEmail: row.applicant_email || '',
      applicantPhone: row.applicant_phone || '',
      brandName: row.brand_name || undefined,
      creatorType: row.creator_type || 'Individual',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || '',
      categories: Array.isArray(row.categories) ? row.categories : [],
      intro: row.intro || '',
      craftDescription: row.craft_description || '',
      yearsExperience: row.years_experience || undefined,
      monthlyCapacity: row.monthly_capacity || undefined,
      craftMethod: row.craft_method || 'handmade',
      leadTime: row.lead_time || '3-5 business days',
      acceptsCustomOrders: Boolean(row.accepts_custom_orders),
      sellsElsewhere: row.sells_elsewhere || undefined,
      portfolioLinks: Array.isArray(row.portfolio_links) ? row.portfolio_links : [],
      portfolioFiles: Array.isArray(row.portfolio_files) ? row.portfolio_files : [],
      agreementAccepted: Boolean(row.agreement_accepted),
      termsVersion: row.terms_version || 'v1.0-founding',
      acceptedAt: row.accepted_at || row.created_at,
      applicationStatus: row.application_status || 'pending_review',
      rejectionReason: row.rejection_reason || undefined,
      reviewedBy: row.reviewed_by || undefined,
      reviewedAt: row.reviewed_at || undefined,
      reviewNotes: row.review_notes || undefined,
      requestedInfo: row.requested_info || undefined,
      submittedAt: row.submitted_at || row.created_at,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  public mapSupabaseRowToDocument(row: any): StoreDocument {
    return {
      id: row.id,
      creatorId: row.creator_id,
      applicationId: row.application_id || undefined,
      documentType: row.document_type || 'portfolio',
      fileName: row.file_name || 'Document',
      fileUrl: row.file_url || '',
      fileSize: Number(row.file_size) || 0,
      mimeType: row.mime_type || 'application/octet-stream',
      verificationStatus: row.verification_status || 'pending',
      rejectionReason: row.rejection_reason || undefined,
      notes: row.notes || undefined,
      uploadedAt: row.uploaded_at || row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  public mapSupabaseRowToProduct(row: any): CreatorProduct {
    return {
      id: row.id,
      productId: row.product_id || `prod-${row.id}`,
      creatorId: row.creator_id,
      creatorName: row.creator_name || 'Artisan',
      title: row.title || '',
      description: row.description || '',
      category: row.category || 'Handmade',
      price: Number(row.price) || 0,
      compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
      inventoryQuantity: Number(row.inventory_quantity || row.inventory) || 0,
      sku: row.sku || `SKU-${row.id.slice(0, 6)}`,
      isHandmade: row.is_handmade ?? true,
      isCustomizable: row.is_customizable ?? false,
      preparationDays: Number(row.preparation_days) || 3,
      shippingWeightGrams: Number(row.shipping_weight_grams) || 250,
      returnPolicy: row.return_policy || '7-day replacement',
      images: Array.isArray(row.images) ? row.images : [],
      status: row.status || 'submitted',
      adminNotes: row.admin_notes || undefined,
      submittedAt: row.submitted_at || row.created_at,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  private mapSupabaseRowToOnboarding(row: any): OnboardingStatus {
    return {
      creatorId: row.creator_id,
      applicationId: row.application_id,
      currentStep: Number(row.current_step) || 1,
      maxStepReached: Number(row.max_step_reached) || 1,
      isDraft: Boolean(row.is_draft),
      status: row.status || 'pending_review',
      checklist: row.checklist || {
        personalDetailsCompleted: true,
        businessDetailsCompleted: true,
        portfolioUploaded: true,
        craftAuthenticityDeclared: true,
        policiesAccepted: true,
        identityVerified: false,
      },
      submittedAt: row.submitted_at || undefined,
      reviewedAt: row.reviewed_at || undefined,
      reviewNotes: row.review_notes || undefined,
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }
}

export const foundingCreatorSyncService = new FoundingCreatorSyncService();
