/**
 * Centralized application constants
 * These values should be moved to environment variables for production
 */

export const CONTACT = {
  EMAIL: "ops@shafskyaviation.com",
  PHONE: "+91 9599087959",
  COMPANY: "Shafsky Aviation Services",
  WEBSITE: "https://shafskyaviation.com",
} as const;

export const BUSINESS = {
  NAME: "Shafsky Aviation Services",
  DESCRIPTION:
    "Private charter, cargo, medical evacuation, aircraft management and Suswagatam airport concierge",
  BASE_URL: "https://aero-launch-sequence.lovable.app/",
} as const;

export const NOTIFICATION = {
  FROM_EMAIL: "concierge@shafskyaviation.com",
  FROM_NAME: "Shafsky Aviation Services",
} as const;

export const CONTACT_DETAILS = {
  WHATSAPP: "+91 95990 87959",
  EMAIL: "concierge@shafskyaviation.com",
  OFFICE: "New Delhi, India",
  WHATSAPP_LINK: "https://wa.me/919599087959",
} as const;

// Re-export site content for convenience
export { FOOTER_CONTENT, SOCIAL_LINKS } from "./site-content";
