import { validateRouteCities } from "./sharedValidation";

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
