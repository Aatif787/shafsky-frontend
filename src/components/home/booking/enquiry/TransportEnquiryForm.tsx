import React, { useState } from "react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import {
  CalendarDays,
  MapPin,
  Car,
  Users,
  Send,
  Loader2,
  FileText,
  User,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { EnquirySuccessCard } from "./EnquirySuccessCard";
import { mono } from "../../theme";

const FIELD_CONTAINER = "flex flex-col gap-1.5";
const LABEL = "h-4 text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";
const INPUT =
  "h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
const DATE_BTN =
  "relative flex h-12 w-full items-center rounded-2xl border border-slate-300 bg-transparent pl-10 pr-4 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";

const VEHICLE_OPTIONS = [
  { value: "Any Vehicle", label: "Any Available Vehicle (Best Fit)" },
  { value: "Luxury Sedan", label: "Luxury Sedan (e.g. Mercedes E-Class, BMW 5-Series)" },
  { value: "Executive SUV", label: "Executive SUV (e.g. Audi Q7, Toyota Fortuner)" },
  { value: "Premium Van", label: "Premium Van / MPV (e.g. Toyota Vellfire, Alphard)" },
  { value: "Ultra Luxury", label: "Ultra Luxury Flagship (e.g. Mercedes S-Class, Maybach)" },
];

interface TransportEnquiryFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialPax?: number;
}

export const TransportEnquiryForm: React.FC<TransportEnquiryFormProps> = ({
  initialOrigin = "",
  initialDestination = "",
  initialDate = "",
  initialPax = 1,
}) => {
  const [pickup, setPickup] = useState(initialOrigin);
  const [dropoff, setDropoff] = useState(initialDestination);
  const [serviceDate, setServiceDate] = useState(initialDate);
  const [serviceTime, setServiceTime] = useState("12:00");
  const [paxCount, setPaxCount] = useState(Math.max(1, initialPax));
  const [vehiclePreference, setVehiclePreference] = useState("Any Vehicle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [dateOpen, setDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup.trim()) {
      toast.error("Please enter a pickup location (airport, hotel, or address).");
      return;
    }
    if (!dropoff.trim()) {
      toast.error("Please enter a drop-off destination.");
      return;
    }
    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) {
      toast.error("Pickup and drop-off locations cannot be identical.");
      return;
    }
    if (!serviceDate) {
      toast.error("Please select a date for transport.");
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

    const combinedDateTime = `${serviceDate} ${serviceTime}`.trim();

    setIsSubmitting(true);
    try {
      const res = await enquiryApi.submit({
        passengerName: name.trim(),
        passengerEmail: email.trim(),
        passengerPhone: phone.trim(),
        serviceCategory: "Ground Transport",
        serviceType: vehiclePreference || "Ground Transport",
        origin: pickup.trim(),
        destination: dropoff.trim(),
        serviceDate: combinedDateTime,
        notes: notes.trim() || undefined,
        details: {
          pickup: pickup.trim(),
          dropoff: dropoff.trim(),
          pickup_location: pickup.trim(),
          dropoff_location: dropoff.trim(),
          service_date: combinedDateTime,
          passenger_count: paxCount,
          vehicle_preference: vehiclePreference,
          vehicle_name: vehiclePreference !== "Any Vehicle" ? vehiclePreference : undefined,
          vehicle_category: vehiclePreference !== "Any Vehicle" ? vehiclePreference : undefined,
        },
      });

      if (res.success && res.data) {
        setSubmittedRef(res.data.bookingRef);
        toast.success(`Transport enquiry registered! Reference: ${res.data.bookingRef}`);
      } else {
        const errMsg = !res.success && res.error ? res.error : "Failed to register transport enquiry. Please try again.";
        toast.error(errMsg);
      }
    } catch (err: any) {
      console.error("[TransportEnquiryForm] Submit error:", err);
      toast.error(err?.message || "Failed to submit transport enquiry. Please try again.");
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
        serviceTitle="Ground Transport"
        passengerName={name}
        onReset={handleReset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      {/* Pickup & Drop-off */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={FIELD_CONTAINER}>
          <label className={LABEL}>
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Pickup Location</span>
            <span className="text-lime-600 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter pickup location"
            className={INPUT}
          />
        </div>

        <div className={FIELD_CONTAINER}>
          <label className={LABEL}>
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Drop-off Destination</span>
            <span className="text-lime-600 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="Enter drop-off destination"
            className={INPUT}
          />
        </div>
      </div>

      {/* Date & Time, Passengers, Vehicle Preference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date */}
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
                <span className={serviceDate ? "text-slate-900" : "text-slate-400 font-normal"}>
                  {serviceDate && isValid(new Date(serviceDate))
                    ? format(new Date(serviceDate), "dd MMM yyyy")
                    : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-slate-200 bg-white shadow-xl rounded-2xl" align="start">
              <CalendarPicker
                mode="single"
                selected={serviceDate ? new Date(serviceDate) : undefined}
                onSelect={(d) => {
                  if (d) {
                    setServiceDate(format(d, "yyyy-MM-dd"));
                    setDateOpen(false);
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time */}
        <div className={FIELD_CONTAINER}>
          <label className={LABEL}>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pickup Time</span>
            <span className="text-lime-600 font-bold">*</span>
          </label>
          <input
            type="time"
            value={serviceTime}
            onChange={(e) => setServiceTime(e.target.value)}
            className={INPUT}
          />
        </div>

        {/* Passengers */}
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
              disabled={paxCount <= 1}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-40"
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

      {/* Vehicle Preference (Optional, strictly no prices displayed) */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Car className="w-3.5 h-3.5 text-slate-500" />
          <span>Vehicle Preference (Optional)</span>
        </label>
        <select
          value={vehiclePreference}
          onChange={(e) => setVehiclePreference(e.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-300 bg-transparent px-4 text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none cursor-pointer"
        >
          {VEHICLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
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
              <span>Registering Transport Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-lime-400" />
              <span>Request Transport Quotation</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
          Enquiry-only request. Our fleet coordination team will provide vehicle availability and quotation.
        </p>
      </div>
    </form>
  );
};
