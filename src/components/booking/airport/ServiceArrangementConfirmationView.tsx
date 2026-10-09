import React from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { AirportServiceType } from "@/lib/api/multiServiceApi";

export interface ServiceArrangementConfirmationViewProps {
  serviceQuerySuccessRef: string | null;
  phone: string;
  email: string;
  selectedServices: AirportServiceType[];
  cleanOrigin: string;
  originCode: string;
  cleanDest: string;
  destCode: string;
  cleanTransit: string;
  transitCode: string;
  airportCode: string;
}

export const ServiceArrangementConfirmationView: React.FC<ServiceArrangementConfirmationViewProps> = ({
  serviceQuerySuccessRef,
  phone,
  email,
  selectedServices,
  cleanOrigin,
  originCode,
  cleanDest,
  destCode,
  cleanTransit,
  transitCode,
  airportCode,
}) => {
  return (
    <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Service Arrangement Requested
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Reference: <strong>{serviceQuerySuccessRef}</strong>
            </span>
          </div>
        </div>
        <div className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-mono font-bold text-amber-900 self-start sm:self-auto">
          Pending Arrangement • ₹0 Payable Now
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <AlertCircle size={16} className="text-amber-700" />
          <span>“We will arrange your service at this airport and inform you shortly.”</span>
        </div>
        <p className="text-amber-800 leading-relaxed font-sans">
          Our 24/7 VIP Concierge team has received your travel request. A dedicated journey manager will contact you at <strong>{phone}</strong> and <strong>{email}</strong> shortly to coordinate your arrangements.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="font-mono text-xs uppercase font-bold text-slate-600">
          Requested Airport Services
        </h3>
        <div className="space-y-2">
          {selectedServices.map((st) => {
            const sApt =
              st === "DEPARTURE"
                ? cleanOrigin || originCode
                : st === "ARRIVAL"
                  ? cleanDest || destCode
                  : cleanTransit || transitCode || airportCode;
            return (
              <div key={st} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                <span className="font-bold text-slate-900">
                  {st === "DEPARTURE" ? "Departure" : st === "ARRIVAL" ? "Arrival" : "Transit"} Service ({sApt || "Airport"})
                </span>
                <span className="font-mono text-amber-700 font-bold">Pending Arrangement</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
        >
          <span>Return to Home</span>
        </Link>
        <a
          href={`https://wa.me/919599087959?text=${encodeURIComponent(
            `Hi Shafsky Team, I requested service arrangement ${serviceQuerySuccessRef} for ${cleanOrigin} to ${cleanDest}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition"
        >
          <span>WhatsApp Concierge Desk</span>
        </a>
      </div>
    </div>
  );
};
