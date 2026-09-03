import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar,
  Users,
  Luggage,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Check,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import meetGreetImg from "@/assets/others/meetgreet.jpeg";
import transitImg from "@/assets/homepage/transit.jpeg";
import buggyImg from "@/assets/homepage/buggy.jpeg";
import vvipImg from "@/assets/homepage/vvip.jpeg";
import {
  INPUT_CLASSES,
  SELECT_CLASSES,
  TEXTAREA_CLASSES,
  FieldLabel,
  CounterField,
} from "../shared/SharedUi";
import { BookingSuccessModal } from "../shared/BookingSuccessModal";

export type MeetGreetSubService =
  | "Domestic Departure"
  | "Domestic Arrival"
  | "International Departure"
  | "International Arrival"
  | "Transit Service";

export interface CatalogOption {
  id: MeetGreetSubService;
  label: string;
  photo: string;
  catalogInclusions: string[];
  transitTypes?: string[];
}

export const MEET_GREET_CATALOG: CatalogOption[] = [
  {
    id: "Domestic Departure",
    label: "Domestic Departure",
    photo: meetGreetImg,
    catalogInclusions: [
      "Welcome Guest from the Curbside Area",
      "Porter Service with Dedicated Staff",
      "Wheelchair Service Available",
      "Assist From Separate Entry Gate",
      "Assist to Baggage Wrapping Facilities",
      "Assist at Airline Baggage Check-in Counter",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Service Available",
      "Assist in Retail Shopping Area",
      "Buggy Service Available Till The Boarding Gate",
      "Assist Guest Till the Boarding Gate",
    ],
  },
  {
    id: "Domestic Arrival",
    label: "Domestic Arrival",
    photo: buggyImg,
    catalogInclusions: [
      "Welcome Guest from End of the Aerobridge",
      "Dedicated Staff with Placard",
      "Porter Service with Dedicated Staff",
      "Buggy Service Available",
      "Wheelchair Service Available with Dedicated Staff",
      "Assist in Baggage Belt Area",
      "Assist Guest Till The Car Parking Area",
    ],
  },
  {
    id: "International Departure",
    label: "International Departure",
    photo: vvipImg,
    catalogInclusions: [
      "Welcome Guest from the Curb Side Area",
      "Porter Service with Dedicated Staff",
      "Wheelchair Service Available",
      "Assist from Separate Entry Gate",
      "Assist in Money Exchange Counter",
      "Assist to Baggage Wrapping Facilities",
      "Assist at Airline Baggage Check-in Counter",
      "Assist in Immigration",
      "Assist in Customs",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Service Available",
      "Assist in Retail Shopping Area",
      "Buggy Service Available Till the Boarding Gate",
      "Assist Guest Till the Boarding Gate",
    ],
  },
  {
    id: "International Arrival",
    label: "International Arrival",
    photo: meetGreetImg,
    catalogInclusions: [
      "Welcome Guest from the Aerobridge",
      "Dedicated Staff with Placard",
      "Porter Service with Dedicated Staff",
      "Buggy Service Available from the Aerobridge",
      "Wheelchair Service Available with Dedicated Staff",
      "Assist in Immigration",
      "Assist in Duty Free Shop",
      "Assist in Baggage Belt Area",
      "Assist in Customs",
      "Assist Guest Till the Car Parking Area",
    ],
  },
  {
    id: "Transit Service",
    label: "Transit Service",
    photo: transitImg,
    transitTypes: [
      "Domestic to Domestic",
      "International to International",
      "Domestic to International",
    ],
    catalogInclusions: [
      "Welcome Guest from Curbside / Aerobridge with Dedicated Staff",
      "Porter Service with Dedicated Staff",
      "Wheelchair & Buggy Service Available",
      "Inter-Terminal Transfer Assistance",
      "Assist in Transit Immigration & Customs (where applicable)",
      "Assist in S.H.A.(Security Hold Area)",
      "Lounge Service Available",
      "Assist Guest Till the Connecting Boarding Gate",
    ],
  },
];

const AIRPORTS = [
  { code: "DEL", name: "Delhi — Indira Gandhi Intl (IGI)", city: "New Delhi" },
  { code: "BOM", name: "Mumbai — Chhatrapati Shivaji Maharaj (CSMIA)", city: "Mumbai" },
  { code: "BLR", name: "Bengaluru — Kempegowda Intl Airport", city: "Bengaluru" },
  { code: "HYD", name: "Hyderabad — Rajiv Gandhi Intl Airport", city: "Hyderabad" },
  { code: "CCU", name: "Kolkata — Netaji Subhash Chandra Bose", city: "Kolkata" },
  { code: "MAA", name: "Chennai — International Airport", city: "Chennai" },
  { code: "GOI", name: "Goa — Dabolim / Manohar Intl Airport (GOX)", city: "Goa" },
  { code: "COK", name: "Kochi — Cochin International Airport", city: "Kochi" },
  { code: "AMD", name: "Ahmedabad — Sardar Vallabhbhai Patel", city: "Ahmedabad" },
  { code: "JAI", name: "Jaipur — International Airport", city: "Jaipur" },
  { code: "LKO", name: "Lucknow — Chaudhary Charan Singh", city: "Lucknow" },
  { code: "ATQ", name: "Amritsar — Sri Guru Ram Dass Jee", city: "Amritsar" },
  { code: "DXB", name: "Dubai — International Airport (DXB)", city: "Dubai" },
  { code: "LHR", name: "London — Heathrow Airport (LHR)", city: "London" },
  { code: "SIN", name: "Singapore — Changi Airport (SIN)", city: "Singapore" },
];

interface MeetGreetExperienceProps {
  initialSubService?: string;
}

export function MeetGreetExperience({ initialSubService }: MeetGreetExperienceProps) {
  const defaultSub: MeetGreetSubService =
    MEET_GREET_CATALOG.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "Domestic Departure";

  const [subService, setSubService] = useState<MeetGreetSubService>(defaultSub);
  const [transitType, setTransitType] = useState("Domestic to Domestic");
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [airport, setAirport] = useState("DEL");
  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [flightNumber, setFlightNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubService) {
      const match = MEET_GREET_CATALOG.find(
        (s) => s.id.toLowerCase() === initialSubService.toLowerCase()
      );
      if (match) setSubService(match.id);
    }
  }, [initialSubService]);

  const activeCatalog = MEET_GREET_CATALOG.find((s) => s.id === subService) || MEET_GREET_CATALOG[0];
  const selectedAirportObj = AIRPORTS.find((a) => a.code === airport) || AIRPORTS[0];

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelDate) {
      alert("Please select your travel date.");
      return;
    }
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const fallbackRef = `MG-${airport}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { createBooking } = await import("@/lib/bookings/core");
      const res = await createBooking({
        data: {
          contact_name: guestName.trim(),
          contact_email: guestEmail.trim() || `${guestPhone.replace(/\D/g, "")}@shafsky.guest`,
          contact_phone: guestPhone.trim(),
          trip_type: subService === "Transit Service" ? "multi_city" : "one_way",
          origin: airport,
          destination: airport,
          depart_date: travelDate,
          pax_adults: adults,
          pax_children: childrenCount,
          pax_infants: infants,
          service_type: "meet_greet",
          special_requests: `Option: ${subService}${subService === "Transit Service" ? ` (${transitType})` : ""}${flightNumber ? ` | Flight: ${flightNumber}` : ""}`,
          notes: specialNotes || undefined,
          services: [
            {
              service_code: "MEET_GREET",
              service_name: `Meet & Greet — ${subService}`,
              category: "AIRPORT",
              quantity: 1,
            },
          ],
        },
      });

      const actualRef = (res as any)?.booking_ref || fallbackRef;
      setSubmittedRef(actualRef);
    } catch (err) {
      console.warn("Backend submission fallback:", err);
      setSubmittedRef(fallbackRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hello Shafsky Aviation,%0A%0AI would like to request Meet & Greet and Lounge Service:%0A• Option: ${subService}${subService === "Transit Service" ? ` (${transitType})` : ""}%0A• Airport: ${selectedAirportObj.name}%0A• Date: ${travelDate || "TBD"}%0A• Passengers: ${adults} Adults${childrenCount ? `, ${childrenCount} Children` : ""}%0A• Guest: ${guestName || "Guest"} (${guestPhone || "Phone"})%0A${flightNumber ? `• Flight: ${flightNumber}%0A` : ""}%0APlease confirm availability.`
    );
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* 5 Sub-Service Pills */}
      <div className="mb-8">
        <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#b38a2e] mb-3">
          Select Service Option:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MEET_GREET_CATALOG.map((cat) => {
            const isSelected = cat.id === subService;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSubService(cat.id);
                  setStep(1);
                }}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 text-white border-slate-900 shadow-md ring-2 ring-[#d4af37]/60"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#d4af37] hover:bg-slate-50"
                }`}
              >
                <span className="text-xs sm:text-sm font-bold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Left (Selected Catalog Details & Photo) + Right (Simple Booking Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exact Company Catalog Content for the Selected Option */}
        <div className="lg:col-span-5 bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6">
          {/* Photo */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
            <img
              src={activeCatalog.photo}
              alt={activeCatalog.label}
              className="w-full h-auto max-h-56 object-cover"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider text-[#b38a2e]">
              <Sparkles size={12} className="text-[#d4af37]" />
              <span>Catalog Inclusions</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950 mt-1" style={display}>
              {activeCatalog.label}
            </h3>
          </div>

          {/* Transit Type Selector if Transit Service is active */}
          {activeCatalog.transitTypes && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
              <div className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider mb-2">
                Supported Transit Route:
              </div>
              <div className="flex flex-col gap-1.5">
                {activeCatalog.transitTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTransitType(t)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      transitType === t
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{t}</span>
                    {transitType === t && <Check size={14} className="text-[#d4af37]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exact Catalog Checklist Items */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
              Included In This Service:
            </div>
            <div className="space-y-2">
              {activeCatalog.catalogInclusions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                  <CheckCircle2 size={15} className="text-[#b38a2e] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 Phone Support */}
          <div className="pt-4 border-t border-slate-200">
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-950 transition"
              style={mono}
            >
              <PhoneCall size={14} className="text-[#d4af37]" />
              <span>24/7 Concierge: +91 95990 87959</span>
            </a>
          </div>
        </div>

        {/* Right Column: Clean, Simple Booking Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h4 className="text-lg sm:text-xl font-bold text-slate-950" style={display}>
              Request {activeCatalog.label}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Provide your travel details below to reserve your dedicated airport concierge escort.
            </p>
          </div>

          <form onSubmit={handleSubmitFinal} className="space-y-5">
            {/* Airport Selector */}
            <div>
              <FieldLabel>Airport Hub</FieldLabel>
              <select
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                className={SELECT_CLASSES}
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Date */}
            <div>
              <FieldLabel>Travel Date</FieldLabel>
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className={INPUT_CLASSES}
                required
              />
            </div>

            {/* Passengers Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <CounterField
                label="Adults"
                sublabel="Age 12+"
                value={adults}
                min={1}
                max={20}
                onChange={setAdults}
              />
              <CounterField
                label="Children"
                sublabel="Age 2-11"
                value={childrenCount}
                min={0}
                max={10}
                onChange={setChildrenCount}
              />
              <CounterField
                label="Infants"
                sublabel="Under 2"
                value={infants}
                min={0}
                max={5}
                onChange={setInfants}
              />
            </div>

            {/* Optional Flight Number (NOT asked on screen 1, only optional here) */}
            <div className="pt-2">
              <FieldLabel optional>Flight Number (Optional / Can provide later)</FieldLabel>
              <input
                type="text"
                placeholder="e.g. AI-102 / 6E-205"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className={INPUT_CLASSES}
              />
            </div>

            {/* Guest Contact Information */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Guest / Lead Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Contact Phone Number</FieldLabel>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={INPUT_CLASSES}
                    required
                  />
                </div>
              </div>

              <div>
                <FieldLabel optional>Email Address</FieldLabel>
                <input
                  type="email"
                  placeholder="e.g. rajesh@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={INPUT_CLASSES}
                />
              </div>

              <div>
                <FieldLabel optional>Special Requests / Wheelchair / Porter Needs</FieldLabel>
                <textarea
                  rows={2}
                  placeholder="Mention any specific assistance, terminal gate, or wheelchair assistance needed..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className={TEXTAREA_CLASSES}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-mono">
                {adults + childrenCount} Guest(s) • {selectedAirportObj.code}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all font-mono cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-[#d4af37]" />
                    <span>Confirm Booking Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={!!submittedRef}
        onClose={() => {
          setSubmittedRef(null);
          setStep(1);
        }}
        referenceId={submittedRef || ""}
        serviceTitle="Meet & Greet and Lounge Service"
        subServiceTitle={subService}
        customerName={guestName}
        customerPhone={guestPhone}
        whatsAppUrl={getWhatsAppLink()}
        isQuoteRequest={false}
        summaryItems={[
          { label: "Option", value: subService },
          ...(subService === "Transit Service" ? [{ label: "Transit Route", value: transitType }] : []),
          { label: "Airport", value: selectedAirportObj.name },
          { label: "Travel Date", value: travelDate },
          { label: "Passengers", value: `${adults} Adults${childrenCount ? `, ${childrenCount} Children` : ""}` },
          ...(flightNumber ? [{ label: "Flight", value: flightNumber }] : []),
        ]}
      />
    </div>
  );
}

export default MeetGreetExperience;
