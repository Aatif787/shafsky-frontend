import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Car,
  Users,
  Calendar,
  MapPin,
  Navigation,
  Mail,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { TRANSPORT_OPTIONS } from "@/data/transportation/options";
import type {
  TransportationVehicleItem,
  TransportOptionId,
} from "@/data/transportation/types";

export interface TransportBookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialVehicle?: TransportationVehicleItem | null;
  initialCategory?: TransportOptionId;
  mode?: "enquiry" | "callback";
  inline?: boolean;
}

const CATEGORIES: TransportOptionId[] = [
  "Luxury Vehicles",
  "MUV / Large Vehicles",
  "Economy / Standard",
];

export const TransportBookingModal: React.FC<TransportBookingModalProps> = ({
  isOpen = true,
  onClose = () => {},
  initialVehicle,
  initialCategory,
  mode = "enquiry",
  inline = false,
}) => {
  const queryClient = useQueryClient();

  // Category & Vehicle Selection
  const [selectedCategory, setSelectedCategory] = useState<TransportOptionId>(
    () => (inline ? "Luxury Vehicles" : (initialVehicle?.category || initialCategory || "Luxury Vehicles"))
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    if (inline) return "";
    if (initialVehicle?.id) return initialVehicle.id;
    return "";
  });

  // 10 Requested Fields:
  // 1. Name
  const [name, setName] = useState("");
  // 2. Email
  const [email, setEmail] = useState("");
  // 3. Mobile Number
  const [phone, setPhone] = useState("");
  // 4. Vehicle Type (controlled via selectedCategory & selectedVehicleId)
  // 5. Number of Passengers
  const [passengers, setPassengers] = useState(2);
  // 6. Number of Vehicles
  const [vehicles, setVehicles] = useState(1);
  // 7. Date
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  // 8. Pickup Location
  const [pickup, setPickup] = useState("");
  // 9. Drop Location
  const [dropoff, setDropoff] = useState("");
  // 10. Optional Message
  const [message, setMessage] = useState("");

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingRef: string;
    vehicleName: string;
    category: string;
    passengerName: string;
    date: string;
  } | null>(null);

  // Sync state whenever modal opens or props change (modal mode only)
  useEffect(() => {
    if (inline) return;
    if (isOpen) {
      if (initialVehicle) {
        setSelectedCategory(initialVehicle.category);
        setSelectedVehicleId(initialVehicle.id);
      } else if (initialCategory) {
        setSelectedCategory(initialCategory);
        const cat = TRANSPORT_OPTIONS.find((o) => o.id === initialCategory);
        if (cat?.vehicles?.[0]) {
          setSelectedVehicleId(cat.vehicles[0].id);
        }
      }
      setBookingResult(null);
    }
  }, [isOpen, initialVehicle, initialCategory, inline]);

  // List of vehicles in active category
  const activeCategoryVehicles = useMemo(() => {
    const cat = TRANSPORT_OPTIONS.find((o) => o.id === selectedCategory);
    return cat?.vehicles || [];
  }, [selectedCategory]);

  // Active vehicle object (only resolved if user has selected a vehicle)
  const activeVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return (
      activeCategoryVehicles.find((v) => v.id === selectedVehicleId) ||
      null
    );
  }, [activeCategoryVehicles, selectedVehicleId]);

  // Handle category change
  const handleCategoryChange = (cat: TransportOptionId) => {
    setSelectedCategory(cat);
    if (inline) {
      setSelectedVehicleId(""); // Keep unselected so user chooses explicitly
    } else {
      const targetCat = TRANSPORT_OPTIONS.find((o) => o.id === cat);
      if (targetCat?.vehicles && targetCat.vehicles.length > 0) {
        setSelectedVehicleId(targetCat.vehicles[0].id);
      }
    }
  };

  if (!inline && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter passenger/contact full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid mobile number with country code.");
      return;
    }
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle model.");
      return;
    }
    if (!pickup.trim()) {
      toast.error("Please enter the pickup location.");
      return;
    }
    if (!dropoff.trim()) {
      toast.error("Please enter the drop location.");
      return;
    }
    if (!date) {
      toast.error("Please select the booking date.");
      return;
    }

    const vehicleName = activeVehicle?.name || "Premium Fleet Vehicle";
    const fullServiceDate = date.trim();

    setIsSubmitting(true);
    try {
      const notesArray: string[] = [];
      if (mode === "callback") {
        notesArray.push("[CALL REQUEST: Immediate Concierge Callback Desired]");
      }
      if (message.trim()) {
        notesArray.push(message.trim());
      }
      notesArray.push(`Vehicle: ${vehicleName} (Count: ${vehicles})`);
      notesArray.push(`Passengers: ${passengers}`);

      const res = await enquiryApi.submit({
        passengerName: name.trim(),
        passengerEmail: email.trim().toLowerCase(),
        passengerPhone: phone.trim(),
        serviceCategory: "Ground Transport",
        serviceType: vehicleName,
        origin: pickup.trim(),
        destination: dropoff.trim(),
        serviceDate: fullServiceDate,
        notes: notesArray.join(" | "),
        details: {
          vehicle_id: activeVehicle?.id || selectedVehicleId,
          vehicle_name: vehicleName,
          vehicle_category: selectedCategory,
          passenger_count: passengers,
          vehicle_count: vehicles,
          pickup_location: pickup.trim(),
          dropoff_location: dropoff.trim(),
          service_date: fullServiceDate,
          mode,
          internal_providers: activeVehicle?.providers || [],
        },
      });

      if (res.success && res.data?.bookingRef) {
        setBookingResult({
          bookingRef: res.data.bookingRef,
          vehicleName,
          category: selectedCategory,
          passengerName: name.trim(),
          date: fullServiceDate,
        });

        // Invalidate admin bookings cache so it immediately reflects in admin portal
        queryClient.invalidateQueries({ queryKey: ["admin-bookings-list"] });
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });

        toast.success(`Booking ${res.data.bookingRef} registered successfully!`);
      } else {
        const errorMsg =
          !res.success && "error" in res
            ? String(res.error)
            : "Failed to submit transport reservation. Please try again.";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("[TransportBookingModal] Error submitting enquiry:", err);
      toast.error(
        err?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppConciergeLink = () => {
    const ref = bookingResult?.bookingRef || "NEW";
    const text = encodeURIComponent(
      `Hello Shafsky Aviation Concierge Desk,\n\nI have submitted a Ground Transport booking.\n` +
        `• Booking Reference: ${ref}\n` +
        `• Lead Passenger: ${name}\n` +
        `• Contact Phone: ${phone}\n` +
        `• Vehicle: ${activeVehicle?.name || "Fleet"} (${vehicles} vehicle${vehicles > 1 ? "s" : ""})\n` +
        `• Passengers: ${passengers} Pax\n` +
        `• Travel Date: ${date}\n` +
        `• Pickup: ${pickup}\n` +
        `• Drop: ${dropoff}\n` +
        (message ? `• Notes: ${message}\n\n` : `\n`) +
        `Please confirm our chauffeur dispatch details.`
    );
    return `https://wa.me/919599087959?text=${text}`;
  };

  const modalCard = (
    <div
      className={`relative w-full ${
        inline
          ? "max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
          : "max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-auto"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      {bookingResult || mode === "callback" ? (
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              {mode === "callback" && (
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-widest text-lime-400 bg-lime-950/60 border border-lime-400/30 px-3 py-1 rounded-full">
                  <ShieldCheck size={12} className="text-lime-400" />
                  <span>Direct Callback Request</span>
                </div>
              )}
              <h2
                id="transport-modal-title"
                className="text-xl sm:text-2xl font-black tracking-tight text-white"
              >
                {bookingResult
                  ? "Enquiry Received"
                  : "Request Chauffeur Callback"}
              </h2>
              {bookingResult && (
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Our team will review your request and contact you shortly.
                </p>
              )}
            </div>

            {!inline && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/80 hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ) : !inline ? (
        <div className="flex items-center justify-end px-5 pt-4 sm:px-7 sm:pt-5 pb-0 bg-white">
          <h2 id="transport-modal-title" className="sr-only">
            Transport Reservation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      {/* Modal / Form Body */}
      <div
        className={`p-5 sm:p-7 ${
          inline ? "" : "max-h-[78vh] overflow-y-auto"
        } ${
          !bookingResult && mode !== "callback" && !inline ? "pt-2 sm:pt-3" : ""
        }`}
      >
          {bookingResult ? (
            /* ──────────────── SUCCESS SCREEN ──────────────── */
            <div className="space-y-6 text-center py-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-600 shadow-sm animate-in zoom-in-75 duration-300">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lime-700 bg-lime-50 px-3 py-1 rounded-full border border-lime-200 inline-block">
                  ENQUIRY RECEIVED
                </span>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 pt-1">
                  Reference:
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950 font-mono tracking-wider">
                  {bookingResult.bookingRef}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-1">
                  Our team will review your request and contact you shortly.
                </p>
              </div>

              {/* Summary Dossier Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 text-left space-y-3 font-sans text-xs shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                    Service & Fleet
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {bookingResult.vehicleName} ({vehicles} Unit{vehicles > 1 ? "s" : ""})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                      Schedule
                    </span>
                    <span className="font-semibold text-slate-900">
                      {bookingResult.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">
                      Passengers
                    </span>
                    <span className="font-semibold text-slate-900">
                      {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200/80 space-y-1">
                  <div>
                    <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider block">
                      Pickup Location
                    </span>
                    <span className="font-medium text-slate-900">{pickup}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider block">
                      Drop Location
                    </span>
                    <span className="font-medium text-slate-900">{dropoff}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppConciergeLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-sm transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={inline ? () => setBookingResult(null) : onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <span>{inline ? "Submit Another Request" : "Done / Close"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ──────────────── BOOKING FORM ──────────────── */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Upper Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-950 font-mono">
                    Enquiry
                  </h3>
                </div>
              </div>

              {/* SECTION A: Lead Contact & Passenger Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    Passenger Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="tel"
                        placeholder="Mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Number of Passengers (Shifted into Passenger Details) */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users size={14} className="text-lime-600" />
                      Number of Passengers
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono block">
                      Total passengers traveling
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition cursor-pointer"
                      aria-label="Decrease passenger count"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={passengers}
                      onChange={(e) =>
                        setPassengers(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
                      }
                      className="w-12 text-center py-1 font-mono font-bold text-sm text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.min(50, p + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition cursor-pointer"
                      aria-label="Increase passenger count"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION B: Vehicle Category & Model Selection */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      2. Vehicle Type & Fleet Selection
                    </span>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-3 py-2 rounded-xl text-center text-xs font-mono font-bold transition border cursor-pointer ${
                          isSelected
                            ? "bg-lime-500 text-slate-950 border-lime-600 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Specific Vehicle Model Dropdown */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-600">
                    Specific Vehicle Model
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 appearance-none pr-9 cursor-pointer"
                    >
                      <option value="">Select Vehicle Model</option>
                      {activeCategoryVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.passengerCapacity ? `(Up to ${v.passengerCapacity} Pax)` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>

                  {activeVehicle && (
                    <div className="flex items-center gap-3 pt-1">
                      {activeVehicle.image && (
                        <img
                          src={activeVehicle.image}
                          alt={activeVehicle.name}
                          className="w-14 h-9 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="text-[11px] text-slate-500 leading-tight">
                        <strong className="text-slate-900 block font-sans">
                          {activeVehicle.name}
                        </strong>
                        <span className="font-mono">
                          {activeVehicle.passengerCapacity || 4} Passenger Capacity • Air Conditioned • Chauffeur Driven
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION C: Number of Vehicles */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    3. Number of Vehicles
                  </span>
                </div>

                {/* Vehicle Counter */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Car size={14} className="text-lime-600" />
                      Number of Vehicles
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono block">
                      Fleet units requested
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVehicles((v) => Math.max(1, v - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold flex items-center justify-center transition cursor-pointer"
                      aria-label="Decrease vehicle count"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={vehicles}
                      onChange={(e) =>
                        setVehicles(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
                      }
                      className="w-12 text-center py-1 font-mono font-bold text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setVehicles((v) => Math.min(10, v + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold flex items-center justify-center transition cursor-pointer"
                      aria-label="Increase vehicle count"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION D: Schedule (Date) */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    4. Travel Date
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                    Travel Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition font-mono cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: Route (Pickup Location & Drop Location) */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    5. Pickup & Drop Locations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                      Pickup Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Pickup address, terminal, or city"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-slate-700 mb-1">
                      Drop Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Navigation
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Drop-off address, destination, or terminal"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION F: Optional Message / Special Requests */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-500" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      Special Requests
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Optional
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Flight details, luggage count, chauffeur instructions, or special requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition resize-none"
                />
              </div>

              {/* Form Action Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {!inline && (
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="w-1/2 sm:w-auto px-5 py-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      inline ? "w-full sm:w-auto" : "w-1/2 sm:w-auto"
                    } inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-lime-500 hover:bg-lime-400 active:bg-lime-600 text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === "callback" ? "Request Call" : "Submit"}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
  );

  if (inline) {
    return modalCard;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transport-modal-title"
    >
      {modalCard}
    </div>
  );
};
