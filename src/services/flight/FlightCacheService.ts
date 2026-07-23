import { FlightData } from "./FlightTypes";

/**
 * Reusable memory-optimized caching service for flight coordinate queries.
 */
export class FlightCacheService {
  private static cache = new Map<string, { data: FlightData | FlightData[]; timestamp: number }>();
  private static TTL = 1000 * 60 * 10; // 10 minutes Cache TTL

  public static get(flightNum: string, departDate: string): FlightData | FlightData[] | null {
    const key = `${flightNum.toUpperCase().trim()}:${departDate.trim()}`;
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check TTL expiration
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public static set(flightNum: string, departDate: string, data: FlightData | FlightData[]): void {
    // Memory Optimization: prune stale entries before adding new ones
    this.pruneStaleEntries();

    const key = `${flightNum.toUpperCase().trim()}:${departDate.trim()}`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private static pruneStaleEntries(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  public static clear(): void {
    this.cache.clear();
  }
}

/**
 * Memory-optimized rate limiter to protect backend endpoints from validation spam.
 */
export class FlightRateLimiter {
  private static tracker = new Map<string, { count: number; windowStart: number }>();
  private static WINDOW_MS = 60 * 1000; // 1 minute window
  private static MAX_REQUESTS = 60; // Max 60 validation requests per minute

  public static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.tracker.get(ip);

    this.pruneStaleRecords();

    if (!record) {
      this.tracker.set(ip, {
        count: 1,
        windowStart: now,
      });
      return false;
    }

    if (now - record.windowStart > this.WINDOW_MS) {
      // Reset window
      this.tracker.set(ip, {
        count: 1,
        windowStart: now,
      });
      return false;
    }

    if (record.count >= this.MAX_REQUESTS) {
      return true;
    }

    record.count++;
    return false;
  }

  private static pruneStaleRecords(): void {
    const now = Date.now();
    for (const [ip, record] of this.tracker.entries()) {
      if (now - record.windowStart > this.WINDOW_MS) {
        this.tracker.delete(ip);
      }
    }
  }
}
