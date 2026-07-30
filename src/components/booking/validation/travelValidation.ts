import { validateRouteCities } from "./sharedValidation";

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
