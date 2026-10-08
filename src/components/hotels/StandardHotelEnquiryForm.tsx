import React, { useState } from "react";
import { Calendar, User, Phone, Mail, Send, Loader2, CheckCircle2, MessageSquare, Copy, Check } from "lucide-react";
import { enquiryApi } from "@/lib/api/enquiryApi";

/**
 * Standard hotel enquiry form (enquiry-only — no booking, no payment, no pricing).
 *
 * Used by hotel pages that are quote/enquiry based. The enquiry is persisted to the
 * backend FIRST and only then is WhatsApp opened, so the admin Bookings desk always
 * receives the enquiry even if the WhatsApp hand-off fails.
 *
 * This component is presentation + submit only: the caller owns the dialog shell so
 * each hotel keeps its own modal chrome, animation and responsive behaviour.
 */
export interface StandardHotelEnquiryFormProps {
  /** Hotel name shown in the enquiry record and the WhatsApp message. */
  hotelName: string;
  /** WhatsApp destination in international format, digits only (e.g. "919217522660"). */
  whatsAppNumber: string;
  /** Optional location line shown under the heading (e.g. "DEL Terminal 3"). */
  locationLabel?: string;
  /** Called after a successful submit when the customer dismisses the success state. */
  onClose?: () => void;
}

const GUEST_OPTIONS = [
  { value: "1", label: "1 Adult (Single Occupancy)" },
  { value: "2", label: "2 Adults (Double Occupancy)" },
  { value: "3", label: "3 Adults (Triple Occupancy)" },
  { value: "4", label: "4 Adults (Family Occupancy)" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function StandardHotelEnquiryForm({
  hotelName,
  whatsAppNumber,
  locationLabel,
  onClose,
}: StandardHotelEnquiryFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState("2");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enquiryRef, setEnquiryRef] = useState("");
  const [copied, setCopied] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // guards double submit

    const name = guestName.trim();
    const phone = guestPhone.trim();
    const email = guestEmail.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone) {
      setError("Please enter your phone / WhatsApp number.");
      return;
    }
    if (!email) {
      setError("Please enter your email address — we send the quotation to it.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!checkIn) {
      setError("Please select your check-in date.");
      return;
    }
    if (!checkOut) {
      setError("Please select your check-out date.");
      return;
    }
    if (checkOut < checkIn) {
      setError("Check-out date cannot be before the check-in date.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    let officialRef = `SHAF-HTL-${Date.now().toString().slice(-6)}`;
    let persisted = false;

    try {
      const res = await enquiryApi.submit({
        passengerName: name,
        passengerEmail: email,
        passengerPhone: phone,
        serviceCategory: "Travel Support",
        serviceType: "Hotel Booking",
        destination: hotelName,
        serviceDate: checkIn,
        notes: `Hotel enquiry — ${hotelName} | Check-in: ${checkIn} | Check-out: ${checkOut} | Guests: ${guestCount}`,
        details: {
          hotel_name: hotelName,
          check_in: checkIn,
          check_out: checkOut,
          guest_count: guestCount,
          enquiry_type: "hotel_enquiry",
        },
      });

      if (res.success && res.data) {
        persisted = true;
        const returned = res.data.bookingRef || (res.data as any).booking_ref;
        if (returned) officialRef = returned;
      } else {
        const message = "error" in res && res.error ? res.error : null;
        setError(message || "Could not submit the enquiry. Please try again.");
      }
    } catch (err) {
      console.error("Hotel enquiry could not be registered:", err);
      setError("Could not submit the enquiry. Please check your connection and try again.");
    }

    if (!persisted) {
      setIsSubmitting(false);
      return;
    }

    setEnquiryRef(officialRef);
    setIsSubmitting(false);

    // WhatsApp is only the communication channel — it runs after the enquiry is saved.
    const text = encodeURIComponent(
      `*New Hotel Enquiry — Shafsky Aviation*\n` +
        `*Reference ID: ${officialRef}*\n\n` +
        `🏨 *Hotel:* ${hotelName}\n` +
        `📅 *Check-in:* ${checkIn}\n` +
        `📅 *Check-out:* ${checkOut}\n` +
        `👥 *Guests:* ${guestCount} Adult(s)\n\n` +
        `👤 *Guest Details:*\n` +
        `• *Name:* ${name}\n` +
        `• *Phone:* ${phone}\n` +
        `• *Email:* ${email}\n\n` +
        `Please share availability and a quotation.`,
    );

    try {
      window.open(`https://wa.me/${whatsAppNumber}?text=${text}`, "_blank");
    } catch (err) {
      console.error("WhatsApp hand-off failed; the enquiry is already saved:", err);
    }
  };

  const handleCopyRef = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(enquiryRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (enquiryRef) {
    return (
      <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>

        <div>
          <h4 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl">
            Enquiry Submitted
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1">
            Your enquiry has been received. Our concierge desk will share availability and a
            quotation shortly.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Enquiry Reference
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wide">
                {enquiryRef}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Enquiry Pending — Not a Confirmed Booking
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200/60 text-xs text-slate-700 space-y-1.5">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Hotel:</span>
              <span className="font-semibold text-slate-900 text-right">{hotelName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Check-in:</span>
              <span className="font-semibold text-slate-900 text-right">{checkIn}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Check-out:</span>
              <span className="font-semibold text-slate-900 text-right">{checkOut}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Guests:</span>
              <span className="font-semibold text-slate-900 text-right">{guestCount} Adult(s)</span>
            </div>
          </div>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
          <a
            href={`https://wa.me/${whatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquare size={15} />
            <span>Open WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Full name"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="tel"
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="Mobile number"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Check-in Date *</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              required
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full pl-10 pr-2 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Check-out Date *</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              required
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full pl-10 pr-2 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Number of Guests</label>
        <select
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d63b8]"
        >
          {GUEST_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {locationLabel && (
        <p className="text-[11px] text-slate-500">Enquiry for {locationLabel} — our desk will confirm availability.</p>
      )}

      {error && (
        <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#1d63b8] hover:bg-[#165099] disabled:opacity-75 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Submit Enquiry</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default StandardHotelEnquiryForm;
