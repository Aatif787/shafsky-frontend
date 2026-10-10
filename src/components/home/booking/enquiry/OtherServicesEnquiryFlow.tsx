import React, { useState } from "react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import {
  ArrowRightLeft,
  Ticket,
  Car,
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Users,
  Send,
  Loader2,
  User,
  Mail,
  Phone,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { EnquirySuccessCard } from "./EnquirySuccessCard";
import { mono, display } from "../../theme";

const FIELD_CONTAINER = "flex flex-col gap-1.5";
const LABEL = "h-4 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";
const INPUT =
  "h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-12 w-full items-center rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";

export type OtherServiceType = "round-trip" | "ticketing" | "transport";

interface OtherServicesEnquiryFlowProps {
  initialService?: OtherServiceType;
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialPax?: number;
  onBackToAirport: () => void;
}

export const OtherServicesEnquiryFlow: React.FC<OtherServicesEnquiryFlowProps> = ({
  initialService = "round-trip",
  initialOrigin = "",
  initialDestination = "",
  initialDate = "",
  initialPax = 1,
  onBackToAirport,
}) => {
  // Step state: 1 = Customer Details, 2 = Service Selection, 3 = Service-Specific Details
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Customer Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerErrors, setCustomerErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});

  // Step 2: Selected Service Option
  const [selectedService, setSelectedService] = useState<OtherServiceType>(initialService);

  // Step 3: Service-Specific State
  // Round Trip
  const [rtOrigin, setRtOrigin] = useState(initialOrigin);
  const [rtDestination, setRtDestination] = useState(initialDestination);
  const [rtReturnOrigin, setRtReturnOrigin] = useState("");
  const [rtReturnDestination, setRtReturnDestination] = useState("");
  const [rtDepartureDate, setRtDepartureDate] = useState(initialDate);
  const [rtReturnDate, setRtReturnDate] = useState("");
  const [rtOutboundFlight, setRtOutboundFlight] = useState("");
  const [rtReturnFlight, setRtReturnFlight] = useState("");
  const [rtPax, setRtPax] = useState(Math.max(1, initialPax));

  // Ticketing
  const [tktOrigin, setTktOrigin] = useState(initialOrigin);
  const [tktDestination, setTktDestination] = useState(initialDestination);
  const [tktDate, setTktDate] = useState(initialDate);
  const [tktPax, setTktPax] = useState(Math.max(1, initialPax));

  // Transport
  const [trnPickup, setTrnPickup] = useState(initialOrigin ? `${initialOrigin} Airport` : "");
  const [trnDropoff, setTrnDropoff] = useState(initialDestination || "");
  const [trnDate, setTrnDate] = useState(initialDate);
  const [trnTime, setTrnTime] = useState("10:00");
  const [trnPax, setTrnPax] = useState(Math.max(1, initialPax));
  const [trnVehicle, setTrnVehicle] = useState("Executive Sedan");

  // Common Notes / Special Requests
  const [notes, setNotes] = useState("");

  // Popover calendar states
  const [rtDepCalendarOpen, setRtDepCalendarOpen] = useState(false);
  const [rtRetCalendarOpen, setRtRetCalendarOpen] = useState(false);
  const [tktCalendarOpen, setTktCalendarOpen] = useState(false);
  const [trnCalendarOpen, setTrnCalendarOpen] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Validation for Step 1
  const validateCustomerStep = (): boolean => {
    const errs: typeof customerErrors = {};
    if (!firstName.trim()) {
      errs.firstName = "First name is required.";
    }
    if (!lastName.trim()) {
      errs.lastName = "Last name is required.";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "A valid email address is required.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!phone.trim() || cleanPhone.length < 7) {
      errs.phone = "A valid phone number (at least 7 digits) is required.";
    }

    setCustomerErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required customer details.");
      return false;
    }
    return true;
  };

  const handleNextFromCustomer = () => {
    if (validateCustomerStep()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromService = () => {
    setCurrentStep(3);
  };

  // Step 3 Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify customer details are still intact
    if (!validateCustomerStep()) {
      setCurrentStep(1);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Validate service-specific fields
    if (selectedService === "round-trip") {
      if (!rtOrigin.trim()) {
        toast.error("Please select departure airport.");
        return;
      }
      if (!rtDestination.trim()) {
        toast.error("Please select destination airport.");
        return;
      }
      if (rtOrigin.trim().toUpperCase() === rtDestination.trim().toUpperCase()) {
        toast.error("Departure and destination airports cannot be identical.");
        return;
      }
      if (!rtDepartureDate) {
        toast.error("Please select departure date.");
        return;
      }
      if (!rtReturnDate) {
        toast.error("Please select return date.");
        return;
      }
      if (new Date(rtReturnDate) < new Date(rtDepartureDate)) {
        toast.error("Return date cannot be earlier than departure date.");
        return;
      }
    } else if (selectedService === "ticketing") {
      if (!tktOrigin.trim()) {
        toast.error("Please select departure airport.");
        return;
      }
      if (!tktDestination.trim()) {
        toast.error("Please select destination airport.");
        return;
      }
      if (tktOrigin.trim().toUpperCase() === tktDestination.trim().toUpperCase()) {
        toast.error("Departure and destination airports cannot be identical.");
        return;
      }
      if (!tktDate) {
        toast.error("Please select departure date.");
        return;
      }
    } else if (selectedService === "transport") {
      if (!trnPickup.trim()) {
        toast.error("Please enter pickup location.");
        return;
      }
      if (!trnDropoff.trim()) {
        toast.error("Please enter drop-off destination.");
        return;
      }
      if (!trnDate) {
        toast.error("Please select departure date.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (selectedService === "round-trip") {
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Round Trip",
          serviceType: "Round Trip Flight Enquiry",
          origin: rtOrigin.trim(),
          destination: rtDestination.trim(),
          serviceDate: rtDepartureDate,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Round Trip",
            origin: rtOrigin.trim(),
            destination: rtDestination.trim(),
            departure_date: rtDepartureDate,
            outbound_date: rtDepartureDate,
            return_origin: (rtReturnOrigin || rtDestination).trim(),
            return_destination: (rtReturnDestination || rtOrigin).trim(),
            return_date: rtReturnDate,
            outbound_flight: rtOutboundFlight.trim().toUpperCase() || undefined,
            return_flight: rtReturnFlight.trim().toUpperCase() || undefined,
            passenger_count: rtPax,
            pax_count: rtPax,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Round Trip enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      } else if (selectedService === "ticketing") {
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Ticketing",
          serviceType: "Air Ticketing Enquiry",
          origin: tktOrigin.trim(),
          destination: tktDestination.trim(),
          serviceDate: tktDate,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Ticketing",
            origin: tktOrigin.trim(),
            destination: tktDestination.trim(),
            travel_date: tktDate,
            service_date: tktDate,
            passenger_count: tktPax,
            pax_count: tktPax,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Ticketing enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      } else if (selectedService === "transport") {
        const fullServiceDate = `${trnDate} ${trnTime || "10:00"}`;
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Transport",
          serviceType: "Ground Transport Enquiry",
          origin: trnPickup.trim(),
          destination: trnDropoff.trim(),
          serviceDate: fullServiceDate,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Transport",
            pickup_location: trnPickup.trim(),
            dropoff_location: trnDropoff.trim(),
            travel_date: trnDate,
            travel_time: trnTime,
            service_date: fullServiceDate,
            passenger_count: trnPax,
            pax_count: trnPax,
            vehicle_preference: trnVehicle,
            vehicle_name: trnVehicle,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Transport enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("[OtherServicesEnquiryFlow] Submit error:", err);
      toast.error(err?.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFlow = () => {
    setSubmittedRef(null);
    setCurrentStep(1);
    setRtReturnOrigin("");
    setRtReturnDestination("");
    setRtReturnDate("");
    setRtOutboundFlight("");
    setRtReturnFlight("");
    setNotes("");
  };

  if (submittedRef) {
    const serviceTitles = {
      "round-trip": "Round Trip Flight",
      ticketing: "Air Ticketing",
      transport: "Ground Transport",
    };
    return (
      <EnquirySuccessCard
        bookingRef={submittedRef}
        serviceTitle={serviceTitles[selectedService]}
        passengerName={`${firstName} ${lastName}`.trim()}
        onReset={handleResetFlow}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-950 text-white text-[11px] font-bold">
            {currentStep}
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900" style={display}>
              {currentStep === 1 && "Step 1 — Customer Details"}
              {currentStep === 2 && "Step 2 — Service Selection"}
              {currentStep === 3 && `Step 3 — ${selectedService === "round-trip" ? "Round Trip" : selectedService === "ticketing" ? "Ticketing" : "Transport"} Details`}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Enquiry-only request • No advance payment required
            </p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-end">
          {[
            { step: 1, label: "Customer" },
            { step: 2, label: "Service" },
            { step: 3, label: "Details" },
          ].map(({ step, label }) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step === 1) setCurrentStep(1);
                  if (step === 2 && validateCustomerStep()) setCurrentStep(2);
                  if (step === 3 && validateCustomerStep()) setCurrentStep(3);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all ${
                  isActive
                    ? "bg-slate-950 text-white shadow-2xs"
                    : isCompleted
                    ? "bg-lime-50 text-lime-800 border border-lime-200 hover:bg-lime-100 cursor-pointer"
                    : "text-slate-400 bg-slate-100 hover:text-slate-600"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3 h-3 text-lime-600" /> : <span>{step}.</span>}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Customer Details */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className={FIELD_CONTAINER}>
              <label className={LABEL}>
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>First Name</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (customerErrors.firstName) setCustomerErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                placeholder="First name"
                className={`${INPUT} ${customerErrors.firstName ? "border-red-400 focus:border-red-500" : ""}`}
              />
              {customerErrors.firstName && (
                <span className="text-[11px] text-red-500 font-medium">{customerErrors.firstName}</span>
              )}
            </div>

            {/* Last Name */}
            <div className={FIELD_CONTAINER}>
              <label className={LABEL}>
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Name</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (customerErrors.lastName) setCustomerErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                placeholder="Last name"
                className={`${INPUT} ${customerErrors.lastName ? "border-red-400 focus:border-red-500" : ""}`}
              />
              {customerErrors.lastName && (
                <span className="text-[11px] text-red-500 font-medium">{customerErrors.lastName}</span>
              )}
            </div>

            {/* Email Address */}
            <div className={FIELD_CONTAINER}>
              <label className={LABEL}>
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Address</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (customerErrors.email) setCustomerErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Email address"
                className={`${INPUT} ${customerErrors.email ? "border-red-400 focus:border-red-500" : ""}`}
              />
              {customerErrors.email && (
                <span className="text-[11px] text-red-500 font-medium">{customerErrors.email}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className={FIELD_CONTAINER}>
              <label className={LABEL}>
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Phone Number</span>
                <span className="text-lime-600 font-bold">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (customerErrors.phone) setCustomerErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="Phone number"
                className={`${INPUT} ${customerErrors.phone ? "border-red-400 focus:border-red-500" : ""}`}
              />
              {customerErrors.phone && (
                <span className="text-[11px] text-red-500 font-medium">{customerErrors.phone}</span>
              )}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onBackToAirport}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={mono}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Flight Booking</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromCustomer}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              style={mono}
            >
              <span>Continue to Service Selection</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Service Selection */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Select Your Required Service
            </h4>
            <p className="text-xs text-slate-500">
              Choose one of the 3 specialised services below to provide your journey requirements:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              {
                id: "round-trip" as const,
                title: "Round Trip",
                desc: "Outbound and return flight bookings with custom itineraries and timings.",
                icon: ArrowRightLeft,
                tag: "Flights & Itineraries",
              },
              {
                id: "ticketing" as const,
                title: "Ticketing",
                desc: "Direct or one-way airline ticketing, seat selections and fare consultation.",
                icon: Ticket,
                tag: "Air Ticketing",
              },
              {
                id: "transport" as const,
                title: "Transport",
                desc: "Executive chauffeur, luxury SUVs and city-to-airport seamless transfers.",
                icon: Car,
                tag: "Ground Chauffeur",
              },
            ].map(({ id, title, desc, icon: Icon, tag }) => {
              const isSelected = selectedService === id;
              return (
                <div
                  key={id}
                  onClick={() => setSelectedService(id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-slate-950 bg-slate-50/70 shadow-sm"
                      : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl ${isSelected ? "bg-slate-950 text-lime-400" : "bg-slate-100 text-slate-700"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSelected ? "bg-lime-100 text-lime-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {tag}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-950">{title}</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? "text-slate-950 font-bold" : "text-slate-500"}>
                      {isSelected ? "Selected" : "Select this service"}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-lime-400" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 2 Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={mono}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Details</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromService}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              style={mono}
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Service-Specific Details */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
          {/* Customer Summary Chip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-900">{firstName} {lastName}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-mono text-[11px]">{phone}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-mono font-bold uppercase text-lime-700 hover:underline cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          {/* SERVICE 1: ROUND TRIP */}
          {selectedService === "round-trip" && (
            <div className="space-y-4">
              {/* Origin & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
                    <span>From Airport</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={rtOrigin}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => {
                      const formatted = formatAirportOption(ap);
                      setRtOrigin(formatted);
                      if (!rtReturnDestination) setRtReturnDestination(formatted);
                    }}
                  />
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneLanding className="w-3.5 h-3.5 text-slate-500" />
                    <span>To Airport</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={rtDestination}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => {
                      const formatted = formatAirportOption(ap);
                      setRtDestination(formatted);
                      if (!rtReturnOrigin) setRtReturnOrigin(formatted);
                    }}
                  />
                </div>
              </div>

              {/* Return Journey (Origin & Destination) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
                    <span>Return From</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={rtReturnOrigin || rtDestination}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => setRtReturnOrigin(formatAirportOption(ap))}
                  />
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneLanding className="w-3.5 h-3.5 text-slate-500" />
                    <span>Return To</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={rtReturnDestination || rtOrigin}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => setRtReturnDestination(formatAirportOption(ap))}
                  />
                </div>
              </div>

              {/* Travel Dates & Optional Flight Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Outbound Date */}
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Departure Date</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <Popover open={rtDepCalendarOpen} onOpenChange={setRtDepCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={DATE_BTN}>
                        <CalendarDays className="absolute left-3 w-4 h-4 text-slate-400" />
                        <span className={rtDepartureDate ? "text-slate-900" : "text-slate-400"}>
                          {rtDepartureDate && isValid(new Date(rtDepartureDate))
                            ? format(new Date(rtDepartureDate), "EEE, dd MMM yyyy")
                            : "Select date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={rtDepartureDate && isValid(new Date(rtDepartureDate)) ? new Date(rtDepartureDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setRtDepartureDate(format(date, "yyyy-MM-dd"));
                            setRtDepCalendarOpen(false);
                          }
                        }}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Return Date</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <Popover open={rtRetCalendarOpen} onOpenChange={setRtRetCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={DATE_BTN}>
                        <CalendarDays className="absolute left-3 w-4 h-4 text-slate-400" />
                        <span className={rtReturnDate ? "text-slate-900" : "text-slate-400"}>
                          {rtReturnDate && isValid(new Date(rtReturnDate))
                            ? format(new Date(rtReturnDate), "EEE, dd MMM yyyy")
                            : "Select date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={rtReturnDate && isValid(new Date(rtReturnDate)) ? new Date(rtReturnDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setRtReturnDate(format(date, "yyyy-MM-dd"));
                            setRtRetCalendarOpen(false);
                          }
                        }}
                        disabled={{ before: rtDepartureDate && isValid(new Date(rtDepartureDate)) ? new Date(rtDepartureDate) : new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Outbound Flight Number (Optional) */}
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <span>Flight Number (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={rtOutboundFlight}
                    onChange={(e) => setRtOutboundFlight(e.target.value.toUpperCase())}
                    placeholder="Enter flight number"
                    className={INPUT}
                  />
                </div>

                {/* Return Flight Number (Optional) */}
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <span>Flight Number (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={rtReturnFlight}
                    onChange={(e) => setRtReturnFlight(e.target.value.toUpperCase())}
                    placeholder="Enter flight number"
                    className={INPUT}
                  />
                </div>
              </div>

              {/* Number of Passengers & Additional Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Passengers</span>
                  </label>
                  <div className="flex items-center h-12 rounded-2xl border border-slate-300 px-3 justify-between">
                    <span className="text-xs font-semibold text-slate-900">{rtPax} Guest{rtPax > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRtPax((p) => Math.max(1, p - 1))}
                        disabled={rtPax <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setRtPax((p) => Math.min(20, p + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <span>Additional Requirements</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional requirements"
                    className={INPUT}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SERVICE 2: TICKETING */}
          {selectedService === "ticketing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
                    <span>From Airport</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={tktOrigin}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => setTktOrigin(formatAirportOption(ap))}
                  />
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <PlaneLanding className="w-3.5 h-3.5 text-slate-500" />
                    <span>To Airport</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <IntelligentAirportAutocomplete
                    mode="global"
                    value={tktDestination}
                    inputClassName={INPUT}
                    placeholder="Select airport"
                    onSelect={(ap) => setTktDestination(formatAirportOption(ap))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Departure Date</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <Popover open={tktCalendarOpen} onOpenChange={setTktCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={DATE_BTN}>
                        <CalendarDays className="absolute left-3 w-4 h-4 text-slate-400" />
                        <span className={tktDate ? "text-slate-900" : "text-slate-400"}>
                          {tktDate && isValid(new Date(tktDate))
                            ? format(new Date(tktDate), "EEE, dd MMM yyyy")
                            : "Select date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={tktDate && isValid(new Date(tktDate)) ? new Date(tktDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setTktDate(format(date, "yyyy-MM-dd"));
                            setTktCalendarOpen(false);
                          }
                        }}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Passengers</span>
                  </label>
                  <div className="flex items-center h-12 rounded-2xl border border-slate-300 px-3 justify-between">
                    <span className="text-xs font-semibold text-slate-900">{tktPax} Guest{tktPax > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTktPax((p) => Math.max(1, p - 1))}
                        disabled={tktPax <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setTktPax((p) => Math.min(20, p + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <span>Additional Requirements</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional requirements"
                    className={INPUT}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SERVICE 3: TRANSPORT (Strictly zero price) */}
          {selectedService === "transport" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pickup Location</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={trnPickup}
                    onChange={(e) => setTrnPickup(e.target.value)}
                    placeholder="Enter pickup location"
                    className={INPUT}
                  />
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span>Drop-off Destination</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={trnDropoff}
                    onChange={(e) => setTrnDropoff(e.target.value)}
                    placeholder="Enter drop-off destination"
                    className={INPUT}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Departure Date</span>
                    <span className="text-lime-600 font-bold">*</span>
                  </label>
                  <Popover open={trnCalendarOpen} onOpenChange={setTrnCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={DATE_BTN}>
                        <CalendarDays className="absolute left-3 w-4 h-4 text-slate-400" />
                        <span className={trnDate ? "text-slate-900" : "text-slate-400"}>
                          {trnDate && isValid(new Date(trnDate))
                            ? format(new Date(trnDate), "EEE, dd MMM yyyy")
                            : "Select date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={trnDate && isValid(new Date(trnDate)) ? new Date(trnDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setTrnDate(format(date, "yyyy-MM-dd"));
                            setTrnCalendarOpen(false);
                          }
                        }}
                        disabled={{ before: new Date() }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pickup Time</span>
                  </label>
                  <input
                    type="time"
                    value={trnTime}
                    onChange={(e) => setTrnTime(e.target.value)}
                    className={INPUT}
                  />
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Passengers</span>
                  </label>
                  <div className="flex items-center h-12 rounded-2xl border border-slate-300 px-3 justify-between">
                    <span className="text-xs font-semibold text-slate-900">{trnPax} Guest{trnPax > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTrnPax((p) => Math.max(1, p - 1))}
                        disabled={trnPax <= 1}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrnPax((p) => Math.min(10, p + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className={FIELD_CONTAINER}>
                  <label className={LABEL}>
                    <span>Vehicle Preference</span>
                    <span className="text-slate-400 text-[10px] font-normal">(Opt)</span>
                  </label>
                  <select
                    value={trnVehicle}
                    onChange={(e) => setTrnVehicle(e.target.value)}
                    className={`${INPUT} cursor-pointer`}
                  >
                    <option value="Executive Sedan">Executive Sedan</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="Executive MPV / Van">Executive MPV / Van</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Additional Requirements</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional requirements"
                  className={INPUT}
                />
              </div>
            </div>
          )}

          {/* Step 3 Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={mono}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Service Selection</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              style={mono}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-lime-400" />
                  <span>Submit Enquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
