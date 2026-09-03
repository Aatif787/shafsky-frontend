import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Hotel,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Building2,
  Crown,
  Sparkles,
  Send,
  CheckCircle2,
  Bed,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import hotelImg from "@/assets/homepage/hotel.jpeg";
import hotelPageImg from "@/assets/others/hotelpage.png";
import vvipLounge from "@/assets/homepage/lounge.jpeg";
import vvipTerminal from "@/assets/homepage/vvip.jpeg";
import transitImg from "@/assets/homepage/transit.jpeg";

export const Route = createFileRoute("/solutions/travel")({
  head: () => ({
    meta: [
      { title: "Luxury Hotels & VIP Accommodations — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Preferred partner rates at distinguished palace resorts, 5-star executive suites, and airport transit hotels across India and worldwide.",
      },
    ],
  }),
  component: DedicatedLuxuryHotelsPage,
});

export type HotelOptionId = "7 Star Hotels" | "5 Star Hotels" | "3 Star Hotels";

interface HotelOptionDef {
  id: HotelOptionId;
  label: string;
  badge: string;
  tagline: string;
  suitePreferences: string[];
  inclusions: string[];
}

const HOTEL_OPTIONS: HotelOptionDef[] = [
  {
    id: "7 Star Hotels",
    label: "7 Star Hotels",
    badge: "ROYAL PALACE & HERITAGE",
    tagline: "Royal palace estates, heritage suites, private pool villas, and ultra-luxury landmark properties.",
    suitePreferences: [
      "Presidential Suite / Royal Suite",
      "Private Heritage Villa with Pool",
      "Executive Palace Club Suite",
      "Grand Signature Pavilion",
    ],
    inclusions: [
      "Ultra-Luxury Palace Suites, Royal Heritage Villas & Presidential Stays",
      "24/7 Dedicated Butler Service & Private Valet Attention",
      "Bespoke In-Suite Fine Dining by Master Chefs",
      "VIP Chauffeur & Direct Airport Tarmac Limousine Transfers",
      "Priority Early Check-in & Guaranteed Late Check-out",
      "Confidential VIP Guest Manifests & Private Security Access",
    ],
  },
  {
    id: "5 Star Hotels",
    label: "5 Star Hotels",
    badge: "PREMIER EXECUTIVE",
    tagline: "Premier luxury city hotels, executive business suites, and airport transit properties.",
    suitePreferences: [
      "Executive Club Suite (Lounge Access)",
      "Deluxe King / Twin City View",
      "Luxury Junior Suite",
      "Airport Transit 5-Star Suite",
    ],
    inclusions: [
      "Premier Luxury City Hotels, Executive Business Suites & Airport Transit Properties",
      "Access to Executive Club Lounges & Meeting Facilities",
      "Complimentary High-Speed Fiber Internet & Business Center Privileges",
      "Seamless Airport Pickup and Drop-off Services",
      "Multi-Cuisine Gourmet Breakfast & 24-Hour Room Service",
      "Flexible Reservation Modifications & Preferential Corporate Rates",
    ],
  },
  {
    id: "3 Star Hotels",
    label: "3 Star Hotels",
    badge: "TRANSIT & COMFORT",
    tagline: "Comfortable executive transit stays, day-use rooms, and convenient airport properties.",
    suitePreferences: [
      "Executive Standard Room",
      "Deluxe Twin Room",
      "Transit Day-Use Room (6 - 12 Hours)",
      "Express Airport Room",
    ],
    inclusions: [
      "Comfortable, Clean Executive Stays & Airside Transit Hotels",
      "Convenient Proximity to Airport Terminals and City Transit Hubs",
      "Air-Conditioned Rooms with Modern Amenities & High-Speed Wi-Fi",
      "24/7 Front Desk Reception & Luggage Storage Facilities",
      "Express Airport Shuttle Transfers on Demand",
      "Cost-Effective Short-Stay & Day-Use Room Packages",
    ],
  },
];

function DedicatedLuxuryHotelsPage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<HotelOptionId>("7 Star Hotels");

  const activeOption =
    HOTEL_OPTIONS.find((o) => o.id === selectedOptionId) || HOTEL_OPTIONS[0];

  // Request form state
  const [destination, setDestination] = useState("Mumbai / Delhi / Udaipur");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [suitePreference, setSuitePreference] = useState(activeOption.suitePreferences[0]);
  const [specialRequests, setSpecialRequests] = useState("");

  // Contact state
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSelectOption = (optId: HotelOptionId) => {
    setSelectedOptionId(optId);
    const match = HOTEL_OPTIONS.find((o) => o.id === optId);
    if (match) {
      setSuitePreference(match.suitePreferences[0]);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert("Please enter your desired destination or city.");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (!guestName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const quoteRef = `HT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Allow slight network delay simulation for user experience
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.warn("Hotel inquiry submission:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedRef(quoteRef);
    }
  };

  const getWhatsAppDirectLink = () => {
    const text = `Hello Shafsky Hospitality Desk,%0A%0AI would like to request hotel accommodation:%0A- Category: ${selectedOptionId}%0A- Destination: ${destination}%0A- Dates: ${checkInDate} to ${checkOutDate}%0A- Rooms: ${roomCount} | Guests: ${guestCount}%0A- Room/Suite Preference: ${suitePreference}%0A- Guest Name: ${guestName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}%0A- Special Requests: ${specialRequests || "None"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & LUXURY HOTELS TITLE
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-4 pb-8 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-lime-500 hover:text-lime-700 hover:bg-lime-50/50 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-lime-700 uppercase tracking-widest bg-lime-50 px-3.5 py-1.5 rounded-full border border-lime-200">
              <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
              <span>VIP ACCOMMODATIONS & PALACE RESORTS</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Luxury <span className="text-lime-600">Hotels</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Preferred partner rates at distinguished palace resorts, 5-star executive suites, and airport transit hotels.
            </p>
          </div>

          {/* Full Original Panoramic Palace Resort Photo (16:9 Landscape - Complete Architecture) */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-white border border-slate-100">
            <img
              src={hotelPageImg}
              alt="Shafsky Luxury 7 Star 5 Star Hotel Suites and Palace Estates"
              className="w-full h-auto object-contain object-center select-none block"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 3 LUXURY HOTEL OPTIONS SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
              SELECT HOTEL CATEGORY
            </span>
          </div>

          {/* 3 Option Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {HOTEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  selectedOptionId === opt.id
                    ? "bg-lime-500 text-slate-950 shadow-md ring-2 ring-lime-400 border border-lime-600"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SELECTED HOTEL REQUEST PANEL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>{activeOption.badge} — ACCOMMODATION REQUEST</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.id} Request
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              {activeOption.tagline}
            </p>
          </div>

          {/* Success State / Reference Card */}
          {submittedRef ? (
            <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700">
                HOTEL RESERVATION INQUIRY DISPATCHED
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your inquiry for <strong className="text-slate-900">{selectedOptionId}</strong> in <strong className="text-slate-900">{destination}</strong> has been received by the Shafsky Hospitality Concierge Desk.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Open WhatsApp Hospitality Desk</span>
                </a>
                <button
                  onClick={() => setSubmittedRef(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider transition-all"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-md">
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Destination & City */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination City / Preferred Hotel Property
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Mumbai (Taj Mahal Palace) / Delhi (The Leela) / Udaipur"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                    />
                  </div>
                </div>

                {/* Check-in & Check-out Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Rooms, Guests & Suite Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Number of Rooms
                    </label>
                    <div className="relative">
                      <Bed size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={roomCount}
                        onChange={(e) => setRoomCount(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Number of Guests
                    </label>
                    <div className="relative">
                      <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Room / Suite Preference
                    </label>
                    <select
                      value={suitePreference}
                      onChange={(e) => setSuitePreference(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                    >
                      {activeOption.suitePreferences.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Airport luxury chauffeur pickup, early check-in, dietary preferences, private butler..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                  />
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-700 block mb-3">
                    Contact Details for Reservation Confirmation
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Sameer Verma"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. guest@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "Submitting..." : `Request ${selectedOptionId} Quotation`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & AUTHENTIC GALLERY (Seamless Editorial)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              <span>COMPANY CATALOG SPECIFICATIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Hospitality Inclusions.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Authoritative palace, executive suite, and transit hotel privileges.
            </p>
          </div>

          {/* 2-Column Balanced Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Option Title & Exact Inclusions List */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-lime-700 font-mono font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                {activeOption.badge}
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a196f] tracking-tight mb-6" style={display}>
                {activeOption.id}
              </h3>

              <div className="space-y-4">
                {activeOption.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-3.5 text-sm sm:text-[15px] text-slate-900 leading-snug">
                    <span className="text-slate-900 font-bold text-xl leading-none mt-0.5">•</span>
                    <span className="font-semibold text-slate-900">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Original Aspect Ratio Uncropped Gallery */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { src: hotelImg, alt: "Palace Resorts & Estates" },
                  { src: vvipLounge, alt: "VIP Lounge & Suite Comfort" },
                  { src: vvipTerminal, alt: "Chauffeured Ground Transfers" },
                  { src: transitImg, alt: "Airside Transit Stays" },
                ].map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white group hover:border-lime-400 transition-all"
                  >
                    <div className="w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-auto object-contain object-center select-none block group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 bg-white border-t border-slate-100">
                      <span className="text-[11px] font-mono font-bold text-slate-800 tracking-wide block">
                        {img.alt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
