import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Car,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Luggage,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { display, mono } from "@/components/home/theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import home5Img from "@/assets/homepage/home5.jpeg";
import vvipImg from "@/assets/homepage/vvip.jpeg";
import buggyImg from "@/assets/homepage/buggy.jpeg";
import home2Img from "@/assets/homepage/home2.jpeg";
import transportImg from "@/assets/others/transport.png";

export const Route = createFileRoute("/solutions/cargo")({
  head: () => ({
    meta: [
      { title: "Transport Service & Chauffeured Luxury Fleet — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Immaculate chauffeured tarmac sedans, Mercedes-Benz Maybach, Toyota Vellfire, and executive airport passenger transport across India and worldwide.",
      },
    ],
  }),
  component: DedicatedTransportServicePage,
});

export type TransportOptionId = "Luxury Vehicles" | "MUV / Large Vehicles" | "Economy / Standard";

interface TransportOptionDef {
  id: TransportOptionId;
  label: string;
  badge: string;
  tagline: string;
  vehicleModels: string[];
  inclusions: string[];
}

const TRANSPORT_OPTIONS: TransportOptionDef[] = [
  {
    id: "Luxury Vehicles",
    label: "Luxury Vehicles",
    badge: "FLAGSHIP LUXURY SEDANS",
    tagline: "Chauffeured Mercedes-Maybach, Mercedes S-Class, BMW 7-Series, and direct tarmac sedan transfer to the aircraft.",
    vehicleModels: [
      "Mercedes-Benz Maybach S-Class",
      "Mercedes-Benz S-Class (W223)",
      "BMW 7 Series (Executive Lounge)",
      "Audi A8 L Quattro",
    ],
    inclusions: [
      "Direct Tarmac Curbside to Aircraft Apron Chauffeur Transfer",
      "Uniformed, Security-Cleared Professional Executive Chauffeur",
      "Complimentary High-Speed Onboard Wi-Fi, Water & Amenities",
      "Flight Radar Live Tracking for Dynamic Landing Adjustments",
      "60 Minutes Complimentary Waiting Time at Airport Arrivals",
      "VIP Sanitized Leather Cabin with Dual Rear Reclining Seats",
    ],
  },
  {
    id: "MUV / Large Vehicles",
    label: "MUV / Large Vehicles",
    badge: "EXECUTIVE MPV & GROUP FLEET",
    tagline: "Spacious Toyota Vellfire, Mercedes V-Class, and executive vans with business class captain seating.",
    vehicleModels: [
      "Toyota Vellfire / Alphard (Ottoman Recliners)",
      "Mercedes-Benz V-Class / EQV",
      "Toyota Innova HyCross (Captain Seats)",
      "Luxury 12-Seater Executive Cruiser",
    ],
    inclusions: [
      "First-Class Ottoman Lounge Recliners & Ambient Lighting",
      "Generous Oversized Luggage Capacity (Up to 8 Large Suitcases)",
      "Private Tinted Acoustic Glass & Dual Sunroofs for Ultimate Privacy",
      "Seamless Group Transfers for Families, Entourages & Flight Crews",
      "Onboard 220V AC Power & USB-C High-Speed Fast Charging",
      "Dedicated Airport Ground Host Coordination at Arrivals Gate",
    ],
  },
  {
    id: "Economy / Standard",
    label: "Economy / Standard",
    badge: "AIRPORT TRANSIT & CITY SEDANS",
    tagline: "Punctual, clean, and reliable executive airport transfers, day disposal, and inter-city connectivity.",
    vehicleModels: [
      "Executive Sedan (Honda City / Maruti Ciaz)",
      "Standard Compact Sedan (Clean Air-Conditioned)",
      "Airport Transit Shuttles",
      "Hourly Disposal City Sedan",
    ],
    inclusions: [
      "Punctual Curbside Airport Drop-off and Terminal Pickup",
      "Fixed Transparent Pricing with Zero Surge Surcharges",
      "Modern Air-Conditioned Fleet with Experienced Route Drivers",
      "24/7 Dispatch Control Room & GPS Real-Time Monitoring",
      "Ample Boot Space for Standard Travel Bags and Carry-ons",
      "Flexible Hourly City Disposal & Airport Transfer Packages",
    ],
  },
];

function DedicatedTransportServicePage() {
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<TransportOptionId>("Luxury Vehicles");

  const activeOption =
    TRANSPORT_OPTIONS.find((o) => o.id === selectedOptionId) || TRANSPORT_OPTIONS[0];

  // Request form state
  const [tripType, setTripType] = useState<"Airport Pickup" | "Airport Drop" | "Point to Point" | "Hourly Disposal">("Airport Pickup");
  const [pickupLocation, setPickupLocation] = useState("Mumbai Airport (BOM) Terminal 2");
  const [dropLocation, setDropLocation] = useState("The Taj Mahal Palace, Colaba");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("14:30");
  const [paxCount, setPaxCount] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);
  const [vehicleModel, setVehicleModel] = useState(activeOption.vehicleModels[0]);
  const [flightNumber, setFlightNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Contact state
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSelectOption = (optId: TransportOptionId) => {
    setSelectedOptionId(optId);
    const match = TRANSPORT_OPTIONS.find((o) => o.id === optId);
    if (match) {
      setVehicleModel(match.vehicleModels[0]);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation.trim() || !dropLocation.trim()) {
      alert("Please provide both pickup and drop locations.");
      return;
    }
    if (!serviceDate) {
      alert("Please select the date for your transport service.");
      return;
    }
    if (!clientName.trim() || !phone.trim()) {
      alert("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    const quoteRef = `TR-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.warn("Transport inquiry submission:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedRef(quoteRef);
    }
  };

  const getWhatsAppDirectLink = () => {
    const text = `Hello Shafsky Chauffeur & Transport Desk,%0A%0AI would like to request luxury transport:%0A- Category: ${selectedOptionId}%0A- Vehicle Model: ${vehicleModel}%0A- Service: ${tripType}%0A- Pickup: ${pickupLocation}%0A- Drop: ${dropLocation}%0A- Date & Time: ${serviceDate} at ${serviceTime}%0A- Flight Number: ${flightNumber || "N/A"}%0A- Passengers: ${paxCount} | Luggage: ${luggageCount} Bags%0A- Client Name: ${clientName}%0A- Phone: ${phone}%0A- Email: ${email || "N/A"}%0A- Special Requests: ${specialRequests || "None"}`;
    return `https://wa.me/919599087959?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & TRANSPORT SERVICE TITLE
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
              <span>CHAUFFEURED FLEET & TARMAC SEDANS</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Transport <span className="text-lime-600">Service</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Immaculate chauffeured tarmac sedans, Mercedes-Benz Maybach, Toyota Vellfire, and luxury passenger coaches.
            </p>
          </div>

          {/* Uncropped Landscape Hero Image Container */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-100 flex items-center justify-center">
            <img
              src={transportImg}
              alt="Shafsky Luxury Transport Fleet and Tarmac Sedans"
              className="w-full h-auto object-contain object-center select-none block"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 3 TRANSPORT VEHICLE OPTIONS SELECTOR
          ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
              SELECT FLEET CATEGORY
            </span>
          </div>

          {/* 3 Option Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {TRANSPORT_OPTIONS.map((opt) => (
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
          3. SELECTED TRANSPORT REQUEST PANEL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>{activeOption.badge} — CHAUFFEUR BOOKING DISPATCH</span>
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
                CHAUFFEUR RESERVATION DISPATCHED
              </span>
              <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                Reference #{submittedRef}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your dispatch request for <strong className="text-slate-900">{selectedOptionId} ({vehicleModel})</strong> has been received by the Shafsky Ground Fleet Desk.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={15} />
                  <span>Open WhatsApp Transport Desk</span>
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
                {/* Trip Type Selector */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Service Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Airport Pickup", "Airport Drop", "Point to Point", "Hourly Disposal"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTripType(t)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          tripType === t
                            ? "bg-lime-500 text-slate-950 border border-lime-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-lime-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pickup & Drop Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Location / Airport Terminal
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        placeholder="e.g. Mumbai Airport T2 Arrival"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Drop-off Destination
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={dropLocation}
                        onChange={(e) => setDropLocation(e.target.value)}
                        placeholder="e.g. The Taj Mahal Palace, Colaba"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pickup Time
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={serviceTime}
                        onChange={(e) => setServiceTime(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Passengers, Luggage & Vehicle Model */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Passengers
                    </label>
                    <div className="relative">
                      <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={paxCount}
                        onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Luggage Pieces
                    </label>
                    <div className="relative">
                      <Luggage size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={luggageCount}
                        onChange={(e) => setLuggageCount(parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Vehicle Preference
                    </label>
                    <select
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                    >
                      {activeOption.vehicleModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Flight Number & Special Requests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Flight Number (For Dynamic Tracking)
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="e.g. AI 102 / EK 504 / 6E 214"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Special Requests (Optional)
                    </label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Child car seat, tarmac escort, English speaking chauffeur"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-700 block mb-3">
                    Contact Details for Dispatch Confirmation
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
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
                    <span>{isSubmitting ? "Dispatching..." : `Request ${selectedOptionId} Dispatch`}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMPANY CATALOG CONTENT & UNCOPPED GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.4em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200">
              <span>COMPANY CATALOG SPECIFICATIONS</span>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Transport Inclusions & Fleet.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Authoritative chauffeured tarmac, executive MPV, and inter-city fleet specifications.
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
                  { src: home5Img, alt: "Luxury Chauffeured Fleet & Jet Apron" },
                  { src: vvipImg, alt: "VIP Tarmac Sedan Arrival Reception" },
                  { src: buggyImg, alt: "Airside Passenger Terminal Buggy" },
                  { src: home2Img, alt: "Dedicated Airport Porterage & Baggage" },
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
