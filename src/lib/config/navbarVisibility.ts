/**
 * Centralized Navbar Service Visibility Configuration
 *
 * Controls which primary service links appear in the navbar Services dropdown.
 * - Meet & Greet / Lounge (/solutions/concierge): REMOVED
 * - Transport (/solutions/transport): REMOVED
 * - Hotels (/solutions/hotels): REMOVED
 * - Ticketing / Special Services (/solutions/special-services): REMOVED
 * - Private Charter (/solutions/aviation): Displayed directly as a top-level navbar link.
 *
 * Hiding a link here does NOT remove the service itself: pages, routes,
 * booking flows, enquiry forms, the Admin Dashboard and WhatsApp notifications
 * remain fully functional.
 */
export const NAVBAR_SERVICE_VISIBILITY: Record<string, boolean> = {
  "/solutions/concierge": false, // Meet & Greet / Lounge Service - REMOVED
  "/solutions/aviation": false, // Top-level navbar link, not in dropdown
  "/solutions/transport": false, // Transport Service - REMOVED
  "/solutions/hotels": false, // Luxury Hotels - REMOVED
  "/solutions/special-services": false, // Special Services (includes Ticketing) - REMOVED
};

/** A service is visible in the dropdown only if explicitly set to `true`. */
export const isNavbarServiceVisible = (href: string): boolean =>
  NAVBAR_SERVICE_VISIBILITY[href] === true;

