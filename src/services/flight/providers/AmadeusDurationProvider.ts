import { IDurationProvider, FlightDurationRequest } from "./IDurationProvider";

/**
 * Step 3 Primary Premium Provider: Amadeus Flight Offers API
 */
export class AmadeusDurationProvider implements IDurationProvider {
  public readonly providerName = "Amadeus";
  private clientId: string | undefined;
  private clientSecret: string | undefined;

  constructor() {
    this.clientId = process.env.AMADEUS_CLIENT_ID;
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  }

  public async fetchDuration(req: FlightDurationRequest): Promise<string | null> {
    const cleanFlight = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const cleanDate = req.departDate.trim();

    // Safe fallback if credentials are missing in local dev
    if (!this.clientId || !this.clientSecret) {
      return this.simulateAmadeusDuration(cleanFlight, cleanDate, req.originCode, req.destCode);
    }

    try {
      // 1. Fetch OAuth2 Token
      const authRes = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (authRes.status === 429) {
        throw new Error("HTTP 429 Rate Limit");
      }

      if (!authRes.ok) {
        return null;
      }

      const authData = await authRes.json();
      const accessToken = authData.access_token;
      if (!accessToken) return null;

      // 2. Fetch Flight Offers / Schedules
      const origin = req.originCode || "DEL";
      const destination = req.destCode || "BOM";

      const searchUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${cleanDate}&adults=1&nonStop=true&max=5`;
      const searchRes = await fetch(searchUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (searchRes.status === 429) {
        throw new Error("HTTP 429 Rate Limit");
      }

      if (!searchRes.ok) return null;

      const data = await searchRes.json();
      if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
        return null;
      }

      // Extract ISO 8601 duration string (e.g. PT2H35M)
      const firstOffer = data.data[0];
      const durationIso = firstOffer?.itineraries?.[0]?.duration;
      if (durationIso) {
        return this.parseIsoDuration(durationIso);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("429")) {
        throw err; // rethrow 429 to trigger provider suppression
      }
      console.warn(`[AmadeusDurationProvider] Lookup failed silently for ${cleanFlight}:`, err);
    }

    return null;
  }

  /**
   * Converts ISO 8601 duration (e.g. PT2H35M) to clean format "2h 35m"
   */
  private parseIsoDuration(isoStr: string): string | null {
    const match = isoStr.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
    if (!match) return null;
    const hrs = match[1] ? parseInt(match[1], 10) : 0;
    const mins = match[2] ? parseInt(match[2], 10) : 0;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    if (mins > 0) return `${mins}m`;
    return null;
  }

  /**
   * Local development simulation fallback for Amadeus
   */
  private simulateAmadeusDuration(
    flightNum: string,
    date: string,
    origin?: string,
    dest?: string,
  ): string | null {
    // Basic hash simulation for offline dev
    if (origin && dest) {
      if ((origin === "DEL" && dest === "BOM") || (origin === "BOM" && dest === "DEL")) {
        return "2h 10m";
      }
      if ((origin === "LKO" && dest === "DEL") || (origin === "DEL" && dest === "LKO")) {
        return "1h 20m";
      }
      if ((origin === "DEL" && dest === "BLR") || (origin === "BLR" && dest === "DEL")) {
        return "2h 45m";
      }
    }
    return null;
  }
}
