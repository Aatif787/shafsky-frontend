import { IDurationProvider, FlightDurationRequest } from "./IDurationProvider";

/**
 * Step 5 Failover 2 Provider: AviationStack / FlightAware API
 */
export class AviationStackDurationProvider implements IDurationProvider {
  public readonly providerName = "AviationStack";
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY || process.env.FLIGHTAWARE_API_KEY;
  }

  public async fetchDuration(req: FlightDurationRequest): Promise<string | null> {
    const cleanFlight = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");

    if (!this.apiKey) {
      return this.simulateAviationStack(cleanFlight);
    }

    try {
      const url = `https://api.aviationstack.com/v1/flights?access_key=${this.apiKey}&flight_iata=${cleanFlight}&limit=1`;
      const response = await fetch(url);

      if (response.status === 429) {
        throw new Error("HTTP 429 Rate Limit");
      }

      if (!response.ok) return null;

      const data = await response.json();
      const firstFlight = data?.data?.[0];
      if (!firstFlight) return null;

      const depTime = firstFlight.departure?.scheduled;
      const arrTime = firstFlight.arrival?.scheduled;

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
        throw err;
      }
      console.warn(`[AviationStackDurationProvider] Lookup failed silently for ${cleanFlight}:`, err);
    }

    return null;
  }

  private simulateAviationStack(flightNum: string): string | null {
    if (flightNum.startsWith("AI")) return "2h 15m";
    if (flightNum.startsWith("6E")) return "1h 50m";
    return null;
  }
}
