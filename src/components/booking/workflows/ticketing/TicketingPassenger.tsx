import React, { useState, useEffect } from "react";
import { ArrowRight, User, Phone, Mail, FileText, ChevronDown, ChevronUp, Check, AlertCircle, Sparkles, Info, ShieldAlert, Globe } from "lucide-react";
import { toast } from "sonner";
import { TicketingPassengerData, TicketingJourneyData, IndividualPassenger } from "../../hooks/useTicketingWorkflow";

interface TicketingPassengerProps {
  data: TicketingPassengerData;
  journeyData?: TicketingJourneyData;
  onChange: (fields: Partial<TicketingPassengerData>) => void;
  onBack: () => void;
  onNext: () => void;
}

function detectItineraryType(fromAirport?: string, toAirport?: string): "DOMESTIC" | "INTERNATIONAL" {
  if (!fromAirport || !toAirport) return "DOMESTIC";

  const getCountryCode = (str: string): string => {
    const u = str.toUpperCase();
    if (
      u.includes("LHR") || u.includes("LONDON") ||
      u.includes("DXB") || u.includes("DUBAI") ||
      u.includes("SIN") || u.includes("SINGAPORE") ||
      u.includes("JFK") || u.includes("NEW YORK") ||
      u.includes("CDG") || u.includes("PARIS") ||
      u.includes("DOH") || u.includes("DOHA") ||
      u.includes("FRA") || u.includes("FRANKFURT") ||
      u.includes("SYD") || u.includes("SYDNEY") ||
      u.includes("HND") || u.includes("TOKYO") ||
      u.includes("AUH") || u.includes("ABU DHABI") ||
      u.includes("BKK") || u.includes("BANGKOK") ||
      u.includes("HKG") || u.includes("HONG KONG") ||
      u.includes("KUL") || u.includes("KUALA LUMPUR") ||
      u.includes("ZRH") || u.includes("ZURICH") ||
      u.includes("IST") || u.includes("ISTANBUL") ||
      u.includes("UK") || u.includes("USA") || u.includes("UAE") || u.includes("QATAR")
    ) {
      return "INTL";
    }
    return "IN";
  };

  const fromCode = getCountryCode(fromAirport);
  const toCode = getCountryCode(toAirport);

  if (fromCode === "IN" && toCode === "IN") {
    return "DOMESTIC";
  }
  return "INTERNATIONAL";
}

export function TicketingPassenger({ data, journeyData, onChange, onBack, onNext }: TicketingPassengerProps) {
  const paxAdults = journeyData?.paxAdults || 1;
  const paxChildren = journeyData?.paxChildren || 0;
  const paxInfants = journeyData?.paxInfants || 0;
  const totalPax = paxAdults + paxChildren + paxInfants;

  const itineraryType = detectItineraryType(journeyData?.fromAirport, journeyData?.toAirport);
  const isInternational = itineraryType === "INTERNATIONAL";

  // Initialize or align passenger list based on counts
  const [passengers, setPassengers] = useState<IndividualPassenger[]>(() => {
    if (data.passengersList && data.passengersList.length === totalPax) {
      return data.passengersList;
    }

    const list: IndividualPassenger[] = [];
    let pNum = 1;

    for (let i = 0; i < paxAdults; i++) {
      list.push({
        id: `pax-${pNum}`,
        type: "Adult",
        passengerNumber: pNum,
        firstName: i === 0 && data.fullName ? data.fullName.split(" ")[0] || "" : "",
        lastName: i === 0 && data.fullName ? data.fullName.split(" ").slice(1).join(" ") || "" : "",
        gender: "",
        dateOfBirth: "",
        nationality: "Indian",
        passportNumber: "",
        passportExpiry: "",
        passportIssuingCountry: "India",
        frequentFlyerNumber: "",
      });
      pNum++;
    }

    for (let i = 0; i < paxChildren; i++) {
      list.push({
        id: `pax-${pNum}`,
        type: "Child",
        passengerNumber: pNum,
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        nationality: "Indian",
        passportNumber: "",
        passportExpiry: "",
        passportIssuingCountry: "India",
        frequentFlyerNumber: "",
      });
      pNum++;
    }

    for (let i = 0; i < paxInfants; i++) {
      list.push({
        id: `pax-${pNum}`,
        type: "Infant",
        passengerNumber: pNum,
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        nationality: "Indian",
        passportNumber: "",
        passportExpiry: "",
        passportIssuingCountry: "India",
        frequentFlyerNumber: "",
      });
      pNum++;
    }

    return list;
  });

  // Track expanded accordion card (card 1 expanded by default)
  const [expandedId, setExpandedId] = useState<string>("pax-1");

  // Keep parent state synced
  useEffect(() => {
    onChange({ passengersList: passengers });
  }, [passengers]);

  const updateIndividualPassenger = (id: string, fields: Partial<IndividualPassenger>) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...fields } : p))
    );
  };

  const isPassengerComplete = (p: IndividualPassenger) => {
    const baseComplete = Boolean(
      p.firstName.trim() &&
        p.lastName.trim() &&
        p.gender &&
        p.dateOfBirth &&
        p.nationality.trim()
    );

    if (!isInternational) {
      return baseComplete;
    }

    return (
      baseComplete &&
      Boolean(p.passportNumber && p.passportNumber.trim()) &&
      Boolean(p.passportExpiry) &&
      Boolean(p.passportIssuingCountry && p.passportIssuingCountry.trim())
    );
  };

  const completedCount = passengers.filter(isPassengerComplete).length;

  const handleContinue = () => {
    if (!data.fullName || !data.fullName.trim()) {
      toast.error("Please enter Lead Contact Full Name.");
      return;
    }
    if (!data.phone || !data.phone.trim()) {
      toast.error("Please enter Lead Contact Phone.");
      return;
    }
    if (!data.email || !data.email.trim()) {
      toast.error("Please enter Lead Contact Email.");
      return;
    }

    // Validate every individual passenger
    for (const p of passengers) {
      if (!isPassengerComplete(p)) {
        setExpandedId(p.id);
        if (isInternational && (!p.passportNumber || !p.passportExpiry || !p.passportIssuingCountry)) {
          toast.error(
            `Passport details required for Passenger ${p.passengerNumber} (${p.type}) on international route.`
          );
        } else {
          toast.error(
            `Please complete required details for Passenger ${p.passengerNumber} (${p.type}).`
          );
        }
        return;
      }
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            Step 2 of 3 — Passenger Manifest
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
            Passenger & Contact Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
            Lead contact and individual manifest for commercial airline e-ticket issuance.
          </p>
        </div>

        {/* Progress Counter Badge */}
        <div className="px-4 py-2 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-right">
          <span className="text-[10px] font-mono uppercase text-emerald-800 tracking-wider block font-bold">
            Manifest Status
          </span>
          <span className="text-xs font-mono font-bold text-emerald-900">
            Completed {completedCount} of {totalPax} Passenger(s)
          </span>
        </div>
      </div>

      {/* Dynamic Itinerary Route Banner */}
      {isInternational ? (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center gap-3 text-xs text-amber-900 font-sans font-medium shadow-xs">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>International Journey Detected:</strong> Passport details are required before ticket issuance.
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 flex items-center gap-3 text-xs text-blue-900 font-sans font-medium shadow-xs">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Domestic Journey Detected:</strong> Passport details are not required.
          </span>
        </div>
      )}

      {/* 1. Lead Contact Section */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">
              Lead Contact & Booking Organizer
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <input
              type="checkbox"
              checked={data.isCorporateBooking || false}
              onChange={(e) => onChange({ isCorporateBooking: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Booking on behalf of someone else?</span>
          </label>
        </div>

        {data.isCorporateBooking && (
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-emerald-900 uppercase tracking-wider font-bold mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={data.companyName || ""}
                onChange={(e) => onChange({ companyName: e.target.value })}
                placeholder="e.g. Sterling Global Holdings"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-slate-900 text-sm font-sans font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-emerald-900 uppercase tracking-wider font-bold mb-1">
                Traveller Relationship *
              </label>
              <select
                value={data.travellerRelationship || "Employee"}
                onChange={(e) => onChange({ travellerRelationship: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-slate-900 text-sm font-sans font-medium"
              >
                <option value="Employee">Executive Employee</option>
                <option value="Executive">C-Suite / Board Member</option>
                <option value="Client">VIP Client</option>
                <option value="Family">Family / Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-emerald-900 uppercase tracking-wider font-bold mb-1">
                Employee / Cost Center Ref
              </label>
              <input
                type="text"
                value={data.employeeReference || ""}
                onChange={(e) => onChange({ employeeReference: e.target.value })}
                placeholder="e.g. CC-90821"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-emerald-200 text-slate-900 text-sm font-mono font-bold"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
              Lead Contact Name *
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => {
                const name = e.target.value;
                onChange({ fullName: name });
                if (passengers.length > 0) {
                  const parts = name.split(" ");
                  updateIndividualPassenger(passengers[0].id, {
                    firstName: parts[0] || "",
                    lastName: parts.slice(1).join(" ") || "",
                  });
                }
              }}
              placeholder="e.g. Lord Henry Sterling"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+44 7700 900077"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="guest@shafskyaviation.com"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Dynamic Multi-Passenger Accordions */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
          Individual Passenger Manifest Details ({totalPax} Passengers)
        </h3>

        {passengers.map((p) => {
          const isExpanded = expandedId === p.id;
          const complete = isPassengerComplete(p);

          return (
            <div
              key={p.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                complete
                  ? "border-emerald-200 bg-white"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? "" : p.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                      complete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    P{p.passengerNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-sans">
                        {p.firstName || p.lastName
                          ? `${p.firstName} ${p.lastName}`.trim()
                          : `Passenger ${p.passengerNumber}`}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {p.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {p.gender ? `${p.gender} • ` : ""}
                      {p.nationality || "Indian"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {complete ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Complete</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>Incomplete</span>
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-white space-y-5">
                  {/* Basic Personal Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={p.firstName}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Given Name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={p.lastName}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Surname"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        Gender *
                      </label>
                      <select
                        value={p.gender}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            gender: e.target.value as any,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={p.dateOfBirth}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        value={p.nationality}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            nationality: e.target.value,
                          })
                        }
                        placeholder="e.g. Indian, British, American"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-sans font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold mb-1">
                        Frequent Flyer # (Optional)
                      </label>
                      <input
                        type="text"
                        value={p.frequentFlyerNumber || ""}
                        onChange={(e) =>
                          updateIndividualPassenger(p.id, {
                            frequentFlyerNumber: e.target.value,
                          })
                        }
                        placeholder="e.g. SQ984021"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* International Travel Documents Section */}
                  {isInternational && (
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-700" />
                        <h4 className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">
                          International Travel Documents *
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-amber-900 uppercase tracking-wider font-bold mb-1">
                            Passport Number *
                          </label>
                          <input
                            type="text"
                            value={p.passportNumber || ""}
                            onChange={(e) =>
                              updateIndividualPassenger(p.id, {
                                passportNumber: e.target.value,
                              })
                            }
                            placeholder="e.g. Z8492041"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-900 text-sm font-mono font-bold uppercase focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-amber-900 uppercase tracking-wider font-bold mb-1">
                            Passport Expiry Date *
                          </label>
                          <input
                            type="date"
                            value={p.passportExpiry || ""}
                            onChange={(e) =>
                              updateIndividualPassenger(p.id, {
                                passportExpiry: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-900 text-sm font-mono font-bold focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-amber-900 uppercase tracking-wider font-bold mb-1">
                            Issuing Country *
                          </label>
                          <input
                            type="text"
                            value={p.passportIssuingCountry || "India"}
                            onChange={(e) =>
                              updateIndividualPassenger(p.id, {
                                passportIssuingCountry: e.target.value,
                              })
                            }
                            placeholder="e.g. India"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-900 text-sm font-sans font-medium focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. VIP Assistance & Special Needs Grid Cards */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider block">
          Special Assistance & Accessibility Cards
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: "wheelchair", label: "Wheelchair Assistance" },
            { id: "medical", label: "Medical / Oxygen" },
            { id: "pregnant", label: "Pregnant Traveller" },
            { id: "visual", label: "Visual Assistance" },
            { id: "hearing", label: "Hearing Assistance" },
            { id: "minor", label: "Unaccompanied Minor" },
          ].map((card) => {
            const currentCards = data.specialAssistanceCards || {};
            const isSelected = Boolean(currentCards[card.id as keyof typeof currentCards]);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  const updated = { ...currentCards, [card.id]: !isSelected };
                  onChange({ specialAssistanceCards: updated });
                }}
                className={`p-3.5 rounded-xl text-left border text-xs font-sans font-semibold transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{card.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">
            Dietary Restrictions / Inflight Meal Preferences
          </label>
          <input
            type="text"
            value={data.dietaryRestrictions || ""}
            onChange={(e) => onChange({ dietaryRestrictions: e.target.value })}
            placeholder="e.g. Diabetic meal, Halal, Kosher, Strict Vegan..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-sans font-medium"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
        >
          <span>Personalize & Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
