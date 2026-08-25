export function validateRequiredText(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `Please enter ${fieldName}.`;
  }
  return null;
}

/** 10-digit Indian mobile (starts 6–9). Accepts +91XXXXXXXXXX or 0XXXXXXXXXX only. */
export function indianMobileDigits(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("91") && national.length === 12) {
    national = national.slice(2);
  } else if (national.startsWith("0") && national.length === 11) {
    national = national.slice(1);
  }
  return /^[6-9]\d{9}$/.test(national) ? national : "";
}

/** Razorpay Checkout prefill: +91XXXXXXXXXX or empty if the number is not a valid Indian mobile. */
export function toRazorpayContact(raw: string): string {
  const national = indianMobileDigits(raw);
  return national ? `+91${national}` : "";
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
