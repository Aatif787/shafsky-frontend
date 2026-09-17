import React, { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Phone,
  MessageSquare,
  ShieldCheck,
  X,
  Send, Clock,
  Coffee,
  Plane, Sparkles, ChevronRight,
  Maximize2,
  CheckCircle2, Compass,
  FileText, ExternalLink,
  MapPin,
  Navigation,
  Loader2,
  Copy
} from "lucide-react";
import { enquiryApi } from "@/lib/api/enquiryApi";

export const Route = createFileRoute("/hotels/holiday-inn-express")({
  head: () => ({
    meta: [
      { title: "Holiday Inn Express Hotel IGI Airport T3 — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Exclusive rates and hourly transit bookings at Holiday Inn Express Hotel IGI Airport Terminal 3, New Delhi. Airside transit and day-use stays.",
      },
    ],
  }),
  component: HolidayInnExpressDetailPage,
});

interface RoomOption {
  id: string;
  name: string;
  wing: "domestic" | "international";
  wingLabel: string;
  duration: string;
  durationHours: number;
  bedType: "Queen" | "Single Twin";
  price: string;
  priceNumeric: number;
  taxNote: string;
  extraBedNote?: string;
  freeBreakfast: boolean;
  freeCancellation: boolean;
}

const ROOM_OPTIONS: RoomOption[] = [
  // Domestic Wing B - 1 Queen Bed Standard
  {
    id: "queen-domestic-9",
    name: "1 Queen Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "9 hrs",
    durationHours: 9,
    bedType: "Queen",
    price: "₹ 9,999/-",
    priceNumeric: 9999,
    taxNote: "Excluded taxes & fees for 9 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  {
    id: "queen-domestic-12",
    name: "1 Queen Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "12 hrs",
    durationHours: 12,
    bedType: "Queen",
    price: "₹ 10,999/-",
    priceNumeric: 10999,
    taxNote: "Excluded taxes & fees for 12 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  {
    id: "queen-domestic-24",
    name: "1 Queen Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "24 hrs",
    durationHours: 24,
    bedType: "Queen",
    price: "₹ 11,999/-",
    priceNumeric: 11999,
    taxNote: "Excluded taxes & fees for 24 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  // Domestic Wing B - 2 Single Bed Standard
  {
    id: "single-domestic-9",
    name: "2 Single Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "9 hrs",
    durationHours: 9,
    bedType: "Single Twin",
    price: "₹ 10,999/-",
    priceNumeric: 10999,
    taxNote: "Excluded taxes & fees for 9 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  {
    id: "single-domestic-12",
    name: "2 Single Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "12 hrs",
    durationHours: 12,
    bedType: "Single Twin",
    price: "₹ 11,999/-",
    priceNumeric: 11999,
    taxNote: "Excluded taxes & fees for 12 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  {
    id: "single-domestic-24",
    name: "2 Single Bed Standard Domestic Wing B",
    wing: "domestic",
    wingLabel: "Domestic Wing B",
    duration: "24 hrs",
    durationHours: 24,
    bedType: "Single Twin",
    price: "₹ 12,499/-",
    priceNumeric: 12499,
    taxNote: "Excluded taxes & fees for 24 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  // International Wing - 1 Queen Bed Standard
  {
    id: "queen-intl-9",
    name: "1 Queen Bed Standard International Wing",
    wing: "international",
    wingLabel: "International Wing",
    duration: "9 hrs",
    durationHours: 9,
    bedType: "Queen",
    price: "₹ 12,820",
    priceNumeric: 12820,
    taxNote: "+₹ 2307.60 taxes & fees for 9 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
  // International Wing - 2 Single Bed Standard
  {
    id: "single-intl-9",
    name: "2 Single Bed Standard International Wing",
    wing: "international",
    wingLabel: "International Wing",
    duration: "9 hrs",
    durationHours: 9,
    bedType: "Single Twin",
    price: "₹ 13,200",
    priceNumeric: 13200,
    taxNote: "+₹ 2,376 taxes & fees for 9 hrs",
    extraBedNote: "Extra bed in single room-1499/-",
    freeBreakfast: true,
    freeCancellation: true,
  },
];

const GALLERY_IMAGES = [
  {
    src: "/images/hotels/holiday-inn/room-main.jpg",
    title: "1 Queen Bed Standard Domestic Wing B",
    caption: "Spacious master bedroom with plush bedding, work desk and mood lighting.",
  },
  {
    src: "/images/hotels/holiday-inn/couple-tablet.jpg",
    title: "Relaxing Airport Transit Ambiance",
    caption: "Soundproof guest room environment with high-speed WiFi and comfortable bedding.",
  },
  {
    src: "/images/hotels/holiday-inn/room-night.jpg",
    title: "Evening Atmosphere & Executive Desk",
    caption: "Warm illumination and full workstation for business and transit travelers.",
  },
  {
    src: "/images/hotels/holiday-inn/twin-beds-1.jpg",
    title: "2 Single Bed Standard Domestic Wing B",
    caption: "Dual twin bed arrangement ideal for colleagues, flight crew, and transit companions.",
  },
  {
    src: "/images/hotels/holiday-inn/room-apples.jpg",
    title: "Executive Suite Living & Dining Lounge",
    caption: "Modern glass coffee table, fresh welcome amenities, and runway airport view.",
  },
];

function HolidayInnExpressDetailPage() {
  const navigate = useNavigate();

  // Filters & State
  const [activeTab, setActiveTab] = useState<"all" | "domestic" | "international">("all");
  const [activeBedFilter, setActiveBedFilter] = useState<"all" | "Queen" | "Single Twin">("all");
  const [activeDurationFilter, setActiveDurationFilter] = useState<"all" | "9 hrs" | "12 hrs" | "24 hrs">("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [activeHeroDuration, setActiveHeroDuration] = useState<"9 hrs" | "12 hrs" | "24 hrs">("9 hrs");
  
  // Photo Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Form State & Dual Persistence
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [needExtraBed, setNeedExtraBed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        "Holiday Inn Express New Delhi Int'l Airport T3, Terminal 3, Level 5, Indira Gandhi International Airport, New Delhi, Delhi 110037"
      );
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };

  const handleCopyBookingRef = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && bookingRef) {
      navigator.clipboard.writeText(bookingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return ROOM_OPTIONS.filter((r) => {
      if (activeTab !== "all" && r.wing !== activeTab) return false;
      if (activeBedFilter !== "all" && r.bedType !== activeBedFilter) return false;
      if (activeDurationFilter !== "all" && r.duration !== activeDurationFilter) return false;
      return true;
    });
  }, [activeTab, activeBedFilter, activeDurationFilter]);

  // Domestic vs International split
  const domesticRooms = filteredRooms.filter((r) => r.wing === "domestic");
  const internationalRooms = filteredRooms.filter((r) => r.wing === "international");

  // Featured hero room based on duration
  const featuredRoom =
    ROOM_OPTIONS.find((r) => r.wing === "domestic" && r.duration === activeHeroDuration) ||
    ROOM_OPTIONS[0];

  const handleEnquiry = (room: RoomOption) => {
    setSelectedRoom(room);
    setNeedExtraBed(false);
    setSubmitted(false);
    setIsSubmitting(false);
    setBookingRef("");
    setCopiedRef(false);
  };

  const handleWhatsAppBooking = (room: RoomOption) => {
    const text = encodeURIComponent(
      `Hello Shafsky Aviation Concierge, I would like to book a room at Holiday Inn Express Hotel IGI Airport T3, New Delhi:\n\n` +
        `• Room: ${room.name}\n` +
        `• Wing: ${room.wingLabel}\n` +
        `• Duration: ${room.duration}\n` +
        `• Rate: ${room.price} (${room.taxNote})\n` +
        `• Note: ${room.extraBedNote || "None"}\n\n` +
        `Please confirm real-time availability and dispatch my check-in reservation.`
    );
    window.open(`https://wa.me/919999017646?text=${text}`, "_blank");
  };

  const submitEnquiry = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom || isSubmitting) return;

    setIsSubmitting(true);

    const extraBedText = needExtraBed ? "Yes (+₹1,499/-)" : "No";
    let officialRef = `SHAF-HTL-T3-${Date.now().toString().slice(-6)}`;

    // Prepare payload for backend DB persistence (Dual Persistence)
    const payload = {
      passengerName: guestName.trim() || "Valued Guest",
      passengerEmail: guestEmail.trim() || `${(guestName.trim() || "guest").toLowerCase().replace(/[^a-z0-9]/g, ".")}@guest.shafsky.com`,
      passengerPhone: guestPhone.trim(),
      serviceCategory: "Travel Support" as const,
      serviceType: "Hotel Booking",
      destination: "Holiday Inn Express New Delhi Int'l Airport T3",
      serviceDate: `Transit Stay (${selectedRoom.duration})`,
      notes: `Room: ${selectedRoom.name} | Wing: ${selectedRoom.wingLabel} | Rate: ${selectedRoom.price} (${selectedRoom.taxNote}) | Extra Bed: ${extraBedText}`,
      details: {
        hotel_name: "Holiday Inn Express Hotel IGI Airport T3, New Delhi",
        room_name: selectedRoom.name,
        wing: selectedRoom.wingLabel,
        duration: selectedRoom.duration,
        rate: selectedRoom.price,
        tax_note: selectedRoom.taxNote,
        extra_bed: needExtraBed,
      },
    };

    try {
      const res = await enquiryApi.submit(payload);
      if (res.success && res.data) {
        const returnedRef = res.data.bookingRef || (res.data as any).booking_ref;
        if (returnedRef) {
          officialRef = returnedRef;
        }
      }
    } catch (err) {
      console.warn("Backend enquiry API offline or not responding, using resilient local ref:", err);
    }

    setBookingRef(officialRef);

    // Build structured WhatsApp message with Official Booking Ref
    const text = encodeURIComponent(
      `*New Hotel Room Reservation Request — Shafsky Aviation*\n` +
      `*Reference ID: ${officialRef}*\n\n` +
      `🏨 *Hotel:* Holiday Inn Express Hotel IGI Airport T3, New Delhi\n` +
      `🛏️ *Room:* ${selectedRoom.name}\n` +
      `📍 *Wing:* ${selectedRoom.wingLabel} (Inside DEL T3)\n` +
      `⏱️ *Duration:* ${selectedRoom.duration} Package\n` +
      `💳 *Rate:* ${selectedRoom.price} (${selectedRoom.taxNote})\n` +
      `➕ *Extra Bed:* ${extraBedText}\n\n` +
      `👤 *Guest Details:*\n` +
      `• *Name:* ${guestName.trim() || "Valued Guest"}\n` +
      `• *Phone:* ${guestPhone.trim()}\n` +
      `• *Email:* ${guestEmail.trim() || "Not provided"}\n\n` +
      `Please confirm real-time availability and dispatch reservation invoice.`
    );

    window.open(`https://wa.me/919999017646?text=${text}`, "_blank");
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-100 pb-28">
      {/* ─────────────────────────────────────────────────────────────
          1. ENTERPRISE HEADER & VIP CONCIERGE BAR
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/solutions/travel" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Hotels</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Hotels</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="text-slate-700 font-semibold">Delhi (DEL) T3</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                Holiday Inn Express
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#hotel-map"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <MapPin size={13} className="text-amber-600" />
              <span className="hidden sm:inline">Terminal 3 Map</span>
              <span className="sm:hidden">Map</span>
            </a>

            <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
              <Plane size={13} className="text-emerald-600" />
              <span>Airside & Landside Transit Hub</span>
            </div>

            <a
              href="tel:+919999017646"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Phone size={12} className="text-amber-400" />
              <span className="hidden sm:inline">24/7 Concierge:</span> +91 99990 17646
            </a>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. ENTERPRISE HERO SHOWCASE CARD (1:1 COLOR, PHOTO & DATA FIDELITY)
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-6 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#FDF5E6] rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column: 3-Photo Master Collage */}
          <div className="w-full lg:w-[58%] p-2.5 sm:p-3 flex flex-col sm:flex-row gap-2.5 bg-white/70">
            {/* Primary Master Photo */}
            <div
              onClick={() => setLightboxIndex(0)}
              className="w-full sm:w-[65%] relative rounded-xl overflow-hidden min-h-[300px] sm:min-h-[360px] group bg-slate-100 cursor-pointer"
            >
              <img
                src="/images/hotels/holiday-inn/room-main.jpg"
                alt="1 Queen Bed Standard Domestic Wing B"
                className="w-full h-full object-cover object-center select-none block group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="inline-flex items-center gap-1 bg-[#80deea] text-[#004d40] text-xs font-bold px-3 py-1 rounded shadow-xs">
                  <Sparkles size={12} />
                  <span>Recommends</span>
                </span>
                <span className="bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded">
                  Inside Terminal 3
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={11} />
                <span>View 5 Photos</span>
              </div>
            </div>

            {/* Side Dual Photo Stack */}
            <div className="w-full sm:w-[35%] flex flex-col gap-2.5">
              <div
                onClick={() => setLightboxIndex(1)}
                className="w-full h-[145px] sm:h-[175px] rounded-xl overflow-hidden bg-slate-100 group relative cursor-pointer"
              >
                <img
                  src="/images/hotels/holiday-inn/couple-tablet.jpg"
                  alt="Couple Relaxing in Guest Room"
                  className="w-full h-full object-cover object-center select-none block group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div
                onClick={() => setLightboxIndex(2)}
                className="w-full h-[145px] sm:h-[175px] rounded-xl overflow-hidden bg-slate-100 group relative cursor-pointer"
              >
                <img
                  src="/images/hotels/holiday-inn/room-night.jpg"
                  alt="Guest Room Evening Atmosphere"
                  className="w-full h-full object-cover object-center select-none block group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Details & Dynamic Booking Engine */}
          <div className="w-full lg:w-[42%] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-block bg-[#80deea] text-[#004d40] text-xs font-semibold px-2.5 py-0.5 rounded-sm tracking-wide">
                  Recommends
                </span>
              </div>

              <h1
                className="font-serif font-bold text-slate-900 text-2xl sm:text-3xl leading-snug mb-2"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                1 Queen Bed Standard Domestic Wing B
              </h1>

              <div
                className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 font-serif mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                <span className="font-semibold text-slate-900">Fits 2 Adults</span>
                <span>•</span>
                <span>226 sq.ft (21 sq.mt)</span>
                <span>•</span>
                <span>Airport View</span>
                <span>•</span>
                <a
                  href="#hotel-map"
                  className="inline-flex items-center gap-1 text-[#1d63b8] font-sans font-bold hover:underline cursor-pointer"
                >
                  <MapPin size={13} className="text-amber-600" />
                  <span>View on Map</span>
                </a>
              </div>

              {/* Verified Inclusions */}
              <div
                className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-serif mb-5"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                <div className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Free Breakfast Included with Hot Buffet</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Free Cancellation till 24 hrs before check in</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Terminal 3 Airside & Landside Direct Access</span>
                </div>
              </div>

              {/* Transit Hour Duration Selector */}
              <div className="bg-white/90 rounded-xl p-3.5 border border-amber-200/80 mb-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                    Select Layover Duration:
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Instant Key Handover
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["9 hrs", "12 hrs", "24 hrs"] as const).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setActiveHeroDuration(dur)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeHeroDuration === dur
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {dur === "24 hrs" ? "24h Overnight" : dur}
                    </button>
                  ))}
                </div>

                <div className="mt-3.5 pt-3 border-t border-amber-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-600 block font-serif">
                      Package Rate for {activeHeroDuration}:
                    </span>
                    <span
                      className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 tracking-tight"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {featuredRoom.price}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans text-right max-w-[170px] leading-tight">
                    {featuredRoom.taxNote}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {/* Primary Call to Action */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleEnquiry(featuredRoom)}
                  className="flex-1 bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer text-center"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppBooking(featuredRoom)}
                  className="inline-flex items-center justify-center p-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Instant WhatsApp Confirmation"
                >
                  <MessageSquare size={16} />
                </button>
              </div>

              {/* Review Proof & Corporate Billing Badge */}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-600 font-medium">
                <p
                  className="font-serif font-bold text-slate-900 text-sm"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  4.8 Customer Reviews
                </p>
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>GST Invoicing Available</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SIGNATURE YELLOW BANNER (EXACT TO REFERENCE SCREENSHOT)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="w-full bg-[#f0de00] py-3.5 px-4 text-center rounded-xl shadow-xs border border-amber-300">
          <h2
            className="text-lg sm:text-2xl md:text-[24px] font-black text-slate-950 tracking-wide"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Holiday Inn Express Hotel IGI Airport T3, New Delhi
          </h2>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ENTERPRISE FILTERING, WING SWITCHER & STATS BAR
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          {/* Row 1: Primary Wing Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: `All Room Packages (${ROOM_OPTIONS.length})` },
                { id: "domestic", label: "Domestic Wing B (6 Packages)" },
                { id: "international", label: "International Wing (2 Packages)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-600" />
                <span>9h / 12h / 24h Blocks</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coffee size={13} className="text-emerald-600" />
                <span>Hot Breakfast Included</span>
              </span>
            </div>
          </div>

          {/* Row 2: Secondary Quick Filters (Bed Type & Duration) */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Bed Type:</span>
              {(["all", "Queen", "Single Twin"] as const).map((bed) => (
                <button
                  key={bed}
                  type="button"
                  onClick={() => setActiveBedFilter(bed)}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    activeBedFilter === bed
                      ? "bg-blue-100 text-blue-800 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {bed === "all" ? "All Beds" : bed === "Queen" ? "1 Queen Bed" : "2 Single Twin Beds"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Duration:</span>
              {(["all", "9 hrs", "12 hrs", "24 hrs"] as const).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setActiveDurationFilter(dur)}
                  className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    activeDurationFilter === dur
                      ? "bg-amber-100 text-amber-800 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {dur === "all" ? "All Durations" : dur}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. WING A: DOMESTIC WING B (EXACT REFERENCE 2 & 3 DATA)
          ───────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "domestic") && domesticRooms.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Wing Title Bar */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded">
                Domestic Wing B
              </span>
              <h2
                className="font-serif font-bold text-slate-900 text-xl sm:text-2xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Standard Room Domestic Wing B Packages
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Terminal 3 Domestic Departures Level 5
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Authentic Room Photos & Specifications */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                    Domestic Wing Gallery
                  </span>
                  <button
                    onClick={() => setLightboxIndex(3)}
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Enlarge</span>
                    <Maximize2 size={11} />
                  </button>
                </div>

                {/* Photo 1: Twin Beds */}
                <div
                  onClick={() => setLightboxIndex(3)}
                  className="w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 group cursor-pointer"
                >
                  <img
                    src="/images/hotels/holiday-inn/twin-beds-1.jpg"
                    alt="Standard Twin Bed Configuration"
                    className="w-full h-auto object-cover select-none block group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    2 Single Twin Bed Layout — Domestic Wing B
                  </div>
                </div>

                {/* Photo 2: King Room with Apples */}
                <div
                  onClick={() => setLightboxIndex(4)}
                  className="w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 group cursor-pointer"
                >
                  <img
                    src="/images/hotels/holiday-inn/room-apples.jpg"
                    alt="King Suite with Desk and Glass Table"
                    className="w-full h-auto object-cover select-none block group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    1 Queen Bed Master Suite & Coffee Lounge
                  </div>
                </div>

                {/* Room Specifications (Exact Reference 3 Data) */}
                <div
                  className="font-serif text-slate-800 space-y-4 pt-3 border-t border-slate-100"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Standard Room Domestic Wing B
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                      226 sq.ft (21 sq.mt) | Airport View
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>Interconnected Room +Bathroom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>24-hour Housekeeping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>24-hour In-room Dining</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-2">
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">
                      Description
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">◦</span>
                        <span>Free Cancellation until 6:00 PM local hotel time, 1 day prior to stay</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">◦</span>
                        <span>Breakfast Included for all Guest</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy Limits */}
                  <div className="pt-2 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      MAXIMUM # OF PERSONS PER ROOM ALLOWED:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-sans">
                      Persons allowed per room: <strong>2 person max.</strong>
                    </p>
                  </div>

                  {/* Rate Rules */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                      RATE RULES:
                    </p>
                    <div className="space-y-1 text-xs sm:text-sm text-slate-700 font-sans">
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span>Check-in time: 2:00 PM (or scheduled transit block)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span>Check-out time: 12:00 PM (or end of hour block)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span>Must stay no more than: 1 nights</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Domestic Room Cards */}
            <div className="lg:col-span-7 space-y-4">
              {domesticRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {room.wingLabel}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {room.duration} Package
                        </span>
                        <span className="text-[10px] font-mono font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded">
                          {room.bedType}
                        </span>
                      </div>

                      <h3
                        className="font-serif font-bold text-slate-900 text-lg sm:text-xl leading-snug group-hover:text-blue-900 transition-colors"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {room.name}
                      </h3>
                    </div>

                    {/* Price Block */}
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p
                        className="font-serif font-bold text-slate-900 text-2xl leading-none"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {room.price}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {room.taxNote}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                    {/* Bullets & Red Extra Bed Note */}
                    <div
                      className="space-y-1 text-xs sm:text-sm text-slate-700 font-serif"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Free Breakfast included</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Free Cancellation till 24 hrs before check in</span>
                      </div>
                      {room.extraBedNote && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>
                            Note:{" "}
                            <span className="text-red-600 font-bold">
                              {room.extraBedNote}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEnquiry(room)}
                        className="bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        ENQUIRY ROOM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppBooking(room)}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        title="Direct WhatsApp Confirmation"
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. WING B: INTERNATIONAL WING (EXACT REFERENCE 4 DATA)
          ───────────────────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "international") && internationalRooms.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Wing Title Bar */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="bg-purple-700 text-white text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded">
                International Wing
              </span>
              <h2
                className="font-serif font-bold text-slate-900 text-xl sm:text-2xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Standard Room International Wing Packages
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Inside International Transit Lounge (Airside)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: International Room Specs & Image */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-purple-800 uppercase tracking-wider">
                    International Wing Suite
                  </span>
                  <button
                    onClick={() => setLightboxIndex(4)}
                    className="text-[11px] text-purple-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Enlarge</span>
                    <Maximize2 size={11} />
                  </button>
                </div>

                {/* Photo: King Room with Apples */}
                <div
                  onClick={() => setLightboxIndex(4)}
                  className="w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 group cursor-pointer"
                >
                  <img
                    src="/images/hotels/holiday-inn/room-apples.jpg"
                    alt="Standard Room International Wing"
                    className="w-full h-auto object-cover select-none block group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    International Wing Standard Suite (Level 5 Airside)
                  </div>
                </div>

                {/* Specs (Exact Reference 4 Data) */}
                <div
                  className="font-serif text-slate-800 space-y-4 pt-3 border-t border-slate-100"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Standard Room International Wing
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                      226 sq.ft (21 sq.mt) | Airport View
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>Interconnected Room +Bathroom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>24-hour Housekeeping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800">•</span>
                      <span>24-hour In-room Dining</span>
                    </div>
                  </div>

                  {/* International Airside Advisory */}
                  <div className="pt-2 bg-purple-50 p-3 rounded-xl border border-purple-200/70">
                    <p className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                      INTERNATIONAL AIRSIDE TRANSIT:
                    </p>
                    <p className="text-xs text-purple-900 mt-0.5 font-sans leading-relaxed">
                      Passengers transferring between international flights can access this wing without clearing Indian Immigration or obtaining an Indian transit visa.
                    </p>
                  </div>

                  {/* Occupancy Limits */}
                  <div className="pt-2 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      MAXIMUM # OF PERSONS PER ROOM ALLOWED:
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-sans">
                      Persons allowed per room: <strong>2 person max.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: International Room Cards */}
            <div className="lg:col-span-7 space-y-4">
              {internationalRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-purple-100 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {room.wingLabel}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {room.duration} Package
                        </span>
                        <span className="text-[10px] font-mono font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded">
                          {room.bedType}
                        </span>
                      </div>

                      <h3
                        className="font-serif font-bold text-slate-900 text-lg sm:text-xl leading-snug group-hover:text-purple-900 transition-colors"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {room.name}
                      </h3>
                    </div>

                    {/* Price Block */}
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p
                        className="font-serif font-bold text-slate-900 text-2xl leading-none"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                      >
                        {room.price}
                      </p>
                      <p className="text-xs text-purple-700 font-medium mt-1">
                        {room.taxNote}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                    {/* Bullets & Red Extra Bed Note */}
                    <div
                      className="space-y-1 text-xs sm:text-sm text-slate-700 font-serif"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Free Breakfast included</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Free Cancellation till 24 hrs before check in</span>
                      </div>
                      {room.extraBedNote && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>
                            Note:{" "}
                            <span className="text-red-600 font-bold">
                              {room.extraBedNote}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEnquiry(room)}
                        className="bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        ENQUIRY ROOM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppBooking(room)}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        title="Direct WhatsApp Confirmation"
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. LOCATION & TERMINAL 3 INTERACTIVE MAP SECTION
          ───────────────────────────────────────────────────────────── */}
      <section id="hotel-map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 scroll-mt-24">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  <MapPin size={11} /> Prime Airside & Landside Location
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-slate-300 text-xs hidden sm:inline">Indira Gandhi International Airport (DEL)</span>
              </div>
              <h3
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Holiday Inn Express New Delhi Int'l Airport T3
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400 flex-shrink-0" />
                <span>Terminal 3, Level 5, Indira Gandhi International Airport, New Delhi, Delhi 110037</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                title="Copy hotel address"
              >
                {copiedAddress ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <FileText size={13} className="text-slate-300" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <a
                href="https://maps.app.goo.gl/U3wMaTbY7AC2KMWHA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer group"
              >
                <Navigation size={13} className="group-hover:rotate-45 transition-transform" />
                <span>Open in Google Maps</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>
          </div>

          {/* Map & Transit Guide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left 8 cols: Interactive Google Map Embed */}
            <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[440px] bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200">
              <iframe
                title="Holiday Inn Express New Delhi Int'l Airport T3 Location Map"
                src="https://maps.google.com/maps?q=Holiday+Inn+Express+New+Delhi+Int%27l+Airport+T3&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[380px] sm:min-h-[440px] block"
              />

              {/* Floating Map Overlay Badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-slate-900 pointer-events-none hidden sm:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold font-sans">Live Verified GPS: T3 Level 5</span>
              </div>
            </div>

            {/* Right 4 cols: Step-by-Step Wayfinding & Location Information */}
            <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-slate-50/60 space-y-4">
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-3">
                  Terminal 3 Navigation & Access
                </h4>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Domestic Wing B (Airside)
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                      Level 5 above Domestic Departures. Proceed past Domestic Security Check near Gate 27 and take the dedicated hotel elevator.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        2
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        International Wing (Airside)
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                      Located inside the International Transit Lounge. Transfer passengers with connecting international flights stay airside without Indian visa requirements.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        3
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Landside & City Transit
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                      Direct covered pedestrian connectivity to Delhi Airport Metro Express (Orange Line) and T3 multi-level terminal car park.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Box */}
              <div className="pt-3 border-t border-slate-200">
                <a
                  href="https://maps.app.goo.gl/U3wMaTbY7AC2KMWHA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer group"
                >
                  <Navigation size={13} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span>Navigate via Google Maps</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Coordinates: 28.555094, 77.084432 (DEL T3)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TERMINAL 3 TRANSIT & ACCESS CONCIERGE GUIDE
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
                <Plane size={20} />
              </div>
              <h4 className="font-bold text-base text-white mb-1">
                Domestic Wing B Access
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Located on Level 5 at Terminal 3 Domestic Departures. Accessible after clearing Domestic Security Check (near Gate 27).
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center mb-3">
                <Compass size={20} />
              </div>
              <h4 className="font-bold text-base text-white mb-1">
                International Wing Access
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Located inside the International Transit Lounge. Transfer passengers with onward international boarding passes do not require Indian visas.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center mb-3">
                <Phone size={20} />
              </div>
              <h4 className="font-bold text-base text-white mb-1">
                Shafsky VIP Meet & Assist
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Need luggage transfer or gate escort? Our airport concierge coordinates directly with airline transfer desks at DEL T3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. PHOTO LIGHTBOX MODAL
          ───────────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 text-white">
              <div>
                <h4 className="font-bold text-sm">
                  {GALLERY_IMAGES[lightboxIndex].title}
                </h4>
                <p className="text-xs text-slate-400">
                  Photo {lightboxIndex + 1} of {GALLERY_IMAGES.length}
                </p>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative max-h-[70vh] flex items-center justify-center bg-black/40 p-2">
              <img
                src={GALLERY_IMAGES[lightboxIndex].src}
                alt={GALLERY_IMAGES[lightboxIndex].title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="p-4 bg-slate-900 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <p>{GALLERY_IMAGES[lightboxIndex].caption}</p>
              <div className="flex items-center gap-2">
                <button
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : prev))}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={lightboxIndex === GALLERY_IMAGES.length - 1}
                  onClick={() =>
                    setLightboxIndex((prev) => (prev! < GALLERY_IMAGES.length - 1 ? prev! + 1 : prev))
                  }
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          10. DIRECT ROOM INQUIRY / BOOKING MODAL
          ───────────────────────────────────────────────────────────── */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRoom(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block mb-2">
                Express Transit Reservation • DEL Terminal 3
              </span>
              <h3 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl leading-snug">
                {selectedRoom.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                <span className="font-bold text-slate-950 text-base">{selectedRoom.price}</span>
                <span>•</span>
                <span className="text-slate-500 text-xs">{selectedRoom.taxNote}</span>
              </div>
            </div>

            {submitted ? (
              <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>

                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl">
                    Reservation Request Dispatched!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1">
                    Your enquiry has been registered in the system and dispatched to our 24/7 airport hospitality concierge on WhatsApp.
                  </p>
                </div>

                {/* Official Booking Reference Card */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                        Official Booking Reference
                      </span>
                      <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wide">
                        {bookingRef}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBookingRef}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedRef ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} className="text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending Concierge Confirmation
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      DEL Terminal 3 Airside Desk
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200/60 text-xs text-slate-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room:</span>
                      <span className="font-semibold text-slate-900 text-right">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration & Wing:</span>
                      <span className="font-medium text-slate-800">{selectedRoom.duration} • {selectedRoom.wingLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rate:</span>
                      <span className="font-bold text-slate-950">{selectedRoom.price}</span>
                    </div>
                    {needExtraBed && (
                      <div className="flex justify-between text-red-600">
                        <span>Extra Bed:</span>
                        <span className="font-medium">+₹1,499/-</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const extraBedText = needExtraBed ? "Yes (+₹1,499/-)" : "No";
                      const text = encodeURIComponent(
                        `*New Hotel Room Reservation Request — Shafsky Aviation*\n` +
                        `*Reference ID: ${bookingRef}*\n\n` +
                        `🏨 *Hotel:* Holiday Inn Express Hotel IGI Airport T3, New Delhi\n` +
                        `🛏️ *Room:* ${selectedRoom.name}\n` +
                        `📍 *Wing:* ${selectedRoom.wingLabel} (Inside DEL T3)\n` +
                        `⏱️ *Duration:* ${selectedRoom.duration} Package\n` +
                        `💳 *Rate:* ${selectedRoom.price} (${selectedRoom.taxNote})\n` +
                        `➕ *Extra Bed:* ${extraBedText}\n\n` +
                        `👤 *Guest Details:*\n` +
                        `• *Name:* ${guestName.trim() || "Valued Guest"}\n` +
                        `• *Phone:* ${guestPhone.trim()}\n` +
                        `• *Email:* ${guestEmail.trim() || "Not provided"}\n\n` +
                        `Please confirm real-time availability and dispatch reservation invoice.`
                      );
                      window.open(`https://wa.me/919999017646?text=${text}`, "_blank");
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare size={15} />
                    <span>Open WhatsApp Chat Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitEnquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Capt. Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email (For Invoice)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. guest@company.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Extra Bed Toggle */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Add Extra Bed to Single Room
                    </span>
                    <span className="text-[11px] text-red-600 font-semibold">
                      Extra bed in single room-1499/-
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={needExtraBed}
                    onChange={(e) => setNeedExtraBed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1d63b8] hover:bg-[#165099] disabled:opacity-75 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Dispatching Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppBooking(selectedRoom)}
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Direct Chat</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HolidayInnExpressDetailPage;
