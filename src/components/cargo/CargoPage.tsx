import React, { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { display, mono } from "@/components/home/theme";
import cargoBannerImg from "@/assets/others/Cargo.jpeg";

const CARGO_LABEL_CLASS =
  "block text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1";

const CARGO_INPUT_CLASS =
  "w-full h-9 px-3 rounded-xl border border-slate-200/90 bg-white/95 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:outline-none shadow-2xs transition-colors";

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

    const trimmedCargoType = cargoType.trim();
    if (!trimmedCargoType) {
      const err = "Please enter the cargo type.";
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
        serviceType: trimmedCargoType,
        origin: origin.trim(),
        destination: destination.trim(),
        notes: cargoDetails.trim(),
        details: {
          cargo_type: trimmedCargoType,
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
    <div className="min-h-screen bg-slate-950 text-slate-900 flex flex-col justify-between selection:bg-lime-200">
      <Navigation visible={true} />

      <div className="relative flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden pt-20 pb-8 sm:pt-22 sm:pb-10 px-4 sm:px-6">
        <img
          src={cargoBannerImg}
          alt="Shafsky Aviation Services Cargo & Freight Logistics"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          loading="eager"
          draggable={false}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/10 to-slate-950/35 pointer-events-none"
          aria-hidden="true"
        />

        <main
          id="main-content"
          className="relative z-10 w-full max-w-[520px] mx-auto"
        >
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/85 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.4)] p-5 sm:p-6 md:p-7">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-200/75">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-extrabold text-[#0b1f4d] tracking-tight leading-none"
                  style={display}
                >
                  Cargo
                </h1>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">
                  Air Freight &amp; Global Logistics Enquiry
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-lime-50 border border-lime-200 text-[10px] font-bold uppercase tracking-wider text-lime-800">
                <ShieldCheck size={12} className="text-lime-600" />
                <span>Priority Desk</span>
              </span>
            </div>

            {submittedRef ? (
              <div className="text-center py-5 bg-white/90 rounded-2xl p-6">
                <div className="w-14 h-14 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto mb-3 text-lime-700 shadow-xs">
                  <CheckCircle2 size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-700">
                  Cargo Enquiry Registered
                </span>
                <h2
                  className="text-2xl font-extrabold text-slate-950 mt-1 mb-2"
                  style={display}
                >
                  Thank You, {fullName.trim()}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5">
                  Your cargo freight enquiry has been registered with our operations desk. A logistics specialist will review your cargo requirements and contact you promptly.
                </p>

                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs sm:text-sm font-bold mb-6">
                  <span className="text-slate-500 font-normal">Reference:</span>
                  <span className="text-lime-700">{submittedRef}</span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Submit Another Cargo Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {submitError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50/95 border border-red-200 text-red-800 text-xs font-medium">
                    <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cargo-full-name" className={CARGO_LABEL_CLASS}>
                      Full Name *
                    </label>
                    <input
                      id="cargo-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className={CARGO_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cargo-email" className={CARGO_LABEL_CLASS}>
                      Email *
                    </label>
                    <input
                      id="cargo-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className={CARGO_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Cargo Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cargo-phone" className={CARGO_LABEL_CLASS}>
                      Phone Number *
                    </label>
                    <PhoneInput
                      id="cargo-phone"
                      value={phone}
                      onChange={setPhone}
                      placeholder="Enter phone number"
                      wrapperClassName="w-full h-9 [&>button]:bg-white/95 [&>button]:border-slate-200/90"
                      className="h-9 px-3 rounded-r-xl border border-slate-200/90 bg-white/95 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:outline-none shadow-2xs transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="cargo-type" className={CARGO_LABEL_CLASS}>
                      Cargo Type *
                    </label>
                    <input
                      id="cargo-type"
                      type="text"
                      required
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      placeholder="Enter cargo type"
                      className={CARGO_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Row 3: Origin & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cargo-origin" className={CARGO_LABEL_CLASS}>
                      Origin *
                    </label>
                    <input
                      id="cargo-origin"
                      type="text"
                      required
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Origin city or airport"
                      className={CARGO_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cargo-destination" className={CARGO_LABEL_CLASS}>
                      Destination *
                    </label>
                    <input
                      id="cargo-destination"
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Destination city or airport"
                      className={CARGO_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Row 4: Cargo Details */}
                <div>
                  <label htmlFor="cargo-details" className={CARGO_LABEL_CLASS}>
                    Cargo Details *
                  </label>
                  <textarea
                    id="cargo-details"
                    required
                    rows={2}
                    value={cargoDetails}
                    onChange={(e) => setCargoDetails(e.target.value)}
                    placeholder="Describe shipment weight, dimensions, packaging, or special handling instructions"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/90 bg-white/95 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:bg-white focus:outline-none shadow-2xs transition-colors resize-none"
                  />
                </div>

                {/* Row 5: Submit Enquiry Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-[#76C000] hover:bg-lime-500 text-slate-950 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md transition disabled:opacity-50 cursor-pointer"
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
      </div>

      <Footer />
    </div>
  );
}
