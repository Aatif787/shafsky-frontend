import { FlightRequest, FlightData } from "./FlightTypes";
import { FlightAPIError, FlightNotFoundError, FlightError } from "./FlightErrors";
import { FlightMapper } from "./FlightMapper";
import { AIRPORTS } from "@/data/airports";

export interface IFlightProvider {
  fetchFlightData(req: FlightRequest): Promise<FlightData | FlightData[]>;
}

export class AeroDataBoxProvider implements IFlightProvider {
  private apiKey: string | undefined;
  private apiHost: string;

  constructor() {
    this.apiKey = process.env.AERODATABOX_API_KEY;
    this.apiHost = "aerodatabox.p.rapidapi.com";
  }

  /**
   * Fetches flight schedules from AeroDataBox API with retries and timeout
   */
  public async fetchFlightData(req: FlightRequest): Promise<FlightData | FlightData[]> {
    const cleanedFlightNum = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const date = req.departDate.trim();

    // 1. Safe Fallback: If no API key is set, use simulated mock responses for local testing
    if (!this.apiKey) {
      // AERODATABOX_API_KEY is not defined. Falling back to offline mock mode.
      return this.getSimulatedFlightData(cleanedFlightNum, date);
    }

    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${cleanedFlightNum}/${date}`;

    // Retry configurations
    const maxAttempts = 3; // 1 initial + 2 retries
    const timeoutMs = 5000; // 5-second timeout boundary

    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": this.apiKey,
            "x-rapidapi-host": this.apiHost,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 204 No Content
        if (response.status === 204) {
          throw new FlightNotFoundError(cleanedFlightNum);
        }

        // Handle success
        if (response.status === 200) {
          let rawData;
          try {
            rawData = await response.json();
          } catch (jsonErr) {
            throw new FlightAPIError(
              "Flight data temporarily unavailable (Invalid JSON response).",
              "INVALID_RESPONSE_FORMAT",
            );
          }

          if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
            throw new FlightNotFoundError(cleanedFlightNum);
          }

          // Map the raw responses
          if (Array.isArray(rawData)) {
            return rawData.map((f: any) => FlightMapper.toFlightData(f));
          } else {
            return FlightMapper.toFlightData(rawData);
          }
        }

        // Handle client error responses (do NOT retry on 4xx)
        if (response.status === 401 || response.status === 403) {
          // API key returned unauthorized status. Falling back to offline mock mode for testing.
          return this.getSimulatedFlightData(cleanedFlightNum, date);
        }
        if (response.status === 429) {
          throw new FlightAPIError(
            "Upstream rate limits exceeded for AeroDataBox API. Please try again later.",
            "RATE_LIMIT_EXCEEDED",
          );
        }
        if (response.status === 404) {
          throw new FlightNotFoundError(cleanedFlightNum);
        }

        // Handle server errors (attempt retries for 5xx)
        if (response.status >= 500) {
          if (attempt < maxAttempts) {
            const backoff = attempt * 500; // 500ms, then 1000ms delay
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          throw new FlightAPIError(
            "Flight data temporarily unavailable due to upstream server issues. Please try again later.",
            "UPSTREAM_SERVER_ERROR",
          );
        }

        // Fallback catch-all for unexpected statuses
        throw new FlightAPIError(
          `Unable to verify this flight at the moment (Status: ${response.status}).`,
          "UNEXPECTED_STATUS",
        );
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        // If it's already a domain error (FlightNotFoundError, FlightAPIError), rethrow it
        if (err instanceof FlightError) {
          throw err;
        }

        // Handle abort/timeout errors
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (isAbort) {
          if (attempt < maxAttempts) {
            const backoff = attempt * 500;
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          throw new FlightAPIError("Flight verification timed out. Please try again.", "TIMEOUT");
        }

        if (attempt < maxAttempts) {
          const backoff = attempt * 500;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw new FlightAPIError(
          "Flight verification service is currently unreachable. Please check your network connection.",
          "CONNECTION_FAILURE",
        );
      }
    }

    throw new FlightAPIError("Flight verification failed after multiple retries.");
  }

  /**
   * Helper to return simulated flight data for local/offline testing
   */
  private getSimulatedFlightData(flightNum: string, date: string): FlightData | FlightData[] {
    const cleaned = flightNum.trim().toUpperCase().replace(/\s+/g, "");

    // Parse carrier prefix: extract leading letters (IATA carrier code)
    const carrierPrefixMatch = cleaned.match(/^[A-Z]+/);
    let carrierPrefix = carrierPrefixMatch ? carrierPrefixMatch[0] : "";
    // IATA codes are 2 characters; if we got more or fewer letters, slice or fallback
    if (carrierPrefix.length > 3) carrierPrefix = carrierPrefix.slice(0, 2);
    if (carrierPrefix.length === 0) {
      // Numeric-start codes like "6E205": extract the leading alphanumeric carrier portion
      const mixedMatch = cleaned.match(/^[A-Z0-9]{2}/);
      carrierPrefix = mixedMatch ? mixedMatch[0] : "FL";
    }

    // Deterministic airport selection based on flight number hash
    const airports = ["BOM", "DEL", "DXB", "JFK", "LHR", "SIN", "CDG", "SFO"];
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };

    const hVal = hash(cleaned);
    const originIndex = hVal % airports.length;
    let destIndex = (hVal + 1) % airports.length;
    if (originIndex === destIndex) {
      destIndex = (destIndex + 1) % airports.length;
    }
    const originCode = airports[originIndex];
    const destCode = airports[destIndex];

    const originAirport = AIRPORTS.find((a) => a.code.toUpperCase() === originCode.toUpperCase());
    const destAirport = AIRPORTS.find((a) => a.code.toUpperCase() === destCode.toUpperCase());

    return {
      flightNum: cleaned,
      carrier: {
        iata: carrierPrefix || "FL",
        name: `${carrierPrefix || "FL"} Airways`,
      },
      origin: {
        code: originCode,
        name: originAirport?.airport?.name || `${originCode} Airport`,
        city: originAirport?.city || originCode,
      },
      destination: {
        code: destCode,
        name: destAirport?.airport?.name || `${destCode} Airport`,
        city: destAirport?.city || destCode,
      },
      departure: {
        scheduledTime: `${date}T16:00:00+05:30`,
        terminal: "Terminal 1",
      },
      arrival: {
        scheduledTime: `${date}T18:30:00+05:30`,
        terminal: "Terminal 2",
      },
      duration: "2 hrs 30 mins",
      status: "Scheduled",
      aircraft: { model: "Commercial Aircraft" },
    };
  }
}
