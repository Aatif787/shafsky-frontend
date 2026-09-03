import React, { useState, useEffect } from "react";
import {
  Hotel,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Building,
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

export type LuxuryHotelsSubService =
  | "7 Star Hotels"
  | "5 Star Hotels"
  | "3 Star Hotels";

const HOTEL_SUB_SERVICES: {
  id: LuxuryHotelsSubService;
  label: string;
  desc: string;
  properties: string;
}[] = [
    {
      id: "7 Star Hotels",
      label: "7 Star Luxury Hotels",
      desc: "Iconic royal palace hotels, heritage royal suites, and ultra-luxury private villas.",
      properties: "Taj Lake Palace, The Leela Palace, Rambagh Palace, Burj Al Arab",
    },
    {
      id: "5 Star Hotels",
      label: "5 Star Luxury Hotels",
      desc: "Distinguished five-star city luxury properties, executive suites, and airport transit hotels.",
      properties: "The Oberoi, ITC Maurya, JW Marriott Aerocity, Taj Mahal Hotel",
    },
    {
      id: "3 Star Hotels",
      label: "3 Star Premium Hotels",
      desc: "Convenient executive accommodations, comfortable airport layover stays, and business transit rooms.",
      properties: "Holiday Inn Aerocity, Ibis Airport Hotel, Lemon Tree Premier",
    },
  ];

const POPULAR_DESTINATIONS = [
  "New Delhi / Aerocity Airport Hub",
  "Mumbai — BKC / Nariman Point / Airport",
  "Bengaluru — Central / Kempegowda Airport",
  "Goa — North / South Luxury Beachfront",
  "Jaipur & Udaipur Palace Circuit",
  "Hyderabad — HITEC City / Banjara Hills",
  "Kolkata & Chennai Metropolitan Hubs",
  "Dubai & Middle East Premier Destinations",
  "London & European Luxury Hubs",
];

const ROOM_PREFERENCES = [
  "No Preference (Best Available Luxury Room)",
  "Presidential / Royal Palace Suite",
  "Executive Club Suite (with Lounge Access)",
  "Luxury Deluxe King Room",
  "Twin Bed Deluxe Room",
  "Connecting Family Suite",
];

interface LuxuryHotelsExperienceProps {
  initialSubService?: string;
}

export function LuxuryHotelsExperience({ initialSubService }: LuxuryHotelsExperienceProps) {
  const defaultSub: LuxuryHotelsSubService = (
    HOTEL_SUB_SERVICES.find((s) => s.id.toLowerCase() === (initialSubService || "").toLowerCase())?.id ||
    "5 Star Hotels"
  );

  const [subService, setSubService] = useState<LuxuryHotelsSubService>(defaultSub);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Destination & Dates
  const [destination, setDestination] = useState(POPULAR_DESTINATIONS[0]);
  const [customCity, setCustomCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Step 2: Rooms & Guests
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [roomPreference, setRoomPreference] = useState(ROOM_PREFERENCES[0]);
  const [specialRequests, setSpecialRequests] = useState("");

  // Step 3: Guest Contact
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Success Modal
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubService) {
      const match = HOTEL_SUB_SERVICES.find(
        (s) => s.id.toLowerCase() === initialSubService.toLowerCase()
      );
      if (match) setSubService(match.id);
    }
  }, [initialSubService]);

  const activeSubObj = HOTEL_SUB_SERVICES.find((s) => s.id === subService) || HOTEL_SUB_SERVICES[0];
  const finalCity = customCity.trim() ? customCity : destination;

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date.");
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
    const ref = `HT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(ref);
  };

  const getWhatsAppLink = () => {
    const summary = `Service: Luxury Hotel Booking%0ACategory: ${subService}%0ADestination: ${finalCity}%0AStay Dates: Check-in ${checkInDate} to Check-out ${checkOutDate}%0AAccommodation: ${rooms} Rooms (${adults} Adults, ${childrenCount} Children)%0ARoom Preference: ${roomPreference}%0A%0ALead Guest: ${guestName}%0APhone: ${guestPhone}%0AEmail: ${guestEmail || "N/A"}%0ARequests: ${specialRequests || "None"}`;
    return `https://wa.me/919599087959?text=Hello%20Shafsky%20Hospitality%20Desk,%20I%20would%20like%20to%20reserve%20a%20hotel%20stay:%0A%0A${summary}`;
  };

  return (
    <div className="w-full">
      {/* Introduction Header & Authentic Photography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 pb-8 border-b border-slate-200">
        {/* Left Intro Text */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcf8ed] border border-[#d4af37]/40 text-[#b38a2e] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Hotel size={13} className="text-[#d4af37]" />
            <span>VIP Hospitality & Palace Accommodations</span>
          </div>

          <h1
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            Luxury <span className="text-[#b38a2e]">Hotels.</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600 max-w-xl leading-relaxed">
            Preferred partner rates at distinguished palace resorts, 5-star executive suites, and airport transit hotels with personalized concierge service.
          </p>

          {/* Sub-Service Option Tabs INSIDE Luxury Hotels Experience */}
          <div className="mt-6">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Choose Hotel Tier:
            </div>
            <div className="flex flex-wrap gap-2">
              {HOTEL_SUB_SERVICES.map((sub) => {
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
            src={HOMEPAGE_PHOTOS.luxuryHotel.src}
            alt="Shafsky Luxury 7 Star 5 Star Hotel Suites and Transfers"
            badge="Palace & 5-Star Accommodations"
            caption="Preferred rates and VIP amenities"
            aspectRatio="16 / 10"
          />
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 px-2">
        {[
          { num: 1, label: "Destination & Dates" },
          { num: 2, label: "Rooms & Guests" },
          { num: 3, label: "Guest Details" },
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
        {/* STEP 1: Destination & Dates */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 1 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Where & When are you staying?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hotel Tier: <strong className="text-slate-800">{subService}</strong> ({activeSubObj.properties})
              </p>
            </div>

            <div>
              <FieldLabel required>Select Destination / City</FieldLabel>
              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setCustomCity("");
                }}
                className={SELECT_CLASSES}
              >
                {POPULAR_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel optional>Or Specific Hotel / City Name</FieldLabel>
              <input
                type="text"
                placeholder="e.g. The Oberoi Amarvilas, Agra / Taj Mahal Palace, Mumbai"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className={INPUT_CLASSES}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Check-in Date</FieldLabel>
                <input
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>
              <div>
                <FieldLabel required>Check-out Date</FieldLabel>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckOutDate(e.target.value)}
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
                <span>Continue to Room Selection</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Rooms & Guests */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 2 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Number of Guests & Room Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CounterField
                label="Number of Rooms"
                sublabel="Suites or Rooms"
                value={rooms}
                onChange={setRooms}
                min={1}
                max={15}
              />
              <CounterField
                label="Adult Guests"
                sublabel="Ages 12+"
                value={adults}
                onChange={setAdults}
                min={1}
                max={30}
              />
              <CounterField
                label="Children"
                sublabel="Under 12 years"
                value={childrenCount}
                onChange={setChildrenCount}
                min={0}
                max={10}
              />
            </div>

            <div>
              <FieldLabel optional>Preferred Room Category</FieldLabel>
              <select
                value={roomPreference}
                onChange={(e) => setRoomPreference(e.target.value)}
                className={SELECT_CLASSES}
              >
                {ROOM_PREFERENCES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel optional>Special Requests / Preferences</FieldLabel>
              <textarea
                placeholder="e.g. Early check-in (10:00 AM), high-floor room, palace garden view, airport transfer linkage, vegetarian breakfast..."
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
                <span>Continue to Guest Details</span>
                <ArrowRight size={14} className="text-[#d4af37]" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Guest Contact & Final Submission */}
        {step === 3 && (
          <form onSubmit={handleSubmitFinal} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#b38a2e] font-bold">
                Step 3 of 3
              </div>
              <h2 className="text-xl font-bold text-slate-950 mt-1" style={display}>
                Lead Guest Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel required>Lead Guest Full Name</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ananya Sen"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={INPUT_CLASSES}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Mobile / WhatsApp Number</FieldLabel>
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
                    placeholder="e.g. ananya.sen@example.com"
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
                Stay Reservation Summary:
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tier:</span>
                <span className="font-semibold text-slate-900">{subService}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Destination:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[60%]">{finalCity}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dates:</span>
                <span className="font-semibold text-slate-900">{checkInDate} to {checkOutDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rooms & Guests:</span>
                <span className="font-semibold text-slate-900">{rooms} Rooms • {adults} Adults, {childrenCount} Children</span>
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
                <span>Request Hotel Reservation</span>
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
        serviceTitle="Luxury Hotel Booking Request"
        subServiceTitle={subService}
        customerName={guestName}
        customerPhone={guestPhone}
        whatsAppUrl={getWhatsAppLink()}
        isQuoteRequest={false}
        summaryItems={[
          { label: "Hotel Tier", value: subService },
          { label: "Destination", value: finalCity },
          { label: "Stay Duration", value: `${checkInDate} to ${checkOutDate}` },
          { label: "Rooms & Guests", value: `${rooms} Rooms (${adults} Adults, ${childrenCount} Children)` },
        ]}
      />
    </div>
  );
}
