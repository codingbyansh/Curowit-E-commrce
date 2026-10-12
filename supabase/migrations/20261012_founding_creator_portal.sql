-- ==============================================================================
-- CUROWIT FOUNDING CREATOR PORTAL — SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. CREATOR PROFILES
CREATE TABLE IF NOT EXISTS creator_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  creator_id VARCHAR(64) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  pincode VARCHAR(16) NOT NULL,
  country VARCHAR(64) DEFAULT 'India',
  brand_name VARCHAR(255),
  bio TEXT,
  creator_type VARCHAR(64) NOT NULL DEFAULT 'Individual', -- Individual, Student, Hobbyist, Small Business, Registered Business
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb, -- instagram, portfolio, youtube, twitter
  categories JSONB DEFAULT '[]'::jsonb,
  account_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, approved, suspended, rejected
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_email ON creator_profiles(email);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_status ON creator_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_creator_id ON creator_profiles(creator_id);

-- 2. CREATOR APPLICATIONS
CREATE TABLE IF NOT EXISTS creator_applications (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) UNIQUE NOT NULL,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(32) NOT NULL,
  brand_name VARCHAR(255),
  creator_type VARCHAR(64) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  pincode VARCHAR(16) NOT NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  intro TEXT,
  craft_description TEXT,
  years_experience VARCHAR(32),
  monthly_capacity VARCHAR(64),
  craft_method VARCHAR(64), -- handmade, customized, sourced
  lead_time VARCHAR(64),
  accepts_custom_orders BOOLEAN DEFAULT TRUE,
  sells_elsewhere VARCHAR(255),
  portfolio_links JSONB DEFAULT '[]'::jsonb,
  portfolio_files JSONB DEFAULT '[]'::jsonb,
  business_details JSONB DEFAULT '{}'::jsonb,
  application_status VARCHAR(32) NOT NULL DEFAULT 'pending_review', -- draft, pending_review, under_review, additional_info_required, approved, rejected, suspended
  review_notes TEXT,
  rejection_reason TEXT,
  requested_info TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_apps_status ON creator_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_creator_apps_email ON creator_applications(applicant_email);
CREATE INDEX IF NOT EXISTS idx_creator_apps_app_id ON creator_applications(application_id);

-- 3. CREATOR AGREEMENTS
CREATE TABLE IF NOT EXISTS creator_agreements (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  agreement_version VARCHAR(32) NOT NULL DEFAULT 'v1.0-founding',
  commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
  creator_share_percentage NUMERIC(5, 2) NOT NULL DEFAULT 70.00,
  payout_policy_version VARCHAR(32) NOT NULL DEFAULT '7-day-post-delivery',
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_or_audit_metadata JSONB DEFAULT '{}'::jsonb,
  agreement_status VARCHAR(32) NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_creator_agreements_creator ON creator_agreements(creator_id);

-- 4. CREATOR PRODUCTS
CREATE TABLE IF NOT EXISTS creator_products (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  product_id VARCHAR(64) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(128) NOT NULL,
  subcategory VARCHAR(128),
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2),
  inventory_quantity INTEGER NOT NULL DEFAULT 1,
  sku VARCHAR(64),
  dimensions VARCHAR(128),
  materials VARCHAR(255),
  is_handmade BOOLEAN DEFAULT TRUE,
  is_customizable BOOLEAN DEFAULT FALSE,
  customization_options TEXT,
  preparation_days INTEGER DEFAULT 3,
  shipping_weight_grams INTEGER DEFAULT 250,
  return_policy VARCHAR(64) DEFAULT '7-day replacement for transit damage',
  care_instructions TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted', -- draft, submitted, under_review, changes_requested, approved, published, rejected, archived, out_of_stock
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_products_creator ON creator_products(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_products_status ON creator_products(status);
CREATE INDEX IF NOT EXISTS idx_creator_products_sku ON creator_products(sku);

-- 5. CREATOR PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS creator_product_images (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) REFERENCES creator_products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_prod ON creator_product_images(product_id);

-- 6. CREATOR ORDER ITEMS
CREATE TABLE IF NOT EXISTS creator_order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  order_item_id VARCHAR(64) NOT NULL,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE RESTRICT,
  product_id VARCHAR(64) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  item_price NUMERIC(10, 2) NOT NULL,
  item_subtotal NUMERIC(10, 2) NOT NULL,
  commissionable_base NUMERIC(10, 2) NOT NULL,
  creator_share NUMERIC(10, 2) NOT NULL,       -- 70%
  platform_commission NUMERIC(10, 2) NOT NULL, -- 30%
  refund_amount NUMERIC(10, 2) DEFAULT 0.00,
  fulfilment_status VARCHAR(32) NOT NULL DEFAULT 'Accepted', -- Accepted, Preparing, Ready to Ship, Shipped, In Transit, Delivered, Cancelled, Return Requested, Returned
  dispatch_deadline TIMESTAMPTZ,
  customer_city VARCHAR(128),
  customer_pincode VARCHAR(16),
  delivered_at TIMESTAMPTZ,
  payout_eligible_at TIMESTAMPTZ,             -- 7 calendar days after delivery
  payout_status VARCHAR(32) DEFAULT 'pending', -- pending, eligible, requested, paid, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_order_items_creator ON creator_order_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_order_items_order ON creator_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_creator_order_items_payout ON creator_order_items(payout_status);

-- 7. CREATOR SHIPMENTS
CREATE TABLE IF NOT EXISTS creator_shipments (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  order_item_id VARCHAR(64) REFERENCES creator_order_items(id) ON DELETE CASCADE,
  order_id VARCHAR(64) NOT NULL,
  courier_name VARCHAR(128) NOT NULL DEFAULT 'Delhivery Eco Surface Logistics',
  tracking_number VARCHAR(128) NOT NULL,
  shipment_status VARCHAR(32) NOT NULL DEFAULT 'Shipped', -- Preparing, Ready to Ship, Shipped, In Transit, Delivered, Exception
  shipping_cost NUMERIC(10, 2) DEFAULT 0.00,
  shipping_receipt_url TEXT,
  dispatched_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  admin_override_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_shipments_tracking ON creator_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_creator_shipments_creator ON creator_shipments(creator_id);

-- 8. CREATOR PAYMENT METHODS
CREATE TABLE IF NOT EXISTS creator_payment_methods (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  method_type VARCHAR(32) NOT NULL DEFAULT 'UPI', -- UPI, Bank Account
  upi_id VARCHAR(128),
  account_holder_name VARCHAR(255),
  bank_name VARCHAR(128),
  masked_account_number VARCHAR(32),
  encrypted_account_number TEXT,
  ifsc_code VARCHAR(32),
  verification_status VARCHAR(32) DEFAULT 'verified',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_creator ON creator_payment_methods(creator_id);

-- 9. CREATOR EARNINGS LEDGER
CREATE TABLE IF NOT EXISTS creator_earnings_ledger (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  order_item_id VARCHAR(64),
  entry_type VARCHAR(32) NOT NULL, -- order_sale, commission_deduction, payout_transfer, refund_adjustment, bonus
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'INR',
  balance_after NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reference_id VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_ledger_creator ON creator_earnings_ledger(creator_id);

-- 10. CREATOR PAYOUTS
CREATE TABLE IF NOT EXISTS creator_payouts (
  id VARCHAR(64) PRIMARY KEY,
  payout_id VARCHAR(64) UNIQUE NOT NULL,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE RESTRICT,
  payout_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'INR',
  payout_method_id VARCHAR(64),
  payout_method_details JSONB DEFAULT '{}'::jsonb, -- method type, masked upi or bank
  payout_status VARCHAR(32) NOT NULL DEFAULT 'requested', -- requested, under_review, approved, payment_initiated, paid, rejected, failed
  admin_id VARCHAR(128),
  transaction_reference VARCHAR(128), -- UTR / Bank transfer reference
  payment_proof_url TEXT,
  failure_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON creator_payouts(payout_status);

-- 11. CREATOR NOTIFICATIONS
CREATE TABLE IF NOT EXISTS creator_notifications (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL, -- order_assigned, dispatch_reminder, product_approved, payout_eligible, payout_paid, support_update, announcement
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_creator ON creator_notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON creator_notifications(is_read);

-- 12. CREATOR SUPPORT TICKETS & MESSAGES
CREATE TABLE IF NOT EXISTS creator_support_tickets (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) UNIQUE NOT NULL,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL, -- application, products, orders, shipping, payouts, technical, other
  priority VARCHAR(32) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(32) DEFAULT 'open', -- open, in_progress, waiting_for_creator, resolved, closed
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_support_messages (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) REFERENCES creator_support_tickets(id) ON DELETE CASCADE,
  sender_type VARCHAR(32) NOT NULL, -- creator, admin
  sender_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS & ADMIN NOTES
CREATE TABLE IF NOT EXISTS creator_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  actor_role VARCHAR(32) NOT NULL, -- admin, creator, system
  target_entity VARCHAR(64) NOT NULL, -- creator, application, product, payout, shipment
  target_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL, -- approve_creator, reject_creator, approve_product, mark_paid, etc.
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_support_tickets ENABLE ROW LEVEL SECURITY;

-- Creators can read their own profile
CREATE POLICY "creators_read_own_profile" ON creator_profiles
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Creators can read and update their own application
CREATE POLICY "creators_read_own_app" ON creator_applications
  FOR SELECT USING (creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- Public can read published products
CREATE POLICY "public_read_published_products" ON creator_products
  FOR SELECT USING (status = 'published' OR creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- Creators can only read their own order items
CREATE POLICY "creators_read_own_order_items" ON creator_order_items
  FOR SELECT USING (creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- 14. STORE DOCUMENTS (KYC, GST, Bank Proof, Artisan Certificates)
CREATE TABLE IF NOT EXISTS creator_documents (
  id VARCHAR(64) PRIMARY KEY,
  creator_id VARCHAR(64) REFERENCES creator_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(64) NOT NULL, -- gstin, pan_card, identity_proof, bank_verification, craft_certificate, brand_trademark, agreement_signature, store_logo, other
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(128),
  verification_status VARCHAR(32) NOT NULL DEFAULT 'pending_verification', -- pending_verification, verified, rejected, draft
  rejection_reason TEXT,
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_creator_documents_creator ON creator_documents(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_documents_type ON creator_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_creator_documents_status ON creator_documents(verification_status);

ALTER TABLE creator_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators_read_own_documents" ON creator_documents
  FOR SELECT USING (creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

CREATE POLICY "creators_insert_own_documents" ON creator_documents
  FOR INSERT WITH CHECK (creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- 15. CREATOR ONBOARDING LIFECYCLE & STEPS
CREATE TABLE IF NOT EXISTS creator_onboarding (
  creator_id VARCHAR(64) PRIMARY KEY REFERENCES creator_profiles(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'not_started', -- not_started, in_progress, submitted, under_review, approved, active, suspended
  has_personal_details BOOLEAN DEFAULT FALSE,
  has_business_details BOOLEAN DEFAULT FALSE,
  has_portfolio_or_products BOOLEAN DEFAULT FALSE,
  has_signed_agreement BOOLEAN DEFAULT FALSE,
  has_store_documents BOOLEAN DEFAULT FALSE,
  has_payment_configured BOOLEAN DEFAULT FALSE,
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators_manage_own_onboarding" ON creator_onboarding
  FOR ALL USING (creator_id = (SELECT id FROM creator_profiles WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

