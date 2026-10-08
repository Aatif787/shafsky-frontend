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

/**
 * Razorpay Checkout prefill contact.
 *
 * Returns a dial-code-prefixed number: Indian mobiles keep the historical
 * +91XXXXXXXXXX form exactly, and any other country passes through so
 * international customers can still complete payment. Empty only when the
 * input is not usable as a phone number at all.
 *
 * The backend imposes no India-only rule on passenger_phone, so nothing else
 * needs to change for non-Indian numbers.
 */
export function toRazorpayContact(raw: string): string {
  const trimmed = (raw || "").trim();

  // Indian numbers keep the original behaviour bit-for-bit.
  const national = indianMobileDigits(trimmed);
  if (national) return `+91${national}`;

  // Anything else: keep the dial code when the caller supplied one.
  if (trimmed.startsWith("+")) {
    const compact = trimmed.replace(/[\s().-]/g, "");
    const digits = compact.slice(1);
    return /^\d{7,15}$/.test(digits) ? `+${digits}` : "";
  }

  // Bare digits: an Indian mobile would already have matched above. Fall back
  // to a plain digit string rather than silently dropping the contact.
  const digitsOnly = trimmed.replace(/\D/g, "");
  return /^\d{7,15}$/.test(digitsOnly) ? digitsOnly : "";
}

/**
 * Normalised phone for storage / backend submission.
 *
 * Preserves a leading "+" so an international number stays unambiguous. The
 * previous digit-only handling turned +971501234567 into 971501234567, which
 * cannot be routed back reliably for WhatsApp or SMS.
 */
export function normalizePhoneForStorage(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }
  return trimmed.replace(/\D/g, "");
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
