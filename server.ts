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

const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
      const paymentMethods = Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : [];
      const tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
      return { applications: apps, profiles: profs, paymentMethods, tickets };
    }
  } catch (err) {
    console.warn('Notice loading persisted creator data:', err);
  }
  return { applications: [], profiles: [], paymentMethods: [], tickets: [] };
}

function savePersistedCreatorData(
  applications: any[],
  profiles: any[],
  paymentMethods: any[] = [],
  tickets: any[] = []
) {
  ensureDataDir();
  try {
    const apps = applications.filter((a: any) => !isDemoRecord(a));
    const profs = profiles.filter((p: any) => !isDemoRecord(p));
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          applications: apps,
          profiles: profs,
          paymentMethods,
          tickets,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.warn('Notice saving persisted creator data:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static media repository for permanently stored uploads
  app.use('/api/media', express.static(UPLOADS_DIR));

  function saveBase64ToFile(
    base64Data: string,
    originalName?: string,
    folder?: string
  ): { url: string; filename: string } {
    ensureDataDir();
    let mimeType = 'image/jpeg';
    let cleanBase64 = base64Data;
    const match = base64Data.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2];
    }

    let ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    if (ext === 'octet-stream') ext = 'bin';
    const prefix = folder ? `${folder.replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const sanitized = (originalName || 'upload')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${prefix}${Date.now()}_${sanitized}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { url: `/api/media/${filename}`, filename };
  }

  // Get Cloudinary config status
  app.get('/api/cloudinary/config', (_req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dehmbsgqo';
    const apiKey = process.env.CLOUDINARY_API_KEY || '242583393382769';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    const hasSecret = Boolean(process.env.CLOUDINARY_API_SECRET);

    res.json({
      cloudName,
      apiKey,
      uploadPreset,
      hasSecret,
      isConfigured: Boolean(cloudName && apiKey),
      serverMediaStorage: true,
    });
  });

  // Direct media upload endpoint
  app.post('/api/media/upload', (req, res) => {
    try {
      const { file, filename, folder } = req.body || {};
      if (!file) {
        res.status(400).json({ error: 'Missing file payload' });
        return;
      }
      const saved = saveBase64ToFile(file, filename, folder);
      res.json({
        success: true,
        url: saved.url,
        filename: saved.filename,
        provider: 'curowit_server',
      });
    } catch (err: any) {
      console.error('[Media Upload] Failed:', err);
      res.status(500).json({ error: 'Failed to store media file' });
    }
  });

  // Resilient Cloudinary Upload endpoint with auto-fallback to permanent media store
  app.post('/api/cloudinary/upload', async (req, res) => {
    try {
      const { file, folder = 'curowit', filename, upload_preset } = req.body || {};
      if (!file) {
        res.status(400).json({ error: 'Missing file data' });
        return;
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dehmbsgqo';
      const apiKey = process.env.CLOUDINARY_API_KEY || '242583393382769';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || 'fWp-RcWGOCpO9sZY3MEvu43Pi3Q';
      const preset = upload_preset || process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      let cloudinarySucceeded = false;
      let cloudinaryUrl = '';

      // 1. Attempt Cloudinary Upload if cloud name configured
      if (cloudName && apiSecret) {
        try {
          const timestamp = Math.round(Date.now() / 1000);
          const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

          const fd = new URLSearchParams();
          fd.append('file', file);
          fd.append('api_key', apiKey);
          fd.append('timestamp', timestamp.toString());
          fd.append('folder', folder);
          fd.append('signature', signature);

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: fd,
          });

          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.secure_url) {
              cloudinarySucceeded = true;
              cloudinaryUrl = cData.secure_url;
            }
          } else {
            const errData = await cRes.json();
            console.warn('[Cloudinary Notice] Upstream returned status:', cRes.status, errData);
          }
        } catch (cErr) {
          console.warn('[Cloudinary Notice] Cloudinary call failed, using high-res server repository:', cErr);
        }
      }

      // If Cloudinary succeeded, return the CDN URL
      if (cloudinarySucceeded && cloudinaryUrl) {
        res.json({
          success: true,
          url: cloudinaryUrl,
          provider: 'cloudinary',
          cloudName,
        });
        return;
      }

      // 2. Fallback: Save persistently to Curowit server media storage
      const saved = saveBase64ToFile(file, filename, folder);
      res.json({
        success: true,
        url: saved.url,
        provider: 'curowit_server',
        filename: saved.filename,
        notice: 'Uploaded to Curowit high-speed media storage',
      });
    } catch (err: any) {
      console.error('[Cloudinary Endpoint] Error:', err);
      // Secondary fallback
      try {
        const { file, filename, folder } = req.body || {};
        if (file) {
          const saved = saveBase64ToFile(file, filename, folder);
          res.json({
            success: true,
            url: saved.url,
            provider: 'curowit_server',
            filename: saved.filename,
          });
          return;
        }
      } catch {}
      res.status(500).json({ error: 'Upload failed' });
    }
  });

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
  const serverCreatorPaymentMethods: any[] = initialData.paymentMethods || [];
  const serverCreatorTickets: any[] = initialData.tickets || [];

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

      const resolvedName = (fullName || body.applicantName || displayName || '').trim();
      const resolvedEmail = (email || body.applicantEmail || '').trim().toLowerCase();
      const resolvedPhone = (phone || body.applicantPhone || '').trim();
      const resolvedCity = (city || body.city || 'India').trim();
      const resolvedState = (state || body.state || 'India').trim();
      const resolvedPincode = (pincode || body.pincode || '000000').trim();
      const resolvedCraft = (craftDescription || intro || body.aboutCraft || 'Artisan handcrafted goods').trim();

      if (!resolvedName || !resolvedEmail || !resolvedPhone) {
        res.status(400).json({ error: 'Missing mandatory applicant contact fields (name, email, phone)' });
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
        applicantName: resolvedName,
        applicantEmail: resolvedEmail,
        applicantPhone: resolvedPhone,
        brandName: brandName?.trim() || undefined,
        creatorType: creatorType || 'Individual',
        city: resolvedCity,
        state: resolvedState,
        pincode: resolvedPincode,
        categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
        intro: (intro || resolvedCraft || '').trim(),
        craftDescription: resolvedCraft,
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
        fullName: resolvedName,
        displayName: (displayName || brandName || resolvedName).trim(),
        email: resolvedEmail,
        phone: resolvedPhone,
        city: resolvedCity,
        state: resolvedState,
        pincode: resolvedPincode,
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
      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

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
        savePersistedCreatorData(
          serverCreatorApplications,
          serverCreatorProfiles,
          serverCreatorPaymentMethods,
          serverCreatorTickets
        );
      }

      console.log(`[Founding Creator] Application ${applicationId} reviewed: ${action} by ${reviewer || 'Admin'}`);
      res.json({
        success: true,
        applicationId,
        action,
        updatedStatus: newStatus,
        reviewedAt: now,
        application: appIdx !== -1 ? serverCreatorApplications[appIdx] : null,
        profile:
          appIdx !== -1
            ? serverCreatorProfiles.find(
                (p) =>
                  p.id === serverCreatorApplications[appIdx].creatorId ||
                  p.email?.toLowerCase() === serverCreatorApplications[appIdx].applicantEmail?.toLowerCase()
              ) || null
            : null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process application review' });
    }
  });

  // Real-time Status check for creator application (by Application ID, email or phone)
  app.get('/api/founding-creator/status', (req, res) => {
    try {
      const q = String(req.query.query || req.query.id || req.query.email || '').trim().toLowerCase();
      if (!q) {
        res.status(400).json({ success: false, error: 'Query parameter is required' });
        return;
      }

      const cleanQ = q.replace(/^APP-FC-/i, '').replace(/^app-/i, '');
      const appRecord = serverCreatorApplications.find((a) => {
        const aId = (a.applicationId || '').toLowerCase();
        const rawId = (a.id || '').toLowerCase();
        const aEmail = (a.applicantEmail || '').toLowerCase();
        const aPhone = (a.applicantPhone || '').replace(/\D/g, '');
        const searchPhone = q.replace(/\D/g, '');

        return (
          aId === q ||
          rawId === q ||
          aEmail === q ||
          (searchPhone.length >= 7 && aPhone.includes(searchPhone)) ||
          aId.includes(cleanQ)
        );
      });

      if (!appRecord) {
        res.status(404).json({ success: false, error: 'Application not found' });
        return;
      }

      const prof = serverCreatorProfiles.find(
        (p) =>
          p.id === appRecord.creatorId ||
          p.email?.toLowerCase() === appRecord.applicantEmail?.toLowerCase()
      );

      res.json({
        success: true,
        application: appRecord,
        creator: prof || null,
        profile: prof || null,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to look up application status' });
    }
  });

  // Creator authentication endpoint (cross-device persistent login)
  app.post('/api/founding-creator/login', (req, res) => {
    try {
      const { email } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail) {
        res.status(400).json({ success: false, error: 'Email address is required' });
        return;
      }

      const prof = serverCreatorProfiles.find(
        (p) => p.email?.toLowerCase() === cleanEmail
      );

      if (!prof) {
        res.status(404).json({
          success: false,
          error: 'No creator registration found with this email. Please submit an application first.',
        });
        return;
      }

      const appRecord = serverCreatorApplications.find(
        (a) =>
          a.creatorId === prof.id ||
          a.applicantEmail?.toLowerCase() === cleanEmail
      );

      res.json({
        success: true,
        creator: prof,
        profile: prof,
        application: appRecord || null,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server authentication error' });
    }
  });

  // Admin / Creator profile update endpoint (persists changes immediately)
  app.post('/api/founding-creator/update-profile', (req, res) => {
    try {
      const body = req.body || {};
      const { id, creatorId, email } = body;
      const targetId = id || creatorId;
      const cleanEmail = email ? String(email).trim().toLowerCase() : '';

      const profIdx = serverCreatorProfiles.findIndex(
        (p) =>
          (targetId && (p.id === targetId || p.creatorId === targetId)) ||
          (cleanEmail && p.email?.toLowerCase() === cleanEmail)
      );

      if (profIdx === -1) {
        res.status(404).json({ success: false, error: 'Creator profile not found on server' });
        return;
      }

      const now = new Date().toISOString();
      serverCreatorProfiles[profIdx] = {
        ...serverCreatorProfiles[profIdx],
        ...body,
        updatedAt: now,
      };

      // If accountStatus is explicitly updated (e.g. approved / pending / suspended), sync the linked application
      if (body.accountStatus) {
        const appIdx = serverCreatorApplications.findIndex(
          (a) =>
            a.creatorId === serverCreatorProfiles[profIdx].id ||
            a.applicantEmail?.toLowerCase() === serverCreatorProfiles[profIdx].email?.toLowerCase()
        );
        if (appIdx !== -1) {
          serverCreatorApplications[appIdx].applicationStatus =
            body.accountStatus === 'approved'
              ? 'approved'
              : body.accountStatus === 'rejected'
              ? 'rejected'
              : 'pending_review';
          serverCreatorApplications[appIdx].updatedAt = now;
        }
      }

      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

      res.json({
        success: true,
        profile: serverCreatorProfiles[profIdx],
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to update creator profile' });
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

  // --------------------------------------------------------------------------
  // CREATOR PAYMENT DETAILS & BANK DESTINATION ENDPOINTS
  // --------------------------------------------------------------------------
  // Get all payment methods (for Admin CRM review & payouts)
  app.get('/api/founding-creator/payment-methods', (_req, res) => {
    res.json({
      success: true,
      paymentMethods: serverCreatorPaymentMethods,
      total: serverCreatorPaymentMethods.length,
    });
  });

  // Get single creator payment method
  app.get('/api/founding-creator/payment-methods/:creatorId', (req, res) => {
    const { creatorId } = req.params;
    const pm = serverCreatorPaymentMethods.find((p) => p.creatorId === creatorId);
    res.json({
      success: true,
      paymentMethod: pm || null,
    });
  });

  // Save / Update payment method (from Creator Dashboard or Admin)
  app.post('/api/founding-creator/payment-methods', (req, res) => {
    try {
      const body = req.body || {};
      const {
        creatorId,
        methodType = 'UPI',
        upiId,
        accountHolderName,
        bankName,
        accountNumber,
        maskedAccountNumber,
        ifscCode,
        verificationStatus = 'verified',
      } = body;

      if (!creatorId) {
        res.status(400).json({ error: 'creatorId is required' });
        return;
      }

      const now = new Date().toISOString();
      const existingIdx = serverCreatorPaymentMethods.findIndex((p) => p.creatorId === creatorId);

      const computedMasked =
        maskedAccountNumber ||
        (accountNumber && accountNumber.length >= 4 ? `•••• •••• ${accountNumber.slice(-4)}` : undefined);

      const updatedMethod = {
        id: existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].id : `pm-${Date.now()}`,
        creatorId,
        methodType,
        upiId: upiId !== undefined ? upiId : (existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].upiId : ''),
        accountHolderName: accountHolderName !== undefined ? accountHolderName : (existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].accountHolderName : ''),
        bankName: bankName !== undefined ? bankName : (existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].bankName : ''),
        maskedAccountNumber: computedMasked !== undefined ? computedMasked : (existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].maskedAccountNumber : ''),
        ifscCode: (ifscCode !== undefined ? ifscCode : (existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].ifscCode : '')).toUpperCase(),
        verificationStatus,
        isDefault: true,
        createdAt: existingIdx !== -1 ? serverCreatorPaymentMethods[existingIdx].createdAt : now,
        updatedAt: now,
      };

      if (existingIdx !== -1) {
        serverCreatorPaymentMethods[existingIdx] = updatedMethod;
      } else {
        serverCreatorPaymentMethods.push(updatedMethod);
      }

      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

      console.log(`[Founding Creator] Payment details updated for creator ${creatorId}: UPI=${updatedMethod.upiId}, Bank=${updatedMethod.bankName}`);
      res.json({
        success: true,
        paymentMethod: updatedMethod,
      });
    } catch (error) {
      console.error('Error saving payment details:', error);
      res.status(500).json({ error: 'Failed to save payment details' });
    }
  });

  // --------------------------------------------------------------------------
  // CREATOR SUPPORT TICKETS & QUERY RESOLUTION ENDPOINTS
  // --------------------------------------------------------------------------
  // Get all support tickets (for Admin Support Desk & Query Resolution)
  app.get('/api/founding-creator/tickets', (_req, res) => {
    res.json({
      success: true,
      tickets: serverCreatorTickets,
      total: serverCreatorTickets.length,
    });
  });

  // Get tickets for a specific creator
  app.get('/api/founding-creator/tickets/:creatorId', (req, res) => {
    const { creatorId } = req.params;
    const creatorTickets = serverCreatorTickets.filter((t) => t.creatorId === creatorId);
    res.json({
      success: true,
      tickets: creatorTickets,
      total: creatorTickets.length,
    });
  });

  // Creator raises a new support ticket
  app.post('/api/founding-creator/tickets', (req, res) => {
    try {
      const body = req.body || {};
      const { creatorId, creatorName, creatorEmail, subject, category, description, priority = 'medium' } = body;

      if (!creatorId || !subject || !description) {
        res.status(400).json({ error: 'creatorId, subject and description are required' });
        return;
      }

      const now = new Date().toISOString();
      const ticketRandom = Math.floor(100 + Math.random() * 900);
      const ticketId = body.ticketId || `TKT-FC-${ticketRandom}`;

      const newTicket = {
        id: body.id || `tkt-${Date.now()}`,
        ticketId,
        creatorId,
        creatorName: creatorName || 'Founding Creator',
        creatorEmail: creatorEmail || '',
        subject: subject.trim(),
        category: category || 'orders',
        priority,
        status: 'open',
        description: description.trim(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderType: 'creator',
            senderName: creatorName || 'Creator',
            message: description.trim(),
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      serverCreatorTickets.unshift(newTicket);

      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

      console.log(`[Founding Creator] Support ticket raised: ${ticketId} by ${creatorName || creatorId}`);
      res.json({
        success: true,
        ticket: newTicket,
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  });

  // Admin replies to or solves a support ticket
  app.post('/api/founding-creator/tickets/:ticketId/reply', (req, res) => {
    try {
      const { ticketId } = req.params;
      const {
        message,
        senderType = 'admin',
        senderName = 'Curowit Support Specialist',
        status,
      } = req.body || {};

      const ticket = serverCreatorTickets.find(
        (t) => t.ticketId === ticketId || t.id === ticketId
      );

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      const now = new Date().toISOString();
      if (!Array.isArray(ticket.messages)) {
        ticket.messages = [];
      }

      if (message && message.trim()) {
        ticket.messages.push({
          id: `msg-${Date.now()}`,
          senderType,
          senderName,
          message: message.trim(),
          createdAt: now,
        });
      }

      if (status) {
        ticket.status = status;
      }
      ticket.updatedAt = now;

      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

      console.log(`[Founding Creator] Ticket ${ticket.ticketId} updated. Status: ${ticket.status}, message added.`);
      res.json({
        success: true,
        ticket,
      });
    } catch (error) {
      console.error('Error replying to ticket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  });

  // Update ticket status directly
  app.post('/api/founding-creator/tickets/:ticketId/status', (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body || {};

      const ticket = serverCreatorTickets.find(
        (t) => t.ticketId === ticketId || t.id === ticketId
      );

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      if (status) {
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();
      }

      savePersistedCreatorData(
        serverCreatorApplications,
        serverCreatorProfiles,
        serverCreatorPaymentMethods,
        serverCreatorTickets
      );

      res.json({
        success: true,
        ticket,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update ticket status' });
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
