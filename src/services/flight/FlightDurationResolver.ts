import { parseFlightDateTime } from "./FlightTimeUtils";
import { IDurationProvider } from "./providers/IDurationProvider";
import { AmadeusDurationProvider } from "./providers/AmadeusDurationProvider";
import { AeroDataBoxDurationProvider } from "./providers/AeroDataBoxDurationProvider";
import { AviationStackDurationProvider } from "./providers/AviationStackDurationProvider";

export type DurationSource = "Live" | "Calculated" | "Verified" | "Unavailable";

export interface FlightDurationResult {
  duration: string;
  source: DurationSource;
}

// 24-Hour TTL Dynamic Cache Entry
interface CacheEntry {
  duration: string;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours
const RATE_LIMIT_SUPPRESSION_MS = 5 * 60 * 1000; // 5 Minutes Suppression Window for HTTP 429

// In-Memory Caches
const durationCache = new Map<string, CacheEntry>();
const providerSuppressionMap = new Map<string, number>();

/**
 * Enterprise Single Source of Truth Flight Duration Resolver
 * Manages Step 1 (Current API), Step 2 (Timezone-Aware Timestamps), and Step 3-5 (Provider Failover Chain).
 */
export class FlightDurationResolver {
  // Provider chain ordered by priority: Amadeus (Step 3) -> AeroDataBox (Step 4) -> AviationStack (Step 5)
  private static providerChain: IDurationProvider[] = [
    new AmadeusDurationProvider(),
    new AeroDataBoxDurationProvider(),
    new AviationStackDurationProvider(),
  ];

  /**
   * Resolves flight duration asynchronously across all provider fallback tiers
   */
  public static async resolve(payload: {
    duration?: string;
    scheduledDuration?: string;
    estimatedDuration?: string;
    blockTime?: string;
    flightTime?: string;
    depTimeIso?: string;
    arrTimeIso?: string;
    flightNum?: string;
    departDate?: string;
    originCode?: string;
    destCode?: string;
  }): Promise<FlightDurationResult> {
    // ----------------------------------------------------
    // STEP 1: Current Flight API Payload
    // ----------------------------------------------------
    const apiRaw =
      payload.duration ||
      payload.scheduledDuration ||
      payload.estimatedDuration ||
      payload.blockTime ||
      payload.flightTime;

    if (
      apiRaw &&
      apiRaw !== "—" &&
      apiRaw !== "Flight duration unavailable" &&
      apiRaw !== "Flight Duration Unavailable" &&
      apiRaw.trim() !== ""
    ) {
      return {
        duration: FlightDurationResolver.normalizeDurationFormat(apiRaw),
        source: "Live",
      };
    }

    // ----------------------------------------------------
    // STEP 2: Timezone-Aware Timestamp Calculation
    // ----------------------------------------------------
    if (payload.depTimeIso && payload.arrTimeIso) {
      const calcResult = FlightDurationResolver.calculateFromTimestamps(
        payload.depTimeIso,
        payload.arrTimeIso,
        payload.originCode,
        payload.destCode,
      );
      if (calcResult) {
        return {
          duration: calcResult,
          source: "Calculated",
        };
      }
    }

    // ----------------------------------------------------
    // STEP 3 - 5: Premium Provider Failover Chain & 24h Cache
    // ----------------------------------------------------
    if (payload.flightNum && payload.departDate) {
      const verifiedResult = await FlightDurationResolver.executeProviderChain({
        flightNum: payload.flightNum,
        departDate: payload.departDate,
        originCode: payload.originCode,
        destCode: payload.destCode,
      });

      if (verifiedResult) {
        return {
          duration: verifiedResult,
          source: "Verified",
        };
      }
    }

    // ----------------------------------------------------
    // Failure State: Unavailable
    // ----------------------------------------------------
    return {
      duration: "Flight Duration Unavailable",
      source: "Unavailable",
    };
  }

  /**
   * Instant synchronous resolver for fast UI rendering (Step 1 & Step 2)
   */
  public static resolveSync(payload: {
    duration?: string;
    scheduledDuration?: string;
    estimatedDuration?: string;
    blockTime?: string;
    flightTime?: string;
    depTimeIso?: string;
    arrTimeIso?: string;
    originCode?: string;
    destCode?: string;
  }): FlightDurationResult {
    // Step 1
    const apiRaw =
      payload.duration ||
      payload.scheduledDuration ||
      payload.estimatedDuration ||
      payload.blockTime ||
      payload.flightTime;

    if (
      apiRaw &&
      apiRaw !== "—" &&
      apiRaw !== "Flight duration unavailable" &&
      apiRaw !== "Flight Duration Unavailable" &&
      apiRaw.trim() !== ""
    ) {
      return {
        duration: FlightDurationResolver.normalizeDurationFormat(apiRaw),
        source: "Live",
      };
    }

    // Step 2
    if (payload.depTimeIso && payload.arrTimeIso) {
      const calcResult = FlightDurationResolver.calculateFromTimestamps(
        payload.depTimeIso,
        payload.arrTimeIso,
        payload.originCode,
        payload.destCode,
      );
      if (calcResult) {
        return {
          duration: calcResult,
          source: "Calculated",
        };
      }
    }

    return {
      duration: "Flight Duration Unavailable",
      source: "Unavailable",
    };
  }

  /**
   * Executes the provider failover pipeline with 24-hour caching and HTTP 429 suppression
   */
  private static async executeProviderChain(req: {
    flightNum: string;
    departDate: string;
    originCode?: string;
    destCode?: string;
  }): Promise<string | null> {
    const cleanFlight = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const cleanDate = req.departDate.trim();
    const cleanOrigin = (req.originCode || "").trim().toUpperCase();
    const cleanDest = (req.destCode || "").trim().toUpperCase();

    const cacheKey = `${cleanFlight}:${cleanDate}:${cleanOrigin}:${cleanDest}`;

    // 1. Check 24-Hour Cache
    const cached = durationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.duration;
    }

    // 2. Iterate Provider Chain silently
    for (const provider of FlightDurationResolver.providerChain) {
      // Check if provider is currently suppressed due to rate limits (HTTP 429)
      const suppressedUntil = providerSuppressionMap.get(provider.providerName) || 0;
      if (Date.now() < suppressedUntil) {
        // Skip suppressed provider silently
        continue;
      }

      try {
        const duration = await provider.fetchDuration({
          flightNum: cleanFlight,
          departDate: cleanDate,
          originCode: cleanOrigin,
          destCode: cleanDest,
        });

        if (duration) {
          const normalized = FlightDurationResolver.normalizeDurationFormat(duration);
          // Cache successful response for 24h
          durationCache.set(cacheKey, {
            duration: normalized,
            timestamp: Date.now(),
          });
          return normalized;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("429")) {
          // Temporarily suppress provider for 5 minutes
          console.warn(
            `[FlightDurationResolver] Suppressing ${provider.providerName} for 5m due to HTTP 429 rate limit.`,
          );
          providerSuppressionMap.set(
            provider.providerName,
            Date.now() + RATE_LIMIT_SUPPRESSION_MS,
          );
        } else {
          console.warn(
            `[FlightDurationResolver] Provider ${provider.providerName} failed silently:`,
            err,
          );
        }
      }
    }

    return null;
  }

  /**
   * Date-aware, timezone-aware timestamp duration calculator
   */
  private static calculateFromTimestamps(
    depIso: string,
    arrIso: string,
    originCode?: string,
    destCode?: string,
  ): string | null {
    try {
      const depDate = parseFlightDateTime(depIso, originCode || "");
      const arrDate = parseFlightDateTime(arrIso, destCode || "");

      if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) {
        return null;
      }

      const diffMs = arrDate.getTime() - depDate.getTime();
      if (diffMs <= 0) {
        return null;
      }

      const totalMins = Math.floor(diffMs / 60000);
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;

      if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
      if (hrs > 0) return `${hrs}h`;
      return `${mins}m`;
    } catch (e) {
      console.error("[FlightDurationResolver] Timestamp calculation error:", e);
      return null;
    }
  }

  /**
   * Normalizes raw ISO or text duration strings (e.g., "PT2H35M", "2 hrs 15 mins") to "2h 35m"
   */
  public static normalizeDurationFormat(raw: string): string {
    const clean = raw.trim();

    // ISO 8601 Duration format: PT2H35M
    const isoMatch = clean.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
    if (isoMatch) {
      const h = isoMatch[1] ? parseInt(isoMatch[1], 10) : 0;
      const m = isoMatch[2] ? parseInt(isoMatch[2], 10) : 0;
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      if (m > 0) return `${m}m`;
    }

    // HH:MM or HH:MM:SS format
    const hhmmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (hhmmMatch) {
      const h = parseInt(hhmmMatch[1], 10);
      const m = parseInt(hhmmMatch[2], 10);
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      if (m > 0) return `${m}m`;
    }

    // "X hrs Y mins" -> "Xh Ym"
    return clean
      .replace(/(\d+)\s*hrs?/gi, "$1h")
      .replace(/(\d+)\s*mins?/gi, "$1m")
      .replace(/\band\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}
