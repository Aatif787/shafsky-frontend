export interface FlightDurationRequest {
  flightNum: string;
  departDate: string; // YYYY-MM-DD
  originCode?: string;
  destCode?: string;
}

export interface IDurationProvider {
  /**
   * Human-readable identifier for logging/metrics
   */
  readonly providerName: string;

  /**
   * Fetches flight duration string (e.g., "2h 35m") or null if unavailable/failed
   */
  fetchDuration(req: FlightDurationRequest): Promise<string | null>;
}
