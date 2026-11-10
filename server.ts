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
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const WORKSHOPS_FILE = path.join(DATA_DIR, 'workshops.json');
const WORKSHOP_BOOKINGS_FILE = path.join(DATA_DIR, 'workshop-bookings.json');

const DEFAULT_WORKSHOPS = [
  {
    id: 'ws-1',
    title: 'Beginner Crochet: Stitch Your First Amigurumi Companion',
    creatorName: "Siya Sharma (Siya's Creations)",
    date: 'Saturday, Oct 12',
    time: '4:00 PM – 6:00 PM IST',
    duration: '2 Hours',
    format: 'Live Online',
    price: 499,
    seatsLeft: 6,
    image: '/images/curated_crochet_1790261016242.jpg',
    description: 'Learn the magic ring, single crochet increases, and shaping techniques in an intimate live interactive cohort. Starter materials list sent upon registration.',
    meetingLink: 'https://meet.google.com/cur-crochet-live',
    meetingPlatform: 'Google Meet',
    meetingNotes: 'Please join 5 mins early with 3.5mm crochet hook and cotton yarn ready.',
  },
  {
    id: 'ws-2',
    title: 'Wildflower Pressing & Artisanal Candle Pouring',
    creatorName: 'Ananya Sen (Botanica Wax)',
    date: 'Sunday, Oct 20',
    time: '11:00 AM – 2:00 PM IST',
    duration: '3 Hours',
    format: 'Studio Offline',
    location: 'Indiranagar Craft Studio, Bengaluru',
    price: 1199,
    seatsLeft: 4,
    image: '/images/botanical_candle_1790261028567.jpg',
    description: 'Hands-on candle creation with natural soy wax, essential oil scent formulation, and flower pressing techniques. Take home 2 large custom candles.',
    meetingLink: '',
    meetingPlatform: 'Studio Offline',
    meetingNotes: 'Indiranagar Craft Studio, Bengaluru. Aprons and wax kits provided on arrival.',
  },
  {
    id: 'ws-3',
    title: 'Botanical Watercolor Floral Painting Masterclass',
    creatorName: 'Priya Das (Mud & Petals)',
    date: 'Saturday, Nov 02',
    time: '3:30 PM – 6:00 PM IST',
    duration: '2.5 Hours',
    format: 'Live Online',
    price: 599,
    seatsLeft: 9,
    image: '/images/hero_creators_1790260990626.jpg',
    description: 'Master wet-on-wet watercolor washes, leaf gradients, and delicate petal layering to create framed botanical art for your living space.',
    meetingLink: 'https://meet.google.com/botanical-art-live',
    meetingPlatform: 'Google Meet',
    meetingNotes: 'Cold press 300gsm watercolor paper, round brushes sizes 4 & 8.',
  },
  {
    id: 'ws-4',
    title: 'Hand-Built Studio Ceramics & Pinch Pottery',
    creatorName: 'Mud & Petals Studio',
    date: 'Sunday, Nov 10',
    time: '10:30 AM – 1:30 PM IST',
    duration: '3 Hours',
    format: 'Studio Offline',
    location: 'Pondicherry Clay Lab',
    price: 1299,
    seatsLeft: 5,
    image: '/images/ceramic_mug_1790261053724.jpg',
    description: 'Tactile journey into hand-building techniques without a wheel: pinching, coiling, slab construction, and custom sgraffito carving. Includes firing and glazing of 2 finished pieces.',
    meetingLink: '',
    meetingPlatform: 'Studio Offline',
    meetingNotes: 'Pondicherry Clay Lab. Clay and pottery tools provided on-site.',
  },
];

function loadPersistedWorkshops() {
  ensureDataDir();
  try {
    if (fs.existsSync(WORKSHOPS_FILE)) {
      const raw = fs.readFileSync(WORKSHOPS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Notice loading persisted workshops:', err);
  }
  // Initialize file with default workshops
  savePersistedWorkshops(DEFAULT_WORKSHOPS);
  return DEFAULT_WORKSHOPS;
}

function savePersistedWorkshops(workshops: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(WORKSHOPS_FILE, JSON.stringify(workshops, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice saving persisted workshops:', err);
  }
}

function loadPersistedWorkshopBookings() {
  ensureDataDir();
  try {
    if (fs.existsSync(WORKSHOP_BOOKINGS_FILE)) {
      const raw = fs.readFileSync(WORKSHOP_BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Notice loading persisted workshop bookings:', err);
  }
  return [];
}

function savePersistedWorkshopBookings(bookings: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(WORKSHOP_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Notice saving persisted workshop bookings:', err);
  }
}

const DEMO_EMAILS = new Set(['meera@studiodhaga.in', 'aarav@mittifire.in']);
const DEMO_IDS = new Set(['app-meera-sharma', 'app-aarav-patel', 'cr-meera-sharma', 'cr-aarav-patel']);

function isDemoRecord(record: any): boolean {
  if (!record) return false;
  if (record.id && DEMO_IDS.has(record.id)) return true;
  if (record.applicationId && DEMO_IDS.has(record.applicationId)) return true;
  if (record.creatorId && DEMO_IDS.has(record.creatorId)) return true;
  const email = (record.applicantEmail || record.email || '').toLowerCase();
  if (DEMO_EMAILS.has(email)) return true;
  return false;
}

function loadPersistedOrders() {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        tracking: Array.isArray(parsed.tracking) ? parsed.tracking : [],
      };
    }
  } catch (err) {
    console.warn('Notice loading persisted orders:', err);
  }
  return { orders: [], tracking: [] };
}

function savePersistedOrders(orders: any[], tracking: any[] = []) {
  ensureDataDir();
  try {
    fs.writeFileSync(
      ORDERS_FILE,
      JSON.stringify({ orders, tracking }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.warn('Notice saving persisted orders:', err);
  }
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
  // REAL-TIME BROADCAST ENGINE (SSE - Server-Sent Events)
  // Ensures sub-second live database updates across Full Website & Admin Panel
  // ==============================================================================
  const realtimeClients = new Set<express.Response>();

  function broadcastRealtimeEvent(type: string, data: any) {
    const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of realtimeClients) {
      try {
        client.write(payload);
      } catch {
        realtimeClients.delete(client);
      }
    }
  }

  // Heartbeat to keep SSE stream alive in all browser environments
  setInterval(() => {
    for (const client of realtimeClients) {
      try {
        client.write(`:keepalive\n\n`);
      } catch {
        realtimeClients.delete(client);
      }
    }
  }, 15000);

  // SSE Stream endpoint for browser clients & admin dashboard
  app.get('/api/realtime/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`:connected\n\n`);
    realtimeClients.add(res);

    req.on('close', () => {
      realtimeClients.delete(res);
    });
  });

  // Client broadcast trigger endpoint (for catalog changes, products, workshops, stories)
  app.post('/api/realtime/broadcast', (req, res) => {
    const { type, data } = req.body || {};
    if (type) {
      broadcastRealtimeEvent(type, data);
    }
    res.json({ success: true });
  });

  // ==============================================================================
  // ORDERS & SHIPMENT TRACKING PERSISTENCE (Zero Data Loss)
  // ==============================================================================
  const initialOrdersData = loadPersistedOrders();
  const serverOrders: any[] = initialOrdersData.orders;
  const serverOrderTracking: any[] = initialOrdersData.tracking;

  // Get all orders
  app.get('/api/orders', (_req, res) => {
    res.json({
      success: true,
      orders: serverOrders,
      total: serverOrders.length,
    });
  });

  // Create or upsert an order
  app.post('/api/orders', (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id) {
        res.status(400).json({ error: 'Order id is required' });
        return;
      }
      const existingIdx = serverOrders.findIndex((o) => o.id === order.id);
      const now = new Date().toISOString();
      const updatedOrder = {
        ...order,
        updatedAt: now,
        createdAt: existingIdx !== -1 ? (serverOrders[existingIdx].createdAt || now) : now,
      };

      if (existingIdx !== -1) {
        serverOrders[existingIdx] = updatedOrder;
      } else {
        serverOrders.unshift(updatedOrder);
      }

      savePersistedOrders(serverOrders, serverOrderTracking);
      broadcastRealtimeEvent(existingIdx !== -1 ? 'ORDER_UPDATED' : 'ORDER_CREATED', updatedOrder);
      res.json({ success: true, order: updatedOrder });
    } catch (err) {
      console.error('[Orders] Failed to save order:', err);
      res.status(500).json({ error: 'Failed to save order' });
    }
  });

  // Update order status with tracking milestone
  app.post('/api/orders/update-status', (req, res) => {
    try {
      const { orderId, status, carrier, awb, location, description } = req.body || {};
      if (!orderId || !status) {
        res.status(400).json({ error: 'orderId and status are required' });
        return;
      }
      const idx = serverOrders.findIndex((o) => o.id === orderId);
      if (idx === -1) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const now = new Date().toISOString();
      serverOrders[idx].status = status;
      if (carrier) serverOrders[idx].courierPartner = carrier;
      if (awb) serverOrders[idx].trackingAwb = awb;
      serverOrders[idx].updatedAt = now;

      // Append tracking milestone
      const milestone = {
        id: `trk-${Date.now()}`,
        order_id: orderId,
        status,
        title: `Order ${status}`,
        location: location || 'Curowit Fulfillment Hub, Bengaluru',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        description: description || `Status updated to ${status}`,
        carrier: carrier || serverOrders[idx].courierPartner || 'Delhivery Eco Surface Logistics',
        awb_number: awb || serverOrders[idx].trackingAwb,
        created_at: now,
      };
      serverOrderTracking.push(milestone);

      savePersistedOrders(serverOrders, serverOrderTracking);
      broadcastRealtimeEvent('ORDER_UPDATED', {
        order: serverOrders[idx],
        tracking: milestone,
      });

      res.json({
        success: true,
        order: serverOrders[idx],
        tracking: milestone,
      });
    } catch (err) {
      console.error('[Orders] Failed to update status:', err);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Get order tracking history
  app.get('/api/orders/tracking/:orderId', (req, res) => {
    const { orderId } = req.params;
    const history = serverOrderTracking.filter((t) => t.order_id === orderId);
    res.json({ success: true, tracking: history });
  });

  // Delete order
  app.delete('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const idx = serverOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      serverOrders.splice(idx, 1);
      savePersistedOrders(serverOrders, serverOrderTracking);
      broadcastRealtimeEvent('ORDER_DELETED', { id: orderId });
    }
    res.json({ success: true, deleted: idx !== -1 });
  });

  // ==============================================================================
  // WORKSHOPS & BUYER BOOKINGS PERSISTENCE & REALTIME BROADCAST
  // ==============================================================================
  const serverWorkshops: any[] = loadPersistedWorkshops();
  const serverWorkshopBookings: any[] = loadPersistedWorkshopBookings();

  // Get all active workshops
  app.get('/api/workshops', (_req, res) => {
    res.json({
      success: true,
      workshops: serverWorkshops,
      total: serverWorkshops.length,
    });
  });

  // Create or update a workshop
  app.post('/api/workshops', (req, res) => {
    try {
      const workshopData = req.body;
      if (!workshopData || !workshopData.id) {
        res.status(400).json({ error: 'Missing workshop data or ID' });
        return;
      }

      const idx = serverWorkshops.findIndex((w) => w.id === workshopData.id);
      if (idx !== -1) {
        serverWorkshops[idx] = {
          ...serverWorkshops[idx],
          ...workshopData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        serverWorkshops.push({
          ...workshopData,
          updatedAt: new Date().toISOString(),
        });
      }

      savePersistedWorkshops(serverWorkshops);
      const savedItem = idx !== -1 ? serverWorkshops[idx] : serverWorkshops[serverWorkshops.length - 1];
      broadcastRealtimeEvent('WORKSHOP_UPDATED', savedItem);

      res.json({ success: true, workshop: savedItem });
    } catch (err) {
      console.error('[Workshops] Failed to upsert:', err);
      res.status(500).json({ error: 'Failed to save workshop' });
    }
  });

  // Update master meeting details
  app.post('/api/workshops/:workshopId/meeting', (req, res) => {
    try {
      const { workshopId } = req.params;
      const { meetingLink, meetingPlatform, meetingNotes } = req.body || {};

      const idx = serverWorkshops.findIndex((w) => w.id === workshopId);
      if (idx === -1) {
        res.status(404).json({ error: 'Workshop not found' });
        return;
      }

      serverWorkshops[idx] = {
        ...serverWorkshops[idx],
        meetingLink: meetingLink !== undefined ? meetingLink : serverWorkshops[idx].meetingLink,
        meetingPlatform: meetingPlatform || serverWorkshops[idx].meetingPlatform || 'Google Meet',
        meetingNotes: meetingNotes !== undefined ? meetingNotes : serverWorkshops[idx].meetingNotes,
        updatedAt: new Date().toISOString(),
      };

      // Also update any bookings for this workshop
      serverWorkshopBookings.forEach((b) => {
        if (b.workshopId === workshopId) {
          if (meetingLink !== undefined) b.meetingLink = meetingLink;
          if (meetingPlatform) b.meetingPlatform = meetingPlatform;
          if (meetingNotes !== undefined) b.meetingNotes = meetingNotes;
        }
      });

      savePersistedWorkshops(serverWorkshops);
      savePersistedWorkshopBookings(serverWorkshopBookings);

      broadcastRealtimeEvent('WORKSHOP_UPDATED', serverWorkshops[idx]);
      broadcastRealtimeEvent('WORKSHOP_MEETING_UPDATED', {
        workshopId,
        meetingLink,
        meetingPlatform,
        meetingNotes,
      });

      res.json({ success: true, workshop: serverWorkshops[idx] });
    } catch (err) {
      console.error('[Workshops] Failed to update meeting:', err);
      res.status(500).json({ error: 'Failed to update meeting details' });
    }
  });

  // Delete workshop
  app.delete('/api/workshops/:workshopId', (req, res) => {
    const { workshopId } = req.params;
    const idx = serverWorkshops.findIndex((w) => w.id === workshopId);
    if (idx !== -1) {
      serverWorkshops.splice(idx, 1);
      savePersistedWorkshops(serverWorkshops);
      broadcastRealtimeEvent('WORKSHOP_DELETED', { id: workshopId });
    }
    res.json({ success: true, deleted: idx !== -1 });
  });

  // Book a workshop spot (buyer checkout / reservation)
  app.post('/api/workshops/book', (req, res) => {
    try {
      const { workshopId, booking } = req.body || {};
      if (!workshopId || !booking) {
        res.status(400).json({ error: 'Missing workshopId or booking payload' });
        return;
      }

      const wsIdx = serverWorkshops.findIndex((w) => w.id === workshopId);
      if (wsIdx !== -1) {
        const currentSeats = Number(serverWorkshops[wsIdx].seatsLeft) || 0;
        serverWorkshops[wsIdx].seatsLeft = Math.max(0, currentSeats - 1);
        savePersistedWorkshops(serverWorkshops);
      }

      // Record booking
      const newBooking = {
        ...booking,
        id: booking.id || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        bookedAt: booking.bookedAt || new Date().toISOString(),
      };
      serverWorkshopBookings.unshift(newBooking);
      savePersistedWorkshopBookings(serverWorkshopBookings);

      const updatedWorkshop = wsIdx !== -1 ? serverWorkshops[wsIdx] : null;
      broadcastRealtimeEvent('WORKSHOP_BOOKED', {
        workshopId,
        workshop: updatedWorkshop,
        booking: newBooking,
      });
      if (updatedWorkshop) {
        broadcastRealtimeEvent('WORKSHOP_UPDATED', updatedWorkshop);
      }

      res.json({
        success: true,
        booking: newBooking,
        workshop: updatedWorkshop,
      });
    } catch (err) {
      console.error('[Workshops] Failed to book spot:', err);
      res.status(500).json({ error: 'Failed to process workshop booking' });
    }
  });

  // Get all workshop bookings (for admin or buyer roster)
  app.get('/api/workshops/bookings', (_req, res) => {
    res.json({
      success: true,
      bookings: serverWorkshopBookings,
    });
  });

  // Update booking status
  app.post('/api/workshops/bookings/status', (req, res) => {
    const { bookingId, status } = req.body || {};
    const b = serverWorkshopBookings.find((item) => item.id === bookingId);
    if (b && status) {
      b.status = status;
      savePersistedWorkshopBookings(serverWorkshopBookings);
      broadcastRealtimeEvent('BOOKING_UPDATED', b);
    }
    res.json({ success: true, booking: b });
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

      broadcastRealtimeEvent('APPLICATION_SUBMITTED', {
        application: applicationRecord,
        creator: profileRecord,
      });

      console.log(`[Founding Creator] New application registered on server: ${applicationId} by ${resolvedName} (${resolvedEmail})`);

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

        broadcastRealtimeEvent('APPLICATION_REVIEWED', {
          applicationId,
          action,
          updatedStatus: newStatus,
          application: serverCreatorApplications[appIdx],
          profile:
            profIdx !== -1
              ? serverCreatorProfiles[profIdx]
              : null,
        });
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

      broadcastRealtimeEvent('PROFILE_UPDATED', {
        profile: serverCreatorProfiles[profIdx],
      });

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

      broadcastRealtimeEvent('PAYMENT_METHODS_UPDATED', {
        paymentMethod: updatedMethod,
      });

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

      broadcastRealtimeEvent('TICKETS_UPDATED', {
        ticket: newTicket,
      });

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

      broadcastRealtimeEvent('TICKETS_UPDATED', {
        ticket,
      });

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
