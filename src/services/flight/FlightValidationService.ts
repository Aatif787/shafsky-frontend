import { FlightRequest, FlightData } from "./FlightTypes";
import { FlightValidationError } from "./FlightErrors";
import { AeroDataBoxProvider, IFlightProvider } from "./FlightProvider";
import { FlightCacheService } from "./FlightCacheService";
import { checkBookingEligibility } from "./FlightTimeUtils";

export class FlightValidationService {
  private provider: IFlightProvider;

  constructor(provider: IFlightProvider = new AeroDataBoxProvider()) {
    this.provider = provider;
  }

  /**
   * Orchestrates the flight validation checks with caching
   */
  public async validateFlight(
    req: FlightRequest,
    threshold: number = 6,
  ): Promise<FlightData | FlightData[]> {
    // 1. Pre-clearance validation pre-checks (regex format syntax check)
    const cleanedFlightNum = req.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    const cleanedDepartDate = req.departDate.trim();

    if (!cleanedFlightNum) {
      throw new FlightValidationError("Flight number is required.");
    }

    if (!cleanedDepartDate) {
      throw new FlightValidationError("Departure date is required.");
    }

    // Strict date format validator (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(cleanedDepartDate)) {
      throw new FlightValidationError("Invalid departure date format. Use YYYY-MM-DD.");
    }

    // Accept 2-4 alphanumeric characters followed by 1-4 digits
    const pattern = /^[A-Z0-9]{2,4}\d{1,4}$/;
    if (!pattern.test(cleanedFlightNum)) {
      throw new FlightValidationError(
        "Invalid flight number format. Use standard patterns like AERO77, AI9811, 6E205.",
      );
    }

    // Helper to dynamically attach timezone-aware booking eligibility
    const attachEligibility = (f: FlightData): FlightData => {
      const isArrival = req.tripType === "round_trip";
      const targetTime = isArrival ? f.arrival.scheduledTime : f.departure.scheduledTime;
      const targetAirport = isArrival ? f.destination.code : f.origin.code;
      const eligibility = checkBookingEligibility(
        targetTime,
        targetAirport,
        req.tripType,
        threshold,
        isArrival,
      );
      return {
        ...f,
        eligibility,
      };
    };

    // 2. Check Cache
    const cachedData = FlightCacheService.get(cleanedFlightNum, cleanedDepartDate);
    if (cachedData) {
      if (Array.isArray(cachedData)) {
        return cachedData.map(attachEligibility);
      }
      return attachEligibility(cachedData);
    }

    const liveData = await this.provider.fetchFlightData({
      flightNum: cleanedFlightNum,
      departDate: cleanedDepartDate,
      tripType: req.tripType,
    });

    // 3. Save Cache (save raw data before eligibility mapping to avoid caching stale eligibility state)
    FlightCacheService.set(cleanedFlightNum, cleanedDepartDate, liveData);

    if (Array.isArray(liveData)) {
      return liveData.map(attachEligibility);
    }
    return attachEligibility(liveData);
  }
}
