import { validateRouteCities } from "./sharedValidation";

export function validateCargoForm(description: string, pickupCity: string, destinationCity: string): string | null {
  if (!description || !description.trim()) return "Please enter Cargo Description.";
  return validateRouteCities(pickupCity, destinationCity);
}

export function validatePetForm(animalType: string, pickupCity: string, destinationCity: string): string | null {
  if (!animalType || !animalType.trim()) return "Please enter Animal / Pet Type.";
  return validateRouteCities(pickupCity, destinationCity);
}
