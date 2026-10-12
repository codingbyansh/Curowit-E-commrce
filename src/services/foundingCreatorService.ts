import { supabase } from '../supabase';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { foundingCreatorSyncService, StoreDocument, StoreDocumentType } from '../lib/foundingCreatorSync';
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

// Seed initial realistic Founding Creators and data if not present
function initializeSeedData() {
  if (typeof window === 'undefined') return;

  const existingProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
  if (!existingProfiles) {
    const defaultCreator: CreatorProfile = {
      id: 'cr-meera-sharma',
      userId: 'usr_meera_01',
      creatorId: 'CR-FC-98421',
      fullName: 'Meera Sharma',
      displayName: 'Meera Sharma (Studio Dhaga)',
      email: 'meera@studiodhaga.in',
      phone: '+91 98201 44521',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      country: 'India',
      brandName: 'Studio Dhaga',
      bio: 'Slow craft textile artisan specializing in vegetable-dyed crochet heirloom pieces and miniature botanical plushies.',
      creatorType: 'Small Business',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/studiodhaga',
        portfolio: 'https://studiodhaga.in',
      },
      categories: ['Crochet & yarn crafts', 'Bags & accessories', 'Personalized gifts'],
      accountStatus: 'approved',
      isVerified: true,
      commissionPercentage: 30,
      creatorSharePercentage: 70,
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    };

    const pendingCreator: CreatorProfile = {
      id: 'cr-aarav-patel',
      userId: 'usr_aarav_02',
      creatorId: 'CR-FC-10543',
      fullName: 'Aarav Patel',
      displayName: 'Aarav Patel (Mitti & Fire)',
      email: 'aarav@mittifire.in',
      phone: '+91 97234 88123',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      country: 'India',
      brandName: 'Mitti & Fire Studio',
      bio: 'Third-generation studio potter crafting reduction-fired stoneware teaware and textured terracotta planters.',
      creatorType: 'Individual',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/mittifire_ceramics',
      },
      categories: ['Paintings & artwork', 'Candles & home decor', 'DIY kits & creative supplies'],
      accountStatus: 'pending',
      isVerified: false,
      commissionPercentage: 30,
      creatorSharePercentage: 70,
      createdAt: '2026-10-11T08:30:00Z',
      updatedAt: '2026-10-11T08:30:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([defaultCreator, pendingCreator]));

    // Seed applications
    const app1: CreatorApplication = {
      id: 'app-meera-sharma',
      applicationId: 'APP-FC-98421',
      creatorId: 'cr-meera-sharma',
      applicantName: 'Meera Sharma',
      applicantEmail: 'meera@studiodhaga.in',
      applicantPhone: '+91 98201 44521',
      brandName: 'Studio Dhaga',
      creatorType: 'Small Business',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      categories: ['Crochet & yarn crafts', 'Bags & accessories'],
      intro: 'Handmade textile atelier empowering 6 rural women crafters in Rajasthan.',
      craftDescription: 'Organic unbleached cotton and vegetable-dyed wool crochet pieces made without synthetic acrylics.',
      yearsExperience: '5+ years',
      monthlyCapacity: '120-150 pieces',
      craftMethod: 'handmade',
      leadTime: '3-5 business days',
      acceptsCustomOrders: true,
      sellsElsewhere: 'Instagram DM boutique & Dastkar Craft Mela',
      portfolioLinks: ['https://instagram.com/studiodhaga'],
      portfolioFiles: [
        {
          name: 'crochet_heirloom_collection.jpg',
          url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
        },
      ],
      agreementAccepted: true,
      termsVersion: 'v1.0-founding',
      acceptedAt: '2026-09-01T10:00:00Z',
      applicationStatus: 'approved',
      reviewNotes: 'Exceptional craft pedigree. Verified natural dye sourcing. Approved under Founding Creator 70/30 terms.',
      submittedAt: '2026-09-01T10:00:00Z',
      reviewedAt: '2026-09-02T14:20:00Z',
      reviewedBy: 'Curowit Curation Lead',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-02T14:20:00Z',
    };

    const app2: CreatorApplication = {
      id: 'app-aarav-patel',
      applicationId: 'APP-FC-10543',
      creatorId: 'cr-aarav-patel',
      applicantName: 'Aarav Patel',
      applicantEmail: 'aarav@mittifire.in',
      applicantPhone: '+91 97234 88123',
      brandName: 'Mitti & Fire Studio',
      creatorType: 'Individual',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      categories: ['Candles & home decor', 'Paintings & artwork'],
      intro: 'Wheel-thrown artisanal ceramics glazed with ash and iron oxides.',
      craftDescription: 'High-fire stoneware fired to 1250°C. Food-safe, microwave-safe, dishwasher-safe.',
      yearsExperience: '3 years',
      monthlyCapacity: '40-60 pieces',
      craftMethod: 'handmade',
      leadTime: '5-7 business days',
      acceptsCustomOrders: true,
      sellsElsewhere: 'Local Sunday pop-up stalls',
      portfolioLinks: ['https://instagram.com/mittifire_ceramics'],
      portfolioFiles: [
        {
          name: 'stoneware_tea_set.jpg',
          url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        },
      ],
      agreementAccepted: true,
      termsVersion: 'v1.0-founding',
      acceptedAt: '2026-10-11T08:30:00Z',
      applicationStatus: 'pending_review',
      reviewNotes: 'Pending studio video review and packaging test sample.',
      submittedAt: '2026-10-11T08:30:00Z',
      createdAt: '2026-10-11T08:30:00Z',
      updatedAt: '2026-10-11T08:30:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify([app1, app2]));

    // Seed products
    const prod1: CreatorProduct = {
      id: 'cp-heirloom-bunny',
      creatorId: 'cr-meera-sharma',
      creatorName: 'Meera Sharma',
      creatorBrand: 'Studio Dhaga',
      productId: 'prod-fc-crochet-bunny',
      title: 'Heirloom Organic Cotton Crochet Sleepy Bunny',
      description:
        'Lovingly handcrafted using 100% GOTS certified unbleached organic cotton yarn. Embroidered eyes with zero plastic beads, making it completely safe for newborns. Stuffed with hypoallergenic organic kapok fibers.',
      category: 'Crochet & yarn crafts',
      subcategory: 'Plushies & Toys',
      price: 1850,
      compareAtPrice: 2200,
      inventoryQuantity: 8,
      sku: 'DHG-BNY-01',
      dimensions: '28 cm height x 12 cm width',
      materials: 'GOTS Organic Cotton Yarn, Kapok Fiber Stuffing',
      isHandmade: true,
      isCustomizable: true,
      customizationOptions: 'Embroidered baby name initials on bunny ear (+₹200)',
      preparationDays: 3,
      shippingWeightGrams: 280,
      returnPolicy: '7-day replacement for transit damage',
      careInstructions: 'Gentle hand wash in lukewarm water with mild liquid soap. Air dry flat.',
      images: [
        {
          id: 'img-bunny-1',
          productId: 'prod-fc-crochet-bunny',
          storagePath: 'creator-products/cr-meera-sharma/prod-fc-crochet-bunny/front.jpg',
          publicUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
      status: 'published',
      submittedAt: '2026-09-05T12:00:00Z',
      approvedAt: '2026-09-06T15:00:00Z',
      publishedAt: '2026-09-06T15:00:00Z',
      createdAt: '2026-09-05T12:00:00Z',
      updatedAt: '2026-09-06T15:00:00Z',
    };

    const prod2: CreatorProduct = {
      id: 'cp-macrame-tote',
      creatorId: 'cr-meera-sharma',
      creatorName: 'Meera Sharma',
      creatorBrand: 'Studio Dhaga',
      productId: 'prod-fc-macrame-tote',
      title: 'Botanical Plant-Dyed Macrame Market Tote',
      description:
        'Sturdy knot-work market tote dyed with indigo and marigold petals. Reinforced wooden handle with inner natural canvas liner and brass magnetic closure.',
      category: 'Bags & accessories',
      subcategory: 'Handbags & Totes',
      price: 2450,
      compareAtPrice: 2900,
      inventoryQuantity: 5,
      sku: 'DHG-BAG-02',
      dimensions: '38 cm x 34 cm x 10 cm',
      materials: 'Natural Cotton Cord, Mango Wood, Brass Snaps',
      isHandmade: true,
      isCustomizable: false,
      preparationDays: 4,
      shippingWeightGrams: 450,
      returnPolicy: '7-day replacement for transit damage',
      careInstructions: 'Spot clean with damp cloth.',
      images: [
        {
          id: 'img-tote-1',
          productId: 'prod-fc-macrame-tote',
          storagePath: 'creator-products/cr-meera-sharma/prod-fc-macrame-tote/front.jpg',
          publicUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
      status: 'published',
      submittedAt: '2026-09-10T09:00:00Z',
      approvedAt: '2026-09-11T11:00:00Z',
      publishedAt: '2026-09-11T11:00:00Z',
      createdAt: '2026-09-10T09:00:00Z',
      updatedAt: '2026-09-11T11:00:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([prod1, prod2]));

    // Seed Order Items
    const orderItem1: CreatorOrderItem = {
      id: 'coi-1001',
      orderId: 'ORD-9421',
      orderItemId: 'item-01',
      creatorId: 'cr-meera-sharma',
      productId: 'prod-fc-crochet-bunny',
      productTitle: 'Heirloom Organic Cotton Crochet Sleepy Bunny',
      productImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
      itemPrice: 1850,
      itemSubtotal: 1850,
      commissionableBase: 1850,
      creatorShare: 1295, // 70% of 1850
      platformCommission: 555, // 30% of 1850
      fulfilmentStatus: 'Delivered',
      dispatchDeadline: '2026-09-24T18:00:00Z',
      customerCity: 'Bengaluru',
      customerPincode: '560038',
      deliveredAt: '2026-09-27T14:30:00Z',
      payoutEligibleAt: '2026-10-04T14:30:00Z', // 7 days after delivery
      payoutStatus: 'paid',
      payoutId: 'PAY-FC-00192',
      trackingNumber: 'DLV-9421-KA',
      courierPartner: 'Delhivery Surface Express',
      createdAt: '2026-09-20T10:15:00Z',
      updatedAt: '2026-10-05T16:00:00Z',
    };

    const orderItem2: CreatorOrderItem = {
      id: 'coi-1002',
      orderId: 'ORD-9856',
      orderItemId: 'item-02',
      creatorId: 'cr-meera-sharma',
      productId: 'prod-fc-macrame-tote',
      productTitle: 'Botanical Plant-Dyed Macrame Market Tote',
      productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      quantity: 1,
      itemPrice: 2450,
      itemSubtotal: 2450,
      commissionableBase: 2450,
      creatorShare: 1715, // 70% of 2450
      platformCommission: 735, // 30% of 2450
      fulfilmentStatus: 'Delivered',
      dispatchDeadline: '2026-10-02T18:00:00Z',
      customerCity: 'Mumbai',
      customerPincode: '400050',
      deliveredAt: '2026-10-04T16:00:00Z',
      payoutEligibleAt: '2026-10-11T16:00:00Z', // 7 days after delivery -> ELIGIBLE NOW!
      payoutStatus: 'eligible',
      trackingNumber: 'DLV-9856-MH',
      courierPartner: 'Delhivery Surface Express',
      createdAt: '2026-09-29T11:45:00Z',
      updatedAt: '2026-10-11T16:00:00Z',
    };

    const orderItem3: CreatorOrderItem = {
      id: 'coi-1003',
      orderId: 'ORD-10142',
      orderItemId: 'item-03',
      creatorId: 'cr-meera-sharma',
      productId: 'prod-fc-crochet-bunny',
      productTitle: 'Heirloom Organic Cotton Crochet Sleepy Bunny',
      productImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80',
      quantity: 2,
      itemPrice: 1850,
      itemSubtotal: 3700,
      commissionableBase: 3700,
      creatorShare: 2590, // 70% of 3700
      platformCommission: 1110, // 30% of 3700
      fulfilmentStatus: 'In Transit',
      dispatchDeadline: '2026-10-12T18:00:00Z',
      customerCity: 'Pune',
      customerPincode: '411004',
      payoutStatus: 'pending',
      trackingNumber: 'DLV-10142-PN',
      courierPartner: 'Delhivery Surface Express',
      createdAt: '2026-10-09T09:20:00Z',
      updatedAt: '2026-10-11T10:00:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify([orderItem1, orderItem2, orderItem3]));

    // Seed Payouts
    const payout1: CreatorPayout = {
      id: 'pay-001',
      payoutId: 'PAY-FC-00192',
      creatorId: 'cr-meera-sharma',
      creatorName: 'Meera Sharma',
      payoutAmount: 1295,
      currency: 'INR',
      payoutMethodType: 'UPI',
      payoutDestination: 'UPI: meera@okhdfcbank',
      payoutStatus: 'paid',
      adminId: 'admin-lead-curowit',
      transactionReference: 'UTR-HDFC-9948210385',
      requestedAt: '2026-10-04T15:00:00Z',
      approvedAt: '2026-10-05T10:00:00Z',
      paidAt: '2026-10-05T14:30:00Z',
      createdAt: '2026-10-04T15:00:00Z',
      updatedAt: '2026-10-05T14:30:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify([payout1]));

    // Seed Payment Methods
    const paymentMethod: CreatorPaymentMethod = {
      id: 'pm-meera-01',
      creatorId: 'cr-meera-sharma',
      methodType: 'UPI',
      upiId: 'meera@okhdfcbank',
      accountHolderName: 'Meera Sharma',
      bankName: 'HDFC Bank Ltd',
      maskedAccountNumber: '•••• •••• 4821',
      ifscCode: 'HDFC0001234',
      verificationStatus: 'verified',
      isDefault: true,
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify([paymentMethod]));

    // Seed Notifications
    const notifs: CreatorNotification[] = [
      {
        id: 'notif-1',
        creatorId: 'cr-meera-sharma',
        type: 'payout_eligible',
        title: 'Payout Balance Ready: ₹1,715',
        message: 'Order #ORD-9856 has surpassed the 7-day post-delivery inspection window and is now eligible for withdrawal.',
        isRead: false,
        createdAt: '2026-10-11T16:00:00Z',
      },
      {
        id: 'notif-2',
        creatorId: 'cr-meera-sharma',
        type: 'order_assigned',
        title: 'New Order Received: #ORD-10142',
        message: '2x Heirloom Organic Cotton Crochet Sleepy Bunny ordered. Please prepare eco-packaging by dispatch deadline.',
        isRead: true,
        createdAt: '2026-10-09T09:20:00Z',
      },
      {
        id: 'notif-3',
        creatorId: 'cr-meera-sharma',
        type: 'payout_paid',
        title: 'Payout Transferred: ₹1,295',
        message: 'Settlement for #ORD-9421 transferred via UPI to meera@okhdfcbank (Ref: UTR-HDFC-9948210385).',
        isRead: true,
        createdAt: '2026-10-05T14:30:00Z',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));

    // Seed Support Tickets
    const ticket1: CreatorSupportTicket = {
      id: 'tick-01',
      ticketId: 'TKT-FC-771',
      creatorId: 'cr-meera-sharma',
      subject: 'Custom packaging paper tape replenishment',
      category: 'shipping',
      priority: 'medium',
      status: 'resolved',
      description: 'We are running low on the branded water-activated craft paper tape for our next 20 boxes.',
      messages: [
        {
          id: 'msg-1',
          senderType: 'creator',
          senderName: 'Meera Sharma',
          message: 'Can the Curowit atelier courier an additional bundle of 50m paper tape to our Jaipur studio?',
          createdAt: '2026-10-01T11:00:00Z',
        },
        {
          id: 'msg-2',
          senderType: 'admin',
          senderName: 'Curowit Logistics Support',
          message: 'Shipped via Bluedart tracking BD-8821. Will arrive tomorrow before noon.',
          createdAt: '2026-10-01T15:30:00Z',
        },
      ],
      createdAt: '2026-10-01T11:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    };

    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify([ticket1]));
  }
}

// Call seed once on load
initializeSeedData();

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

    // Synchronize to Supabase database & reactive event bus via service layer
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

  // 3. FILE UPLOADS TO FIREBASE STORAGE
  async uploadPortfolioFile(file: File, creatorId: string): Promise<string> {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `creator-portfolios/${creatorId}/${Date.now()}_${sanitizedName}`;
      const fileRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload notice, falling back to local object preview:', err);
      return URL.createObjectURL(file);
    }
  },

  async uploadProductImage(file: File, creatorId: string, productId: string): Promise<string> {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `creator-products/${creatorId}/${productId}/${Date.now()}_${sanitizedName}`;
      const fileRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage product image upload notice, fallback used:', err);
      return URL.createObjectURL(file);
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

  // 6. PROFILES AND APPLICATIONS ACCESS
  getAllProfiles(): CreatorProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getAllApplications(): CreatorApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
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
    app.applicationStatus = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = reviewerName;
    apps[appIndex] = app;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    const profiles = this.getAllProfiles();
    const profIndex = profiles.findIndex((p) => p.id === app.creatorId);
    if (profIndex !== -1) {
      profiles[profIndex].accountStatus = 'rejected';
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    }

    foundingCreatorSyncService
      .updateApplicationStatus(app.applicationId, 'rejected', {
        reviewerName,
        rejectionReason: reason,
      })
      .catch(() => {});

    return true;
  },

  requestMoreInformation(applicationId: string, requestedInfo: string) {
    const apps = this.getAllApplications();
    const appIndex = apps.findIndex((a) => a.applicationId === applicationId || a.id === applicationId);
    if (appIndex === -1) return false;

    const app = apps[appIndex];
    app.applicationStatus = 'additional_info_required';
    app.requestedInfo = requestedInfo;
    apps[appIndex] = app;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

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
