import React, { useState, useEffect } from "react";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Users,
  Luggage,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Plane,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { ExperiencePhoto } from "../shared/ExperiencePhoto";
import {
  INPUT_CLASSES,
  SELECT_CLASSES,
  TEXTAREA_CLASSES,
  FieldLabel,
  CounterField,
} from "../shared/SharedUi";
import { BookingSuccessModal } from "../shared/BookingSuccessModal";

export type TransportSubService =
  | "Luxury Vehicles"
  | "MUV / Large Vehicles"
  | "Economy / Standard";

const TRANSPORT_SUB_SERVICES: {
  id: TransportSubService;
  label: string;
  desc: string;
  vehicles: string;
}[] = [
    {
      id: "Luxury Vehicles",
      label: "Luxury Vehicles",
      desc: "Chauffeured flagship sedans with dedicated uniform driver, airport greeting, and refreshments.",
      vehicles: "Mercedes-Benz Maybach, S-Class, BMW 7-Series, Audi A8L",
    },
    {
      id: "MUV / Large Vehicles",
      label: "MUV / Large Vehicles",
      desc: "Spacious first-class luxury vans and multi-utility vehicles for VIP delegations and family entourages.",
      vehicles: "Toyota Vellfire, Mercedes V-Class, Toyota Innova Hycross",
    },
    {
      id: "Economy / Standard",
      label: "Economy / Standard",
      desc: "Reliable executive city transfers, corporate station sedans, and seamless airport pickups.",
      vehicles: "Toyota Innova Crysta, Skoda Superb, Executive Sedans",
    },
  ];

interface TransportExperienceProps {
  initialSubService?: string;
}

export function TransportExperience({ initialSubService }: TransportExperienceProps) {
  const defaultSub: TransportSubService = (
    TRANSPORT_SUB_SERVICES.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "Luxury Vehicles"
  );

  const [subService, setSubService] = useState<TransportSubService>(defaultSub);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Route & Schedule
  const [pickup, setPickup] = useState("IGI Airport Terminal 3, New Delhi");
  const [dropoff, setDropoff] = useState("The Oberoi / Aerocity, New Delhi");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("12:00");

  // Step 2: Passenger & Vehicle Specs
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flightNumber, setFlightNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 3: Contact Info
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Success Modal
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubService) {
      const match = TRANSPORT_SUB_SERVICES.find(
        (s) => s.id.toLowerCase() === initialSubService.toLowerCase()
      );
      if (match) setSubService(match.id);
    }
  }, [initialSubService]);

  const activeSubObj = TRANSPORT_SUB_SERVICES.find((s) => s.id === subService) || TRANSPORT_SUB_SERVICES[0];
  const isAirportPickup = pickup.toLowerCase().includes("airport") || pickup.toLowerCase().includes("terminal") || pickup.toLowerCase().includes("t3") || pickup.toLowerCase().includes("t2");

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      alert("Please provide both pickup and drop-off locations.");
      return;
    }
    if (!pickupDate) {
      alert("Please select the pickup date.");
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }
    const ref = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(ref);
  };

  const getWhatsAppLink = () => {
    const summary = `Service: Transport Service%0ACategory: ${subService}%0APickup: ${pickup}%0ADrop-off: ${dropoff}%0ADate & Time: ${pickupDate} at ${pickupTime}%0APassengers: ${passengers} Guests, ${luggage} Bags${flightNumber ? `%0AFlight: ${flightNumber}` : ""}%0A%0AGuest: ${guestName}%0APhone: ${guestPhone}%0AEmail: ${guestEmail || "N/A"}%0ARequests: ${specialRequests || "None"}`;
    return `https://wa.me/919599087959?text=Hello%20Shafsky%20Transport%20Desk,%20I%20would%20like%20to%20book%20ground%20transport:%0A%0A${summary}`;
  };

  return (
    <div className="w-full">
      {/* Introduction Header & Authentic Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 pb-8 border-b border-slate-200">
        {/* Left Intro Text */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcf8ed] border border-[#d4af37]/40 text-[#b38a2e] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Car size={13} className="text-[#d4af37]" />
            <span>Chauffeured Airport & Tarmac Fleet</span>
          </div>

          <h1
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            Transport <span className="text-[#b38a2e]">Service.</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600 max-w-xl leading-relaxed">
            Chauffeured luxury sedans, Maybach airport transfers, and spacious first-class passenger vans with professional uniformed drivers.
          </p>

          {/* Sub-Service Option Tabs INSIDE Transport Experience */}
          <div className="mt-6">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select Vehicle Category:
            </div>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_SUB_SERVICES.map((sub) => {
                const isActive = subService === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSubService(sub.id);
                      setStep(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${isActive
                        ? "bg-slate-950 text-white border-2 border-[#d4af37]"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"
                      }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Authentic Photography - Zero Cropping / Zero Text Over Photo */}
        <div className="lg:col-span-5">
          <ExperiencePhoto
            src={HOMEPAGE_PHOTOS.luxuryFleet.src}
            alt="Chauffeured Airport and Tarmac Luxury Transport Vehicles"
            badge="Luxury Ground Fleet"
            caption="Chauffeured luxury sedans and premium passenger vans"
            aspectRatio="16 / 10"
          />
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-2">
        {[
          { num: 1, label: "Route & Time" },
          { num: 2, label: "Passengers & Luggage" },
          { num: 3, label: "Contact Details" },
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${isDone
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-slate-950 text-white border-2 border-[#d4af37]"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
              >
                {isDone ? <CheckCircle2 size={15} /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${isCurrent ? "font-bold text-slate-900" : "text-slate-500"
                  }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm">
        {/* STEP 1: Pickup, Drop & Schedule */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 1 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Where & When do you need the vehicle?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vehicle Category: <strong className="text-slate-800">{subService}</strong> ({activeSubObj.vehicles})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Pickup Location</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Airport Terminal 3 / Hotel / Residence"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
              <div>
                <FieldLabel required>Drop-off Location</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Aerocity / Downtown Hotel / Private Address"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Date</FieldLabel>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
              <div>
                <FieldLabel required>Pickup Time</FieldLabel>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition font-mono cursor-pointer"
              >
                <span>Continue to Passenger Details</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Passengers, Luggage & Conditional Flight */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 2 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Passenger & Vehicle Specifications
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CounterField
                label="Passengers"
                sublabel="Guests traveling"
                value={passengers}
                onChange={setPassengers}
                min={1}
                max={20}
              />
              <CounterField
                label="Luggage Pieces"
                sublabel="Suitcases & Bags"
                value={luggage}
                onChange={setLuggage}
                min={0}
                max={20}
              />
            </div>

            {/* Conditional Flight Number (Only shown if airport pickup context) */}
            {isAirportPickup && (
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                <FieldLabel optional>Arriving Flight Number (for Chauffeur Tracking)</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. AI-102 / 6E-501 (Optional)"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  className={INPUT_CLASSES}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Your chauffeur tracks your flight status and adjusts pickup time automatically in case of flight delays.
                </p>
              </div>
            )}

            <div>
              <FieldLabel optional>Special Chauffeur Instructions / Notes</FieldLabel>
              <textarea
                placeholder="e.g. English-speaking chauffeur, child car seat, extra bottled water, or tarmac gate pickup..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className={TEXTAREA_CLASSES}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition font-mono cursor-pointer"
              >
                <span>Continue to Contact</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Contact & Submit */}
        {step === 3 && (
          <form onSubmit={handleSubmitFinal} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 3 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Lead Passenger Contact Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel required>Lead Guest Name</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Siddharth Mehra"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Phone / WhatsApp Number</FieldLabel>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div>
                  <FieldLabel optional>Email Address</FieldLabel>
                  <input
                    type="email"
                    placeholder="e.g. s.mehra@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 mb-2 font-mono uppercase tracking-wider text-[11px]">
                Transport Summary:
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vehicle:</span>
                <span className="font-semibold text-slate-900">{subService}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pickup:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[60%]">{pickup}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Drop-off:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[60%]">{dropoff}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date & Time:</span>
                <span className="font-semibold text-slate-900">{pickupDate} at {pickupTime}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Guests & Bags:</span>
                <span className="font-semibold text-slate-900">{passengers} Guests • {luggage} Bags</span>
              </div>
            </div>

            {/* Navigation & Submit */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all font-mono cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-[#d4af37]" />
                <span>Submit Transport Request</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={!!submittedRef}
        onClose={() => {
          setSubmittedRef(null);
          setStep(1);
        }}
        referenceId={submittedRef || ""}
        serviceTitle="Transport Service Request"
        subServiceTitle={subService}
        customerName={guestName}
        customerPhone={guestPhone}
        whatsAppUrl={getWhatsAppLink()}
        isQuoteRequest={false}
        summaryItems={[
          { label: "Vehicle Tier", value: subService },
          { label: "Pickup", value: pickup },
          { label: "Drop-off", value: dropoff },
          { label: "Date & Time", value: `${pickupDate} at ${pickupTime}` },
          { label: "Passengers", value: `${passengers} Guests, ${luggage} Bags` },
        ]}
      />
    </div>
  );
}
