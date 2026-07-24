/**
 * Centralized TanStack Query Key Factory
 *
 * Prevents key collision and standardizes query invalidation across components.
 */

export const queryKeys = {
  user: {
    all: ["user"] as const,
    profile: (userId?: string) => ["client-profile", userId] as const,
    role: () => ["current-user-role"] as const,
    notifications: (userId?: string) => ["client-notifications", userId] as const,
    paymentHistory: (userId?: string) => ["client-payment-history", userId] as const,
  },
  bookings: {
    all: ["client-bookings"] as const,
    userList: (userId?: string) => ["client-bookings", userId] as const,
    adminList: () => ["admin-bookings-list"] as const,
    detail: (bookingId: string) => ["admin-booking-detail", bookingId] as const,
    history: (bookingId: string) => ["booking-history", bookingId] as const,
    audit: (bookingId: string) => ["booking-audit", bookingId] as const,
    docs: (bookingId?: string) => ["booking-docs", bookingId] as const,
    notifications: (bookingId: string) => ["booking-notifications", bookingId] as const,
    services: (bookingId: string) => ["booking-services", bookingId] as const,
    manifest: (bookingId: string) => ["booking-manifest", bookingId] as const,
  },
  superAdmin: {
    kpis: () => ["super-admin-kpis"] as const,
    users: () => ["super-admin-users"] as const,
    coupons: () => ["super-admin-coupons"] as const,
    audits: () => ["super-admin-audits"] as const,
    settings: () => ["super-admin-settings"] as const,
    lounges: () => ["super-admin-lounges"] as const,
    shifts: () => ["super-admin-shifts"] as const,
  },
  cases: {
    all: ["cases-list"] as const,
    detail: (caseId: string) => ["case-detail", caseId] as const,
    messages: (caseId: string) => ["case-messages", caseId] as const,
    auditLogs: (caseId: string) => ["case-audit-logs", caseId] as const,
    savedReplies: () => ["cases-saved-replies"] as const,
    analytics: () => ["cases-analytics"] as const,
  },
  branding: {
    active: () => ["branding-active"] as const,
  },
};
