/**
 * Temporary Frontend ICICI Review Mode Configuration
 *
 * Explicit opt-in:
 * - VITE_ICICI_REVIEW_MODE="true"  --> ICICI Review Mode ON (Exclusively Meet & Greet / Lounge)
 * - VITE_ICICI_REVIEW_MODE="false" --> Full website ON (All services active)
 * - Missing / unset                --> Full website ON (Safe default for normal development)
 */
export const ICICI_REVIEW_MODE =
  import.meta.env.VITE_ICICI_REVIEW_MODE === "true";

export const isIciciReviewMode = () => ICICI_REVIEW_MODE;
