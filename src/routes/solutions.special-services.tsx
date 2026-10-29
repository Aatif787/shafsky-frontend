import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Sparkles,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { display } from "@/components/home/theme";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
  validateNameNoDigits,
  validatePhoneNoLetters,
} from "@/lib/inputValidation";
import { Footer } from "@/components/home/sections/Footer";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OnboardMealArrangementForm } from "@/components/special-services/OnboardMealArrangementForm";
import { InfantCareEnquiryForm } from "@/components/special-services/InfantCareEnquiryForm";
import {
  SPECIAL_SERVICES_OPTIONS,
  resolveSpecialServiceFromSearch,
  SpecialServiceHeroStage,
  SpecialServiceDetailsSection,
  SpecialServiceMedicalAndLogisticsFields,
  type SpecialServiceOptionId,
  type SpecialServiceOptionDef,
} from "@/components/special-services/SpecialServicesParts";

export {
  SPECIAL_SERVICES_OPTIONS,
  resolveSpecialServiceFromSearch,
  type SpecialServiceOptionId,
  type SpecialServiceOptionDef,
};

export const Route = createFileRoute("/solutions/special-services")({
  head: () =>
    pageHead({
      title: "VIP Special Services, Air Ticketing, Tours, Visa & Medevac | Shafsky",
      description:
        "Commercial air ticketing, curated tours and travel, fast-track visa assistance, on-board meals, luxury spa and wellness, PSO close protection, 24/7 air and train ambulance, HUM repatriation, and cargo pet logistics.",
      path: "/solutions/special-services",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Special Services", path: "/solutions/special-services" },
        ]),
      ],
    }),
  component: DedicatedSpecialServicesPage,
});

function DedicatedSpecialServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedOptionId, setSelectedOptionId] = useState<SpecialServiceOptionId>(() =>
    resolveSpecialServiceFromSearch(location.search)
  );

  // Synchronize selected service whenever URL search parameter changes
  useEffect(() => {
    const resolved = resolveSpecialServiceFromSearch(location.search);
    setSelectedOptionId(resolved);
    setSubmittedRef(null);
  }, [location.search]);

  const activeOption =
    SPECIAL_SERVICES_OPTIONS.find((o) => o.id === selectedOptionId) ||
    SPECIAL_SERVICES_OPTIONS[0];

  // ─────────────────────────────────────────────────────────────
  // STREAMLINED ENQUIRY-BASED FORM STATES (MINIMUM REQUIRED)
  // ─────────────────────────────────────────────────────────────

  // 1. Spa & Wellness (Location, Date/Time, Guests, Optional Preferences)
  const [spaLocation, setSpaLocation] = useState("");
  const [spaDate, setSpaDate] = useState("");
  const [spaGuests, setSpaGuests] = useState(2);
  const [spaNotes, setSpaNotes] = useState("");

  // 2. Tours & Travel (Destination, Dates/Month, Guests, Optional Wishes)
  const [tourDestination, setTourDestination] = useState("");
  const [tourDates, setTourDates] = useState("");
  const [tourGuests, setTourGuests] = useState(2);
  const [tourNotes, setTourNotes] = useState("");

  // 3. PSO Close Protection (Location, Dates/Duration, Scope, Notes)
  const [psoLocation, setPsoLocation] = useState("");
  const [psoDates, setPsoDates] = useState("");
  const [psoScope, setPsoScope] = useState("VIP Luxury Shopping Escort");
  const [psoNotes, setPsoNotes] = useState("");

  // 4. Air Ambulance (From, To, Urgency/Date, Patient Condition)
  const [airAmbPickup, setAirAmbPickup] = useState("");
  const [airAmbDest, setAirAmbDest] = useState("");
  const [airAmbDate, setAirAmbDate] = useState("");
  const [airAmbNotes, setAirAmbNotes] = useState("");

  // 5. Train Ambulance (From Station, To Station, Date, Medical Support)
  const [trainAmbOrigin, setTrainAmbOrigin] = useState("");
  const [trainAmbDest, setTrainAmbDest] = useState("");
  const [trainAmbDate, setTrainAmbDate] = useState("");
  const [trainAmbNotes, setTrainAmbNotes] = useState("");

  // 6. HUM Remains Repatriation (From City, To Destination, Date, Scope)
  const [humOrigin, setHumOrigin] = useState("");
  const [humDest, setHumDest] = useState("");
  const [humDate, setHumDate] = useState("");
  const [humScope, setHumScope] = useState("Domestic Repatriation (Airport to Airport)");

  // 7. Visa Assistance (Country, Category, Date, Applicants, Passport)
  const [visaCountry, setVisaCountry] = useState("");
  const [visaCategory, setVisaCategory] = useState("Tourist / Visitor Visa");
  const [visaDate, setVisaDate] = useState("");
  const [visaApplicants, setVisaApplicants] = useState(1);
  const [visaPassport, setVisaPassport] = useState("");

  // 8. Cargo & AVI Pet Freight (From, To, Pet/Cargo Details, Date)
  const [cargoOrigin, setCargoOrigin] = useState("");
  const [cargoDest, setCargoDest] = useState("");
  const [cargoDetails, setCargoDetails] = useState("");
  const [cargoDate, setCargoDate] = useState("");

  // 9. Air Ticketing (From, To, Travel Date, Class & Pax, Notes)
  const [ticketOrigin, setTicketOrigin] = useState("");
  const [ticketDest, setTicketDest] = useState("");
  const [ticketDate, setTicketDate] = useState("");
  const [ticketClass, setTicketClass] = useState("Economy Class");
  const [ticketPax, setTicketPax] = useState(1);
  const [ticketNotes, setTicketNotes] = useState("");

  // Common Contact Details (Required for desk follow-up)
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmitRequest = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientName.trim() || !validateNameNoDigits(clientName)) {
      alert("Please provide your name without numbers.");
      return;
    }
    if (!phone.trim() || !validatePhoneNoLetters(phone)) {
      alert("Please provide your contact phone number without letters.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please provide a valid email so our desk can send your quotation.");
      return;
    }

    if (selectedOptionId === "Visa Assistance Services" && !visaPassport.trim()) {
      alert("Please provide your passport number.");
      return;
    }

    setIsSubmitting(true);

    let origin: string | undefined;
    let destination: string | undefined;
    let serviceDate: string | undefined;
    let details: Record<string, unknown> = { service: selectedOptionId };
    let notes: string | undefined;
    let serviceCategory: "Travel Support" | "Cargo & Logistics" = "Travel Support";
    let serviceType: string = selectedOptionId;

    if (selectedOptionId === "Spa & Wellness") {
      origin = spaLocation;
      destination = spaLocation;
      serviceDate = spaDate || undefined;
      details = {
        service: selectedOptionId,
        location: spaLocation,
        date: spaDate,
        guests: spaGuests,
        notes: spaNotes,
      };
      notes = `${spaGuests} Guests — ${spaNotes || "No specific request"}`;
      serviceType = "Spa & Wellness";
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      origin = tourDestination;
      destination = tourDestination;
      serviceDate = tourDates || undefined;
      details = {
        service: selectedOptionId,
        destination: tourDestination,
        dates: tourDates,
        guests: tourGuests,
        notes: tourNotes,
      };
      notes = `${tourGuests} Travelers for ${tourDestination} (${tourDates}) — ${tourNotes || "None"}`;
      serviceType = "Travel Support";
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      origin = psoLocation;
      destination = psoLocation;
      serviceDate = psoDates || undefined;
      details = {
        service: selectedOptionId,
        location: psoLocation,
        dates: psoDates,
        scope: psoScope,
        notes: psoNotes,
      };
      notes = `${psoScope} in ${psoLocation} — ${psoNotes || "None"}`;
      serviceType = "VIP Escort";
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      origin = airAmbPickup;
      destination = airAmbDest;
      serviceDate = airAmbDate || undefined;
      details = {
        service: selectedOptionId,
        pickup_hospital: airAmbPickup,
        destination_hospital: airAmbDest,
        date: airAmbDate,
        condition: airAmbNotes,
      };
      notes = `Transfer from ${airAmbPickup} to ${airAmbDest} — Patient Status: ${airAmbNotes || "Urgent Air Ambulance"}`;
      serviceType = "Air Ambulance";
    } else if (selectedOptionId === "Train Ambulance" || selectedOptionId === "Train Ambulance (Train ICU Escort)") {
      origin = trainAmbOrigin;
      destination = trainAmbDest;
      serviceDate = trainAmbDate || undefined;
      details = {
        service: selectedOptionId,
        origin_station: trainAmbOrigin,
        destination_station: trainAmbDest,
        date: trainAmbDate,
        medical_support: trainAmbNotes,
      };
      notes = `Rail Transfer from ${trainAmbOrigin} to ${trainAmbDest} — Needs: ${trainAmbNotes || "Doctor & Oxygen Escort"}`;
      serviceType = "Train Ambulance";
    } else if (selectedOptionId === "Human Remains (HUM)" || (selectedOptionId as any) === "Dignified Human Remains (HUM)") {
      origin = humOrigin;
      destination = humDest;
      serviceDate = humDate || undefined;
      details = {
        service: selectedOptionId,
        departure_city: humOrigin,
        arrival_destination: humDest,
        date: humDate,
        scope: humScope,
      };
      notes = `${humScope} from ${humOrigin} to ${humDest} on ${humDate}`;
      serviceType = "Human Remains Repatriation";
    } else if (selectedOptionId === "Visa Assistance Services") {
      origin = "India";
      destination = visaCountry;
      serviceDate = visaDate || undefined;
      details = {
        service: selectedOptionId,
        destination_country: visaCountry,
        visa_category: visaCategory,
        travel_date: visaDate,
        applicants_count: visaApplicants,
        passport_number: visaPassport.trim().toUpperCase(),
      };
      notes = `${visaCategory} for ${visaCountry} (${visaApplicants} Applicants) | Passport: ${visaPassport.trim().toUpperCase()}`;
      serviceType = "Visa Assistance";
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      origin = cargoOrigin;
      destination = cargoDest;
      serviceDate = cargoDate || undefined;
      serviceCategory = "Cargo & Logistics";
      details = {
        service: selectedOptionId,
        origin: cargoOrigin,
        destination: cargoDest,
        cargo_pet_details: cargoDetails,
        date: cargoDate,
      };
      notes = `Cargo/Pet Details: ${cargoDetails} from ${cargoOrigin} to ${cargoDest}`;
      serviceType = "Cargo Assistance";
    } else if (selectedOptionId === "Air Ticketing Services") {
      origin = ticketOrigin;
      destination = ticketDest;
      serviceDate = ticketDate || undefined;
      details = {
        service: selectedOptionId,
        origin: ticketOrigin,
        destination: ticketDest,
        travel_date: ticketDate,
        cabin_class: ticketClass,
        passengers_count: ticketPax,
        class_passengers: `${ticketClass} (${ticketPax} Pax)`,
        notes: ticketNotes,
      };
      notes = `Flight Inquiry: ${ticketOrigin} to ${ticketDest} — ${ticketClass} (${ticketPax} Pax) — Notes: ${ticketNotes || "None"}`;
      serviceType = "Air Ticketing";
    }

    try {
      const res = await enquiryApi.submit({
        passengerName: clientName.trim(),
        passengerEmail: email.trim().toLowerCase(),
        passengerPhone: phone.trim(),
        serviceCategory,
        serviceType,
        origin,
        destination,
        serviceDate,
        notes,
        details,
      });
      if (res.success && res.data?.bookingRef) {
        setSubmittedRef(res.data.bookingRef);
      } else {
        const errMsg =
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit enquiry. Please try again.";
        alert(errMsg);
      }
    } catch (err) {
      console.error("Special service inquiry submission:", err);
      alert("Something went wrong while submitting your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppDirectLink = () => {
    let details = "";
    if (selectedOptionId === "Spa & Wellness") {
      details = `Location: ${spaLocation}%0ADate: ${spaDate}%0AGuests: ${spaGuests}%0APreferences: ${spaNotes || "None"}`;
    } else if (selectedOptionId === "Tours & Travel (Honeymoon/Couples)") {
      details = `Destination: ${tourDestination}%0ATravel Dates: ${tourDates}%0AGuests: ${tourGuests}%0ANotes: ${tourNotes || "None"}`;
    } else if (selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)") {
      details = `Location: ${psoLocation}%0ADates: ${psoDates}%0AScope: ${psoScope}%0ANotes: ${psoNotes || "None"}`;
    } else if (selectedOptionId === "Air Ambulance (Airborne ICU Jet)") {
      details = `From: ${airAmbPickup}%0ATo: ${airAmbDest}%0ADate/Urgency: ${airAmbDate}%0APatient Needs: ${airAmbNotes || "Urgent"}`;
    } else if (selectedOptionId === "Train Ambulance" || selectedOptionId === "Train Ambulance (Train ICU Escort)") {
      details = `From: ${trainAmbOrigin}%0ATo: ${trainAmbDest}%0ADate: ${trainAmbDate}%0AMedical Needs: ${trainAmbNotes || "Oxygen & Escort"}`;
    } else if (selectedOptionId === "Human Remains (HUM)" || (selectedOptionId as any) === "Dignified Human Remains (HUM)") {
      details = `From: ${humOrigin}%0ATo: ${humDest}%0ATimeline: ${humDate}%0AScope: ${humScope}`;
    } else if (selectedOptionId === "Visa Assistance Services") {
      details = `Country: ${visaCountry}%0ACategory: ${visaCategory}%0ATravel Date: ${visaDate}%0AApplicants: ${visaApplicants}%0APassport: ${visaPassport.trim().toUpperCase()}`;
    } else if (selectedOptionId === "Cargo & AVI Pet Freight") {
      details = `From: ${cargoOrigin}%0ATo: ${cargoDest}%0ACargo/Pet: ${cargoDetails}%0ADate: ${cargoDate}`;
    } else if (selectedOptionId === "Air Ticketing Services") {
      details = `Sector: ${ticketOrigin} to ${ticketDest}%0ADate: ${ticketDate}%0ACabin Class: ${ticketClass}%0APassengers: ${ticketPax}%0ANotes: ${ticketNotes || "None"}`;
    }

    const text = `Hello Shafsky VIP Concierge Desk,%0A%0AI would like to inquire about:%0A*Service:* ${selectedOptionId}%0A${details}%0A%0A*Name:* ${clientName}%0A*Phone:* ${phone}%0A*Email:* ${email || "N/A"}`;
    const targetPhone = selectedOptionId === "Air Ticketing Services" ? "919599087957" : "919599087959";
    return `https://wa.me/${targetPhone}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* 1. DEDICATED SELECTED SERVICE HERO STAGE */}
      <SpecialServiceHeroStage
        activeOption={activeOption}
        onBack={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            navigate({ to: "/" });
          }
        }}
      />

      {/* 2. SUPER SIMPLE ENQUIRY PANEL (FOR SELECTED SERVICE ONLY) */}
      <section id="request-form" className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200 px-4 sm:px-6 lg:px-8 scroll-mt-6">
        <div className={selectedOptionId === "On-board Meal Arrangements for Group Meet & Greet Bookings" ? "mx-auto max-w-4xl" : "mx-auto max-w-3xl"}>
          {/* Active Option Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 mb-2">
              <Sparkles size={13} className="text-lime-600" />
              <span>QUICK ENQUIRY • CUSTOM QUOTATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950" style={display}>
              {activeOption.label} Enquiry
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Share your details below to receive a custom quote within 15 minutes, or chat directly with our concierge desk.
            </p>
          </div>

          {selectedOptionId === "On-board Meal Arrangements for Group Meet & Greet Bookings" ? (
            <OnboardMealArrangementForm />
          ) : selectedOptionId === "Infant Care Services" ? (
            <InfantCareEnquiryForm />
          ) : (
            <>
              {/* Success State / Reference Card */}
              {submittedRef ? (
                <div className="bg-white rounded-3xl border border-lime-400 p-8 sm:p-12 text-center shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700">
                    ENQUIRY RECEIVED SUCCESSFULLY
                  </span>
                  <h3 className="text-3xl font-extrabold text-slate-950 mt-1 mb-2" style={display}>
                    Reference #{submittedRef}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                    Thank you, <strong className="text-slate-900">{clientName || "Guest"}</strong>. Your enquiry for <strong className="text-slate-900">{selectedOptionId}</strong> has been logged. Our VIP desk will contact you within 15 minutes.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getWhatsAppDirectLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all"
                    >
                      <MessageSquare size={15} />
                      <span>Chat on WhatsApp Directly</span>
                    </a>
                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs font-mono tracking-wider transition-all"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    {/* User Contact Details (Placed Upper) */}
                    <div className="pb-5 border-b border-slate-100">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 block mb-3">
                        Your Contact Details (For Fast Response)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={clientName}
                            onKeyDown={preventDigitsKeyDown}
                            onChange={(e) => setClientName(sanitizeName(e.target.value))}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Phone / WhatsApp *
                          </label>
                          <PhoneInput
                            required
                            value={phone}
                            onChange={setPhone}
                            placeholder="Mobile number"
                            className="border-slate-200 text-sm font-medium focus:border-lime-500 focus:ring-lime-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 1. Spa & Wellness Minimal Enquiry */}
                    {selectedOptionId === "Spa & Wellness" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Preferred City / Hotel *
                            </label>
                            <input
                              type="text"
                              value={spaLocation}
                              onChange={(e) => setSpaLocation(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Preferred Date & Time *
                            </label>
                            <input
                              type="date"
                              min={today}
                              value={spaDate}
                              onChange={(e) => setSpaDate(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Guests *
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={spaGuests}
                              onChange={(e) => setSpaGuests(parseInt(e.target.value) || 1)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Treatment or Preferences (Optional)
                            </label>
                            <input
                              type="text"
                              value={spaNotes}
                              onChange={(e) => setSpaNotes(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Tours & Travel Minimal Enquiry */}
                    {selectedOptionId === "Tours & Travel (Honeymoon/Couples)" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Destination / Circuit *
                            </label>
                            <input
                              type="text"
                              value={tourDestination}
                              onChange={(e) => setTourDestination(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Travel Dates or Month *
                            </label>
                            <input
                              type="date"
                              min={today}
                              value={tourDates}
                              onChange={(e) => setTourDates(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Travelers *
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={tourGuests}
                              onChange={(e) => setTourGuests(parseInt(e.target.value) || 2)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Special Wishes & Preferences (Optional)
                            </label>
                            <input
                              type="text"
                              value={tourNotes}
                              onChange={(e) => setTourNotes(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. PSO Close Protection Minimal Enquiry */}
                    {selectedOptionId === "PSO (Personal Security Officer / VIP Shopping)" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              City / Deployment Location *
                            </label>
                            <input
                              type="text"
                              value={psoLocation}
                              onChange={(e) => setPsoLocation(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Dates / Duration *
                            </label>
                            <input
                              type="date"
                              min={today}
                              value={psoDates}
                              onChange={(e) => setPsoDates(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Scope of Detail *
                            </label>
                            <select
                              value={psoScope}
                              onChange={(e) => setPsoScope(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                            >
                              <option value="VIP Luxury Shopping Escort">VIP Luxury Shopping Escort</option>
                              <option value="24/7 Close Protection Officer">24/7 Close Protection Officer</option>
                              <option value="Armored Convoy & Airport Transit">Armored Convoy & Airport Transit</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Specific Security Notes (Optional)
                            </label>
                            <input
                              type="text"
                              value={psoNotes}
                              onChange={(e) => setPsoNotes(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4-8: Medical, Repatriation, Visa, Cargo */}
                    <SpecialServiceMedicalAndLogisticsFields
                      selectedOptionId={selectedOptionId}
                      today={today}
                      airAmbPickup={airAmbPickup}
                      setAirAmbPickup={setAirAmbPickup}
                      airAmbDest={airAmbDest}
                      setAirAmbDest={setAirAmbDest}
                      airAmbDate={airAmbDate}
                      setAirAmbDate={setAirAmbDate}
                      airAmbNotes={airAmbNotes}
                      setAirAmbNotes={setAirAmbNotes}
                      trainAmbOrigin={trainAmbOrigin}
                      setTrainAmbOrigin={setTrainAmbOrigin}
                      trainAmbDest={trainAmbDest}
                      setTrainAmbDest={setTrainAmbDest}
                      trainAmbDate={trainAmbDate}
                      setTrainAmbDate={setTrainAmbDate}
                      trainAmbNotes={trainAmbNotes}
                      setTrainAmbNotes={setTrainAmbNotes}
                      humOrigin={humOrigin}
                      setHumOrigin={setHumOrigin}
                      humDest={humDest}
                      setHumDest={setHumDest}
                      humDate={humDate}
                      setHumDate={setHumDate}
                      humScope={humScope}
                      setHumScope={setHumScope}
                      visaCountry={visaCountry}
                      setVisaCountry={setVisaCountry}
                      visaCategory={visaCategory}
                      setVisaCategory={setVisaCategory}
                      visaDate={visaDate}
                      setVisaDate={setVisaDate}
                      visaApplicants={visaApplicants}
                      setVisaApplicants={setVisaApplicants}
                      visaPassport={visaPassport}
                      setVisaPassport={setVisaPassport}
                      cargoOrigin={cargoOrigin}
                      setCargoOrigin={setCargoOrigin}
                      cargoDest={cargoDest}
                      setCargoDest={setCargoDest}
                      cargoDetails={cargoDetails}
                      setCargoDetails={setCargoDetails}
                      cargoDate={cargoDate}
                      setCargoDate={setCargoDate}
                    />

                    {/* 9. Air Ticketing Minimal Enquiry */}
                    {selectedOptionId === "Air Ticketing Services" && (
                      <div className="space-y-4">
                        {/* Airports */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Departure Airport / City *
                            </label>
                            <IntelligentAirportAutocomplete
                              mode="global"
                              value={ticketOrigin}
                              placeholder="Search airport (e.g. DEL, BOM, DXB)"
                              inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                              showIcon={false}
                              onSelect={(ap) => setTicketOrigin(formatAirportOption(ap))}
                              onChangeText={(txt) => setTicketOrigin(txt)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Destination Airport / City *
                            </label>
                            <IntelligentAirportAutocomplete
                              mode="global"
                              value={ticketDest}
                              placeholder="Search airport (e.g. DEL, BOM, DXB)"
                              inputClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                              showIcon={false}
                              onSelect={(ap) => setTicketDest(formatAirportOption(ap))}
                              onChangeText={(txt) => setTicketDest(txt)}
                            />
                          </div>
                        </div>

                        {/* Travel Date, Cabin Class & Passengers Count (Separated) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Travel Date(s) *
                            </label>
                            <input
                              type="date"
                              min={today}
                              value={ticketDate}
                              onChange={(e) => setTicketDate(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Cabin Class *
                            </label>
                            <select
                              value={ticketClass}
                              onChange={(e) => setTicketClass(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                            >
                              <option value="Economy Class">Economy Class</option>
                              <option value="Premium Economy">Premium Economy</option>
                              <option value="Business Class">Business Class</option>
                              <option value="First Class">First Class</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Passengers Count *
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={ticketPax}
                              onChange={(e) => setTicketPax(Math.max(1, parseInt(e.target.value) || 1))}
                              required
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* Specific Notes / Preferences */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Specific Flight or Airline Preference (Optional)
                          </label>
                          <input
                            type="text"
                            value={ticketNotes}
                            onChange={(e) => setTicketNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-lime-500 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Fast WhatsApp + Direct Lead Submit */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                      <a
                        href={getWhatsAppDirectLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono tracking-wider transition-all"
                      >
                        <MessageSquare size={14} className="text-lime-400" />
                        <span>Instant WhatsApp Enquiry</span>
                      </a>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={14} />
                        <span>{isSubmitting ? "Sending..." : "Submit Enquiry"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. SELECTED SERVICE DETAILS & INCLUSIONS */}
      <SpecialServiceDetailsSection activeOption={activeOption} />

      <Footer />
    </div>
  );
}
