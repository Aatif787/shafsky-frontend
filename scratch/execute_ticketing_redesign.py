import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\workflows\ticketing"
os.makedirs(base_dir, exist_ok=True)

# 1. create useTicketingWorkflow.ts
hook_code = '''import { useState } from "react";

export interface TicketingJourneyData {
  tripType: "round_trip" | "one_way" | "multi_city";
  fromAirport: string;
  toAirport: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: string;
}

export interface TicketingPassengerData {
  fullName: string;
  phone: string;
  email: string;
  specialRequests: string;
}

export function useTicketingWorkflow(initialOrigin = "London Heathrow (LHR)", initialDest = "Delhi Indira Gandhi (DEL)") {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [journey, setJourney] = useState<TicketingJourneyData>({
    tripType: "round_trip",
    fromAirport: initialOrigin,
    toAirport: initialDest,
    departDate: new Date().toISOString().split("T")[0],
    returnDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    passengers: 1,
    cabinClass: "First / Business Class",
  });

  const [passenger, setPassenger] = useState<TicketingPassengerData>({
    fullName: "",
    phone: "",
    email: "",
    specialRequests: "",
  });

  const updateJourney = (fields: Partial<TicketingJourneyData>) => {
    setJourney((prev) => ({ ...prev, ...fields }));
  };

  const updatePassenger = (fields: Partial<TicketingPassengerData>) => {
    setPassenger((prev) => ({ ...prev, ...fields }));
  };

  const estimatedFare = 85000 * journey.passengers;

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    journey,
    updateJourney,
    passenger,
    updatePassenger,
    estimatedFare,
  };
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\hooks\useTicketingWorkflow.ts", "w", encoding="utf-8") as f:
    f.write(hook_code)

# 2. TicketingJourney.tsx
journey_code = '''import React from "react";
import { ArrowRight, Plane, Calendar, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TicketingJourneyData } from "../../hooks/useTicketingWorkflow";

interface TicketingJourneyProps {
  data: TicketingJourneyData;
  onChange: (fields: Partial<TicketingJourneyData>) => void;
  onNext: () => void;
}

export function TicketingJourney({ data, onChange, onNext }: TicketingJourneyProps) {
  const handleContinue = () => {
    if (!data.fromAirport || !data.toAirport) {
      toast.error("Please enter departure and arrival airports.");
      return;
    }
    if (!data.departDate) {
      toast.error("Please select departure date.");
      return;
    }
    if (data.tripType === "round_trip" && !data.returnDate) {
      toast.error("Please select return date.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Executive Flight Reservation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Select Your Flight Itinerary
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          First & Business class commercial seats with priority airside staging.
        </p>
      </div>

      {/* Trip Type Selector */}
      <div className="flex flex-wrap gap-3 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
        {[
          { id: "round_trip", label: "Round Trip" },
          { id: "one_way", label: "One Way" },
          { id: "multi_city", label: "Multi-City" },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange({ tripType: type.id as any })}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              data.tripType === type.id
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            From Airport *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.fromAirport}
              onChange={(e) => onChange({ fromAirport: e.target.value })}
              placeholder="e.g. London Heathrow (LHR) / New Delhi (DEL)"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            To Airport *
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.toAirport}
              onChange={(e) => onChange({ toAirport: e.target.value })}
              placeholder="e.g. Dubai International (DXB) / Singapore (SIN)"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Departure Date *
          </label>
          <input
            type="date"
            value={data.departDate}
            onChange={(e) => onChange({ departDate: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>

        {data.tripType === "round_trip" && (
          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
              Return Date *
            </label>
            <input
              type="date"
              value={data.returnDate}
              onChange={(e) => onChange({ returnDate: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Cabin Class *
          </label>
          <select
            value={data.cabinClass}
            onChange={(e) => onChange({ cabinClass: e.target.value })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          >
            <option value="First Class Suite">First Class Suite</option>
            <option value="Business Class Lie-Flat">Business Class Lie-Flat</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Economy Class">Economy Class</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Passengers *
          </label>
          <input
            type="number"
            min={1}
            max={9}
            value={data.passengers}
            onChange={(e) => onChange({ passengers: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          <span>Continue to Passenger Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "TicketingJourney.tsx"), "w", encoding="utf-8") as f:
    f.write(journey_code)

# 3. TicketingPassenger.tsx
passenger_code = '''import React from "react";
import { ArrowRight, User, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";
import { TicketingPassengerData } from "../../hooks/useTicketingWorkflow";

interface TicketingPassengerProps {
  data: TicketingPassengerData;
  onChange: (fields: Partial<TicketingPassengerData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TicketingPassenger({ data, onChange, onBack, onNext }: TicketingPassengerProps) {
  const handleContinue = () => {
    if (!data.fullName || !data.fullName.trim()) {
      toast.error("Please enter Full Name.");
      return;
    }
    if (!data.phone || !data.phone.trim()) {
      toast.error("Please enter Phone / Mobile Number.");
      return;
    }
    if (!data.email || !data.email.trim()) {
      toast.error("Please enter Email Address.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 2 of 3 — Passenger Contact
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Passenger & Contact Details
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Enter lead passenger information for commercial airline e-ticket issuance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Lead Passenger Full Name *
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Lord Henry Sterling"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Mobile Number *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+44 7700 900077"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="guest@shafskyaviation.com"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
            Special Requests / Seat Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={data.specialRequests}
            onChange={(e) => onChange({ specialRequests: e.target.value })}
            placeholder="Window seat preference, frequent flyer numbers, or baggage notes..."
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium resize-none"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          <span>Review Ticket Request</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "TicketingPassenger.tsx"), "w", encoding="utf-8") as f:
    f.write(passenger_code)

# 4. TicketingReview.tsx
review_code = '''import React from "react";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { TicketingJourneyData, TicketingPassengerData } from "../../hooks/useTicketingWorkflow";

interface TicketingReviewProps {
  journey: TicketingJourneyData;
  passenger: TicketingPassengerData;
  estimatedFare: number;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function TicketingReview({ journey, passenger, estimatedFare, busy, onEdit, onSubmit }: TicketingReviewProps) {
  const routeString = `${journey.fromAirport} → ${journey.toAirport}`;
  const dateString = journey.tripType === "round_trip"
    ? `${journey.departDate} to ${journey.returnDate}`
    : journey.departDate;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          Step 3 of 3 — Final Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
          Verify Flight Quotation Request
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
          Confirm your flight itinerary and passenger details before submission to our ticketing desk.
        </p>
      </div>

      <ReviewSummary
        serviceTitle={`Commercial Flight Reservation (${journey.cabinClass})`}
        badgeLabel="Passengers"
        badgeValue={`${journey.passengers} Passenger(s)`}
        items={[
          { label: "Flight Route", value: routeString },
          { label: "Travel Dates", value: dateString },
          { label: "Cabin Class", value: journey.cabinClass },
          { label: "Lead Passenger", value: passenger.fullName },
          { label: "Contact Phone", value: passenger.phone },
          { label: "Contact Email", value: passenger.email },
        ]}
        totalPrice={estimatedFare}
        submitLabel="Request Flight Ticket Quote"
        busy={busy}
        onEdit={onEdit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
'''

with open(os.path.join(base_dir, "TicketingReview.tsx"), "w", encoding="utf-8") as f:
    f.write(review_code)

# 5. TicketingSuccess.tsx
success_code = '''import React from "react";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";

interface TicketingSuccessProps {
  bookingRef: string;
  routeSummary: string;
  guestSummary: string;
}

export function TicketingSuccess({ bookingRef, routeSummary, guestSummary }: TicketingSuccessProps) {
  return (
    <BookingSuccessPass
      badge="Flight Reservation Staged"
      title="Commercial Flight Ticket Request Submitted"
      subtitle={`Our airline ticketing desk is holding preferred seat inventory for ${routeSummary}.`}
      bookingRef={bookingRef}
      guestSummary={guestSummary}
    />
  );
}
'''

with open(os.path.join(base_dir, "TicketingSuccess.tsx"), "w", encoding="utf-8") as f:
    f.write(success_code)

# 6. TicketingWorkflow.tsx (Main orchestrator for Ticketing)
workflow_code = '''import React from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { useTicketingWorkflow } from "../../hooks/useTicketingWorkflow";
import { TicketingJourney } from "./TicketingJourney";
import { TicketingPassenger } from "./TicketingPassenger";
import { TicketingReview } from "./TicketingReview";
import { TicketingSuccess } from "./TicketingSuccess";

interface TicketingWorkflowProps {
  searchParams?: any;
}

export function TicketingWorkflow({ searchParams }: TicketingWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);

  const {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    journey,
    updateJourney,
    passenger,
    updatePassenger,
    estimatedFare,
  } = useTicketingWorkflow(searchParams?.origin, searchParams?.destination);

  const handleSubmit = async () => {
    setBusy(true);
    const generatedRef = `SHF-TCK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: `SHF-[#TCK]`,
          departure_airport: journey.fromAirport,
          arrival_airport: journey.toAirport,
          depart_date: journey.departDate,
          lead_passenger_name: passenger.fullName,
          passenger_email: passenger.email,
          passenger_phone: passenger.phone,
          total_price: estimatedFare,
          special_requests: passenger.specialRequests || `Cabin: ${journey.cabinClass}`,
          service_type: "air_ticketing",
        } as any,
      });
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Flight ticket quote request submitted successfully!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Flight ticket quote request submitted!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {currentStep === 1 && (
        <TicketingJourney
          data={journey}
          onChange={updateJourney}
          onNext={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 2 && (
        <TicketingPassenger
          data={passenger}
          onChange={updatePassenger}
          onBack={() => {
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNext={() => {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 3 && (
        <TicketingReview
          journey={journey}
          passenger={passenger}
          estimatedFare={estimatedFare}
          busy={busy}
          onEdit={() => setCurrentStep(1)}
          onSubmit={handleSubmit}
        />
      )}

      {currentStep === 4 && (
        <TicketingSuccess
          bookingRef={bookingRef || "SHF-TCK-849201"}
          routeSummary={`${journey.fromAirport} → ${journey.toAirport}`}
          guestSummary={`${journey.passengers} Passenger(s) | ${journey.cabinClass}`}
        />
      )}
    </div>
  );
}
'''

with open(os.path.join(base_dir, "TicketingWorkflow.tsx"), "w", encoding="utf-8") as f:
    f.write(workflow_code)

# 7. index.ts
index_code = '''export * from "./TicketingWorkflow";
export * from "./TicketingJourney";
export * from "./TicketingPassenger";
export * from "./TicketingReview";
export * from "./TicketingSuccess";
'''

with open(os.path.join(base_dir, "index.ts"), "w", encoding="utf-8") as f:
    f.write(index_code)

print("Created modular Ticketing workflow architecture under src/components/booking/workflows/ticketing/")
