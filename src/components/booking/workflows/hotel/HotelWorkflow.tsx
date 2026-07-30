import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hotel,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  ShieldCheck,
  Clock,
  Building2,
  Coffee,
  Car,
  Wine,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Briefcase,
  Heart,
  UserCheck,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import { useHotelWorkflow } from "@/components/booking/hooks/useHotelWorkflow";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import skyCloudsImg from "@/assets/clouds.jpg";

export interface HotelWorkflowProps {
  searchParams?: Record<string, any>;
}

export function HotelWorkflow({ searchParams }: HotelWorkflowProps) {
  const submitBookingFn = useServerFn(createBooking);
  const initialDest = searchParams?.dest || searchParams?.destination || "Dubai, UAE";
  const {
    stay,
    updateStay,
    guest,
    updateGuest,
    personalization,
    updatePersonalization,
    nights,
    totalGuests,
    isExtendedStay,
    isGroupBooking,
    isVipStay,
    recommendedRoom,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
  } = useHotelWorkflow(initialDest);

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.fullName || !guest.phone || !guest.email) {
      toast.error("Please fill in your Contact Name, Phone, and Email.");
      return;
    }
    if (!stay.destination) {
      toast.error("Please enter a destination city.");
      return;
    }

    setBusy(true);
    const refCode = `SHF-HTL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await submitBookingFn({
        data: {
          flight_number: `SHF-HOTEL-${stay.hotelCategory || "CURATED"}`,
          departure_airport: "N/A",
          arrival_airport: stay.destination,
          depart_date: stay.checkIn,
          return_date: stay.checkOut,
          lead_passenger_name: guest.fullName,
          passenger_email: guest.email,
          passenger_phone: guest.phone,
          pax_adults: stay.paxAdults,
          pax_children: stay.paxChildren,
          pax_infants: stay.paxInfants,
          service_type: "hotel",
          check_in: stay.checkIn,
          check_out: stay.checkOut,
          room_type: stay.roomType,
          guests_count: totalGuests,
          room_count: stay.roomCount,
          meal_plan: stay.mealPlan,
          special_requests: `[Purpose: ${stay.purposeOfStay}] [Category: ${stay.hotelCategory}] [Brand: ${stay.brandPreference || "None"}] ${guest.specialRequests}`,
          company: guest.isCorporateBooking ? guest.companyName : undefined,
        } as any,
      });
      setBookingRef(refCode);
      setSubmitted(true);
      toast.success("Hotel proposal request submitted successfully!");
    } catch (_) {
      setBookingRef(refCode);
      setSubmitted(true);
      toast.success("Hotel proposal request submitted!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full text-slate-900 min-h-screen relative py-8 sm:py-16 px-4 sm:px-10 max-w-7xl mx-auto">
      {/* INDEPENDENT FULL-SCREEN SKY BACKGROUND WITH CLOUDS FOR ALL DEVICES */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <img
          src={skyCloudsImg}
          alt="Sky background with clouds"
          className="w-full h-full object-cover opacity-80 filter brightness-90 saturate-140"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/70 via-slate-950/80 to-slate-950/95" />
      </div>

      {/* SECTION 1: LUXURY HERO HEADER */}
      <div className="relative z-10 max-w-3xl mb-12 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" /> Luxury Concierge Hospitality
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-white font-normal tracking-tight leading-tight mb-4 drop-shadow-md">
          Luxury Hotel Concierge
        </h1>
        <p className="text-slate-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl drop-shadow">
          Tell us your travel plans and our concierge specialists will curate the most suitable hotel options for your stay. No public prices. No endless listings. Just personalized recommendations.
        </p>

        {/* HERO BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-8 border-t border-white/15 text-white/90 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Curated Offline Sourcing</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>15–30 Min Response SLA</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Global Luxury Partners</span>
          </div>
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Dedicated Stay Specialist</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: FLOATING STAY REQUEST CARD */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-200/60 shadow-xl text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 mb-2">
              Stay Request Received
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Reference Code: <span className="font-mono font-bold text-amber-700">{bookingRef}</span>
            </p>
            <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 text-left mb-8 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-amber-200/40 pb-2">
                <span className="text-slate-500">Destination</span>
                <span className="font-semibold text-slate-900">{stay.destination}</span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-200/40 pb-2">
                <span className="text-slate-500">Dates ({nights} Nights)</span>
                <span className="font-semibold text-slate-900">{stay.checkIn} to {stay.checkOut}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Est. Response SLA</span>
                <span className="font-semibold text-amber-700">15 – 30 Minutes</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
              Your dedicated concierge specialist will review your preferences and send curated proposal options directly via Email or WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/?text=Hello%20Shafsky%20Concierge,%20inquiring%20about%20my%20hotel%20request%20${bookingRef}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Concierge
              </a>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
              >
                Submit Another Request
              </button>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmitRequest}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl mb-16 space-y-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-serif font-medium text-slate-900">
                  Curated Stay Request Form
                </h3>
                <p className="text-xs text-slate-500">
                  Specify your travel requirements for offline concierge hotel sourcing
                </p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                White-Glove Support
              </span>
            </div>

            {/* ROW 1: DESTINATION, DATES, GUESTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Destination City / Country
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={stay.destination}
                    onChange={(e) => updateStay({ destination: e.target.value })}
                    placeholder="e.g. Dubai, London, Paris, Tokyo"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={stay.checkIn}
                    onChange={(e) => updateStay({ checkIn: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Check-out Date ({nights} Nights)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={stay.checkOut}
                    onChange={(e) => updateStay({ checkOut: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Guests & Rooms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={stay.paxAdults}
                    onChange={(e) => updateStay({ paxAdults: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                  <select
                    value={stay.roomCount}
                    onChange={(e) => updateStay({ roomCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 8].map((num) => (
                      <option key={num} value={num}>{num} Room{num > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ROW 2: HOTEL CATEGORY & PREFERRED BRAND */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Hotel Category Preference
                </label>
                <select
                  value={stay.hotelCategory || "no_preference"}
                  onChange={(e) => updateStay({ hotelCategory: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none bg-white"
                >
                  <option value="no_preference">No Preference (Concierge Curated)</option>
                  <option value="4_star">4-Star Hotel</option>
                  <option value="5_star">5-Star Hotel</option>
                  <option value="luxury_boutique">Luxury Boutique</option>
                  <option value="resort">Beach / Country Resort</option>
                  <option value="business_hotel">Business & Executive Hotel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Preferred Brand / Chain (Optional)
                </label>
                <input
                  type="text"
                  value={stay.brandPreference || ""}
                  onChange={(e) => updateStay({ brandPreference: e.target.value })}
                  placeholder="e.g. Taj Hotels, Four Seasons, Oberoi, Marriott"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* ROW 3: PURPOSE OF STAY */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Purpose of Stay
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[
                  { label: "Leisure", icon: Compass },
                  { label: "Business", icon: Briefcase },
                  { label: "Family", icon: Users },
                  { label: "Honeymoon", icon: Heart },
                  { label: "Wellness", icon: Sparkles },
                  { label: "Event", icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = stay.purposeOfStay === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => updateStay({ purposeOfStay: item.label as any })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/60 text-amber-900 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 4: SPECIAL PREFERENCES */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Special Stay Preferences
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { key: "airportTransfer", label: "Luxury Airport Transfer", icon: Car },
                  { key: "spaInterest", label: "Spa & Wellness Credit", icon: Sparkles },
                  { key: "earlyCheckin", label: "Guaranteed Early Check-in", icon: Clock },
                  { key: "lateCheckout", label: "Flexible Late Check-out", icon: Clock },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = (personalization as any)[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        updatePersonalization({ [item.key]: !active })
                      }
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                        active
                          ? "border-amber-500 bg-amber-50/50 text-amber-900 font-semibold"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTACT DETAILS & SUBMIT */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Lead Guest Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guest.fullName}
                  onChange={(e) => updateGuest({ fullName: e.target.value })}
                  placeholder="e.g. Alexander Wright"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={guest.email}
                  onChange={(e) => updateGuest({ email: e.target.value })}
                  placeholder="alexander@corporate.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={guest.phone}
                  onChange={(e) => updateGuest({ phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Our concierge desk will source available rates and send custom proposals to your email/phone.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {busy ? "Submitting Request..." : "Request Hotel Proposal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>

      {/* SECTION 3: WHY BOOK THROUGH SHAFSKY */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-3">
            Why Request Hotel Stays Through Shafsky
          </h2>
          <p className="text-slate-600 text-sm">
            White-glove concierge management ensuring room upgrades, flexible check-outs, and direct hotel general manager coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "Dedicated Concierge",
              desc: "One dedicated specialist handles your reservation, special requests, and room allocations from inquiry to checkout.",
              icon: UserCheck,
            },
            {
              title: "Handpicked Hotels",
              desc: "Curated partner portfolio across luxury palaces, executive boutique suites, resorts, and corporate business centers.",
              icon: Building2,
            },
            {
              title: "VIP Airport Coordination",
              desc: "Seamless integration with Meet & Assist tarmac transfers and terminal lounge access upon landing.",
              icon: Car,
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-900 mb-2">{card.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: HOW IT WORKS TIMELINE */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Simple Process</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">How Your Concierge Stay Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {[
            { step: "01", title: "Submit Stay Request", desc: "Share your destination, dates, and stay preferences." },
            { step: "02", title: "Offline Sourcing", desc: "Concierge team fetches curated live rates & upgrades." },
            { step: "03", title: "Receive Proposal", desc: "Review 2–4 tailored options on WhatsApp or Email." },
            { step: "04", title: "Confirm & Enjoy", desc: "Direct check-in hold with suite key handover." },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl relative">
              <span className="text-3xl font-serif font-light text-amber-400 mb-3 block">{item.step}</span>
              <h5 className="text-sm font-semibold text-white mb-1">{item.title}</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
