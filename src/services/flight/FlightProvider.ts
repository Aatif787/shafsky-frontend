import { FlightRequest, FlightData } from "./FlightTypes";
import { FlightAPIError, FlightNotFoundError, FlightError } from "./FlightErrors";
import { FlightMapper } from "./FlightMapper";

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
   * Fetches live flight schedules from AeroDataBox API with retries and timeout
   */
  public async fetchFlightData(req: FlightRequest): Promise<FlightData | FlightData[]> {
    const cleanedFlightNum = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const date = req.departDate.trim();

    if (!this.apiKey) {
      throw new FlightAPIError(
        "Live flight verification API key is not configured.",
        "API_KEY_MISSING"
      );
    }

    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${cleanedFlightNum}/${date}`;

    // Retry configurations
    const maxAttempts = 3; // 1 initial + 2 retries
    const timeoutMs = 5000; // 5-second timeout boundary

    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
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
          } catch {
            throw new FlightAPIError(
              "Flight data temporarily unavailable (Invalid JSON response).",
              "INVALID_RESPONSE_FORMAT"
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

        // Handle client error responses
        if (response.status === 401 || response.status === 403) {
          throw new FlightAPIError(
            "Live flight provider authorization failed.",
            "UNAUTHORIZED"
          );
        }
        if (response.status === 429) {
          throw new FlightAPIError(
            "Upstream rate limits exceeded for AeroDataBox API. Please try again later.",
            "RATE_LIMIT_EXCEEDED"
          );
        }
        if (response.status === 404) {
          throw new FlightNotFoundError(cleanedFlightNum);
        }

        // Handle server errors (attempt retries for 5xx)
        if (response.status >= 500) {
          if (attempt < maxAttempts) {
            const backoff = attempt * 500;
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          throw new FlightAPIError(
            "Flight data temporarily unavailable due to upstream server issues. Please try again later.",
            "UPSTREAM_SERVER_ERROR"
          );
        }

        // Fallback catch-all for unexpected statuses
        throw new FlightAPIError(
          `Unable to verify this flight at the moment (Status: ${response.status}).`,
          "UNEXPECTED_STATUS"
        );
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof FlightError) {
          throw err;
        }

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
          "CONNECTION_FAILURE"
        );
      }
    }

    throw new FlightAPIError("Flight verification failed after multiple retries.");
  }
}
