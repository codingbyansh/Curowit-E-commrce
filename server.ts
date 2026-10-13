import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateSitemapEntries, buildSitemapXml, getSitemapStats } from './src/services/sitemapGenerator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TgyT0boqInIYsI';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '2y01LBJDaAddjDShsyyawCCh';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==============================================================================
  // SEARCH ENGINE SITEMAP & DISCOVERABILITY ENDPOINTS
  // ==============================================================================
  app.get('/sitemap.xml', (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.get('host') || 'curowit.in';
      const baseUrl = `${protocol}://${host}`;

      const entries = generateSitemapEntries({ baseUrl });
      const xml = buildSitemapXml(entries);

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('Cache-Control', 'public, max-age=3600, s-maxage=14400');
      res.send(xml);
    } catch (err: any) {
      console.error('[Sitemap Server Error]', err);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'curowit.in';
    const baseUrl = `${protocol}://${host}`;

    const robotsTxt = [
      '# Curowit — Home of Creatives robots.txt',
      'User-agent: *',
      'Allow: /',
      'Disallow: /admincurowit',
      'Disallow: /admin',
      'Disallow: /api/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robotsTxt);
  });

  app.get('/api/sitemap/stats', (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.get('host') || 'curowit.in';
      const baseUrl = `${protocol}://${host}`;

      const entries = generateSitemapEntries({ baseUrl });
      const stats = getSitemapStats(entries);
      res.json({
        success: true,
        stats,
        sitemapUrl: `${baseUrl}/sitemap.xml`,
        robotsUrl: `${baseUrl}/robots.txt`,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compute sitemap stats' });
    }
  });

  // ==============================================================================
  // CLOUDINARY MEDIA SERVICE CONFIG & ENDPOINTS
  // ==============================================================================
  let runtimeCloudinaryConfig = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dehmbsgqo',
    apiKey: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '242583393382769',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'fWp-RcWGOCpO9sZY3MEvu43Pi3Q',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
  };

  app.get('/api/cloudinary/config', (_req, res) => {
    res.json({
      cloudName: runtimeCloudinaryConfig.cloudName,
      hasApiKey: Boolean(runtimeCloudinaryConfig.apiKey),
      hasApiSecret: Boolean(runtimeCloudinaryConfig.apiSecret),
      uploadPreset: runtimeCloudinaryConfig.uploadPreset,
      isConfigured: Boolean(
        runtimeCloudinaryConfig.cloudName &&
          ((runtimeCloudinaryConfig.apiKey && runtimeCloudinaryConfig.apiSecret) || runtimeCloudinaryConfig.uploadPreset)
      ),
    });
  });

  app.post('/api/cloudinary/config', (req, res) => {
    const { cloudName, apiKey, apiSecret, uploadPreset } = req.body || {};
    if (cloudName) runtimeCloudinaryConfig.cloudName = String(cloudName).trim();
    if (apiKey) runtimeCloudinaryConfig.apiKey = String(apiKey).trim();
    if (apiSecret) runtimeCloudinaryConfig.apiSecret = String(apiSecret).trim();
    if (uploadPreset) runtimeCloudinaryConfig.uploadPreset = String(uploadPreset).trim();
    console.log(`[Cloudinary Config] Updated for cloudName: ${runtimeCloudinaryConfig.cloudName || '(empty)'}, hasKey: ${Boolean(runtimeCloudinaryConfig.apiKey)}`);
    res.json({
      success: true,
      cloudName: runtimeCloudinaryConfig.cloudName,
      hasApiKey: Boolean(runtimeCloudinaryConfig.apiKey),
      hasApiSecret: Boolean(runtimeCloudinaryConfig.apiSecret),
      uploadPreset: runtimeCloudinaryConfig.uploadPreset,
      isConfigured: Boolean(
        runtimeCloudinaryConfig.cloudName &&
          ((runtimeCloudinaryConfig.apiKey && runtimeCloudinaryConfig.apiSecret) || runtimeCloudinaryConfig.uploadPreset)
      ),
    });
  });

  app.post('/api/cloudinary/upload', async (req, res) => {
    try {
      const {
        file,
        folder = 'curowit',
        tags = [],
        publicId,
        cloudName: reqCloudName,
        apiKey: reqApiKey,
        apiSecret: reqApiSecret,
        uploadPreset: reqPreset,
      } = req.body || {};

      if (!file) {
        res.status(400).json({ error: 'Missing file content' });
        return;
      }

      const cloudName = reqCloudName || runtimeCloudinaryConfig.cloudName;
      const apiKey = reqApiKey || runtimeCloudinaryConfig.apiKey;
      const apiSecret = reqApiSecret || runtimeCloudinaryConfig.apiSecret;
      const uploadPreset = reqPreset || runtimeCloudinaryConfig.uploadPreset;

      if (!cloudName) {
        res.status(400).json({ error: 'Cloudinary Cloud Name is not configured.' });
        return;
      }

      const timestamp = Math.round(Date.now() / 1000);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', String(timestamp));

      const paramsToSign: Record<string, string> = {
        timestamp: String(timestamp),
      };

      if (folder) {
        formData.append('folder', folder);
        paramsToSign['folder'] = folder;
      }

      if (publicId) {
        formData.append('public_id', publicId);
        paramsToSign['public_id'] = publicId;
      }

      if (tags && (Array.isArray(tags) ? tags.length > 0 : Boolean(tags))) {
        const tagStr = Array.isArray(tags) ? tags.join(',') : String(tags);
        formData.append('tags', tagStr);
        paramsToSign['tags'] = tagStr;
      }

      // If API key and Secret are provided, sign the payload using HMAC/SHA1
      if (apiKey && apiSecret) {
        formData.append('api_key', apiKey);
        const sortedKeys = Object.keys(paramsToSign).sort();
        const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
        const signature = crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');
        formData.append('signature', signature);
      } else if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      } else {
        res.status(400).json({
          error: 'Cloudinary credentials missing: please supply API Key & Secret or an Upload Preset',
        });
        return;
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[Cloudinary Upload Error]', data);
        res.status(response.status || 500).json({
          error: data.error?.message || 'Cloudinary upload failed',
          details: data,
        });
        return;
      }

      res.json({
        success: true,
        url: data.secure_url || data.url,
        secureUrl: data.secure_url || data.url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      });
    } catch (error: any) {
      console.error('[Cloudinary Server Error]', error);
      res.status(500).json({ error: error.message || 'Server error during Cloudinary upload' });
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
  // FOUNDING CREATOR PORTAL SERVER ENDPOINTS
  // ==============================================================================
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

  // Creator application validation & server logging
  app.post('/api/founding-creator/apply', (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        city,
        state,
        pincode,
        creatorType,
        categories,
        craftDescription,
      } = req.body || {};

      if (!fullName || !email || !phone || !city || !state || !pincode || !craftDescription) {
        res.status(400).json({ error: 'Missing mandatory application fields' });
        return;
      }

      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const applicationId = `APP-FC-${randomNum}`;
      const creatorId = `CR-FC-${randomNum}`;

      console.log(`[Founding Creator] New application received: ${applicationId} from ${fullName} (${email})`);

      res.json({
        success: true,
        applicationId,
        creatorId,
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
        message: 'Application registered. Under curation team review.',
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

      console.log(`[Founding Creator] Application ${applicationId} reviewed: ${action} by ${reviewer || 'Admin'}`);
      res.json({
        success: true,
        applicationId,
        action,
        updatedStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'additional_info_required',
        reviewedAt: new Date().toISOString(),
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
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Curowit server running with Razorpay integration on http://localhost:${PORT}`);
  });
}

startServer();
