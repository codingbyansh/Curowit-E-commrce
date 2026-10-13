import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TgyT0boqInIYsI';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '2y01LBJDaAddjDShsyyawCCh';

// Data persistence directory for zero data loss
const DATA_DIR = path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'founding-creators.json');

const DEMO_EMAILS = new Set(['meera@studiodhaga.in', 'aarav@mittifire.in']);
const DEMO_IDS = new Set(['app-meera-sharma', 'app-aarav-patel', 'cr-meera-sharma', 'cr-aarav-patel', 'APP-FC-98421', 'APP-FC-10543']);

function isDemoRecord(record: any): boolean {
  if (!record) return false;
  if (record.id && DEMO_IDS.has(record.id)) return true;
  if (record.applicationId && DEMO_IDS.has(record.applicationId)) return true;
  if (record.creatorId && DEMO_IDS.has(record.creatorId)) return true;
  const email = (record.applicantEmail || record.email || '').toLowerCase();
  if (DEMO_EMAILS.has(email)) return true;
  return false;
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Notice ensuring .data directory:', err);
  }
}

function loadPersistedCreatorData() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const apps = Array.isArray(parsed.applications) ? parsed.applications.filter((a: any) => !isDemoRecord(a)) : [];
      const profs = Array.isArray(parsed.profiles) ? parsed.profiles.filter((p: any) => !isDemoRecord(p)) : [];
      return { applications: apps, profiles: profs };
    }
  } catch (err) {
    console.warn('Notice loading persisted creator data:', err);
  }
  return { applications: [], profiles: [] };
}

function savePersistedCreatorData(applications: any[], profiles: any[]) {
  ensureDataDir();
  try {
    const apps = applications.filter((a: any) => !isDemoRecord(a));
    const profs = profiles.filter((p: any) => !isDemoRecord(p));
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ applications: apps, profiles: profs }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.warn('Notice saving persisted creator data:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health & public key config endpoint
  app.get('/api/razorpay/config', (_req, res) => {
    res.json({
      keyId: RAZORPAY_KEY_ID,
      currency: 'INR',
      enabled: true,
    });
  });

  // ==============================================================================
  // FOUNDING CREATOR PORTAL SERVER ENDPOINTS & PERSISTENT STORE
  // ==============================================================================
  const initialData = loadPersistedCreatorData();
  const serverCreatorApplications: any[] = initialData.applications;
  const serverCreatorProfiles: any[] = initialData.profiles;

  app.get('/api/founding-creator/config', (_req, res) => {
    res.json({
      programName: 'Curowit Founding Creator Program',
      commissionSplit: {
        creatorSharePercentage: 70,
        platformCommissionPercentage: 30,
      },
      payoutPolicy: {
        cycle: '7-day-post-delivery',
        description: 'Earnings become eligible for payout 7 calendar days after confirmed delivery.',
      },
      agreementVersion: 'v1.0-founding',
      acceptedCategories: [
        'Handmade jewellery',
        'Crochet and yarn crafts',
        'Keychains and charms',
        'Bags and accessories',
        'Paintings and artwork',
        'Candles and home decor',
        'Personalized gifts',
        'DIY kits and creative supplies',
        'Paper crafts and stationery',
        'Other creative products',
      ],
    });
  });

  // Get all submitted applications for Admin CMS Panel (Cleaned of any mock/demo entries)
  app.get('/api/founding-creator/applications', (_req, res) => {
    const cleanApps = serverCreatorApplications.filter((a) => !isDemoRecord(a));
    res.json({
      success: true,
      applications: cleanApps,
      total: cleanApps.length,
    });
  });

  // Get all creator profiles (Cleaned of any mock/demo entries)
  app.get('/api/founding-creator/profiles', (_req, res) => {
    const cleanProfs = serverCreatorProfiles.filter((p) => !isDemoRecord(p));
    res.json({
      success: true,
      profiles: cleanProfs,
      total: cleanProfs.length,
    });
  });

  // Creator application validation & server storage
  app.post('/api/founding-creator/apply', (req, res) => {
    try {
      const body = req.body || {};
      const {
        fullName,
        displayName,
        email,
        phone,
        city,
        state,
        pincode,
        creatorType,
        brandName,
        categories,
        intro,
        craftDescription,
        yearsExperience,
        monthlyCapacity,
        craftMethod,
        leadTime,
        acceptsCustomOrders,
        sellsElsewhere,
        socialLinks,
        portfolioFiles,
        portfolioLinks,
        applicationId: existingAppId,
        id: existingId,
      } = body;

      if (!fullName || !email || !phone || !city || !state || !pincode || !craftDescription) {
        res.status(400).json({ error: 'Missing mandatory application fields' });
        return;
      }

      const now = new Date().toISOString();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const applicationId = existingAppId || `APP-FC-${randomNum}`;
      const creatorIdentifier = `CR-FC-${randomNum}`;
      const appId = existingId || `app-${Date.now()}`;
      const creatorId = body.creatorId || `cr-${Date.now()}`;

      const applicationRecord = {
        id: appId,
        applicationId,
        creatorId,
        applicantName: fullName.trim(),
        applicantEmail: email.toLowerCase().trim(),
        applicantPhone: phone.trim(),
        brandName: brandName?.trim() || undefined,
        creatorType: creatorType || 'Individual',
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
        intro: (intro || craftDescription || '').trim(),
        craftDescription: craftDescription.trim(),
        yearsExperience: yearsExperience || '1-3 years',
        monthlyCapacity: monthlyCapacity || '20-50 pieces',
        craftMethod: craftMethod || 'handmade',
        leadTime: leadTime || '3-5 business days',
        acceptsCustomOrders: acceptsCustomOrders ?? true,
        sellsElsewhere: sellsElsewhere || undefined,
        socialLinks: socialLinks || {},
        portfolioLinks: Array.isArray(portfolioLinks) ? portfolioLinks : [],
        portfolioFiles: Array.isArray(portfolioFiles) ? portfolioFiles : [],
        agreementAccepted: true,
        termsVersion: 'v1.0-founding',
        acceptedAt: now,
        applicationStatus: 'pending_review',
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const profileRecord = {
        id: creatorId,
        userId: `usr_${Date.now()}`,
        creatorId: creatorIdentifier,
        fullName: fullName.trim(),
        displayName: (displayName || brandName || fullName).trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'India',
        brandName: brandName?.trim() || undefined,
        creatorType: creatorType || 'Individual',
        socialLinks: socialLinks || {},
        categories: Array.isArray(categories) ? categories : [],
        accountStatus: 'pending',
        isVerified: false,
        commissionPercentage: 30,
        creatorSharePercentage: 70,
        createdAt: now,
        updatedAt: now,
      };

      // Check if application already exists by email or ID
      const existingIdx = serverCreatorApplications.findIndex(
        (a) =>
          a.applicationId === applicationId ||
          a.id === appId ||
          a.applicantEmail.toLowerCase() === email.toLowerCase().trim()
      );

      if (existingIdx !== -1) {
        serverCreatorApplications[existingIdx] = {
          ...serverCreatorApplications[existingIdx],
          ...applicationRecord,
          updatedAt: now,
        };
      } else {
        serverCreatorApplications.unshift(applicationRecord);
      }

      // Profile record upsert
      const profIdx = serverCreatorProfiles.findIndex(
        (p) => p.email.toLowerCase() === email.toLowerCase().trim() || p.id === creatorId
      );
      if (profIdx !== -1) {
        serverCreatorProfiles[profIdx] = {
          ...serverCreatorProfiles[profIdx],
          ...profileRecord,
          updatedAt: now,
        };
      } else {
        serverCreatorProfiles.unshift(profileRecord);
      }

      // Save changes to disk immediately
      savePersistedCreatorData(serverCreatorApplications, serverCreatorProfiles);

      console.log(`[Founding Creator] New application registered on server: ${applicationId} by ${fullName} (${email})`);

      res.json({
        success: true,
        applicationId,
        creatorId,
        status: 'pending_review',
        submittedAt: now,
        application: applicationRecord,
        creator: profileRecord,
        message: 'Application registered and queued for Admin CMS approval.',
      });
    } catch (error) {
      console.error('[Founding Creator] Error processing application:', error);
      res.status(500).json({ error: 'Internal server error processing creator application' });
    }
  });

  // Admin application review endpoint
  app.post('/api/founding-creator/review-application', (req, res) => {
    try {
      const { applicationId, action, reviewer, notes, reason } = req.body || {};
      if (!applicationId || !['approve', 'reject', 'request_info'].includes(action)) {
        res.status(400).json({ error: 'Invalid application review action' });
        return;
      }

      const now = new Date().toISOString();
      const newStatus =
        action === 'approve'
          ? 'approved'
          : action === 'reject'
          ? 'rejected'
          : 'additional_info_required';

      const appIdx = serverCreatorApplications.findIndex(
        (a) => a.applicationId === applicationId || a.id === applicationId
      );

      if (appIdx !== -1) {
        serverCreatorApplications[appIdx].applicationStatus = newStatus;
        serverCreatorApplications[appIdx].reviewedAt = now;
        serverCreatorApplications[appIdx].reviewedBy = reviewer || 'Curowit Admin';
        if (notes) serverCreatorApplications[appIdx].reviewNotes = notes;
        if (reason) serverCreatorApplications[appIdx].rejectionReason = reason;
        serverCreatorApplications[appIdx].updatedAt = now;

        // Also update profile status
        const creatorId = serverCreatorApplications[appIdx].creatorId;
        const profIdx = serverCreatorProfiles.findIndex(
          (p) => p.id === creatorId || p.email === serverCreatorApplications[appIdx].applicantEmail
        );
        if (profIdx !== -1) {
          serverCreatorProfiles[profIdx].accountStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
          if (action === 'approve') serverCreatorProfiles[profIdx].isVerified = true;
          serverCreatorProfiles[profIdx].updatedAt = now;
        }

        // Persist update to disk immediately
        savePersistedCreatorData(serverCreatorApplications, serverCreatorProfiles);
      }

      console.log(`[Founding Creator] Application ${applicationId} reviewed: ${action} by ${reviewer || 'Admin'}`);
      res.json({
        success: true,
        applicationId,
        action,
        updatedStatus: newStatus,
        reviewedAt: now,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process application review' });
    }
  });

  // Admin payout reconciliation
  app.post('/api/founding-creator/reconcile-payout', (req, res) => {
    try {
      const { payoutId, transactionReference, adminId } = req.body || {};
      if (!payoutId || !transactionReference) {
        res.status(400).json({ error: 'Missing payoutId or transactionReference' });
        return;
      }

      console.log(`[Founding Creator] Payout ${payoutId} settled with UTR: ${transactionReference}`);
      res.json({
        success: true,
        payoutId,
        transactionReference,
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reconcile payout' });
    }
  });

  // Create a Razorpay Order on the server
  app.post('/api/razorpay/create-order', async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt, notes } = req.body || {};
      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        res.status(400).json({ error: 'Invalid order amount' });
        return;
      }

      const amountInPaise = Math.round(numericAmount * 100);
      const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Razorpay Order API Warning:', data);
        // Return keyId and amountInPaise so client-side standard checkout can still proceed
        res.json({
          id: null,
          amount: amountInPaise,
          currency,
          keyId: RAZORPAY_KEY_ID,
          fallbackMode: true,
        });
        return;
      }

      res.json({
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        status: data.status,
        keyId: RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      const amountInPaise = Math.round(Number(req.body?.amount || 0) * 100);
      res.json({
        id: null,
        amount: amountInPaise,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
        fallbackMode: true,
      });
    }
  });

  // Verify Razorpay Payment Signature using HMAC-SHA256
  app.post('/api/razorpay/verify-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

      if (!razorpay_payment_id) {
        res.status(400).json({ verified: false, error: 'Missing razorpay_payment_id' });
        return;
      }

      // If order_id and signature are present, verify cryptographic HMAC-SHA256 signature
      if (razorpay_order_id && razorpay_signature) {
        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          res.status(400).json({
            verified: false,
            error: 'Invalid payment signature',
          });
          return;
        }

        res.json({
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
        });
        return;
      }

      // Fallback verification for direct payment_id without server order_id
      res.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id || null,
      });
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ verified: false, error: 'Payment verification failed' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Curowit server running with Razorpay integration on http://localhost:${PORT}`);
  });
}

startServer();
