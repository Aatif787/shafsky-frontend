export type SystemEventType =
  | "booking.created"
  | "booking.status.changed"
  | "service.created"
  | "service.updated"
  | "service.deleted"
  | "slot.released"
  | "waitlist.promoted"
  | "currency.synced"
  | "review.submitted"
  | "review.moderated";

export interface SystemEventPayload {
  eventType: SystemEventType;
  payload: Record<string, any>;
  publishedBy?: string;
}

type EventListener = (payload: any) => void | Promise<void>;

const getBackendUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env?.VITE_BACKEND_API_URL) {
    return process.env.VITE_BACKEND_API_URL;
  }
  return "http://127.0.0.1:8003";
};

export class EventBus {
  private static listeners: Map<SystemEventType, Set<EventListener>> = new Map();

  /**
   * Register a subscriber for a system event type
   */
  public static subscribe(type: SystemEventType, listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener);
      }
    };
  }

  /**
   * Publish an event to the bus, logs it to database, and triggers listeners
   */
  public static async publish(
    type: SystemEventType,
    payload: Record<string, any>,
    publishedBy?: string,
  ): Promise<void> {
    console.log(`[EventBus] Publishing event: ${type}`, payload);

    // 1. Trigger subscribers asynchronously (non-blocking)
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((listener) => {
        try {
          const res = listener(payload);
          if (res instanceof Promise) {
            res.catch((err) => console.error(`[EventBus] Subscriber error on ${type}:`, err));
          }
        } catch (err) {
          console.error(`[EventBus] Subscriber error on ${type}:`, err);
        }
      });
    }

    // 2. Log event to FastAPI backend system_events table asynchronously
    try {
      const url = `${getBackendUrl()}/api/system-events`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: type,
          payload,
          published_by: publishedBy || null,
        }),
      });
    } catch (err) {
      console.warn(`[EventBus] Database event log exception:`, err);
    }
  }
}
