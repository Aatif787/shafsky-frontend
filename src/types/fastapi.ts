/**
 * FastAPI Response and Data Entity Type Definitions
 *
 * Provides strongly-typed models matching backend Pydantic models in FastAPI
 * to eliminate `any` casts across TanStack Server Functions and client components.
 */

export interface FastApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  company?: string;
  role?: string;
  roles?: string[];
  status?: string;
  is_active?: boolean;
  avatar_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingServiceItem {
  id?: string;
  service_code?: string;
  service_name?: string;
  category?: string;
  quantity?: number;
  unit_price?: number;
  currency?: string;
}

export interface BookingItem {
  id: string;
  booking_ref: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company?: string;
  trip_type: "one_way" | "round_trip" | "multi_city";
  origin: string;
  destination: string;
  depart_date: string;
  return_date?: string;
  pax_adults: number;
  pax_children: number;
  pax_infants: number;
  aircraft_preference?: string;
  service_type?: string;
  status: string;
  quote_amount?: number;
  quote_currency?: string;
  created_at: string;
  updated_at?: string;
  services?: BookingServiceItem[];
  booking_services?: BookingServiceItem[];
  notes?: string | null;
  user_id?: string | null;
  verification_type?: string;
  assigned_to?: string | null;
  service_id?: string;
  service_name?: string;
  customer_profile?: {
    id?: string;
    full_name?: string;
    phone?: string;
    company?: string;
    created_at?: string;
  };
}

export interface BookingPassenger {
  id: string;
  booking_id: string;
  title?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  passenger_type: "adult" | "child" | "infant";
}

export interface BookingDocumentItem {
  id: string;
  booking_id: string;
  kind: "quotation" | "invoice" | "receipt";
  storage_path: string;
  file_name?: string;
  file_size?: number;
  document_type?: string;
  url?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  booking_id?: string;
  title: string;
  message: string;
  body?: string;
  type: string;
  channel?: string;
  read_at?: string | null;
  created_at: string;
}

export interface SupportCaseItem {
  id: string;
  case_number: string;
  customer_id: string;
  subject: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface CaseMessageItem {
  id: string;
  case_id: string;
  sender_id: string;
  sender_type: "customer" | "staff" | "system";
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface SavedReplyItem {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcut?: string;
  created_at?: string;
}

export interface CaseAuditLogItem {
  id: string;
  case_id: string;
  actor_id: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface BrandingProfileItem {
  id: string;
  company_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
  theme_config?: Record<string, unknown>;
  created_at?: string;
}

export interface LoungeItem {
  id: string;
  airport_code: string;
  lounge_name: string;
  name?: string;
  terminal?: string;
  capacity?: number;
  status: "active" | "maintenance" | "closed";
  amenities?: string[];
  airport?: { code?: string; name?: string };
  current_occupancy?: number;
}

export interface StaffShiftItem {
  id: string;
  staff_id: string;
  staff_name?: string;
  airport_code: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
}

export interface CouponItem {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  is_active: boolean;
  usage_limit?: number;
  times_used?: number;
  valid_until?: string;
}

export interface SystemSettingItem {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at?: string;
}

export interface SuperAdminActivityItem {
  id?: string;
  action?: string;
  created_at?: string;
  entity?: string;
  entity_id?: string;
  actor?: string;
}

export interface SuperAdminKPIs {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeLounges: number;
  activeCoupons: number;
  pendingCases: number;
  adminCount?: number;
  airportCount?: number;
  loungeCount?: number;
  recentBookings?: Array<{ created_at?: string; quote_amount?: number }>;
  recentActivity?: SuperAdminActivityItem[];
}

export interface ContactInquiry {
  id?: string;
  status?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  created_at?: string;
}

export interface AdminDashboardMetrics {
  bookings: BookingItem[];
  messages: ContactInquiry[];
  notifFailures: number;
  recentActivity: SuperAdminActivityItem[];
  status?: string;
  dailyRevenueINR?: number;
  todayBookings?: number;
  completedToday?: number;
}

export interface ServiceConfigItem {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
  available_airports?: string[];
}

export interface FlightLogItem {
  id: string;
  booking_ref: string;
  origin: string;
  destination: string;
  verification_type?: string;
  notes?: string | null;
  depart_date?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  admin?: string;
  entity_id?: string;
  table?: string;
  ip?: string;
  created_at?: string;
  timestamp?: string;
  actor_id?: string;
  before?: any;
  after?: any;
  metadata?: {
    ip?: string;
    before?: any;
    after?: any;
  };
}

export interface NotificationLogItem {
  id: string;
  recipient: string;
  booking_ref?: string;
  booking_id?: string;
  subject?: string;
  template: string;
  channel?: string;
  status?: string;
  created_at?: string;
  body?: string;
  error_message?: string;
}

export interface AssignableStaffMember {
  id: string;
  roles?: string[];
  full_name?: string;
  email?: string;
}

export interface BookingHistoryItem {
  id: string;
  created_at?: string;
  actor_id?: string;
  from_status?: string;
  to_status?: string;
  note?: string;
}

export interface RoleDefinition {
  name: string;
  description?: string;
}

export interface PermissionDefinition {
  id: string;
  name?: string;
  description?: string;
}

export interface RoleMatrixPayload {
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  matrix: Record<string, string[]>;
}
