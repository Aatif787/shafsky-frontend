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

const FIELD_CONTAINER = "flex flex-col gap-1";
const LABEL =
  "text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";
const INPUT =
  "h-11 w-full rounded-xl border border-slate-300 bg-white/70 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-11 w-full items-center rounded-xl border border-slate-300 bg-white/70 pl-9 pr-3 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none cursor-pointer";

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
  // Service Selection State (Defaults to initialService, preserved on switch)
  const [selectedService, setSelectedService] = useState<OtherServiceType>(initialService);

  // Customer Details State
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

  // Round Trip State
  const [rtOrigin, setRtOrigin] = useState(initialOrigin);
  const [rtDestination, setRtDestination] = useState(initialDestination);
  const [rtReturnOrigin, setRtReturnOrigin] = useState("");
  const [rtReturnDestination, setRtReturnDestination] = useState("");
  const [rtDepartureDate, setRtDepartureDate] = useState(initialDate);
  const [rtReturnDate, setRtReturnDate] = useState("");
  const [rtOutboundFlight, setRtOutboundFlight] = useState("");
  const [rtReturnFlight, setRtReturnFlight] = useState("");
  const [rtPax, setRtPax] = useState(Math.max(1, initialPax));

  // Ticketing State
  const [tktOrigin, setTktOrigin] = useState(initialOrigin);
  const [tktDestination, setTktDestination] = useState(initialDestination);
  const [tktDate, setTktDate] = useState(initialDate);
  const [tktPax, setTktPax] = useState(Math.max(1, initialPax));

  // Transport State
  const [trnPickup, setTrnPickup] = useState(initialOrigin ? `${initialOrigin} Airport` : "");
  const [trnDropoff, setTrnDropoff] = useState(initialDestination || "");
  const [trnDate, setTrnDate] = useState(initialDate);
  const [trnTime, setTrnTime] = useState("10:00");
  const [trnPax, setTrnPax] = useState(Math.max(1, initialPax));
  const [trnVehicle, setTrnVehicle] = useState("Executive Sedan");

  // Common Additional Requirements
  const [notes, setNotes] = useState("");

  // Popover Calendar States
  const [rtDepCalendarOpen, setRtDepCalendarOpen] = useState(false);
  const [rtRetCalendarOpen, setRtRetCalendarOpen] = useState(false);
  const [tktCalendarOpen, setTktCalendarOpen] = useState(false);
  const [trnCalendarOpen, setTrnCalendarOpen] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Customer Validation
  const validateCustomerDetails = (): boolean => {
    const errs: typeof customerErrors = {};
    if (!firstName.trim()) {
      errs.firstName = "First name is required.";
    }
    if (!lastName.trim()) {
      errs.lastName = "Last name is required.";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "A valid email is required.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!phone.trim() || cleanPhone.length < 7) {
      errs.phone = "Valid phone required (7+ digits).";
    }

    setCustomerErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all customer contact details.");
      return false;
    }
    return true;
  };

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCustomerDetails()) {
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Service-specific validation
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

  const SERVICE_OPTIONS: { id: OtherServiceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "round-trip", label: "Round Trip", icon: ArrowRightLeft },
    { id: "ticketing", label: "Ticketing", icon: Ticket },
    { id: "transport", label: "Transport", icon: Car },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-5 animate-in fade-in duration-200"
    >
      {/* 1. CUSTOMER DETAILS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5" style={mono}>
            <User className="w-3.5 h-3.5 text-lime-600" />
            <span>Customer Details</span>
          </label>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Enquiry Request • ₹0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* First Name */}
          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <span>First Name</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (customerErrors.firstName) setCustomerErrors((p) => ({ ...p, firstName: undefined }));
              }}
              placeholder="First name"
              className={`${INPUT} ${customerErrors.firstName ? "border-red-400 focus:border-red-500" : ""}`}
            />
            {customerErrors.firstName && (
              <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <span>Last Name</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (customerErrors.lastName) setCustomerErrors((p) => ({ ...p, lastName: undefined }));
              }}
              placeholder="Last name"
              className={`${INPUT} ${customerErrors.lastName ? "border-red-400 focus:border-red-500" : ""}`}
            />
            {customerErrors.lastName && (
              <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.lastName}</span>
            )}
          </div>

          {/* Email Address */}
          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Email Address</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (customerErrors.email) setCustomerErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Email address"
              className={`${INPUT} ${customerErrors.email ? "border-red-400 focus:border-red-500" : ""}`}
            />
            {customerErrors.email && (
              <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Phone Number</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (customerErrors.phone) setCustomerErrors((p) => ({ ...p, phone: undefined }));
              }}
              placeholder="Phone number"
              className={`${INPUT} ${customerErrors.phone ? "border-red-400 focus:border-red-500" : ""}`}
            />
            {customerErrors.phone && (
              <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SERVICE SELECTION */}
      <div className="space-y-2 pt-1 border-t border-slate-200/80">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5" style={mono}>
          <Sparkles className="w-3.5 h-3.5 text-lime-600" />
          <span>Select Service</span>
        </label>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {SERVICE_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedService === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedService(id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 h-11 px-2 sm:px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950"
                }`}
                style={mono}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-lime-400" : "text-slate-500"}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC SERVICE-SPECIFIC FIELDS */}
      <div className="pt-1 border-t border-slate-200/80">
        {/* OPTION 1: ROUND TRIP */}
        {selectedService === "round-trip" && (
          <div className="space-y-3">
            {/* Outbound Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneTakeoff className="w-3 h-3 text-slate-500" />
                  <span>From Airport</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={rtOrigin}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => {
                    const formatted = formatAirportOption(ap);
                    setRtOrigin(formatted);
                    if (!rtReturnDestination) setRtReturnDestination(formatted);
                  }}
                  onChangeText={(txt) => setRtOrigin(txt)}
                />
              </div>

              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneLanding className="w-3 h-3 text-slate-500" />
                  <span>To Airport</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={rtDestination}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => {
                    const formatted = formatAirportOption(ap);
                    setRtDestination(formatted);
                    if (!rtReturnOrigin) setRtReturnOrigin(formatted);
                  }}
                  onChangeText={(txt) => setRtDestination(txt)}
                />
              </div>
            </div>

            {/* Return Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneTakeoff className="w-3 h-3 text-slate-500" />
                  <span>Return From</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={rtReturnOrigin || rtDestination}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => setRtReturnOrigin(formatAirportOption(ap))}
                  onChangeText={(txt) => setRtReturnOrigin(txt)}
                />
              </div>

              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneLanding className="w-3 h-3 text-slate-500" />
                  <span>Return To</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={rtReturnDestination || rtOrigin}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => setRtReturnDestination(formatAirportOption(ap))}
                  onChangeText={(txt) => setRtReturnDestination(txt)}
                />
              </div>
            </div>

            {/* Travel Dates & Optional Flight Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Departure Date */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <CalendarDays className="w-3 h-3 text-slate-500" />
                  <span>Departure Date</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <Popover open={rtDepCalendarOpen} onOpenChange={setRtDepCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={DATE_BTN}>
                      <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
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
                  <CalendarDays className="w-3 h-3 text-slate-500" />
                  <span>Return Date</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <Popover open={rtRetCalendarOpen} onOpenChange={setRtRetCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={DATE_BTN}>
                      <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
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

              {/* Outbound Flight Number */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Flight Number</span>
                  <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  type="text"
                  value={rtOutboundFlight}
                  onChange={(e) => setRtOutboundFlight(e.target.value.toUpperCase())}
                  placeholder="Enter flight number"
                  className={INPUT}
                />
              </div>

              {/* Return Flight Number */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Return Flight</span>
                  <span className="text-slate-400 font-normal">(Opt)</span>
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

            {/* Passengers & Additional Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>Passengers</span>
                </label>
                <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
                  <span className="text-xs font-semibold text-slate-900">{rtPax} Guest{rtPax > 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRtPax((p) => Math.max(1, p - 1))}
                      disabled={rtPax <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setRtPax((p) => Math.min(20, p + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Additional Requirements</span>
                  <span className="text-slate-400 font-normal">(Opt)</span>
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

        {/* OPTION 2: TICKETING */}
        {selectedService === "ticketing" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneTakeoff className="w-3 h-3 text-slate-500" />
                  <span>From Airport</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={tktOrigin}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => setTktOrigin(formatAirportOption(ap))}
                  onChangeText={(txt) => setTktOrigin(txt)}
                />
              </div>

              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <PlaneLanding className="w-3 h-3 text-slate-500" />
                  <span>To Airport</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <IntelligentAirportAutocomplete
                  mode="global"
                  value={tktDestination}
                  inputClassName={INPUT}
                  placeholder="Select airport"
                  showIcon={false}
                  onSelect={(ap) => setTktDestination(formatAirportOption(ap))}
                  onChangeText={(txt) => setTktDestination(txt)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Travel Date */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <CalendarDays className="w-3 h-3 text-slate-500" />
                  <span>Travel Date</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <Popover open={tktCalendarOpen} onOpenChange={setTktCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={DATE_BTN}>
                      <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
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

              {/* Passengers */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>Passengers</span>
                </label>
                <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
                  <span className="text-xs font-semibold text-slate-900">{tktPax} Guest{tktPax > 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTktPax((p) => Math.max(1, p - 1))}
                      disabled={tktPax <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setTktPax((p) => Math.min(20, p + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Additional Requirements</span>
                  <span className="text-slate-400 font-normal">(Opt)</span>
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

        {/* OPTION 3: TRANSPORT */}
        {selectedService === "transport" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <Car className="w-3 h-3 text-slate-500" />
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
                  <Car className="w-3 h-3 text-slate-500" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Date */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <CalendarDays className="w-3 h-3 text-slate-500" />
                  <span>Date</span>
                  <span className="text-lime-600 font-bold">*</span>
                </label>
                <Popover open={trnCalendarOpen} onOpenChange={setTrnCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={DATE_BTN}>
                      <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
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

              {/* Time */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  value={trnTime}
                  onChange={(e) => setTrnTime(e.target.value)}
                  className={INPUT}
                />
              </div>

              {/* Passengers */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>Passengers</span>
                </label>
                <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
                  <span className="text-xs font-semibold text-slate-900">{trnPax} Guest{trnPax > 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTrnPax((p) => Math.max(1, p - 1))}
                      disabled={trnPax <= 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrnPax((p) => Math.min(10, p + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle Preference */}
              <div className={FIELD_CONTAINER}>
                <label className={LABEL}>
                  <span>Vehicle Preference</span>
                  <span className="text-slate-400 font-normal">(Opt)</span>
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

            {/* Additional Requirements */}
            <div className={FIELD_CONTAINER}>
              <label className={LABEL}>
                <span>Additional Requirements</span>
                <span className="text-slate-400 font-normal">(Opt)</span>
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
      </div>

      {/* 4. ACTIONS: BACK & SUBMIT */}
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
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
  );
};
