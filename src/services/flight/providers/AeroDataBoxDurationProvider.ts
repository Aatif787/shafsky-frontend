import { IDurationProvider, FlightDurationRequest } from "./IDurationProvider";

/**
 * Step 4 Failover 1 Provider: AeroDataBox API
 */
export class AeroDataBoxDurationProvider implements IDurationProvider {
  public readonly providerName = "AeroDataBox";
  private apiKey: string | undefined;
  private apiHost: string;

  constructor() {
    this.apiKey = process.env.AERODATABOX_API_KEY;
    this.apiHost = "aerodatabox.p.rapidapi.com";
  }

  public async fetchDuration(req: FlightDurationRequest): Promise<string | null> {
    const cleanFlight = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const date = req.departDate.trim();

    if (!this.apiKey) {
      return this.simulateAeroDataBox(cleanFlight, date);
    }

    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${cleanFlight}/${date}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
          Accept: "application/json",
        },
      });

      if (response.status === 429) {
        throw new Error("HTTP 429 Rate Limit");
      }

      if (!response.ok || response.status === 204) {
        return null;
      }

      const raw = await response.json();
      const single = Array.isArray(raw) ? raw[0] : raw;

      if (!single) return null;

      const depTime = single.departure?.scheduledTimeUtc || single.departure?.scheduledTimeLocal;
      const arrTime = single.arrival?.scheduledTimeUtc || single.arrival?.scheduledTimeLocal;

      if (depTime && arrTime) {
        const dep = new Date(depTime);
        const arr = new Date(arrTime);
        const diffMs = arr.getTime() - dep.getTime();
        if (diffMs > 0) {
          const totalMins = Math.floor(diffMs / 60000);
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
          if (hrs > 0) return `${hrs}h`;
          return `${mins}m`;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("429")) {
        throw err; // rethrow 429 to trigger suppression
      }
      console.warn(`[AeroDataBoxDurationProvider] Lookup failed silently for ${cleanFlight}:`, err);
    }

    return null;
  }

  private simulateAeroDataBox(flightNum: string, date: string): string | null {
    if (flightNum === "AI101") return "2h 10m";
    if (flightNum === "6E205") return "1h 45m";
    return null;
  }
}
