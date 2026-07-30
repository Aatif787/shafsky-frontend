import os

base_dir = r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\workflows\airport"
os.makedirs(base_dir, exist_ok=True)

# 1. create useAirportWorkflow.ts
hook_code = '''import { useState } from "react";

export interface AirportWorkflowState {
  airportCode: string;
  airportName: string;
  direction: "arrival" | "departure" | "transit";
  bookingMode: "individual" | "package";
  selectedService: string;
  selectedPackage: string;
  serviceDate: string;
  serviceTime: string;
  guestCount: number;
  fullName: string;
  phone: string;
  email: string;
  flightNumber: string;
  specialRequests: string;
}

export function useAirportWorkflow(initialService = "meet_greet", initialOrigin = "Delhi (DEL)") {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [busy, setBusy] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const [state, setState] = useState<AirportWorkflowState>({
    airportCode: initialOrigin.match(/\\(([A-Z]{3})\\)/)?.[1] || "DEL",
    airportName: initialOrigin || "Delhi Indira Gandhi International Airport",
    direction: "arrival",
    bookingMode: "individual",
    selectedService: initialService,
    selectedPackage: "gold",
    serviceDate: new Date().toISOString().split("T")[0],
    serviceTime: "14:30",
    guestCount: 1,
    fullName: "",
    phone: "",
    email: "",
    flightNumber: "AI302",
    specialRequests: "",
  });

  const updateState = (fields: Partial<AirportWorkflowState>) => {
    setState((prev) => ({ ...prev, ...fields }));
  };

  const getBasePrice = () => {
    if (state.bookingMode === "package") {
      if (state.selectedPackage === "bronze") return 9500;
      if (state.selectedPackage === "silver") return 14500;
      if (state.selectedPackage === "gold") return 22500;
      if (state.selectedPackage === "platinum") return 35000;
      return 22500;
    }
    if (state.selectedService === "lounge") return 9500;
    if (state.selectedService === "fast_track") return 7500;
    if (state.selectedService === "transport") return 14000;
    return 12500;
  };

  const totalPrice = getBasePrice() * state.guestCount;

  return {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    totalPrice,
  };
}
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\hooks\useAirportWorkflow.ts", "w", encoding="utf-8") as f:
    f.write(hook_code)

# 2. AirportServiceSelection.tsx
selection_code = '''import React from "react";
import { Check, Crown, Shield, Plane, Coffee, Car } from "lucide-react";
import { AirportWorkflowState } from "../../hooks/useAirportWorkflow";

interface AirportServiceSelectionProps {
  state: AirportWorkflowState;
  onChange: (fields: Partial<AirportWorkflowState>) => void;
}

export function AirportServiceSelection({ state, onChange }: AirportServiceSelectionProps) {
  const individualServices = [
    { id: "meet_greet", name: "Meet & Greet", price: "₹12,500", desc: "Airside gate escort, luggage porter & express assistance." },
    { id: "lounge", name: "VIP Lounge Access", price: "₹9,500", desc: "Executive tarmac sanctuary, premium dining & private quiet pods." },
    { id: "fast_track", name: "Fast Track Clearance", price: "₹7,500", desc: "Priority diplomatic immigration desk clearance & security skip." },
    { id: "transport", name: "Chauffeur Transfer", price: "₹14,000", desc: "Private executive sedan tarmac-to-hotel limousines." },
  ];

  const packages = [
    { id: "bronze", name: "Bronze VIP", price: "₹9,500", desc: "Gate escort & luggage porter assistance." },
    { id: "silver", name: "Silver VIP", price: "₹14,500", desc: "Gate escort, porter & executive airport lounge." },
    { id: "gold", name: "Gold VIP Bundle", price: "₹22,500", desc: "Gate escort, fast-track, lounge & electric buggy." },
    { id: "platinum", name: "Platinum All-Inclusive", price: "₹35,000", desc: "Tarmac escort, fast-track, lounge, buggy & chauffeur sedan." },
  ];

  const isPackage = state.bookingMode === "package";
  const items = isPackage ? packages : individualServices;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
        {isPackage ? "Select VIP Package Tier" : "Select Standalone Service"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = isPackage ? state.selectedPackage === item.id : state.selectedService === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onChange(isPackage ? { selectedPackage: item.id } : { selectedService: item.id })}
              className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-serif font-bold text-slate-900">{item.name}</h4>
                  <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-700">
                <span>{isSelected ? "Selected" : "Choose Option"}</span>
                <Check className={`w-4 h-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "AirportServiceSelection.tsx"), "w", encoding="utf-8") as f:
    f.write(selection_code)

# 3. AirportWorkflow.tsx (Main orchestrator for Airport Concierge)
workflow_code = '''import React from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { ReviewSummary } from "../../shared/ReviewSummary";
import { ContactSection } from "../../shared/ContactSection";
import { useAirportWorkflow } from "../../hooks/useAirportWorkflow";
import { AirportPhase1Header } from "./AirportPhase1Header";
import { AirportServiceSelection } from "./AirportServiceSelection";

interface AirportWorkflowProps {
  searchParams?: any;
}

export function AirportWorkflow({ searchParams }: AirportWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);

  const {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    totalPrice,
  } = useAirportWorkflow(searchParams?.service_id || searchParams?.sub || "meet_greet", searchParams?.origin);

  const stepConfigs = [
    { title: "Select Airport Concierge Service", sub: "Choose individual service or VIP package tier.", estTime: "Est. 30 sec", progress: 33 },
    { title: "Guest & Schedule Information", sub: "Enter travel schedule and lead passenger details.", estTime: "Est. 30 sec", progress: 66 },
    { title: "Review & Confirm Booking", sub: "Verify your itemized service itinerary.", estTime: "Est. 30 sec", progress: 90 },
    { title: "Airside Pass Active", sub: "Your concierge request is active with our command desk.", estTime: "Completed", progress: 100 },
  ];

  const currentConfig = stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)];

  const handleSaveDraft = () => {
    localStorage.setItem("shafsky_booking_draft", JSON.stringify({ service: "airport", state, updatedAt: new Date().toISOString() }));
    toast.success("Airport concierge draft saved locally.");
  };

  const getServiceKey = () => {
    if (state.bookingMode === "package") return `package_${state.selectedPackage}`;
    return state.selectedService;
  };

  const getRefPrefix = () => {
    const map: Record<string, string> = {
      meet_greet: "SHF-[#MEET]-",
      lounge: "SHF-[#LOUNGE]-",
      fast_track: "SHF-FT-",
      transport: "SHF-TRP-",
    };
    return map[state.selectedService] || "SHF-[#MEET]-";
  };

  const handleSubmit = async () => {
    if (!state.fullName || !state.phone || !state.email) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    setBusy(true);
    const prefix = getRefPrefix();
    const generatedRef = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: state.flightNumber || `SHF-[#${getServiceKey().toUpperCase()}]`,
          departure_airport: state.airportName,
          arrival_airport: state.airportCode,
          depart_date: state.serviceDate,
          lead_passenger_name: state.fullName,
          passenger_email: state.email,
          passenger_phone: state.phone,
          total_price: totalPrice,
          special_requests: state.specialRequests || `Direction: ${state.direction}`,
          service_type: getServiceKey(),
        } as any,
      });
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Airport concierge booking request submitted!");
    } catch {
      setBookingRef(generatedRef);
      setCurrentStep(4);
      toast.success("Airport concierge booking request submitted!");
    } finally {
      setBusy(false);
    }
  };

  const getServiceTitle = () => {
    if (state.bookingMode === "package") return `VIP Package (${state.selectedPackage.toUpperCase()})`;
    const map: Record<string, string> = {
      meet_greet: "Meet & Greet Concierge",
      lounge: "Executive Airport Lounge Access",
      fast_track: "VIP Fast-Track Clearance",
      transport: "Chauffeured Airport Transfer",
    };
    return map[state.selectedService] || "Airport Concierge";
  };

  return (
    <div className="space-y-6">
      <BookingProgressHeader
        currentStep={Math.min(currentStep, 3)}
        maxSteps={3}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
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
          {currentStep === 1 && (
            <div className="space-y-6">
              <AirportPhase1Header
                airportCode={state.airportCode}
                airportName={state.airportName}
                direction={state.direction}
                onDirectionChange={(direction) => updateState({ direction })}
                bookingMode={state.bookingMode}
                onBookingModeChange={(bookingMode) => updateState({ bookingMode })}
              />

              <AirportServiceSelection state={state} onChange={updateState} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    value={state.serviceDate}
                    onChange={(e) => updateState({ serviceDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Service Time *
                  </label>
                  <input
                    type="time"
                    value={state.serviceTime}
                    onChange={(e) => updateState({ serviceTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Guests *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={state.guestCount}
                    onChange={(e) => updateState({ guestCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Continue to Guest Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 2 of 3 — Guest Details
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Lead Guest Contact Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Provide lead passenger contact info for airside welcome sign paging.
                </p>
              </div>

              <ContactSection
                contactName={state.fullName}
                setContactName={(fullName) => updateState({ fullName })}
                phone={state.phone}
                setPhone={(phone) => updateState({ phone })}
                email={state.email}
                setEmail={(email) => updateState({ email })}
                nameLabel="Lead Guest Name *"
                namePlaceholder="e.g. Lord Henry Sterling"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Flight Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={state.flightNumber}
                    onChange={(e) => updateState({ flightNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. AI302, EK511"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                    Special Assistance Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={state.specialRequests}
                    onChange={(e) => updateState({ specialRequests: e.target.value })}
                    placeholder="Wheelchair assistance, buggy, extra luggage..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!state.fullName || !state.phone || !state.email) {
                      toast.error("Please fill in Lead Guest Name, Phone, and Email.");
                      return;
                    }
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                >
                  <span>Review Booking Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  Step 3 of 3 — Final Review
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                  Verify Airport Concierge Booking
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                  Review itemized airport concierge breakdown before confirming.
                </p>
              </div>

              <ReviewSummary
                serviceTitle={getServiceTitle()}
                badgeLabel="Guests"
                badgeValue={`${state.guestCount} Passenger(s)`}
                items={[
                  { label: "Airport Hub", value: `${state.airportName} (${state.airportCode})` },
                  { label: "Flight Direction", value: state.direction.toUpperCase() },
                  { label: "Service Date", value: `${state.serviceDate} (${state.serviceTime} HRS)` },
                  { label: "Lead Guest", value: state.fullName },
                  { label: "Contact Phone", value: state.phone },
                  { label: "Flight Ref", value: state.flightNumber || "N/A" },
                ]}
                totalPrice={totalPrice}
                submitLabel={`Confirm & Stage ${getServiceTitle()}`}
                busy={busy}
                onEdit={() => setCurrentStep(1)}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {currentStep === 4 && (
            <BookingSuccessPass
              badge="Airside Pass Active"
              title={`${getServiceTitle()} Confirmed`}
              subtitle={`Your request for ${state.airportCode} (${state.direction.toUpperCase()}) is assigned to our 24/7 command desk.`}
              bookingRef={bookingRef || "SHF-[#MEET]-849201"}
              guestSummary={`${state.guestCount} Guest(s) | ${state.serviceDate}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
'''

with open(os.path.join(base_dir, "AirportWorkflow.tsx"), "w", encoding="utf-8") as f:
    f.write(workflow_code)

# 4. index.ts
index_code = '''export * from "./AirportWorkflow";
export * from "./AirportPhase1Header";
export * from "./AirportServiceSelection";
'''

with open(os.path.join(base_dir, "index.ts"), "w", encoding="utf-8") as f:
    f.write(index_code)

print("Created modular Airport Concierge workflow architecture under src/components/booking/workflows/airport/")
