import React, { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  X,
  Clock,
  Coffee,
  Plane,
  Sparkles,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Compass,
  MapPin,
} from "lucide-react";
import { StandardHotelEnquiryForm } from "@/components/hotels/StandardHotelEnquiryForm";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { useWebsiteContacts } from "@/hooks/useWebsiteContacts";
import {
  ROOM_OPTIONS,
  GALLERY_IMAGES,
  HolidayInnDomesticWingSection,
  HolidayInnInternationalWingSection,
  HolidayInnLocationMapSection,
  type RoomOption,
} from "@/components/hotels/HolidayInnExpressParts";

export { ROOM_OPTIONS, GALLERY_IMAGES, type RoomOption };

export const Route = createFileRoute("/hotels/holiday-inn-express")({
  head: () =>
    pageHead({
      title: "Holiday Inn Express IGI Airport Terminal 3 | Shafsky",
      description:
        "Exclusive rates and hourly transit bookings at Holiday Inn Express, IGI Airport Terminal 3, New Delhi. Airside transit and day-use stays with Shafsky Aviation.",
      path: "/hotels/holiday-inn-express",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Hotels", path: "/solutions/hotels" },
          { name: "Holiday Inn Express T3", path: "/hotels/holiday-inn-express" },
        ]),
      ],
    }),
  component: HolidayInnExpressDetailPage,
});

function HolidayInnExpressDetailPage() {
  const navigate = useNavigate();
  const { getPrimaryContact } = useWebsiteContacts();
  const primaryHotelContact = getPrimaryContact("hotel");

  // Filters & State
  const [activeTab, setActiveTab] = useState<"all" | "domestic" | "international">("all");
  const [activeBedFilter, setActiveBedFilter] = useState<"all" | "Queen" | "Single Twin">("all");
  const [activeDurationFilter, setActiveDurationFilter] = useState<"all" | "9 hrs" | "12 hrs" | "24 hrs">("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [activeHeroDuration, setActiveHeroDuration] = useState<"9 hrs" | "12 hrs" | "24 hrs">("9 hrs");

  // Photo Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Only the address-copy affordance remains here; the enquiry form owns its own
  // field state (see StandardHotelEnquiryForm).
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
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-100 pb-28">
      {/* 1. ENTERPRISE HEADER & VIP CONCIERGE BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/solutions/hotels" });
                }
              }}
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

            {primaryHotelContact && (
              <a
                href={primaryHotelContact.tel_link}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Phone size={12} className="text-amber-400" />
                <span className="hidden sm:inline">24/7 Desk:</span> {primaryHotelContact.formatted}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. ENTERPRISE HERO SHOWCASE CARD */}
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
                width={1600}
                height={900}
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
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
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
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
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
                  Submit Enquiry
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

      {/* 3. SIGNATURE YELLOW BANNER */}
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

      {/* 4. ENTERPRISE FILTERING, WING SWITCHER & STATS BAR */}
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

      {/* 5. WING A: DOMESTIC WING B */}
      {(activeTab === "all" || activeTab === "domestic") && domesticRooms.length > 0 && (
        <HolidayInnDomesticWingSection
          domesticRooms={domesticRooms}
          setLightboxIndex={setLightboxIndex}
          handleEnquiry={handleEnquiry}
        />
      )}

      {/* 6. WING B: INTERNATIONAL WING */}
      {(activeTab === "all" || activeTab === "international") && internationalRooms.length > 0 && (
        <HolidayInnInternationalWingSection
          internationalRooms={internationalRooms}
          setLightboxIndex={setLightboxIndex}
          handleEnquiry={handleEnquiry}
        />
      )}

      {/* 7. LOCATION & TERMINAL 3 INTERACTIVE MAP SECTION */}
      <HolidayInnLocationMapSection
        copiedAddress={copiedAddress}
        handleCopyAddress={handleCopyAddress}
      />

      {/* 8. TERMINAL 3 TRANSIT & ACCESS CONCIERGE GUIDE */}
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

      {/* 9. PHOTO LIGHTBOX MODAL */}
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
                width={1600}
                height={900}
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

      {/* 10. DIRECT ROOM INQUIRY / BOOKING MODAL */}
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
                Hotel Enquiry • DEL Terminal 3
              </span>
              <h3 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl leading-snug">
                Enquire — Holiday Inn Express
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">
                Share your stay dates and our desk will confirm availability and send a
                quotation. No payment is taken online.
              </p>
            </div>

            <StandardHotelEnquiryForm
              hotelName="Holiday Inn Express Hotel IGI Airport T3, New Delhi"
              whatsAppNumber="919217522660"
              locationLabel="DEL Terminal 3"
              onClose={() => setSelectedRoom(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
