import React from "react";
import {
  Check,
  Maximize2,
  FileText,
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";

export interface RoomOption {
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

export const ROOM_OPTIONS: RoomOption[] = [
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

export const GALLERY_IMAGES = [
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

export function HolidayInnDomesticWingSection({
  domesticRooms,
  setLightboxIndex,
  handleEnquiry,
}: {
  domesticRooms: RoomOption[];
  setLightboxIndex: (idx: number) => void;
  handleEnquiry: (room: RoomOption) => void;
}) {
  return (
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
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
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
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
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
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                {/* Inclusions */}
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEnquiry(room)}
                    className="bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    SUBMIT ENQUIRY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HolidayInnInternationalWingSection({
  internationalRooms,
  setLightboxIndex,
  handleEnquiry,
}: {
  internationalRooms: RoomOption[];
  setLightboxIndex: (idx: number) => void;
  handleEnquiry: (room: RoomOption) => void;
}) {
  return (
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
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
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
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                {/* Inclusions */}
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEnquiry(room)}
                    className="bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    SUBMIT ENQUIRY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HolidayInnLocationMapSection({
  copiedAddress,
  handleCopyAddress,
}: {
  copiedAddress: boolean;
  handleCopyAddress: () => void;
}) {
  return (
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
  );
}
