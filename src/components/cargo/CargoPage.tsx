import React, { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { display, mono } from "@/components/home/theme";

const CARGO_TYPE_OPTIONS = [
  "General Cargo",
  "Perishables & Cold Chain",
  "Valuable & High-Value Cargo",
  "Dangerous Goods (Hazmat)",
  "Pharma & Temperature-Controlled",
  "Heavy & Oversized Freight",
  "Express Air Freight",
  "Other",
];

export function CargoPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoDetails, setCargoDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || !/^[A-Za-z\s]+$/.test(trimmedName)) {
      const err = "Please enter a valid full name using letters only.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      const err = "Please enter a valid email address.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) {
      const err = "Please enter a valid phone number with country code.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    if (!cargoType) {
      const err = "Please select a cargo type.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    if (!origin.trim()) {
      const err = "Please enter the origin.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    if (!destination.trim()) {
      const err = "Please enter the destination.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    if (!cargoDetails.trim()) {
      const err = "Please provide cargo details.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await enquiryApi.submit({
        passengerName: trimmedName,
        passengerEmail: trimmedEmail,
        passengerPhone: cleanPhone,
        serviceCategory: "Cargo & Logistics",
        serviceType: cargoType,
        origin: origin.trim(),
        destination: destination.trim(),
        notes: cargoDetails.trim(),
        details: {
          cargo_type: cargoType,
          cargo_details: cargoDetails.trim(),
        },
      });

      if (res.success && res.data?.bookingRef) {
        setSubmittedRef(res.data.bookingRef);
        toast.success(`Cargo enquiry submitted! Reference #${res.data.bookingRef}`);
      } else {
        const errorMsg =
          !res.success && "error" in res && res.error
            ? String(res.error)
            : "Failed to submit enquiry. Please try again.";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err?.message || "Something went wrong while submitting your enquiry. Please try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedRef(null);
    setSubmitError(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setCargoType("");
    setOrigin("");
    setDestination("");
    setCargoDetails("");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between selection:bg-lime-200">
      <Navigation visible={true} />

      <main
        id="main-content"
        className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24"
      >
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight mb-8"
          style={display}
        >
          Cargo
        </h1>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] p-6 sm:p-8 md:p-10">
          {submittedRef ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-4 text-lime-700 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <span
                className="text-xs font-mono font-bold uppercase tracking-widest text-lime-700"
                style={mono}
              >
                CARGO ENQUIRY REGISTERED
              </span>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 mb-2"
                style={display}
              >
                Thank You, {fullName.trim()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
                Your cargo freight enquiry has been registered with our operations desk. A logistics specialist will review your cargo requirements and contact you promptly.
              </p>

              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold mb-8">
                <span className="text-slate-500 font-normal">Reference:</span>
                <span className="text-lime-700">{submittedRef}</span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  style={mono}
                >
                  Submit Another Cargo Enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div>
                <label
                  htmlFor="cargo-full-name"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Full Name *
                </label>
                <input
                  id="cargo-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                />
              </div>

              {/* 2. Email */}
              <div>
                <label
                  htmlFor="cargo-email"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Email *
                </label>
                <input
                  id="cargo-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                />
              </div>

              {/* 3. Phone Number */}
              <div>
                <label
                  htmlFor="cargo-phone"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Phone Number *
                </label>
                <PhoneInput
                  id="cargo-phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter phone number"
                />
              </div>

              {/* 4. Cargo Type */}
              <div>
                <label
                  htmlFor="cargo-type"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Cargo Type *
                </label>
                <select
                  id="cargo-type"
                  required
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                >
                  <option value="" disabled>
                    Select cargo type
                  </option>
                  {CARGO_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Origin */}
              <div>
                <label
                  htmlFor="cargo-origin"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Origin *
                </label>
                <input
                  id="cargo-origin"
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Origin city or airport"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                />
              </div>

              {/* 6. Destination */}
              <div>
                <label
                  htmlFor="cargo-destination"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Destination *
                </label>
                <input
                  id="cargo-destination"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination city or airport"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                />
              </div>

              {/* 7. Cargo Details */}
              <div>
                <label
                  htmlFor="cargo-details"
                  className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-2"
                  style={mono}
                >
                  Cargo Details *
                </label>
                <textarea
                  id="cargo-details"
                  required
                  rows={4}
                  value={cargoDetails}
                  onChange={(e) => setCargoDetails(e.target.value)}
                  placeholder="Describe shipment weight, dimensions, packaging, or special handling instructions"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none bg-white shadow-xs"
                />
              </div>

              {/* Submit Enquiry Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
                  style={mono}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <span>Submit Enquiry</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
