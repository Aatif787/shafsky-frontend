import { validateContactDetails, validateRouteCities } from "./sharedValidation";

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
