import { FlightData } from "./FlightTypes";

export class FlightMapper {
  /**
   * Maps raw API payload to unified internal FlightData structure
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toFlightData(raw: any): FlightData {
    const flightNum = (raw.number || "").trim().toUpperCase();
    const carrierIata = raw.airline?.iata || (flightNum ? flightNum.replace(/\d+$/, "") : "—");
    const carrierName =
      raw.airline?.name || (carrierIata !== "—" ? `${carrierIata} Airline` : "Unknown Airline");

    const originCode = raw.departure?.airport?.iata || "—";
    const originName = raw.departure?.airport?.name || "Unknown Airport";
    const originCity =
      raw.departure?.airport?.city ||
      (raw.departure?.airport?.name ? raw.departure.airport.name.split(" ")[0] : "Unknown City");

    const destCode = raw.arrival?.airport?.iata || "—";
    const destName = raw.arrival?.airport?.name || "Unknown Airport";
    const destCity =
      raw.arrival?.airport?.city ||
      (raw.arrival?.airport?.name ? raw.arrival.airport.name.split(" ")[0] : "Unknown City");

    const departureTime =
      raw.departure?.scheduledTimeUtc || raw.departure?.scheduledTimeLocal || "";
    const departureTerminal = raw.departure?.terminal || "";

    const arrivalTime = raw.arrival?.scheduledTimeUtc || raw.arrival?.scheduledTimeLocal || "";
    const arrivalTerminal = raw.arrival?.terminal || "";

    // Compute duration from departure and arrival local times if available
    let duration = "—";
    if (departureTime && arrivalTime) {
      try {
        const depDate = new Date(departureTime);
        const arrDate = new Date(arrivalTime);
        const diffMs = arrDate.getTime() - depDate.getTime();
        if (diffMs > 0) {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          duration = diffHrs > 0 ? `${diffHrs} hrs ${diffMins} mins` : `${diffMins} mins`;
        }
      } catch (e) {
        // Failed to calculate duration
      }
    }

    return {
      flightNum,
      carrier: {
        iata: carrierIata,
        name: carrierName,
      },
      origin: {
        code: originCode,
        name: originName,
        city: originCity,
      },
      destination: {
        code: destCode,
        name: destName,
        city: destCity,
      },
      departure: {
        scheduledTime: departureTime,
        terminal: departureTerminal,
      },
      arrival: {
        scheduledTime: arrivalTime,
        terminal: arrivalTerminal,
      },
      duration,
      status: raw.status || "Scheduled",
      aircraft: {
        model: raw.aircraft?.model || "Commercial Aircraft",
        reg: raw.aircraft?.registration,
      },
    };
  }
}
