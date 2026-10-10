import React, { useState } from "react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import {
  CalendarDays,
  PlaneTakeoff,
  PlaneLanding,
  Users,
  Send,
  Loader2,
  FileText,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { EnquirySuccessCard } from "./EnquirySuccessCard";
import { mono } from "../../theme";

const FIELD_CONTAINER = "flex flex-col gap-1.5";
const LABEL = "h-4 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";
const INPUT =
  "h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-12 w-full items-center rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";

interface TicketingEnquiryFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialPax?: number;
}

export const TicketingEnquiryForm: React.FC<TicketingEnquiryFormProps> = ({
  initialOrigin = "",
  initialDestination = "",
  initialDate = "",
  initialPax = 1,
}) => {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [travelDate, setTravelDate] = useState(initialDate);
  const [paxCount, setPaxCount] = useState(Math.max(1, initialPax));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [dateOpen, setDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin.trim()) {
      toast.error("Please specify your departure airport or city.");
      return;
    }
    if (!destination.trim()) {
      toast.error("Please specify your arrival airport or city.");
      return;
    }
    if (origin.trim().toUpperCase() === destination.trim().toUpperCase()) {
      toast.error("Origin and destination cannot be identical.");
      return;
    }
    if (!travelDate) {
      toast.error("Please select a travel date.");
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
      toast.error("Please provide a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await enquiryApi.submit({
        passengerName: name.trim(),
        passengerEmail: email.trim(),
        passengerPhone: phone.trim(),
        serviceCategory: "Ticketing",
        serviceType: "Air Ticketing",
        origin: origin.trim(),
        destination: destination.trim(),
        serviceDate: travelDate,
        notes: notes.trim() || undefined,
        details: {
          origin: origin.trim(),
          destination: destination.trim(),
          travel_date: travelDate,
          passenger_count: paxCount,
        },
      });

      if (res.success && res.data) {
        setSubmittedRef(res.data.bookingRef);
        toast.success(`Ticketing enquiry registered! Reference: ${res.data.bookingRef}`);
      } else {
        const errMsg = !res.success && res.error ? res.error : "Failed to register ticketing enquiry. Please try again.";
        toast.error(errMsg);
      }
    } catch (err: any) {
      console.error("[TicketingEnquiryForm] Submit error:", err);
      toast.error(err?.message || "Failed to submit ticketing enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setNotes("");
  };

  if (submittedRef) {
    return (
      <EnquirySuccessCard
        bookingRef={submittedRef}
        serviceTitle="Air Ticketing"
        passengerName={name}
        onReset={handleReset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
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
            value={origin}
            inputClassName={INPUT}
            placeholder="Select airport"
            onSelect={(ap) => setOrigin(formatAirportOption(ap))}
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
            value={destination}
            inputClassName={INPUT}
            placeholder="Select airport"
            onSelect={(ap) => setDestination(formatAirportOption(ap))}
          />
        </div>
      </div>

      {/* Travel Date & Passengers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={FIELD_CONTAINER}>
          <label className={LABEL}>
            <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
            <span>Departure Date</span>
            <span className="text-lime-600 font-bold">*</span>
          </label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={DATE_BTN}>
                <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <span className={travelDate ? "text-slate-900" : "text-slate-400 font-normal"}>
                  {travelDate && isValid(new Date(travelDate))
                    ? format(new Date(travelDate), "dd MMM yyyy")
                    : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-slate-200 bg-white shadow-xl rounded-2xl" align="start">
              <CalendarPicker
                mode="single"
                selected={travelDate ? new Date(travelDate) : undefined}
                onSelect={(d) => {
                  if (d) {
                    setTravelDate(format(d, "yyyy-MM-dd"));
                    setDateOpen(false);
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className={FIELD_CONTAINER}>
          <label className={LABEL}>
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Passengers</span>
            <span className="text-lime-600 font-bold">*</span>
          </label>
          <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-300 px-3">
            <button
              type="button"
              onClick={() => setPaxCount((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {paxCount} {paxCount === 1 ? "Passenger" : "Passengers"}
            </span>
            <button
              type="button"
              onClick={() => setPaxCount((p) => Math.min(20, p + 1))}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="pt-2 border-t border-slate-200">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-3" style={mono}>
          Customer Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Name</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className={INPUT}
            />
          </div>

          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className={INPUT}
            />
          </div>

          <div className={FIELD_CONTAINER}>
            <label className={LABEL}>
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Phone Number</span>
              <span className="text-lime-600 font-bold">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className={INPUT}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Additional Requirements</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional requirements"
          className="w-full rounded-2xl border border-slate-300 bg-transparent p-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-slate-950 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          style={mono}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
              <span>Submitting Ticketing Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-lime-400" />
              <span>Request Ticketing Quotation</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
          Enquiry-only request. Our ticketing specialists will find the best fares and itineraries for you.
        </p>
      </div>
    </form>
  );
};
