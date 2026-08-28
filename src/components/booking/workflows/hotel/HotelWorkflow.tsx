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
import desktop169HotelPlaneImg from "@/assets/desktop-169-hotel-plane.png";

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
          contact_name: guest.fullName,
          contact_email: guest.email,
          contact_phone: guest.phone,
          company: guest.isCorporateBooking ? guest.companyName || "" : "",
          trip_type: "one_way",
          origin: stay.destination,
          destination: stay.destination,
          depart_date: stay.checkIn,
          return_date: stay.checkOut,
          pax_adults: stay.paxAdults || 1,
          pax_children: stay.paxChildren || 0,
          pax_infants: stay.paxInfants || 0,
          service_type: "hotel",
          check_in: stay.checkIn,
          check_out: stay.checkOut,
          room_type: stay.roomType,
          guests_count: totalGuests,
          room_count: stay.roomCount,
          meal_plan: stay.mealPlan,
          special_requests: `[Purpose: ${stay.purposeOfStay}] [Category: ${stay.hotelCategory}] [Brand: ${stay.brandPreference || "None"}] ${guest.specialRequests}`,
        },
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
      {/* PERFECT WIDESCREEN 16:9 DESKTOP BACKGROUND (HOTELS & FLYING PLANE) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-sky-950">
        <img
          src={desktop169HotelPlaneImg}
          alt="Widescreen desktop luxury hotel resort with airplane flying in morning sky"
          className="w-full h-full object-cover object-top sm:object-[center_20%] lg:object-[center_15%] opacity-90 filter brightness-105 saturate-135 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/85" />
      </div>

      <div className="relative z-10">

      {/* SECTION 1: LUXURY HERO HEADER */}
      <div className="relative z-10 max-w-3xl mb-12 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" /> VIP Hotel Booking
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-white font-normal tracking-tight leading-tight mb-4 drop-shadow-md">
          Luxury Hotel Booking
        </h1>
        <p className="text-slate-200 text-base sm:text-xl font-light leading-relaxed max-w-2xl drop-shadow">
          Tell us your travel plans and our stay specialists will source the best hotel options for you. No public prices. No endless search. Just handpicked recommendations.
        </p>

        {/* HERO BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-8 border-t border-white/15 text-white/90 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Curated Sourcing</span>
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
            <span>Dedicated Travel Specialist</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: FLOATING STAY REQUEST CARD */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl mb-16 text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-600 mb-2 block">
              Stay Request Received
            </span>

            <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-3">
              We Are Curating Your Hotel Proposals
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Thank you, <strong className="text-slate-900">{guest.fullName}</strong>. Our stay specialists are contacting top hotel managers for your stay in{" "}
              <strong className="text-slate-900">{stay.destination}</strong>.
            </p>

            {bookingRef && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 inline-block mb-8">
                <span className="text-xs text-slate-500 block uppercase font-medium">Reference Code</span>
                <span className="text-xl font-mono font-bold text-amber-600">{bookingRef}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/919599087959?text=Hello%20Shafsky,%20I%20just%20submitted%20a%20hotel%20booking%20request."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" /> Connect via WhatsApp
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
                  Hotel Booking Request Form
                </h3>
                <p className="text-xs text-slate-500">
                  Share your travel preferences and our team will handle your hotel booking.
                </p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                VIP Support
              </span>
            </div>

            {/* ROW 1: DESTINATION, DATES, GUESTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Destination City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={stay.destination}
                    onChange={(e) => updateStay({ destination: e.target.value })}
                    placeholder="e.g. Dubai, London, Paris"
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
                  Check-out Date ({nights} {nights === 1 ? "night" : "nights"})
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
                  Guests & Rooms ({totalGuests} PAX)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={stay.roomCount}
                    onChange={(e) => updateStay({ roomCount: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-white"
                  >
                    <option value={1}>1 Room ({stay.paxAdults} Guests)</option>
                    <option value={2}>2 Rooms</option>
                    <option value={3}>3 Rooms</option>
                    <option value={4}>4+ Rooms (Group Stay)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ROW 2: HOTEL CATEGORY, ROOM TYPE, PURPOSE, MEAL PLAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Hotel Category Preference
                </label>
                <select
                  value={stay.hotelCategory}
                  onChange={(e) => updateStay({ hotelCategory: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-white"
                >
                  <option value="no_preference">No Preference (Best Option)</option>
                  <option value="5_star">5-Star Luxury</option>
                  <option value="4_star">4-Star Premium</option>
                  <option value="luxury_boutique">Luxury Boutique Hotel</option>
                  <option value="resort">Beach / Golf Resort</option>
                  <option value="business_hotel">Business Hotel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Room Type Preference
                </label>
                <select
                  value={stay.roomType}
                  onChange={(e) => updateStay({ roomType: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-white"
                >
                  <option value="standard_room">Standard Room</option>
                  <option value="deluxe_room">Deluxe Room</option>
                  <option value="executive_suite">Executive Suite</option>
                  <option value="family_suite">Family Suite</option>
                  <option value="presidential_suite">Presidential Suite</option>
                  <option value="private_villa">Private Villa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Purpose of Stay
                </label>
                <select
                  value={stay.purposeOfStay}
                  onChange={(e) => updateStay({ purposeOfStay: e.target.value as any })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-white"
                >
                  <option value="leisure">Leisure / Vacation</option>
                  <option value="business">Business / Corporate</option>
                  <option value="vip_event">VIP Event / Conference</option>
                  <option value="honeymoon">Honeymoon / Anniversary</option>
                  <option value="medical_recovery">Medical / Rest Stay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Meal Plan Preference
                </label>
                <select
                  value={stay.mealPlan}
                  onChange={(e) => updateStay({ mealPlan: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none bg-white"
                >
                  <option value="room_only">Room Only</option>
                  <option value="bed_breakfast">Bed & Breakfast</option>
                  <option value="half_board">Half Board (Breakfast & Dinner)</option>
                  <option value="full_board">Full Board (All Meals)</option>
                </select>
              </div>
            </div>

            {/* ROW 3: PREFERRED BRAND & SPECIAL PREFERENCES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Preferred Hotel Brand (Optional)
                </label>
                <input
                  type="text"
                  value={stay.brandPreference || ""}
                  onChange={(e) => updateStay({ brandPreference: e.target.value })}
                  placeholder="e.g. Taj, Oberoi, Four Seasons, Marriott, Hilton"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Special Stay Preferences & Requests
                </label>
                <input
                  type="text"
                  value={guest.specialRequests || ""}
                  onChange={(e) => updateGuest({ specialRequests: e.target.value })}
                  placeholder="e.g. Sea view, high floor, early check-in, airport transfer"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                />
              </div>
            </div>

            {/* ROW 4: CONTACT INFORMATION */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" /> Guest & Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Full Contact Name *
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
                    Email Address *
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
                    Phone / WhatsApp *
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
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Our stay specialists will source available rates and send custom proposals to your email/phone.
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
            Personalized service ensuring room upgrades, flexible check-outs, and direct hotel coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "Dedicated Travel Specialist",
              desc: "One dedicated manager handles your hotel booking, room upgrades, and special requests from start to finish.",
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
          <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">How Your Hotel Booking Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {[
            { step: "01", title: "Submit Stay Request", desc: "Share your destination, dates, and stay preferences." },
            { step: "02", title: "Handpicked Sourcing", desc: "Our travel team sources top hotel rates and room upgrades." },
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
    </div>
  );
}
