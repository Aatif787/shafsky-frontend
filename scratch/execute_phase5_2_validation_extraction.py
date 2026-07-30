import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\validation"
os.makedirs(base_dir, exist_ok=True)

# 1. sharedValidation.ts
shared_val = '''export function validateRequiredText(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `Please enter ${fieldName}.`;
  }
  return null;
}

export function validateContactDetails(name: string, phone: string, email: string): string | null {
  if (!name || !name.trim()) return "Please enter Contact Name.";
  if (!phone || !phone.trim()) return "Please enter Phone Number.";
  if (!email || !email.trim()) return "Please enter Email Address.";
  return null;
}

export function validateRouteCities(origin: string, destination: string): string | null {
  if (!origin || !origin.trim()) return "Please enter Departure / Pickup location.";
  if (!destination || !destination.trim()) return "Please enter Destination / Drop location.";
  return null;
}
'''

with open(os.path.join(base_dir, "sharedValidation.ts"), "w", encoding="utf-8") as f:
    f.write(shared_val)

# 2. airportValidation.ts
airport_val = '''import { validateContactDetails, validateRouteCities } from "./sharedValidation";

export function validateMeetGreetForm(pickupCity: string, destinationCity: string): string | null {
  return validateRouteCities(pickupCity, destinationCity);
}

export function validateLoungeForm(airportCode: string): string | null {
  if (!airportCode || !airportCode.trim()) return "Please select Airport for Lounge access.";
  return null;
}

export function validateTransferForm(pickup: string, drop: string): string | null {
  if (!pickup || !pickup.trim()) return "Please enter Pickup location.";
  if (!drop || !drop.trim()) return "Please enter Drop-off location.";
  return null;
}
'''

with open(os.path.join(base_dir, "airportValidation.ts"), "w", encoding="utf-8") as f:
    f.write(airport_val)

# 3. travelValidation.ts
travel_val = '''import { validateRouteCities } from "./sharedValidation";

export function validateHotelForm(destination: string, checkInDate: string, checkOutDate: string): string | null {
  if (!destination || !destination.trim()) return "Please enter Hotel Destination.";
  if (!checkInDate) return "Please select Check-in date.";
  if (!checkOutDate) return "Please select Check-out date.";
  return null;
}

export function validateVisaForm(visaCountry: string): string | null {
  if (!visaCountry || !visaCountry.trim()) return "Please select Destination Country.";
  return null;
}

export function validateTicketingForm(departureCity: string, arrivalCity: string): string | null {
  return validateRouteCities(departureCity, arrivalCity);
}
'''

with open(os.path.join(base_dir, "travelValidation.ts"), "w", encoding="utf-8") as f:
    f.write(travel_val)

# 4. cargoValidation.ts
cargo_val = '''import { validateRouteCities } from "./sharedValidation";

export function validateCargoForm(description: string, pickupCity: string, destinationCity: string): string | null {
  if (!description || !description.trim()) return "Please enter Cargo Description.";
  return validateRouteCities(pickupCity, destinationCity);
}

export function validatePetForm(animalType: string, pickupCity: string, destinationCity: string): string | null {
  if (!animalType || !animalType.trim()) return "Please enter Animal / Pet Type.";
  return validateRouteCities(pickupCity, destinationCity);
}
'''

with open(os.path.join(base_dir, "cargoValidation.ts"), "w", encoding="utf-8") as f:
    f.write(cargo_val)

# 5. medicalValidation.ts
medical_val = '''import { validateRouteCities } from "./sharedValidation";

export function validateAirAmbulanceForm(patientCondition: string, pickupCity: string, destinationCity: string): string | null {
  if (!patientCondition || !patientCondition.trim()) return "Please enter Patient Condition.";
  return validateRouteCities(pickupCity, destinationCity);
}

export function validateTrainAmbulanceForm(patientCondition: string, pickupStation: string, destinationStation: string): string | null {
  if (!patientCondition || !patientCondition.trim()) return "Please enter Patient Condition.";
  if (!pickupStation || !pickupStation.trim()) return "Please enter Pickup Station / City.";
  if (!destinationStation || !destinationStation.trim()) return "Please enter Destination Station / City.";
  return null;
}

export function validateHumForm(originCity: string, destinationCity: string): string | null {
  return validateRouteCities(originCity, destinationCity);
}
'''

with open(os.path.join(base_dir, "medicalValidation.ts"), "w", encoding="utf-8") as f:
    f.write(medical_val)

# 6. charterValidation.ts
charter_val = '''import { validateRouteCities } from "./sharedValidation";

export function validateCharterForm(departureCity: string, destinationCity: string): string | null {
  return validateRouteCities(departureCity, destinationCity);
}
'''

with open(os.path.join(base_dir, "charterValidation.ts"), "w", encoding="utf-8") as f:
    f.write(charter_val)

# 7. bookingValidation.ts (Registry)
registry_val = '''export * from "./sharedValidation";
export * from "./airportValidation";
export * from "./travelValidation";
export * from "./cargoValidation";
export * from "./medicalValidation";
export * from "./charterValidation";
'''

with open(os.path.join(base_dir, "bookingValidation.ts"), "w", encoding="utf-8") as f:
    f.write(registry_val)

print("Created Phase 5.2 validation architecture modules cleanly.")
