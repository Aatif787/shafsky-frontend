import React from "react";
import { motion } from "framer-motion";
import { Plane, Calendar, Clock, MapPin, Building2, CheckCircle2, ChevronUp } from "lucide-react";
import { FlightData } from "@/services/flight/FlightTypes";
import { IntelligentAirlineAutocomplete } from "./IntelligentAirlineAutocomplete";
import { IntelligentAirportAutocomplete } from "./IntelligentAirportAutocomplete";
import { IntelligentFlightNumberAutocomplete } from "./IntelligentFlightNumberAutocomplete";

export interface ManualFlightDetails {
  airlineName: string;
  flightNum: string;
  depAirportCode: string;
  depAirportName: string;
  arrAirportCode: string;
  arrAirportName: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  terminal?: string;
}

interface ManualFlightEntryFormProps {
  initialValues?: Partial<ManualFlightDetails>;
  onSubmit: (flightData: FlightData) => void;
  onClose?: () => void;
  direction?: "arrival" | "departure" | "transit";
}

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function ManualFlightEntryForm({
  initialValues,
  onSubmit,
  onClose,
  direction = "arrival",
}: ManualFlightEntryFormProps) {
  const [details, setDetails] = React.useState<ManualFlightDetails>({
    airlineName: initialValues?.airlineName || "",
    flightNum: initialValues?.flightNum || "",
    depAirportCode: initialValues?.depAirportCode || (direction === "arrival" ? "DEL" : ""),
    depAirportName: initialValues?.depAirportName || "",
    arrAirportCode: initialValues?.arrAirportCode || (direction === "departure" ? "DEL" : ""),
    arrAirportName: initialValues?.arrAirportName || "",
    depDate: initialValues?.depDate || new Date().toISOString().split("T")[0],
    depTime: initialValues?.depTime || "12:00",
    arrDate: initialValues?.arrDate || initialValues?.depDate || new Date().toISOString().split("T")[0],
    arrTime: initialValues?.arrTime || "14:30",
    terminal: initialValues?.terminal || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof ManualFlightDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const cleanFlightNum = details.flightNum.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanFlightNum || cleanFlightNum.length < 3) {
      newErrors.flightNum = "Enter a valid flight number (e.g. AI101, 6E224).";
    }

    if (!details.depDate) {
      newErrors.depDate = "Departure date is required.";
    }

    if (!details.depTime) {
      newErrors.depTime = "Departure time is required.";
    }

    const cleanDepCode = (details.depAirportCode || "DEL").trim().toUpperCase();
    const cleanArrCode = (details.arrAirportCode || "BOM").trim().toUpperCase();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const carrierIata = cleanFlightNum.slice(0, 2).toUpperCase();
    const carrierName = details.airlineName.trim() || `${carrierIata} Airways`;

    const depIso = `${details.depDate}T${details.depTime}:00`;
    const arrIso = details.arrDate && details.arrTime ? `${details.arrDate}T${details.arrTime}:00` : depIso;

    const constructedFlightData: FlightData = {
      flightNum: cleanFlightNum,
      carrier: {
        iata: carrierIata,
        name: carrierName,
        logo: `https://images.aviation-edge.com/airline-logos/${carrierIata}.png`,
      },
      origin: {
        code: cleanDepCode,
        name: details.depAirportName || `${cleanDepCode} Airport`,
        city: cleanDepCode === "DEL" ? "Delhi" : cleanDepCode === "BOM" ? "Mumbai" : cleanDepCode,
      },
      destination: {
        code: cleanArrCode,
        name: details.arrAirportName || `${cleanArrCode} Airport`,
        city: cleanArrCode === "DEL" ? "Delhi" : cleanArrCode === "BOM" ? "Mumbai" : cleanArrCode,
      },
      departure: {
        scheduledTime: depIso,
        terminal: details.terminal || null,
        gate: null,
      },
      arrival: {
        scheduledTime: arrIso,
        terminal: null,
        gate: null,
      },
      duration: "Calculated",
      status: "Scheduled (Custom)",
      aircraft: {
        model: "Commercial Flight",
      },
      isManual: true,
    };

    onSubmit(constructedFlightData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5 rounded-2xl border border-white/20 bg-white/60 p-5 md:p-6 backdrop-blur-xl shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-gray-200/60 pb-3.5 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400 shadow-sm">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-slate-900" style={sansFont}>
              Enter Flight Details Manually
            </h4>
            <p className="text-[10px] text-slate-500 font-mono" style={monoFont}>
              Provide your airline and schedule details directly to proceed with booking.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 text-[10px] font-bold text-slate-700 transition"
            style={monoFont}
          >
            <ChevronUp className="h-3.5 w-3.5" />
            <span>Collapse</span>
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Row 1: Airline & Flight Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Airline Name (Smart Autocomplete)
            </label>
            <IntelligentAirlineAutocomplete
              value={details.airlineName}
              onChangeText={(text) => handleChange("airlineName", text)}
              onSelect={(airline) => {
                setDetails((prev) => {
                  let updatedNum = prev.flightNum;
                  if (!updatedNum || !updatedNum.startsWith(airline.iata)) {
                    updatedNum = `${airline.iata}${updatedNum.replace(/^[A-Z0-9]{2,3}/, "")}`;
                  }
                  return {
                    ...prev,
                    airlineName: airline.name,
                    flightNum: updatedNum,
                  };
                });
              }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Flight Number <span className="text-red-500">*</span>
            </label>
            <IntelligentFlightNumberAutocomplete
              value={details.flightNum}
              airlineIata={details.flightNum.slice(0, 2).toUpperCase()}
              onChangeText={(text) => handleChange("flightNum", text)}
              error={errors.flightNum}
              onSelect={(flight) => {
                setDetails((prev) => ({
                  ...prev,
                  flightNum: flight.flightNum,
                  depAirportCode: flight.origin || prev.depAirportCode,
                  arrAirportCode: flight.destination || prev.arrAirportCode,
                  airlineName: flight.airlineName || prev.airlineName,
                }));
              }}
            />
          </div>
        </div>

        {/* Row 2: Departure & Arrival Airports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Departure Airport (Code / City / Name / Country)
            </label>
            <IntelligentAirportAutocomplete
              value={details.depAirportName ? `${details.depAirportName} (${details.depAirportCode})` : details.depAirportCode}
              onChangeText={(text) => handleChange("depAirportCode", text)}
              onSelect={(airport) => {
                setDetails((prev) => ({
                  ...prev,
                  depAirportCode: airport.code,
                  depAirportName: airport.name,
                }));
              }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Arrival Airport (Code / City / Name / Country)
            </label>
            <IntelligentAirportAutocomplete
              value={details.arrAirportName ? `${details.arrAirportName} (${details.arrAirportCode})` : details.arrAirportCode}
              onChangeText={(text) => handleChange("arrAirportCode", text)}
              onSelect={(airport) => {
                setDetails((prev) => ({
                  ...prev,
                  arrAirportCode: airport.code,
                  arrAirportName: airport.name,
                }));
              }}
            />
          </div>
        </div>

        {/* Row 3: Departure Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Departure Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={details.depDate}
                onChange={(e) => handleChange("depDate", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white/80 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={monoFont}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Departure Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="time"
                value={details.depTime}
                onChange={(e) => handleChange("depTime", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white/80 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={monoFont}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Terminal (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Terminal 3"
                value={details.terminal}
                onChange={(e) => handleChange("terminal", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-gray-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={sansFont}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Arrival Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Arrival Date (Optional)
            </label>
            <input
              type="date"
              value={details.arrDate}
              onChange={(e) => handleChange("arrDate", e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              style={monoFont}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
              Arrival Time (Optional)
            </label>
            <input
              type="time"
              value={details.arrTime}
              onChange={(e) => handleChange("arrTime", e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              style={monoFont}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/60 mt-4">
          <p className="text-[10px] text-slate-500 font-mono" style={monoFont}>
            * Custom flight details will be assigned to your VIP concierge order immediately.
          </p>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-purple-900 hover:to-purple-800 text-white px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest shadow-md transition-all duration-200"
            style={monoFont}
          >
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
            <span>Confirm & Continue</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
