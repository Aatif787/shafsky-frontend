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
  status?: string;
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
  notes?: string;
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
  terminal?: string;
  capacity?: number;
  status: "active" | "maintenance" | "closed";
  amenities?: string[];
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

export interface SuperAdminKPIs {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeLounges: number;
  activeCoupons: number;
  pendingCases: number;
}
