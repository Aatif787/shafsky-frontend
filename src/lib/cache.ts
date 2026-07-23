interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// In-memory memory cache fallback
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

class ServerCache implements CacheStore {
  private redisClient: any = null;
  private initialized = false;

  private async getRedis() {
    if (typeof window !== "undefined") return null;
    if (this.initialized) return this.redisClient;

    this.initialized = true;
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    if (redisUrl) {
      try {
        // Dynamically import @vercel/kv optionally
        // @ts-ignore
        const { createClient } = await import("@vercel/kv");
        this.redisClient = createClient({
          url: redisUrl,
          token: process.env.KV_REST_API_TOKEN,
        });
        console.log("[Cache] Redis/KV Client initialized successfully.");
      } catch (err) {
        console.warn("[Cache] Redis/KV client could not be loaded dynamically, using memory fallback:", err);
      }
    }
    return this.redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window !== "undefined") return null;
    
    const redis = await this.getRedis();
    if (redis) {
      try {
        const val = await redis.get(key);
        if (val) {
          return typeof val === "string" ? JSON.parse(val) : val;
        }
        return null;
      } catch (err) {
        console.warn(`[Cache] Redis get error for key ${key}:`, err);
      }
    }

    // Memory fallback
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number = 600000): Promise<void> {
    if (typeof window !== "undefined") return;

    const redis = await this.getRedis();
    if (redis) {
      try {
        const strVal = JSON.stringify(value);
        await redis.set(key, strVal, { ex: Math.ceil(ttlMs / 1000) });
        return;
      } catch (err) {
        console.warn(`[Cache] Redis set error for key ${key}:`, err);
      }
    }

    // Memory fallback
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async del(key: string): Promise<void> {
    if (typeof window !== "undefined") return;

    const redis = await this.getRedis();
    if (redis) {
      try {
        await redis.del(key);
        return;
      } catch (err) {
        console.warn(`[Cache] Redis del error for key ${key}:`, err);
      }
    }

    memoryCache.delete(key);
  }
}

export const cache = new ServerCache();
