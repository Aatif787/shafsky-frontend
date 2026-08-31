import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Plane,
  Car,
  Hotel,
  Shield,
  Sparkles,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Award,
  Crown,
  FileCheck,
  Send,
  Luggage,
} from "lucide-react";
import { display, mono } from "../home/theme";

export type BookingServiceType =
  | "meet-greet"
  | "charter"
  | "transport"
  | "hotel"
  | "special";

interface ServiceTab {
  id: BookingServiceType;
  title: string;
  shortTitle: string;
  icon: any;
  subtitle: string;
}

const SERVICE_TABS: ServiceTab[] = [
  {
    id: "meet-greet",
    title: "Meet & Greet and Lounge",
    shortTitle: "Meet & Greet",
    icon: Plane,
    subtitle: "Airport VIP Escort & Fast-Track",
  },
  {
    id: "charter",
    title: "Air Charter",
    shortTitle: "Air Charter",
    icon: Crown,
    subtitle: "Private Jets & Helicopters",
  },
  {
    id: "transport",
    title: "Transport Service",
    shortTitle: "Luxury Transport",
    icon: Car,
    subtitle: "Luxury Sedans & Large MUVs",
  },
  {
    id: "hotel",
    title: "Luxury Hotels",
    shortTitle: "Luxury Hotels",
    icon: Hotel,
    subtitle: "7-Star, 5-Star & Palace Suites",
  },
  {
    id: "special",
    title: "Special Services",
    shortTitle: "Special Services",
    icon: Shield,
    subtitle: "PSO Security, Tours & Repatriation",
  },
];

const AIRPORTS = [
  { code: "DEL", name: "Delhi - Indira Gandhi Intl (IGI)", city: "New Delhi" },
  { code: "BOM", name: "Mumbai - Chhatrapati Shivaji Maharaj (CSMIA)", city: "Mumbai" },
  { code: "BLR", name: "Bengaluru - Kempegowda Intl", city: "Bengaluru" },
  { code: "GOI", name: "Goa - Dabolim / Mopa Airport", city: "Goa" },
  { code: "HYD", name: "Hyderabad - Rajiv Gandhi Intl", city: "Hyderabad" },
  { code: "CCU", name: "Kolkata - Netaji Subhash Chandra Bose", city: "Kolkata" },
  { code: "MAA", name: "Chennai - International Airport", city: "Chennai" },
  { code: "COK", name: "Kochi - International Airport", city: "Kochi" },
  { code: "JAI", name: "Jaipur - International Airport", city: "Jaipur" },
  { code: "ATQ", name: "Amritsar - Sri Guru Ram Dass Jee", city: "Amritsar" },
  { code: "DXB", name: "Dubai - International (DXB)", city: "Dubai" },
  { code: "LHR", name: "London - Heathrow (LHR)", city: "London" },
];

export function UniversalBookingHub({
  initialService = "meet-greet",
}: {
  initialService?: BookingServiceType;
}) {
  const [activeTab, setActiveTab] = useState<BookingServiceType>(initialService);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Common Contact State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // 1. Meet & Greet Form State (Departure First)
  const [mgServiceType, setMgServiceType] = useState<"Departure" | "Arrival" | "Transit">("Departure");
  const [mgTravelType, setMgTravelType] = useState<"Domestic" | "International">("Domestic");
  const [mgAirport, setMgAirport] = useState("DEL");
  const [mgDate, setMgDate] = useState("");
  const [mgFlightNumber, setMgFlightNumber] = useState("");
  const [mgAdults, setMgAdults] = useState(1);
  const [mgChildren, setMgChildren] = useState(0);
  const [mgTier, setMgTier] = useState<"Silver" | "Gold" | "Platinum VIP">("Gold");

  // 2. Air Charter Form State
  const [charterType, setCharterType] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [charterOrigin, setCharterOrigin] = useState("DEL");
  const [charterDest, setCharterDest] = useState("BOM");
  const [charterCategory, setCharterCategory] = useState("Midsize Executive Jet (7-9 Pax)");
  const [charterDate, setCharterDate] = useState("");
  const [charterPax, setCharterPax] = useState(4);

  // 3. Transport Form State
  const [transVehicle, setTransVehicle] = useState("Luxury Sedan (Mercedes S-Class / BMW 7)");
  const [transType, setTransType] = useState("Airport Transfer");
  const [transPickup, setTransPickup] = useState("Delhi Airport T3");
  const [transDrop, setTransDrop] = useState("The Oberoi / Aerocity");
  const [transDate, setTransDate] = useState("");

  // 4. Hotel Form State
  const [hotelCity, setHotelCity] = useState("New Delhi / Aerocity");
  const [hotelTier, setHotelTier] = useState("5 Star Luxury Suite");
  const [hotelCheckIn, setHotelCheckIn] = useState("");
  const [hotelCheckOut, setHotelCheckOut] = useState("");
  const [hotelRooms, setHotelRooms] = useState(1);

  // 5. Special Services Form State
  const [specialCategory, setSpecialCategory] = useState("PSO (Personal Security Officer)");
  const [specialCity, setSpecialCity] = useState("Delhi NCR");
  const [specialDate, setSpecialDate] = useState("");
  const [specialUrgent, setSpecialUrgent] = useState(false);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    if (initialService) {
      setActiveTab(initialService);
    }
  }, [initialService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refId = `SHAF-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(refId);
  };

  const constructWhatsAppMessage = () => {
    let details = "";
    if (activeTab === "meet-greet") {
      details = `Service: Meet & Greet (${mgServiceType}, ${mgTravelType})%0AAirport: ${mgAirport}%0ADate: ${mgDate}%0AFlight: ${mgFlightNumber}%0APassengers: ${mgAdults} Adults, ${mgChildren} Children%0APackage: ${mgTier}`;
    } else if (activeTab === "charter") {
      details = `Service: Air Charter (${charterType})%0ARoute: ${charterOrigin} -> ${charterDest}%0AAircraft: ${charterCategory}%0ADate: ${charterDate}%0APassengers: ${charterPax}`;
    } else if (activeTab === "transport") {
      details = `Service: Transport Service (${transType})%0AVehicle: ${transVehicle}%0APickup: ${transPickup}%0ADrop: ${transDrop}%0ADate: ${transDate}`;
    } else if (activeTab === "hotel") {
      details = `Service: Luxury Hotel Booking%0ACity: ${hotelCity}%0ATier: ${hotelTier}%0ACheck-in: ${hotelCheckIn} to ${hotelCheckOut}%0ARooms: ${hotelRooms}`;
    } else if (activeTab === "special") {
      details = `Service: Special Services%0AType: ${specialCategory}%0ALocation: ${specialCity}%0ADate: ${specialDate}%0AUrgent: ${specialUrgent ? "YES" : "Standard"}`;
    }

    const lead = `Guest Name: ${fullName}%0APhone: ${phone}%0AEmail: ${email}%0ANotes: ${specialNotes}`;
    return `https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20would%20like%20to%20reserve%20a%20service:%0A%0A${details}%0A%0A${lead}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-lime-700 font-bold"
            style={mono}
          >
            <span className="h-px w-8 bg-lime-500" />
            <Sparkles size={12} className="text-lime-600" />
            <span>BESPOKE RESERVATION PORTAL</span>
            <span className="h-px w-8 bg-lime-500" />
          </div>

          <h1
            className="mt-3 text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.06] text-slate-950 font-bold tracking-tight"
            style={display}
          >
            Reserve Your <span className="text-lime-600">Experience.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Select your service below for direct arrangement across 20+ Indian airports and global destinations.
          </p>
        </div>

        {/* 5-Service Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-slate-950 text-white border-lime-500 shadow-xl shadow-slate-950/15 scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-lime-400 hover:bg-lime-50/40"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl mb-3 ${
                    isActive ? "bg-lime-500 text-slate-950" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-xs sm:text-sm font-bold tracking-tight mb-1" style={display}>
                  {tab.shortTitle}
                </span>
                <span
                  className={`text-[10.5px] leading-tight font-medium ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {tab.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Form (Left) & Live Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Dynamic Service Booking Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pillar 1: Meet & Greet */}
              {activeTab === "meet-greet" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950" style={display}>
                      Meet & Greet and Lounge Details
                    </h3>
                    <span className="text-xs font-mono text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200" style={mono}>
                      Airside Fast-Track
                    </span>
                  </div>

                  {/* Direction & Travel Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Service Protocol
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Departure", "Arrival", "Transit"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setMgServiceType(type)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                              mgServiceType === type
                                ? "bg-slate-950 text-lime-400 border-slate-950"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-lime-400"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Flight Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Domestic", "International"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setMgTravelType(type)}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                              mgTravelType === type
                                ? "bg-slate-950 text-lime-400 border-slate-950"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-lime-400"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Airport & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Select Airport Hub
                      </label>
                      <select
                        value={mgAirport}
                        onChange={(e) => setMgAirport(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
                      >
                        {AIRPORTS.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Date of Travel
                      </label>
                      <input
                        type="date"
                        required
                        value={mgDate}
                        onChange={(e) => setMgDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Flight Number & Passengers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Flight Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AI 102 / 6E 204"
                        value={mgFlightNumber}
                        onChange={(e) => setMgFlightNumber(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Adults (12+ yrs)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={mgAdults}
                        onChange={(e) => setMgAdults(Number(e.target.value))}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Package Tier
                      </label>
                      <select
                        value={mgTier}
                        onChange={(e) => setMgTier(e.target.value as any)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
                      >
                        <option value="Silver">Silver Escort</option>
                        <option value="Gold">Gold VIP Fast-Track</option>
                        <option value="Platinum VIP">Platinum Royal VVIP</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar 2: Air Charter */}
              {activeTab === "charter" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950" style={display}>
                      Private Aviation & Helicopter Charter
                    </h3>
                    <span className="text-xs font-mono text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200" style={mono}>
                      Executive Fleet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Flight Type
                      </label>
                      <select
                        value={charterType}
                        onChange={(e) => setCharterType(e.target.value as any)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option value="One Way">One Way</option>
                        <option value="Round Trip">Round Trip</option>
                        <option value="Multi-City">Multi-City Tour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Origin City / Airport
                      </label>
                      <select
                        value={charterOrigin}
                        onChange={(e) => setCharterOrigin(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        {AIRPORTS.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.city} ({a.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Destination City
                      </label>
                      <select
                        value={charterDest}
                        onChange={(e) => setCharterDest(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        {AIRPORTS.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.city} ({a.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Aircraft Category
                      </label>
                      <select
                        value={charterCategory}
                        onChange={(e) => setCharterCategory(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option>Light Jet (4-6 Pax)</option>
                        <option>Midsize Executive Jet (7-9 Pax)</option>
                        <option>Heavy Long-Range Jet (10-16 Pax)</option>
                        <option>Twin-Engine Helicopter (4-6 Pax)</option>
                        <option>Dedicated Air Ambulance (ICU on Board)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Departure Date
                      </label>
                      <input
                        type="date"
                        required
                        value={charterDate}
                        onChange={(e) => setCharterDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Passenger Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={charterPax}
                        onChange={(e) => setCharterPax(Number(e.target.value))}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar 3: Transport */}
              {activeTab === "transport" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950" style={display}>
                      Luxury Chauffeur & Fleet Details
                    </h3>
                    <span className="text-xs font-mono text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200" style={mono}>
                      Chauffeur Driven
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Vehicle Preference
                      </label>
                      <select
                        value={transVehicle}
                        onChange={(e) => setTransVehicle(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option>Luxury Sedan (Mercedes S-Class / BMW 7)</option>
                        <option>Luxury MUV (Toyota Vellfire / Innova Hycross)</option>
                        <option>Executive Sedan (Mercedes E-Class / BMW 5)</option>
                        <option>Standard / Economy Fleet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Service Type
                      </label>
                      <select
                        value={transType}
                        onChange={(e) => setTransType(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option>Airport Transfer (Pickup / Drop)</option>
                        <option>Full-Day Chauffeur (8 Hours / 80 Km)</option>
                        <option>Intercity Travel (Outstation)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Pickup Address / Airport
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi Airport T3"
                        value={transPickup}
                        onChange={(e) => setTransPickup(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Drop Address / Hotel
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. The Oberoi / Aerocity"
                        value={transDrop}
                        onChange={(e) => setTransDrop(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        required
                        value={transDate}
                        onChange={(e) => setTransDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar 4: Luxury Hotels */}
              {activeTab === "hotel" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950" style={display}>
                      Luxury Hotel & Palace Reservations
                    </h3>
                    <span className="text-xs font-mono text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200" style={mono}>
                      VIP Hospitality
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Destination City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi / Aerocity / Mumbai / Udaipur"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Hotel Tier
                      </label>
                      <select
                        value={hotelTier}
                        onChange={(e) => setHotelTier(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option>7-Star Heritage Palace Suite</option>
                        <option>5-Star Luxury Suite</option>
                        <option>3-Star Premium Business Hotel</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Check-In Date
                      </label>
                      <input
                        type="date"
                        required
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Check-Out Date
                      </label>
                      <input
                        type="date"
                        required
                        value={hotelCheckOut}
                        onChange={(e) => setHotelCheckOut(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Rooms
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={hotelRooms}
                        onChange={(e) => setHotelRooms(Number(e.target.value))}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pillar 5: Special Services */}
              {activeTab === "special" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950" style={display}>
                      Special Services & Bespoke Assistance
                    </h3>
                    <span className="text-xs font-mono text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200" style={mono}>
                      Dedicated Support
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Select Special Service
                      </label>
                      <select
                        value={specialCategory}
                        onChange={(e) => setSpecialCategory(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      >
                        <option>PSO (Personal Security Officer) Armed Escort</option>
                        <option>Bespoke Tours & Travel Itineraries</option>
                        <option>Passport & VISA Fast-Track Assistance</option>
                        <option>Sightseeing & Official Multilingual Guide</option>
                        <option>Infant & Elderly Dedicated Airport Care</option>
                        <option>Human Remains Air Cargo Repatriation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Service Location / City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi NCR, Mumbai, Jaipur, etc."
                        value={specialCity}
                        onChange={(e) => setSpecialCity(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2" style={mono}>
                        Requested Date
                      </label>
                      <input
                        type="date"
                        required
                        value={specialDate}
                        onChange={(e) => setSpecialDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={specialUrgent}
                        onChange={(e) => setSpecialUrgent(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
                      />
                      <label htmlFor="urgent" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Urgent / Same-Day Dispatch Required
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Simplified Contact Details Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono" style={mono}>
                  Your Contact Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajiv Mehra"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rajiv@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-lime-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notes / Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific flight numbers, dietary requirements, or special assistance..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-lime-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="submit"
                  className="w-full sm:flex-1 h-14 rounded-2xl bg-slate-950 text-lime-400 hover:bg-slate-900 text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer font-mono"
                  style={mono}
                >
                  <span>Submit Reservation Request</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href={constructWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer font-mono shadow-md"
                  style={mono}
                >
                  <MessageSquare size={16} />
                  <span>Instant WhatsApp Booking</span>
                </a>
              </div>
            </form>
          </div>

          {/* Right: Live Summary & Direct 24/7 Desk */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Itinerary Review Card */}
            <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-7 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold" style={mono}>
                  RESERVATION SUMMARY
                </span>
                <span className="text-xs text-slate-400 font-mono" style={mono}>
                  24/7 Ops Ready
                </span>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Selected Service:</span>
                  <span className="font-bold text-white uppercase text-[11px]" style={mono}>
                    {SERVICE_TABS.find((t) => t.id === activeTab)?.title}
                  </span>
                </div>

                {activeTab === "meet-greet" && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Protocol & Type:</span>
                      <span className="font-semibold text-lime-300">{mgServiceType} · {mgTravelType}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Airport Hub:</span>
                      <span className="font-semibold text-white">{mgAirport}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Package Tier:</span>
                      <span className="font-semibold text-white">{mgTier}</span>
                    </div>
                  </>
                )}

                {activeTab === "charter" && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Route:</span>
                      <span className="font-semibold text-lime-300">{charterOrigin} ➔ {charterDest}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Fleet:</span>
                      <span className="font-semibold text-white">{charterCategory}</span>
                    </div>
                  </>
                )}

                {activeTab === "transport" && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="font-semibold text-lime-300">{transVehicle}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Service:</span>
                      <span className="font-semibold text-white">{transType}</span>
                    </div>
                  </>
                )}

                {activeTab === "hotel" && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Destination:</span>
                      <span className="font-semibold text-lime-300">{hotelCity}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Tier:</span>
                      <span className="font-semibold text-white">{hotelTier}</span>
                    </div>
                  </>
                )}

                {activeTab === "special" && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Service:</span>
                      <span className="font-semibold text-lime-300">{specialCategory}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-semibold text-white">{specialCity}</span>
                    </div>
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Confirmation SLA:</span>
                  <span className="text-lime-400 font-bold font-mono">Under 15 Minutes</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <a
                  href="tel:+919599087959"
                  className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  style={mono}
                >
                  <PhoneCall size={14} className="text-lime-400" />
                  <span>Call 24/7 Desk (+91 9599087959)</span>
                </a>
              </div>
            </div>

            {/* Compliance Guarantee */}
            <div className="rounded-2xl bg-lime-50 border border-lime-200 p-5 flex items-start gap-3.5">
              <ShieldCheck size={22} className="text-lime-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-lime-950 font-mono uppercase tracking-wider" style={mono}>
                  Official DGCA Protocol Authorized
                </h5>
                <p className="text-[11px] text-lime-800 mt-1 leading-relaxed">
                  All airside escort, private charter, and airport transport itineraries adhere to official airport security standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Success Modal */}
      <AnimatePresence>
        {submittedRef && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border-2 border-lime-500 relative"
            >
              <div className="h-16 w-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-lime-600" />
              </div>

              <span className="text-[10px] font-mono uppercase tracking-widest text-lime-700 font-bold" style={mono}>
                RESERVATION RECEIVED
              </span>

              <h3 className="text-2xl font-bold text-slate-950 mt-1" style={display}>
                Your Booking Reference
              </h3>

              <div className="my-4 p-3 bg-slate-900 text-lime-400 rounded-xl font-mono text-xl font-bold tracking-widest" style={mono}>
                {submittedRef}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Our 24/7 Operations Desk has received your request for <strong>{fullName}</strong>. An executive will contact you within 15 minutes to confirm flight slots and airside clearance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={constructWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] text-slate-950 text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  style={mono}
                >
                  <MessageSquare size={14} />
                  <span>Send on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                  style={mono}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UniversalBookingHub;
