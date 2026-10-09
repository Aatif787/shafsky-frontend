import React from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Copy, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { MultiServiceAvailabilityResponse } from "@/lib/api/multiServiceApi";

export interface BookingConfirmationViewProps {
  confirmedBookingRef: string;
  paymentTransactionId: string | null;
  convertedTotalPrice: number;
  selectedCurrency: string;
  airportCityName: string;
  airportCode: string;
  selectedPackageName: string;
  direction: "arrival" | "departure" | "transit";
  travelType: "domestic" | "international";
  originCode: string;
  destCode: string;
  dateValue: Date;
  dateValue2: Date;
  activeFlight: string;
  activeFlight1: string;
  activeFlight2: string;
  fullName: string;
  totalPax: number;
  phone: string;
  email: string;
  multiServiceResponse: MultiServiceAvailabilityResponse | null;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  confirmedBookingRef,
  paymentTransactionId,
  convertedTotalPrice,
  selectedCurrency,
  airportCityName,
  airportCode,
  selectedPackageName,
  direction,
  travelType,
  originCode,
  destCode,
  dateValue,
  dateValue2,
  activeFlight,
  activeFlight1,
  activeFlight2,
  fullName,
  totalPax,
  phone,
  email,
  multiServiceResponse,
}) => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-lime-400 bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-8 text-center text-white sm:px-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 text-slate-950 shadow-md">
            <CheckCircle2 size={32} />
          </div>
          <span className="rounded-full bg-lime-500/20 px-3 py-1 font-mono text-[10.5px] font-extrabold uppercase tracking-widest text-lime-400 border border-lime-400/30">
            Payment Successful • Booking Confirmed
          </span>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome Begins Before You Land.
          </h2>
          <p className="mt-1.5 text-xs text-slate-300 font-medium">
            Your VIP concierge reservation at {airportCityName} has been confirmed.
          </p>
        </div>

        {/* Booking Ref & Payment ID Card */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Booking Reference
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-slate-950 tracking-wider">
              {confirmedBookingRef}
            </div>
            {paymentTransactionId && (
              <span className="font-mono text-[10.5px] text-lime-800 font-bold block mt-0.5">
                Razorpay Payment ID: {paymentTransactionId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-lime-500 px-3 py-1 text-xs font-mono font-bold text-slate-950">
              {formatPrice(convertedTotalPrice, selectedCurrency)} PAID
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(confirmedBookingRef);
                toast.success("Booking reference copied to clipboard.");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition"
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Details Summary Table */}
        <div className="px-6 py-6 sm:px-10 space-y-4">
          {direction === "transit" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Transit Hub & Service
                </span>
                <span className="font-bold text-slate-900 block font-sans">
                  {airportCityName} ({airportCode})
                </span>
                <span className="text-[11px] text-slate-600 font-medium font-sans">
                  {selectedPackageName}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Route & Category
                </span>
                <span className="font-mono font-bold text-slate-900 block">
                  {originCode} ➔ {airportCode} ➔ {destCode}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium capitalize">
                  {travelType} Transit
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Incoming Flight (Leg 1)
                </span>
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  {activeFlight1}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium">
                  {format(dateValue, "dd MMM yyyy")}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Connecting Flight (Leg 2)
                </span>
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  {activeFlight2}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium">
                  {format(dateValue2, "dd MMM yyyy")}
                </span>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Lead Guest & Passengers
                </span>
                <span className="font-bold text-slate-900 block truncate font-sans">
                  {fullName}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium">
                  {totalPax} Passenger{totalPax > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Airport & Service
                </span>
                <span className="font-bold text-slate-900 block font-sans">
                  {airportCityName} ({airportCode})
                </span>
                <span className="text-[11px] text-slate-600 font-medium font-sans">
                  {selectedPackageName}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Journey & Date
                </span>
                <span className="font-bold text-slate-900 block capitalize font-sans">
                  {travelType} {direction}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium">
                  {format(dateValue, "dd MMM yyyy")}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Flight
                </span>
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  {activeFlight}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                  Lead Guest & Passengers
                </span>
                <span className="font-bold text-slate-900 block truncate font-sans">
                  {fullName}
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-medium">
                  {totalPax} Passenger{totalPax > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {multiServiceResponse && multiServiceResponse.unavailable_services_count > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle size={16} className="text-amber-700 shrink-0" />
                <span>Pending Service Arrangement (Not Confirmed)</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {multiServiceResponse.services.filter((s) => s.status === "REQUEST_REQUIRED").map((us) => (
                  <div key={`${us.service_type}-${us.airport_code}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white/90 border border-amber-200 gap-1">
                    <span className="font-bold text-amber-950">
                      {us.service_type === "DEPARTURE" ? "Departure" : us.service_type === "ARRIVAL" ? "Arrival" : "Transit"} Service ({us.airport_code})
                    </span>
                    <span className="text-[11px] text-amber-900 font-semibold">
                      “We will arrange your service at this airport and inform you shortly.”
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] text-amber-800 leading-relaxed font-sans pt-1">
                Your available airport services are confirmed and paid. The unavailable service(s) above have been saved as a pending arrangement request linked to booking <strong>{confirmedBookingRef}</strong>. Our operations team will contact you shortly.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-lime-200 bg-lime-50/50 p-4 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-lime-900">
              <ShieldCheck size={16} className="text-lime-700" />
              <span>Next Steps</span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
              Our airport concierge team will reach out on your contact number (<strong>{phone}</strong>) and email (<strong>{email}</strong>) prior to flight departure or arrival to coordinate your meeting point.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
            >
              <span>Return to Home</span>
            </Link>

            <a
              href={`https://wa.me/919599087959?text=${encodeURIComponent(
                `Hi Shafsky Team, I just confirmed and paid booking ${confirmedBookingRef} for ${selectedPackageName} at ${airportCode}. Payment ID: ${paymentTransactionId}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition"
            >
              <span>WhatsApp Support Desk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
