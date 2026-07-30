import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking"

# Directories
dirs = [
    os.path.join(base_dir, "types"),
    os.path.join(base_dir, "utils"),
    os.path.join(base_dir, "pricing"),
    os.path.join(base_dir, "validation"),
    os.path.join(base_dir, "hooks"),
    os.path.join(base_dir, "shared"),
    os.path.join(base_dir, "router"),
    os.path.join(base_dir, "workflows", "airport"),
    os.path.join(base_dir, "workflows", "travel"),
    os.path.join(base_dir, "workflows", "cargo"),
    os.path.join(base_dir, "workflows", "medical"),
    os.path.join(base_dir, "workflows", "charter"),
]

for d in dirs:
    os.makedirs(d, exist_ok=True)

# 1. types/booking.types.ts
types_code = '''export type WorkflowType =
  | "meet_greet"
  | "lounge"
  | "fast_track"
  | "transport"
  | "hotel"
  | "visa"
  | "air_ticketing"
  | "onboard_meals"
  | "cargo"
  | "avi"
  | "air_ambulance"
  | "train_ambulance"
  | "hum"
  | "jet_charter";

export interface SharedBookingContact {
  leadPassengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  paxAdults: number;
  specialRequests?: string;
}

export interface BookingPayload {
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  depart_date: string;
  lead_passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  total_price: number;
  special_requests?: string;
  service_type: string;
}
'''

with open(os.path.join(base_dir, "types", "booking.types.ts"), "w", encoding="utf-8") as f:
    f.write(types_code)

# 2. utils/referenceGenerator.ts
ref_code = '''export function generateBookingReference(serviceType: string): string {
  const prefixMap: Record<string, string> = {
    jet_charter: "SHF-JTS-",
    air_ambulance: "SHF-MED-",
    train_ambulance: "SHF-TRN-",
    hum: "SHF-HUM-",
    cargo: "SHF-CGO-",
    avi: "SHF-AVI-",
    hotel: "SHF-HTL-",
    visa: "SHF-VSA-",
    air_ticketing: "SHF-TCK-",
    onboard_meals: "SHF-MEL-",
    transport: "SHF-TRP-",
    fast_track: "SHF-FT-",
    lounge: "SHF-[#LOUNGE]-",
    meet_greet: "SHF-[#MEET]-",
  };

  const prefix = prefixMap[serviceType] || "SHF-";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}
'''

with open(os.path.join(base_dir, "utils", "referenceGenerator.ts"), "w", encoding="utf-8") as f:
    f.write(ref_code)

# 3. pricing/pricing.ts
pricing_code = '''export function getServicePrice(serviceId: string): number {
  switch (serviceId) {
    case "jet_charter":
    case "charter":
    case "private_jet":
      return 450000;
    case "air_ambulance":
    case "medical":
      return 185000;
    case "train_ambulance":
      return 45000;
    case "hum":
    case "repatriation":
    case "human_remains":
      return 65000;
    case "cargo":
    case "air_cargo":
    case "freight":
      return 45000;
    case "avi":
    case "pet_transport":
    case "live_animal":
      return 28000;
    case "hotel":
    case "hotel_booking":
      return 32000;
    case "visa":
    case "visa_assistance":
      return 8500;
    case "air_ticketing":
    case "ticketing":
      return 85000;
    case "onboard_meals":
    case "meals":
      return 4500;
    case "transport":
      return 14000;
    case "fast_track":
      return 7500;
    case "lounge":
      return 9500;
    case "meet_greet":
    default:
      return 12500;
  }
}
'''

with open(os.path.join(base_dir, "pricing", "pricing.ts"), "w", encoding="utf-8") as f:
    f.write(pricing_code)

# 4. validation/bookingValidation.ts
val_code = '''export function validateContactDetails(name: string, phone: string, email: string): string | null {
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
'''

with open(os.path.join(base_dir, "validation", "bookingValidation.ts"), "w", encoding="utf-8") as f:
    f.write(val_code)

# 5. hooks/useBookingDraft.ts
draft_code = '''import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useBookingDraft(initialServiceId: string) {
  const [draftLoaded, setDraftLoaded] = useState(false);

  const saveDraft = (data: Record<string, any>) => {
    try {
      const draft = {
        initialServiceId,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("shafsky_booking_draft", JSON.stringify(draft));
      toast.success("Request draft saved locally.");
    } catch {
      // ignore draft save error
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("shafsky_booking_draft");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore parse error
    }
    return null;
  };

  return { saveDraft, loadDraft, draftLoaded, setDraftLoaded };
}
'''

with open(os.path.join(base_dir, "hooks", "useBookingDraft.ts"), "w", encoding="utf-8") as f:
    f.write(draft_code)

# 6. hooks/useBookingPricing.ts
pricing_hook_code = '''import { useMemo } from "react";
import { getServicePrice } from "../pricing/pricing";

export function useBookingPricing(serviceId: string) {
  const totalPrice = useMemo(() => getServicePrice(serviceId), [serviceId]);
  return { totalPrice };
}
'''

with open(os.path.join(base_dir, "hooks", "useBookingPricing.ts"), "w", encoding="utf-8") as f:
    f.write(pricing_hook_code)

# 7. shared/ContactSection.tsx
contact_code = '''import React from "react";

interface ContactSectionProps {
  contactName: string;
  setContactName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  nameLabel?: string;
  namePlaceholder?: string;
}

export function ContactSection({
  contactName,
  setContactName,
  phone,
  setPhone,
  email,
  setEmail,
  nameLabel = "Contact Name *",
  namePlaceholder = "Full Name",
}: ContactSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          {nameLabel}
        </label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder={namePlaceholder}
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Phone Number *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 9599087959"
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Email Address *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contact@example.com"
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "shared", "ContactSection.tsx"), "w", encoding="utf-8") as f:
    f.write(contact_code)

# 8. shared/ReviewSummary.tsx
review_code = '''import React from "react";
import { Check } from "lucide-react";

interface ReviewSummaryProps {
  serviceTitle: string;
  badgeLabel: string;
  badgeValue: string;
  items: { label: string; value: string }[];
  totalPrice: number;
  submitLabel: string;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function ReviewSummary({
  serviceTitle,
  badgeLabel,
  badgeValue,
  items,
  totalPrice,
  submitLabel,
  busy,
  onEdit,
  onSubmit,
}: ReviewSummaryProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Service</span>
          <div className="text-xl font-serif font-bold text-slate-900">{serviceTitle}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">{badgeLabel}</span>
          <div className="text-sm font-mono font-bold text-emerald-700">{badgeValue}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        {items.map((item, idx) => (
          <div key={idx}>
            <span className="text-slate-500 font-medium">{item.label}</span>
            <div className="text-slate-900 font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase">Total Estimate</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
            ₹{totalPrice.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <span>{busy ? "Processing..." : submitLabel}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "shared", "ReviewSummary.tsx"), "w", encoding="utf-8") as f:
    f.write(review_code)

# 9. shared/BookingLayout.tsx
layout_code = '''import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookingProgressHeader } from "./BookingProgressHeader";
import { BookingCancelModal } from "./BookingCancelModal";

interface BookingLayoutProps {
  currentStep: number;
  maxSteps: number;
  progress: number;
  title: string;
  estTime: string;
  showCancelDialog: boolean;
  onSaveDraft: () => void;
  onCloseCancelDialog: () => void;
  children: React.ReactNode;
}

export function BookingLayout({
  currentStep,
  maxSteps,
  progress,
  title,
  estTime,
  showCancelDialog,
  onSaveDraft,
  onCloseCancelDialog,
  children,
}: BookingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <BookingProgressHeader
        currentStep={currentStep}
        maxSteps={maxSteps}
        progress={progress}
        title={title}
        estTime={estTime}
        onSaveDraft={onSaveDraft}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <BookingCancelModal show={showCancelDialog} onClose={onCloseCancelDialog} />
    </div>
  );
}
'''

with open(os.path.join(base_dir, "shared", "BookingLayout.tsx"), "w", encoding="utf-8") as f:
    f.write(layout_code)

# 10. Update router/BookingRouter.tsx
router_update = '''import React from "react";
import BookingView from "@/components/views/BookingView";

interface BookingRouterProps {
  searchParams?: any;
}

export function BookingRouter({ searchParams }: BookingRouterProps) {
  return <BookingView searchParams={searchParams} />;
}

export default BookingRouter;
'''

with open(os.path.join(base_dir, "router", "BookingRouter.tsx"), "w", encoding="utf-8") as f:
    f.write(router_update)

print("Created Phase 2 Enterprise Architecture structure successfully.")
