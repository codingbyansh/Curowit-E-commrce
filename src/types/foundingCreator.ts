export type CreatorType =
  | 'Individual'
  | 'Student'
  | 'Hobbyist'
  | 'Small Business'
  | 'Registered Business';

export type ApplicationStatus =
  | 'draft'
  | 'pending_review'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type ProductStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived'
  | 'out_of_stock';

export type FulfilmentStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Awaiting Creator Confirmation'
  | 'Accepted'
  | 'Preparing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded'
  | 'Delivery Exception';

export type PayoutStatus =
  | 'pending'
  | 'on_hold'
  | 'processing'
  | 'eligible'
  | 'requested'
  | 'approved'
  | 'payment_initiated'
  | 'paid'
  | 'failed'
  | 'reversed';

export interface CreatorSocialLinks {
  instagram?: string;
  portfolio?: string;
  youtube?: string;
  twitter?: string;
  etsy?: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  creatorId: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  brandName?: string;
  bio?: string;
  creatorType: CreatorType;
  avatarUrl?: string;
  socialLinks: CreatorSocialLinks;
  categories: string[];
  accountStatus: 'pending' | 'approved' | 'suspended' | 'rejected';
  isVerified: boolean;
  commissionPercentage: number; // default 30
  creatorSharePercentage: number; // default 70
  createdAt: string;
  updatedAt: string;
}

export interface CreatorApplication {
  id: string;
  applicationId: string;
  creatorId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  brandName?: string;
  creatorType: CreatorType;
  city: string;
  state: string;
  pincode: string;
  categories: string[];
  intro: string;
  craftDescription: string;
  yearsExperience?: string;
  monthlyCapacity?: string;
  craftMethod: 'handmade' | 'customized' | 'sourced';
  leadTime: string;
  acceptsCustomOrders: boolean;
  sellsElsewhere?: string;
  portfolioLinks: string[];
  portfolioFiles: {
    name: string;
    url: string;
    storagePath?: string;
    size?: number;
    type?: string;
  }[];
  businessDetails?: {
    gstin?: string;
    panOrArtisanId?: string;
    registrationType?: string;
  };
  agreementAccepted: boolean;
  termsVersion: string;
  acceptedAt: string;
  applicationStatus: ApplicationStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  requestedInfo?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProductImage {
  id: string;
  productId: string;
  storagePath: string;
  publicUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CreatorProduct {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorBrand?: string;
  productId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number; // INR
  compareAtPrice?: number;
  inventoryQuantity: number;
  sku: string;
  dimensions?: string;
  materials?: string;
  isHandmade: boolean;
  isCustomizable: boolean;
  customizationOptions?: string;
  preparationDays: number;
  shippingWeightGrams: number;
  returnPolicy: string;
  careInstructions?: string;
  images: CreatorProductImage[];
  status: ProductStatus;
  adminNotes?: string;
  submittedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorOrderItem {
  id: string;
  orderId: string;
  orderItemId: string;
  creatorId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  itemPrice: number;
  itemSubtotal: number;
  commissionableBase: number;
  creatorShare: number; // 70%
  platformCommission: number; // 30%
  refundAmount?: number;
  fulfilmentStatus: FulfilmentStatus;
  dispatchDeadline: string;
  customerCity?: string;
  customerPincode?: string;
  deliveredAt?: string;
  payoutEligibleAt?: string; // 7 calendar days after delivery
  payoutStatus: PayoutStatus;
  payoutId?: string;
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorShipment {
  id: string;
  creatorId: string;
  orderItemId: string;
  orderId: string;
  courierName: string;
  trackingNumber: string;
  shipmentStatus: string;
  shippingCost?: number;
  shippingReceiptUrl?: string;
  dispatchedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  adminOverrideNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorPaymentMethod {
  id: string;
  creatorId: string;
  methodType: 'UPI' | 'Bank Account';
  upiId?: string;
  accountHolderName?: string;
  bankName?: string;
  maskedAccountNumber?: string;
  ifscCode?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorEarningsLedgerEntry {
  id: string;
  creatorId: string;
  orderItemId?: string;
  entryType: 'order_sale' | 'commission_deduction' | 'payout_transfer' | 'refund_adjustment' | 'bonus';
  amount: number;
  currency: 'INR';
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface CreatorPayout {
  id: string;
  payoutId: string;
  creatorId: string;
  creatorName: string;
  payoutAmount: number;
  currency: 'INR';
  payoutMethodId?: string;
  payoutMethodType: 'UPI' | 'Bank Account';
  payoutDestination: string; // e.g. "UPI: creator@okaxis" or "Bank: HDFC Bank ••••4821"
  payoutStatus: PayoutStatus;
  adminId?: string;
  transactionReference?: string; // UTR / IMPS reference
  paymentProofUrl?: string;
  failureReason?: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorNotification {
  id: string;
  creatorId: string;
  type:
    | 'order_assigned'
    | 'dispatch_reminder'
    | 'product_approved'
    | 'product_changes_requested'
    | 'payout_eligible'
    | 'payout_paid'
    | 'support_update'
    | 'announcement';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreatorSupportTicket {
  id: string;
  ticketId: string;
  creatorId: string;
  creatorName?: string;
  creatorEmail?: string;
  subject: string;
  category: 'application' | 'products' | 'orders' | 'shipping' | 'payouts' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_creator' | 'resolved' | 'closed';
  description: string;
  messages: {
    id: string;
    senderType: 'creator' | 'admin';
    senderName: string;
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'gstin'
  | 'pan_card'
  | 'identity_proof'
  | 'bank_verification'
  | 'craft_certificate'
  | 'brand_trademark'
  | 'agreement_signature'
  | 'store_logo'
  | 'other';

export type DocumentVerificationStatus =
  | 'verified'
  | 'pending_verification'
  | 'rejected'
  | 'draft';

export interface CreatorStoreDocument {
  id: string;
  creatorId: string;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  storagePath?: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export type OnboardingStepNumber = 1 | 2 | 3 | 4 | 5;
export type OnboardingLifecycleStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'active'
  | 'suspended';

export interface CreatorOnboardingProgress {
  creatorId: string;
  applicationId?: string;
  currentStep: OnboardingStepNumber;
  completedSteps: OnboardingStepNumber[];
  status: OnboardingLifecycleStatus;
  hasPersonalDetails: boolean;
  hasBusinessDetails: boolean;
  hasPortfolioOrProducts: boolean;
  hasSignedAgreement: boolean;
  hasStoreDocuments: boolean;
  hasPaymentConfigured: boolean;
  notes?: string;
  lastUpdated: string;
}

export interface FoundingCreatorSyncState {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
}

