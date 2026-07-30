export function generateBookingReference(serviceType: string): string {
  const prefixMap: Record<string, string> = {
    jet_charter: "SHF-JTS-",
    air_ambulance: "SHF-MED-",
    train_ambulance: "SHF-TRN-",
    hum: "SHF-HUM-",
    cargo: "SHF-CGO-",
    avi: "SHF-AVI-",
    hotel: "SHF-HTL-",
    visa: "SHF-VSA-",
    air_ticketing: "SHF-TCK-",
    onboard_meals: "SHF-MEL-",
    transport: "SHF-TRP-",
    fast_track: "SHF-FT-",
    lounge: "SHF-[#LOUNGE]-",
    meet_greet: "SHF-[#MEET]-",
  };

  const prefix = prefixMap[serviceType] || "SHF-";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}
