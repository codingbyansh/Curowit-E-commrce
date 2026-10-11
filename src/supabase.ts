import { createClient } from '@supabase/supabase-js';
import { Order } from './context/StoreContext';

// Default Supabase project configuration (matches project caihxlsxayfykdmyahwx)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://caihxlsxayfykdmyahwx.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaWh4bHN4YXlmeWtkbXlhaHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MDAwMDAsImV4cCI6MjA0Mjk3NjAwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseTrackingRecord {
  id: string;
  order_id: string;
  status: string;
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  carrier?: string;
  awb_number?: string;
  is_completed?: boolean;
  is_current?: boolean;
  created_at?: string;
}

export interface SupabaseOrderRecord {
  id: string;
  date: string;
  total: number;
  status: 'Confirmed' | 'Crafting' | 'Dispatched' | 'Delivered' | 'Cancelled';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_street?: string;
  customer_city?: string;
  customer_postal_code?: string;
  shipping_address?: any;
  items?: any;
  payment_method?: string;
  payment_status?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  courier_partner?: string;
  tracking_awb?: string;
  estimated_delivery?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert application Order model to Supabase order record
 */
export function mapOrderToSupabase(order: Order): SupabaseOrderRecord {
  return {
    id: order.id,
    date: order.date,
    total: order.total,
    status: order.status,
    customer_name: order.shippingAddress.fullName,
    customer_phone: order.shippingAddress.phone,
    customer_email: order.userEmail || '',
    customer_street: order.shippingAddress.street,
    customer_city: order.shippingAddress.city,
    customer_postal_code: order.shippingAddress.postalCode,
    shipping_address: order.shippingAddress,
    items: order.items,
    payment_method: order.paymentMethod || 'Razorpay UPI',
    payment_status: order.paymentStatus || 'Paid',
    razorpay_payment_id: order.razorpayPaymentId || '',
    razorpay_order_id: order.razorpayOrderId || '',
    courier_partner: order.courierPartner || 'Delhivery Eco Surface Logistics',
    tracking_awb: order.trackingAwb || `DLV-${order.id.replace(/\D/g, '') || '9142'}`,
    estimated_delivery: order.estimatedDelivery || '3-5 Business Days',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert Supabase order record to application Order model
 */
export function mapSupabaseToOrder(row: any): Order {
  const shipping = row.shipping_address || {
    fullName: row.customer_name || 'Customer',
    phone: row.customer_phone || '',
    street: row.customer_street || '',
    city: row.customer_city || '',
    postalCode: row.customer_postal_code || '',
  };

  return {
    id: row.id,
    date: row.date || new Date().toLocaleDateString('en-GB'),
    total: Number(row.total) || 0,
    status: row.status || 'Confirmed',
    userEmail: row.customer_email || undefined,
    userId: row.user_id || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    paymentMethod: row.payment_method || 'Razorpay UPI',
    paymentStatus: row.payment_status || 'Paid',
    razorpayPaymentId: row.razorpay_payment_id || undefined,
    razorpayOrderId: row.razorpay_order_id || undefined,
    shippingAddress: shipping,
    trackingAwb: row.tracking_awb || undefined,
    courierPartner: row.courier_partner || undefined,
    estimatedDelivery: row.estimated_delivery || undefined,
  };
}

/**
 * Fetch all orders from the Supabase 'orders' table
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase orders fetch notice:', error.message);
      return [];
    }

    if (data && Array.isArray(data)) {
      return data.map(mapSupabaseToOrder);
    }
    return [];
  } catch (err) {
    console.warn('Supabase orders error:', err);
    return [];
  }
}

/**
 * Fetch order tracking history from the Supabase 'order_tracking' table
 */
export async function fetchOrderTrackingFromSupabase(
  orderId: string
): Promise<SupabaseTrackingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase order_tracking fetch notice:', error.message);
      return [];
    }

    return (data as SupabaseTrackingRecord[]) || [];
  } catch (err) {
    console.warn('Supabase order_tracking error:', err);
    return [];
  }
}

/**
 * Upsert an order to the Supabase 'orders' table
 */
export async function upsertOrderToSupabase(order: Order): Promise<boolean> {
  try {
    const payload = mapOrderToSupabase(order);
    const { error } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert order notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert order error:', err);
    return false;
  }
}

/**
 * Update order status and append a milestone event to 'order_tracking' in Supabase
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: Order['status'],
  trackingInfo?: {
    location?: string;
    description?: string;
    carrier?: string;
    awb?: string;
  }
): Promise<boolean> {
  try {
    // 1. Update orders table
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(trackingInfo?.carrier ? { courier_partner: trackingInfo.carrier } : {}),
        ...(trackingInfo?.awb ? { tracking_awb: trackingInfo.awb } : {}),
      })
      .eq('id', orderId);

    if (orderError) {
      console.warn('Supabase update order status notice:', orderError.message);
    }

    // 2. Append milestone to order_tracking table
    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const statusTitles: Record<string, string> = {
      Confirmed: 'Order Confirmed & Atelier Assigned',
      Crafting: 'Handcrafting & Artisan Studio Preparation',
      Dispatched: 'Handed to Courier Partner',
      Delivered: 'Delivered to Doorstep',
      Cancelled: 'Order Cancelled & Production Halted',
    };

    const defaultDescriptions: Record<string, string> = {
      Confirmed: 'Payment authorized. Maker received specifications and commenced material preparation.',
      Crafting: 'Individual piece is being shaped, cured, and packaged in plastic-free eco honeycomb wrap.',
      Dispatched: 'Package sealed with tamper-evident paper tape and in transit with courier partner.',
      Delivered: 'Parcel successfully handed over to recipient.',
      Cancelled: 'Order was marked cancelled by administrator or customer request.',
    };

    const trackingRecord: Partial<SupabaseTrackingRecord> = {
      id: `trk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order_id: orderId,
      status: newStatus,
      title: statusTitles[newStatus] || `Status updated to ${newStatus}`,
      location: trackingInfo?.location || 'Curowit Fulfillment Hub',
      date: dateLabel,
      time: timeLabel,
      description: trackingInfo?.description || defaultDescriptions[newStatus] || `Status updated to ${newStatus}`,
      carrier: trackingInfo?.carrier || 'Delhivery Eco Surface Logistics',
      awb_number: trackingInfo?.awb || `DLV-${orderId.replace(/\D/g, '') || '9142'}`,
      is_completed: true,
      is_current: true,
      created_at: now.toISOString(),
    };

    const { error: trackingError } = await supabase
      .from('order_tracking')
      .insert(trackingRecord);

    if (trackingError) {
      console.warn('Supabase order_tracking insert notice:', trackingError.message);
    }

    return true;
  } catch (err) {
    console.warn('Supabase update status error:', err);
    return false;
  }
}

/**
 * Delete an order and its tracking events from Supabase
 */
export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  try {
    await supabase.from('order_tracking').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.warn('Supabase delete order notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete order error:', err);
    return false;
  }
}
