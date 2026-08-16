export interface Booking {
  id: string;
  booking_ref: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  trip_type: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date?: string | null;
  pax_adults: number;
  pax_children: number;
  pax_infants: number;
  aircraft_preference?: string | null;
  service_type?: string | null;
  notes?: string | null;
  status: string;
  quote_amount?: number | null;
  quote_currency?: string | null;
  created_at: string;
}

export interface SavedPassenger {
  id: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  type: "adult" | "child" | "infant";
}

export interface SupportTicket {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high";
  message: string;
  status: "open" | "resolved";
  created_at: string;
}

export interface DocumentLocker {
  id: string;
  name: string;
  type: "passport" | "visa" | "id_proof";
  uploaded_at: string;
}

export type DashboardTab =
  | "home"
  | "bookings"
  | "new-booking"
  | "passengers"
  | "documents"
  | "billing"
  | "support"
  | "settings"
  | "notifications";

export interface NotesData {
  passengers?: SavedPassenger[];
  tickets?: SupportTicket[];
  documents?: DocumentLocker[];
  addresses?: Array<{ id: string; name: string; address: string }>;
  paymentMethods?: Array<{ id: string; type: string; last4: string }>;
  dark_mode?: boolean;
  currency?: string;
}
