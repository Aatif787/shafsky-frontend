export function getServicePrice(serviceId: string): number {
  switch (serviceId) {
    case "jet_charter":
    case "charter":
    case "private_jet":
      return 450000;
    case "air_ambulance":
    case "medical":
      return 185000;
    case "train_ambulance":
      return 45000;
    case "hum":
    case "repatriation":
    case "human_remains":
      return 65000;
    case "cargo":
    case "air_cargo":
    case "freight":
      return 45000;
    case "avi":
    case "pet_transport":
    case "live_animal":
      return 28000;
    case "hotel":
    case "hotel_booking":
      return 32000;
    case "visa":
    case "visa_assistance":
      return 8500;
    case "air_ticketing":
    case "ticketing":
      return 85000;
    case "onboard_meals":
    case "meals":
      return 4500;
    case "transport":
      return 14000;
    case "fast_track":
      return 7500;
    case "lounge":
      return 9500;
    case "meet_greet":
    default:
      return 12500;
  }
}
