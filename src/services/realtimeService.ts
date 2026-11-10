import { syncEventBus, SyncEventType } from '../lib/foundingCreatorSync';

export interface RealtimeMessage {
  type: string;
  data: any;
  timestamp: string;
}

type RealtimeListener = (event: RealtimeMessage) => void;

class RealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectTimer: any = null;
  private isConnecting = false;
  private isConnected = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('curowit_realtime_channel');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.type) {
              this.handleIncomingMessage(event.data, false);
            }
          };
        }
      } catch (err) {
        console.warn('Notice initializing BroadcastChannel:', err);
      }

      this.connect();
    }
  }

  public connect() {
    if (typeof window === 'undefined' || this.isConnecting || (this.eventSource && this.eventSource.readyState === EventSource.OPEN)) {
      return;
    }

    this.isConnecting = true;
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/realtime/stream');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.eventSource.onmessage = (event) => {
        if (!event.data || event.data.startsWith(':')) return; // ignore comments / keepalives
        try {
          const parsed: RealtimeMessage = JSON.parse(event.data);
          this.handleIncomingMessage(parsed, true);
        } catch (err) {
          console.warn('Realtime event parse notice:', err);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Attempt reconnection after 3.5 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 3500);
        }
      };
    } catch (err) {
      this.isConnecting = false;
      console.warn('Realtime connection setup notice:', err);
    }
  }

  private handleIncomingMessage(msg: RealtimeMessage, broadcastToTabs: boolean) {
    if (!msg || !msg.type) return;

    // 1. Notify direct realtime subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.warn('Realtime listener error:', e);
      }
    });

    // 2. Dispatch mapped events to syncEventBus for admin and creator portal
    switch (msg.type) {
      case 'APPLICATION_SUBMITTED':
      case 'APPLICATION_REVIEWED':
        syncEventBus.notify('APPLICATION_UPDATED', msg.data?.application || msg.data);
        if (msg.data?.profile) {
          syncEventBus.notify('PROFILE_UPDATED', msg.data.profile);
        }
        break;
      case 'PROFILE_UPDATED':
        syncEventBus.notify('PROFILE_UPDATED', msg.data?.profile || msg.data);
        break;
      case 'PAYMENT_METHODS_UPDATED':
        syncEventBus.notify('PAYMENT_METHODS_UPDATED', msg.data?.paymentMethod || msg.data);
        break;
      case 'TICKETS_UPDATED':
      case 'TICKET_CREATED':
        syncEventBus.notify('TICKETS_UPDATED', msg.data?.ticket || msg.data);
        break;
      case 'ORDER_CREATED':
      case 'ORDER_UPDATED':
      case 'ORDER_DELETED':
        syncEventBus.notify('ORDERS_UPDATED', msg.data);
        break;
      case 'CATALOG_UPDATED':
        syncEventBus.notify('PRODUCTS_UPDATED', msg.data);
        break;
      default:
        break;
    }

    // 3. Mirror to sibling browser tabs via BroadcastChannel
    if (broadcastToTabs && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {}
    }
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(type: string, data: any) {
    const msg: RealtimeMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    // 1. Local handling
    this.handleIncomingMessage(msg, true);

    // 2. Forward to server so other users & devices receive it
    fetch('/api/realtime/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    }).catch((err) => {
      console.warn('Realtime broadcast upstream notice:', err);
    });
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }
}

export const realtimeService = new RealtimeService();
