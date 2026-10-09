import React from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";
import { AirportServiceType } from "@/lib/api/multiServiceApi";
import { AirportPackageItem } from "./types";

export interface TripContextBannerProps {
  airportCityName: string;
  airportCode: string;
  selectedPackageName: string;
  travelType: "domestic" | "international";
  direction: "arrival" | "departure" | "transit";
  dateValue: Date;
  totalPax: number;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  convertedTotalPrice: number;
  selectedCurrency: string;
  isPackagesLoading: boolean;
  availablePackages: AirportPackageItem[];
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  setSelectedPackageName: (name: string) => void;
  setSelectedPackagePrice: (price: string) => void;
  setPackageByService: React.Dispatch<React.SetStateAction<Record<AirportServiceType, string>>>;
}

export const TripContextBanner: React.FC<TripContextBannerProps> = ({
  airportCityName,
  airportCode,
  selectedPackageName,
  travelType,
  direction,
  dateValue,
  totalPax,
  paxAdults,
  paxChildren,
  paxInfants,
  convertedTotalPrice,
  selectedCurrency,
  isPackagesLoading,
  availablePackages,
  selectedPackageId,
  setSelectedPackageId,
  setSelectedPackageName,
  setSelectedPackagePrice,
  setPackageByService,
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500 text-slate-950 font-bold font-mono text-xs">
            ✓
          </span>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Selected Airport Service
            </span>
            <span className="font-serif text-base sm:text-lg font-bold text-slate-900">
              {airportCityName} ({airportCode})
            </span>
          </div>
        </div>

        <Link
          to="/airports/$code"
          params={{ code: airportCode }}
          hash="available-services"
          className="text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 underline cursor-pointer"
        >
          Change Service
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-slate-600">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
          {selectedPackageName}
        </span>
        <span>•</span>
        <span className="capitalize">
          {travelType} {direction}
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1.5 bg-lime-50 text-slate-900 border border-lime-300/80 px-2 py-0.5 rounded-md font-bold">
          <CalendarDays size={12} className="text-lime-700" />
          <span>{format(dateValue, "dd MMM yyyy")}</span>
        </span>
        <span>•</span>
        <span>
          <strong>{totalPax}</strong> Pax ({paxAdults}A{paxChildren ? `, ${paxChildren}C` : ""}
          {paxInfants ? `, ${paxInfants}I` : ""})
        </span>
        <span>•</span>
        <span className="text-lime-700 font-bold">
          {formatPrice(convertedTotalPrice, selectedCurrency)} total
        </span>
      </div>

      {isPackagesLoading ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/80 animate-pulse">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Loading packages:
          </span>
          <div className="h-7 w-28 rounded-full bg-slate-200" />
          <div className="h-7 w-32 rounded-full bg-slate-200" />
          <div className="h-7 w-28 rounded-full bg-slate-200" />
        </div>
      ) : availablePackages.length > 1 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/80">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Available Packages:
          </span>
          {availablePackages.map((pkg) => {
            const isSelected = pkg.id.toLowerCase() === (selectedPackageId || "").toLowerCase();
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  setSelectedPackageName(pkg.title);
                  setSelectedPackagePrice(String(pkg.basePrice));
                  setPackageByService((prev) => ({
                    ...prev,
                    [(direction || "departure").toUpperCase()]: pkg.id,
                  }));
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-lime-400 font-bold shadow-sm ring-1 ring-lime-400/40"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{pkg.title}</span>
                <span className={isSelected ? "text-lime-300 font-semibold" : "text-slate-500"}>
                  • ₹{pkg.basePrice.toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
