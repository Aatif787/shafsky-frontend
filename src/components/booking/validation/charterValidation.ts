import { validateRouteCities } from "./sharedValidation";

export function validateCharterForm(departureCity: string, destinationCity: string): string | null {
  return validateRouteCities(departureCity, destinationCity);
}
