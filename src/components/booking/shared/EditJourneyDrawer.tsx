import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plane, Calendar, Clock, Check } from "lucide-react";
import { FlightData } from "@/services/flight/FlightTypes";
import { IntelligentAirlineAutocomplete } from "./IntelligentAirlineAutocomplete";
import { IntelligentAirportAutocomplete } from "./IntelligentAirportAutocomplete";
import { IntelligentFlightNumberAutocomplete } from "./IntelligentFlightNumberAutocomplete";

interface EditJourneyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flightData: FlightData | null;
  serviceDate: string;
  onSave: (updatedData: {
    flightNum: string;
    airlineName: string;
    depCode: string;
    arrCode: string;
    date: string;
    time: string;
    isManual: boolean;
  }) => void;
}

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };
const sansFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function EditJourneyDrawer({
  isOpen,
  onClose,
  flightData,
  serviceDate,
  onSave,
}: EditJourneyDrawerProps) {
  const [airlineName, setAirlineName] = useState(flightData?.carrier?.name || "");
  const [flightNum, setFlightNum] = useState(flightData?.flightNum || "");
  const [depCode, setDepCode] = useState(flightData?.origin?.code || "DEL");
  const [arrCode, setArrCode] = useState(flightData?.destination?.code || "BOM");
  const [date, setDate] = useState(serviceDate || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      flightNum: flightNum.toUpperCase().replace(/\s+/g, ""),
      airlineName,
      depCode: depCode.toUpperCase(),
      arrCode: arrCode.toUpperCase(),
      date,
      time,
      isManual: true,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Side Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900" style={sansFont}>
                      Edit Journey Details
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono" style={monoFont}>
                      Update your flight without leaving your booking
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Airline Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                    Airline
                  </label>
                  <IntelligentAirlineAutocomplete
                    value={airlineName}
                    onChangeText={setAirlineName}
                    onSelect={(a) => setAirlineName(a.name)}
                  />
                </div>

                {/* Flight Number */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                    Flight Number
                  </label>
                  <IntelligentFlightNumberAutocomplete
                    value={flightNum}
                    onChangeText={setFlightNum}
                    onSelect={(f) => setFlightNum(f.flightNum)}
                  />
                </div>

                {/* Departure Airport */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                    Departure Airport
                  </label>
                  <IntelligentAirportAutocomplete
                    value={depCode}
                    onChangeText={setDepCode}
                    onSelect={(ap) => setDepCode(ap.code)}
                  />
                </div>

                {/* Arrival Airport */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                    Arrival Airport
                  </label>
                  <IntelligentAirportAutocomplete
                    value={arrCode}
                    onChangeText={setArrCode}
                    onSelect={(ap) => setArrCode(ap.code)}
                  />
                </div>

                {/* Travel Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1" style={monoFont}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-purple-900 text-amber-400 text-xs font-bold font-mono shadow-md inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
