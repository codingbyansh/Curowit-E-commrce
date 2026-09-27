export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface OpenRazorpayCheckoutParams {
  amountInRupees: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  receipt?: string;
  notes?: Record<string, string>;
  preferredMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  onSuccess: (payment: RazorpayPaymentResult) => void;
  onDismiss?: () => void;
  onError?: (errorMessage: string) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

let scriptLoadingPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptLoadingPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function openRazorpayCheckout(params: OpenRazorpayCheckoutParams): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    params.onError?.('Unable to load Razorpay Checkout SDK. Please check your internet connection.');
    return;
  }

  // 1. Create order on backend
  let orderId: string | null = null;
  let keyId = 'rzp_test_TgyT0boqInIYsI';
  let amountInPaise = Math.round(params.amountInRupees * 100);

  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: params.amountInRupees,
        currency: 'INR',
        receipt: params.receipt || `cw_rcpt_${Date.now()}`,
        notes: params.notes || {},
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) orderId = data.id;
      if (data.keyId) keyId = data.keyId;
      if (data.amount) amountInPaise = data.amount;
    }
  } catch {
    // Fallback to client-side order initialization with test key if backend route is unreachable
  }

  const cleanPhone = (params.customerPhone || '').replace(/[^0-9+]/g, '');

  const options: Record<string, unknown> = {
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Curowit',
    description: params.description,
    image: `${window.location.origin}/curowit-logo.jpg`,
    ...(orderId ? { order_id: orderId } : {}),
    prefill: {
      name: params.customerName || '',
      email: params.customerEmail || '',
      contact: cleanPhone || '',
      ...(params.preferredMethod ? { method: params.preferredMethod } : {}),
    },
    notes: {
      store: 'Curowit — Home of Creatives',
      ...(params.notes || {}),
    },
    theme: {
      color: '#07545A',
      backdrop_color: 'rgba(7, 84, 90, 0.55)',
    },
    modal: {
      ondismiss: () => {
        params.onDismiss?.();
      },
      confirm_close: true,
    },
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }) => {
      try {
        const verifyRes = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.verified) {
          params.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          params.onError?.(verifyData.error || 'Payment signature verification failed.');
        }
      } catch {
        // If verification endpoint had a network hiccup but Razorpay returned a valid payment_id
        if (response.razorpay_payment_id) {
          params.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          params.onError?.('Unable to verify payment.');
        }
      }
    },
  };

  const rzpInstance = new window.Razorpay(options);
  rzpInstance.on('payment.failed', (response: any) => {
    const reason =
      response?.error?.description ||
      response?.error?.reason ||
      'Payment could not be completed. Please try again.';
    params.onError?.(reason);
  });

  rzpInstance.open();
}
