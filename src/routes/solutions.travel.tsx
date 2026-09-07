import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { display } from "@/components/home/theme";
import hotelPageImg from "@/assets/others/hotelpage.png";

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

export interface HotelCardItem {
  id: string;
  name: string;
  badge?: string;
  stars: number;
  location: string;
  capacity: string;
  features: string[];
  bookingTerms: string;
  ratingLabel: string;
  image: string;
}

export const FEATURED_HOTELS: HotelCardItem[] = [
  {
    id: "holiday-inn-express-t3",
    name: "Hotel Holiday Inn Express At Terminal 3 Delhi Airport",
    badge: "Recommends",
    stars: 5,
    location: "Location: IGI Airport T3, New Delhi",
    capacity: "Fits 2 Adults",
    features: [
      "Free Breakfast Included",
      "Free Cancellation till 24 hrs before check in",
    ],
    bookingTerms: "For 9 Hrs/ 12 Hrs/ Over Night Booking",
    ratingLabel: "4.6 Customer Reviews",
    image: "/images/hotels/holiday-inn-express-t3.jpg",
  },
  {
    id: "classic-diplomat",
    name: "Classic Diplomat Hotel",
    stars: 4,
    location: "Location: Mahipalpur, Near IGI Airport, New Delhi",
    capacity: "Fits 2 Adults",
    features: [
      "Free Breakfast Included",
      "Free Cancellation till 24 hrs before check in",
    ],
    bookingTerms: "For Over Night Booking",
    ratingLabel: "4.8 Customer Reviews",
    image: "/images/hotels/classic-diplomat.jpg",
  },
  {
    id: "de-pavilion",
    name: "De Pavilion Hotel",
    stars: 4,
    location: "Location: Mahipalpur, Near IGI Airport, New Delhi",
    capacity: "Fits 2 Adults",
    features: [
      "Free Breakfast Included",
      "Free Cancellation till 24 hrs before check in",
    ],
    bookingTerms: "For Over Night Booking",
    ratingLabel: "4.7 Customer Reviews",
    image: "/images/hotels/de-pavilion.jpg",
  },
  {
    id: "castle-blue",
    name: "Hotel Castle Blue",
    stars: 3,
    location:
      "Location: No.A-109, Road No-5, Near Hotel Lohias, Mahipalpur Extension, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi, Delhi 110037",
    capacity: "Fits 2 Adults",
    features: [
      "Free Breakfast Included",
      "Free Cancellation till 24 hrs before check in",
    ],
    bookingTerms: "For Over Night Booking",
    ratingLabel: "4.7 Customer Reviews",
    image: "/images/hotels/castle-blue.jpg",
  },
  {
    id: "airport-hotel",
    name: "Airport Hotel",
    stars: 3,
    location:
      "Location: Indira Gandhi International Airport, Terminal 1, Opp, Domestic, Mehram Nagar, New Delhi, Delhi 110037",
    capacity: "Fits 2 Adults",
    features: [
      "Free Breakfast Included",
      "Free Cancellation till 24 hrs before check in",
    ],
    bookingTerms: "For Over Night Booking",
    ratingLabel: "3.9 Customer Reviews",
    image: "/images/hotels/airport-hotel.jpg",
  },
];

function DedicatedLuxuryHotelsPage() {
  const navigate = useNavigate();
  const activeOption = HOTEL_OPTIONS[0];
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Handled silently for browser policies
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. FULL-WIDTH CINEMATIC HERO VIDEO BANNER (EDGE-TO-EDGE)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-black">
        {/* Full-Width Panoramic Video Container */}
        <div className="relative w-full aspect-[2.4/1] sm:aspect-[2.7/1] md:aspect-[3/1] min-h-[300px] max-h-[520px] overflow-hidden">
          {/* Native HTML5 Video in Crystal Clear 1080p Full HD */}
          <video
            ref={videoRef}
            poster={hotelPageImg}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          >
            <source src="/videos/hotel-hero.mp4" type="video/mp4" />
            <source src="/hotel/video.mp4" type="video/mp4" />
          </video>

          {/* Top Bar with Floating Back Button & VIP Badge */}
          <div className="absolute top-4 left-4 right-4 sm:top-5 sm:left-6 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 text-xs font-bold transition-all cursor-pointer pointer-events-auto shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-lime-300 uppercase tracking-widest bg-black/50 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-lime-400 inline-block animate-pulse" />
              <span>VIP ACCOMMODATIONS & PALACE RESORTS</span>
            </div>
          </div>

          {/* Clean Overlay: COMFORT & LUXURY / HOTELS / BOOK NOW */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 select-none pointer-events-none">
            <p className="text-white font-serif font-bold text-base sm:text-2xl md:text-3xl tracking-[0.2em] uppercase mb-1 sm:mb-2 drop-shadow-md">
              COMFORT & LUXURY
            </p>
            <h1
              className="text-white font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider uppercase mb-3 sm:mb-5 drop-shadow-lg"
              style={display}
            >
              HOTELS
            </h1>
            <a
              href="#hotel-request"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("hotel-request")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-block bg-[#f0de00] hover:bg-[#ffe600] text-slate-950 font-black text-xs sm:text-sm md:text-base uppercase tracking-wider px-7 sm:px-9 py-2.5 sm:py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto shadow-lg"
            >
              BOOK NOW
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. DISCOVER THE PERFECT STAY — GOLD BANNER & 4-IMAGE ROW
             (Exact 1:1 match to reference design: Full-width gold banner,
              zero shadow, sharp rectangular, crystal clear images)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white border-b border-slate-200">
        {/* Full-Width Luxury Gold Header Banner */}
        <div
          className="w-full py-8 sm:py-10 md:py-12 px-4 sm:px-8 text-center select-none"
          style={{
            background: "linear-gradient(180deg, #d6ac35 0%, #ecd08e 100%)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-black tracking-normal mb-3"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Discover The Perfect Stay
            </h1>
            <p
              className="text-xs sm:text-sm md:text-[15px] lg:text-[16px] text-black max-w-4xl mx-auto leading-relaxed"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              "Book Your Dream Hotel with Ease. Explore top destinations, compare rates, and secure your ideal accommodation effortlessly. From luxurious resorts to cozy retreats, find the best deals and enjoy a smooth booking experience. Your next adventure starts here—book now and make every stay unforgettable!"
            </p>
          </div>
        </div>

        {/* 4 Hotel Images in a Row — Centered, Tight Gaps, Full Ratio, Clear, No Shadow */}
        <div className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-1.5 md:gap-2">
            {/* Image 1: Called directly from src/assets/others/hotelpage.png */}
            <div className="w-full aspect-[195/247] overflow-hidden bg-white shadow-none rounded-none border-0">
              <img
                src={hotelPageImg}
                alt="Palace Heritage & Luxury Hotel"
                className="w-full h-full object-cover object-center select-none block shadow-none rounded-none border-0"
                loading="eager"
              />
            </div>
            {/* Image 2: public/hotel/hotel1.png */}
            <div className="w-full aspect-[195/247] overflow-hidden bg-white shadow-none rounded-none border-0">
              <img
                src="/hotel/hotel1.png"
                alt="Illuminated Modern Luxury Resort Hotel"
                className="w-full h-full object-cover object-center select-none block shadow-none rounded-none border-0"
                loading="eager"
              />
            </div>
            {/* Image 3: public/hotel/hotel2.png */}
            <div className="w-full aspect-[195/247] overflow-hidden bg-white shadow-none rounded-none border-0">
              <img
                src="/hotel/hotel2.png"
                alt="Luxury Hotel Resort Swimming Pool"
                className="w-full h-full object-cover object-center select-none block shadow-none rounded-none border-0"
                loading="eager"
              />
            </div>
            {/* Image 4: public/hotel/hotel3.png */}
            <div className="w-full aspect-[195/247] overflow-hidden bg-white shadow-none rounded-none border-0">
              <img
                src="/hotel/hotel3.png"
                alt="The Taj Mahal Palace Luxury Landmark Hotel"
                className="w-full h-full object-cover object-center select-none block shadow-none rounded-none border-0"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Golden Bottom Accent Line (Matching User Reference Image) */}
        <div
          className="w-full h-1.5 sm:h-2"
          style={{
            background: "linear-gradient(90deg, #d6ac35 0%, #ecd08e 50%, #d6ac35 100%)",
          }}
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURED LUXURY AIRPORT & TRANSIT HOTELS (USER SHOWCASE)
          ───────────────────────────────────────────────────────────── */}
      <section id="hotel-request" className="py-12 sm:py-16 bg-white px-4 sm:px-6 lg:px-8 scroll-mt-6">
        <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
          {FEATURED_HOTELS.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-col md:flex-row overflow-hidden border border-slate-100 bg-[#FDF5E6] shadow-sm transition-all hover:shadow-md"
            >
              {/* Left Column: Authentic Hotel Photo */}
              <div className="w-full md:w-[48%] min-h-[240px] md:min-h-[290px] relative overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover object-center select-none block"
                  loading="lazy"
                />
              </div>

              {/* Right Column: Hotel Details & Actions */}
              <div className="w-full md:w-[52%] p-6 sm:p-7 md:p-8 flex flex-col justify-between">
                <div>
                  {/* Recommends Badge */}
                  {hotel.badge && (
                    <div className="mb-2">
                      <span className="inline-block bg-[#80deea] text-[#004d40] text-xs font-semibold px-2.5 py-0.5 rounded-sm tracking-wide">
                        {hotel.badge}
                      </span>
                    </div>
                  )}

                  {/* Hotel Title */}
                  <h3
                    className="font-serif font-bold text-slate-900 text-lg sm:text-xl md:text-[22px] leading-snug mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {hotel.name}
                  </h3>

                  {/* Gold Star Rating */}
                  <div className="flex items-center gap-0.5 text-[#f59e0b] mb-2.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <span key={i} className="text-base leading-none text-[#f59e0b]">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p
                      className="text-xs sm:text-sm text-slate-700 font-serif"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {hotel.location}
                    </p>
                    {hotel.id === "holiday-inn-express-t3" && (
                      <a
                        href="https://maps.app.goo.gl/U3wMaTbY7AC2KMWHA"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-[#1d63b8] hover:underline cursor-pointer"
                        title="Open Hotel Location in Google Maps"
                      >
                        <MapPin size={12} className="text-amber-600" />
                        <span>Google Map</span>
                        <ExternalLink size={11} className="opacity-75" />
                      </a>
                    )}
                  </div>

                  {/* Capacity */}
                  <p
                    className="text-xs sm:text-sm text-slate-700 font-serif mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {hotel.capacity}
                  </p>

                  {/* Inclusions List */}
                  <div
                    className="space-y-1 text-xs sm:text-sm text-slate-700 font-serif mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {hotel.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-slate-800">•</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Booking Terms (Hours / Overnight) */}
                  <p
                    className="text-xs sm:text-sm text-slate-900 font-serif font-bold mb-5"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {hotel.bookingTerms}
                  </p>
                </div>

                <div>
                  {/* SEE DETAIL Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (hotel.id === "holiday-inn-express-t3") {
                          navigate({ to: "/hotels/holiday-inn-express" });
                        } else {
                          alert(`Details for ${hotel.name} will be connected shortly.`);
                        }
                      }}
                      className="inline-block bg-[#1d63b8] hover:bg-[#165099] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded shadow-sm transition-colors cursor-pointer"
                    >
                      SEE DETAIL
                    </button>
                  </div>

                  {/* Customer Reviews Summary */}
                  <p
                    className="font-serif font-bold text-slate-900 text-sm sm:text-base mt-4"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {hotel.ratingLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
                  { src: hotelPageImg, alt: "Palace Heritage & Estates" },
                  { src: "/hotel/hotel1.png", alt: "Premier 5-Star City & Resort Properties" },
                  { src: "/hotel/hotel2.png", alt: "Luxury Pool & Leisure Accommodations" },
                  { src: "/hotel/hotel3.png", alt: "Iconic Landmark Heritage Hotels" },
                ].map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white group hover:border-lime-400 transition-all"
                  >
                    <div className="w-full aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover object-center select-none block group-hover:scale-102 transition-transform duration-500"
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
