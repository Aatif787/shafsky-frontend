export function validateRequiredText(value: string, fieldName: string): string | null {
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
