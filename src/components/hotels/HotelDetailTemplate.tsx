import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Phone,
  Maximize2,
  Bed,
  Copy,
  Calendar,
  User,
  Users,
  X,
  Navigation,
  Car,
  Plane,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  Wifi,
  Coffee,
  ChevronRight,
} from "lucide-react";
import {
  HotelInfo,
  AmenityItem,
  GalleryImage,
  RoomCategory,
  RoomPlan,
} from "./types";

interface HotelDetailTemplateProps {
  hotel: HotelInfo;
  amenities: AmenityItem[];
  galleryImages: GalleryImage[];
  categories: RoomCategory[];
}

export function HotelDetailTemplate({
  hotel,
  amenities,
  galleryImages,
  categories,
}: HotelDetailTemplateProps) {
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = React.useState(false);
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = React.useState<string>("");

  const [activeCategoryFilter, setActiveCategoryFilter] =
    React.useState<string>("all");

  const [selectedEnquiry, setSelectedEnquiry] = React.useState<{
    categoryName: string;
    plan: RoomPlan;
  } | null>(null);

  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [checkInDate, setCheckInDate] = React.useState("");
  const [checkOutDate, setCheckOutDate] = React.useState("");
  const [guestCount, setGuestCount] = React.useState("2");

  const whatsAppPhone = hotel.whatsAppNumber || "919999017646";
  const displayPhone = hotel.contactPhone || "+91 99990 17646";

  const openLightbox = (src: string, title: string) => {
    setLightboxSrc(src);
    setLightboxTitle(title);
  };

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hotel.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };

  const openWhatsAppForPlan = (categoryName: string, plan: RoomPlan) => {
    const text = encodeURIComponent(
      `Hello Shafsky Aviation Concierge, I would like to book a room at ${hotel.name}:\n\n` +
        `• Room: ${categoryName}\n` +
        `• Plan: ${plan.name}\n` +
        `• Price: ${plan.price} (${plan.taxNote})\n` +
        `• Inclusions:\n  - ${plan.inclusions.join("\n  - ")}\n\n` +
        `Please confirm availability and dispatch booking confirmation.`
    );
    window.open(`https://wa.me/${whatsAppPhone}?text=${text}`, "_blank");
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    const { categoryName, plan } = selectedEnquiry;
    const details =
      `Hello Shafsky Aviation Concierge, I would like to book an enquiry for ${hotel.name}:\n\n` +
      `• Room: ${categoryName}\n` +
      `• Plan: ${plan.name}\n` +
      `• Rate: ${plan.price} (${plan.taxNote})\n` +
      (guestName ? `• Guest Name: ${guestName}\n` : "") +
      (guestPhone ? `• Phone: ${guestPhone}\n` : "") +
      (checkInDate ? `• Check-in: ${checkInDate}\n` : "") +
      (checkOutDate ? `• Check-out: ${checkOutDate}\n` : "") +
      `• Guests: ${guestCount} Adults\n` +
      `• Inclusions: ${plan.inclusions.join(", ")}\n\n` +
      `Please provide booking confirmation.`;

    window.open(
      `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(details)}`,
      "_blank"
    );
    setSelectedEnquiry(null);
  };

  const handleWhatsAppGeneral = () => {
    const text = encodeURIComponent(
      `Hello Shafsky Aviation Concierge, I would like to enquire about staying at ${hotel.name}, Near IGI Airport, New Delhi. Please share available room options and rates.`
    );
    window.open(`https://wa.me/${whatsAppPhone}?text=${text}`, "_blank");
  };

  const visibleCategories =
    activeCategoryFilter === "all"
      ? categories
      : categories.filter((c) => c.id === activeCategoryFilter);

  const googleMapsEmbedUrl =
    hotel.googleMapsEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(
      hotel.name + " " + hotel.address
    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION / SHAFSKY CONCIERGE HEADER
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate({ to: "/solutions/travel" })}
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1d63b8] transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Hotels</span>
            </button>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-950 tracking-tight text-base sm:text-lg font-serif">
                {hotel.name}
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60">
                ⭐ Shafsky Verified Partner
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleWhatsAppGeneral}
              className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Concierge</span>
              <span className="sm:hidden">WhatsApp</span>
            </button>
            <a
              href={`tel:${displayPhone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Phone className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">{displayPhone}</span>
              <span className="md:hidden">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. ELEVATED HERO SHOWCASE & BRAND HEADER
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Luxury Hero Showcase Container */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-lg group">
          <div
            onClick={() =>
              openLightbox(hotel.bannerImage, `${hotel.name} — Ultra-HD Overview`)
            }
            className="relative overflow-hidden cursor-pointer flex justify-center bg-slate-950/5"
          >
            {/* Clean Hero Showcase Image */}
            <img
              src={hotel.bannerImage}
              alt={hotel.name}
              className="w-full h-auto max-h-[540px] sm:max-h-[620px] object-contain object-center transition-transform duration-700 group-hover:scale-[1.01]"
              loading="eager"
            />

            {/* Top-Left Floating Partner Badge */}
            <div className="absolute top-4 left-4 bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center space-x-2 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Directly Opposite IGI Terminal 1 • Verified Partner</span>
            </div>

            {/* Repositioned Top-Right Ultra-HD Zoom Button (Never overlaps yellow banner) */}
            <div className="absolute top-4 right-4 bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center space-x-2 transition-all">
              <Maximize2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Click to view ultra-HD photo</span>
            </div>
          </div>

          {/* Optional Brand Bar if enabled */}
          {!hotel.hideBrandBar && (
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-center py-4 px-6 border-t border-amber-300 shadow-sm">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-wide"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {hotel.brandTitle || hotel.name}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-900/80 mt-1">
                Premier Airport Transit Hotel • 2 Minutes from Domestic Terminal 1
              </p>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODERN FLOATING PILL CATEGORY FILTER BAR
            ───────────────────────────────────────────────────────────── */}
        <div className="mt-6 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                activeCategoryFilter === "all"
                  ? "bg-slate-950 text-white shadow-md shadow-slate-900/20"
                  : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
              }`}
            >
              <span>All Rooms</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeCategoryFilter === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {categories.length}
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? "bg-slate-950 text-white shadow-md shadow-slate-900/20"
                    : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Rates in INR • Includes 12% GST & Breakfast</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ROOM TARIFF & RATE PLANS SECTION (Elevated Executive Cards)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="space-y-8">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left Column: Room Photo & Specifications */}
                <div className="lg:col-span-5 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between bg-white">
                  <div>
                    {/* Room Image Container */}
                    <div
                      onClick={() => openLightbox(category.image, category.name)}
                      className="relative rounded-2xl overflow-hidden bg-slate-100 mb-5 group/img cursor-pointer border border-slate-200/80 shadow-xs"
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                      {/* Frosted Room Tier Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-slate-950/80 backdrop-blur-md text-white border border-white/10 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                          {category.badge}
                        </span>
                      </div>
                      {/* View Photo Pill */}
                      <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors">
                        <Maximize2 className="w-3 h-3 text-blue-300" />
                        <span>View Photo</span>
                      </div>
                    </div>

                    {/* Room Title */}
                    <h3
                      className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-2 tracking-tight"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {category.name}
                    </h3>

                    {/* Subtitle / Specs */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Quick Specs Badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center space-x-1.5 text-xs bg-indigo-50/80 text-indigo-900 border border-indigo-100 px-3 py-1.5 rounded-lg font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{category.fits}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1.5 text-xs bg-amber-50/80 text-amber-900 border border-amber-100 px-3 py-1.5 rounded-lg font-medium">
                        <Bed className="w-3.5 h-3.5 text-amber-600" />
                        <span>{category.bed}</span>
                      </span>
                    </div>

                    {/* Key Inclusions & Services with Emerald Checks */}
                    {category.amenities && category.amenities.length > 0 && (
                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                          Key Inclusions & Services:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {category.amenities.map((amenity, aIdx) => (
                            <div
                              key={aIdx}
                              className="flex items-center space-x-2 text-xs text-slate-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Deluxe Concierge Rate Card (Replaced the dull #edf2f7 box) */}
                <div className="lg:col-span-7 p-6 sm:p-7 bg-slate-50/60 flex flex-col justify-center space-y-4">
                  {category.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-gradient-to-br from-white via-white to-blue-50/40 border border-blue-100/90 hover:border-blue-300/90 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Plan Header with Emerald Breakfast Tag */}
                        <div>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 mb-2">
                            <Coffee className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Breakfast Included • CPAI Plan</span>
                          </span>
                          <h4
                            className="text-base sm:text-lg font-serif font-bold text-slate-950"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                          >
                            {plan.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Best Flexible Rate • Instant Shafsky Concierge Booking
                          </p>
                        </div>

                        {/* Price & Reassuring GST Tag */}
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2">
                            <div>
                              <span
                                className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-950 tracking-tight block"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                              >
                                {plan.price}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                / night
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ {plan.taxNote || "Including 12% GST"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inclusions Checklist */}
                      <div className="pt-3 border-t border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Package Inclusions:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                          {plan.inclusions.map((inc, iIdx) => (
                            <li key={iIdx} className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons: Primary Modal + Direct WhatsApp */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                        <button
                          onClick={() =>
                            setSelectedEnquiry({
                              categoryName: category.name,
                              plan: plan,
                            })
                          }
                          className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Enquiry & Reserve Room</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            openWhatsAppForPlan(category.name, plan)
                          }
                          className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                          title="Instant WhatsApp Booking"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>Quick WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SERVICES & AMENITIES STRIP (Elevated Modern Grid)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Premium Hospitality
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif mt-0.5">
                Hotel Amenities & Services
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Included with every room package
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {amenities.map((amenity, idx) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center text-center p-4 bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/70 hover:border-blue-200 rounded-2xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {amenity.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. AUTHENTIC PHOTO GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Visual Tour
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif mt-0.5">
              Verified Hotel Photography
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Exterior facade, restaurant entrance, and en-suite room interiors.
            </p>
          </div>
          <span className="text-xs font-bold text-[#1d63b8] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200/60">
            {galleryImages.length} Verified Photos
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(img.src, img.alt)}
              className={`group relative rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer ${
                idx === 0 ? "col-span-2 row-span-1 md:col-span-2" : ""
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-44 sm:h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                <span className="text-white text-xs font-medium truncate flex items-center space-x-1.5">
                  <Maximize2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-300" />
                  <span>{img.alt}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. LOCATION & AIRPORT PROXIMITY CARDS
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <MapPin className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">
                  Location & Transit Access
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                How to Reach {hotel.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {hotel.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyAddress}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedAddress ? "Copied to Clipboard!" : "Copy Address"}</span>
              </button>
              <a
                href={hotel.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1d63b8] hover:bg-[#165099] text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-6">
            <iframe
              title={`${hotel.name} Google Maps Location`}
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Airport Proximity Information (Color-coded modern chips) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            {hotel.airportProximities.map((prox, pIdx) => {
              const Icon =
                prox.iconType === "terminal"
                  ? Plane
                  : prox.iconType === "domestic"
                  ? Plane
                  : Car;
              const colorBg =
                prox.iconType === "domestic"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : prox.iconType === "terminal"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-indigo-50 text-indigo-800 border-indigo-200";
              const iconColor =
                prox.iconType === "domestic"
                  ? "text-emerald-600"
                  : prox.iconType === "terminal"
                  ? "text-[#1d63b8]"
                  : "text-indigo-600";
              return (
                <div
                  key={pIdx}
                  className={`flex items-start space-x-3 p-4 rounded-2xl border ${colorBg}`}
                >
                  <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                  <div>
                    <span className="font-bold text-slate-900 block">{prox.title}</span>
                    <span className="text-slate-600 mt-0.5 block">{prox.distance}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. LIGHTBOX MODAL
          ───────────────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 text-white">
              <span className="text-xs font-semibold">{lightboxTitle}</span>
              <button
                onClick={() => setLightboxSrc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 flex justify-center bg-black">
              <img
                src={lightboxSrc}
                alt={lightboxTitle}
                className="max-h-[80vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. ENQUIRY MODAL (Dispatches to WhatsApp)
          ───────────────────────────────────────────────────────────── */}
      {selectedEnquiry && (
        <div
          onClick={() => setSelectedEnquiry(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 block">
                  Shafsky Aviation Concierge
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif mt-0.5">
                  Room Booking Enquiry
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Plan Summary Banner */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1d63b8] block">
                    {selectedEnquiry.categoryName}
                  </span>
                  <span className="text-sm font-bold text-slate-900 block font-serif mt-0.5">
                    {selectedEnquiry.plan.name}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    {selectedEnquiry.plan.inclusions.join(" • ")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-950 block font-serif">
                    {selectedEnquiry.plan.price}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {selectedEnquiry.plan.taxNote}
                  </span>
                </div>
              </div>
            </div>

            {/* Enquiry Form */}
            <form onSubmit={handleEnquirySubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Guest Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain / Traveler Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Mobile / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Check-in Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Check-out Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
                >
                  <option value="1">1 Adult (Single Occupancy)</option>
                  <option value="2">2 Adults (Double Occupancy)</option>
                  <option value="3">3 Adults (Triple Occupancy)</option>
                  <option value="4">4 Adults (Family Occupancy)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp Concierge</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppForPlan(
                      selectedEnquiry.categoryName,
                      selectedEnquiry.plan
                    )
                  }
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Direct Message"
                >
                  Direct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
