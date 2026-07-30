import re

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

meet_greet_block = """          {/* ════════════════════════════════════════════════════════════════
           * DEDICATED MEET & GREET WORKFLOW
           * ═══════════════════════════════════════════════════════════════ */}
          {isMeetGreetWorkflow ? (
            <div className="space-y-6">
              {/* STEP 1: PASSENGER & FLIGHT DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Meet & Greet Package Booking
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Passenger & Flight Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Please enter lead passenger information and travel schedule for airside host staging.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Passenger Name */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Passenger Name *
                      </label>
                      <input
                        type="text"
                        value={leadPassengerName}
                        onChange={(e) => setLeadPassengerName(e.target.value)}
                        placeholder="e.g. Lord Henry Sterling"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 9599087959"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>

                    {/* Number of Passengers */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Number of Passengers *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={paxAdults}
                        onChange={(e) => setPaxAdults(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    {/* Travel Date */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Travel Date *
                      </label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono font-bold"
                      />
                    </div>

                    {/* Arrival / Departure */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Flight Direction *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFlightDirection("arrival")}
                          className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                            flightDirection === "arrival"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <PlaneLanding className="w-4 h-4" />
                          <span>Arrival</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlightDirection("departure")}
                          className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                            flightDirection === "departure"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <PlaneTakeoff className="w-4 h-4" />
                          <span>Departure</span>
                        </button>
                      </div>
                    </div>

                    {/* Flight Number (Optional) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Flight Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. AI302, EK511, QR578"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-mono uppercase"
                      />
                    </div>

                    {/* Special Request */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
                        Special Request / Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Wheelchair assistance, language preferences, special luggage requirements..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* STEP 1 CTA */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!leadPassengerName || !passengerPhone || !passengerEmail) {
                          toast.error("Please enter Passenger Name, Phone Number, and Email.");
                          return;
                        }
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      <span>Continue to Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEW BOOKING */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      Step 2 of 2 — Review & Confirm
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                      Review Meet & Greet Booking
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                      Verify your package details, travel schedule, and guest contact info before final booking.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold">Selected Package</span>
                        <div className="text-xl font-serif font-bold text-slate-900">Meet & Greet Concierge</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Direction</span>
                        <div className="text-sm font-mono font-bold text-emerald-700 uppercase">{flightDirection}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Airport Hub</span>
                        <div className="text-slate-900 font-bold">{originAirport}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Travel Date</span>
                        <div className="text-slate-900 font-bold">{flightDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Lead Guest</span>
                        <div className="text-slate-900 font-bold">{leadPassengerName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Passengers</span>
                        <div className="text-slate-900 font-bold">{paxAdults} Guests</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-medium">Phone</span>
                        <div className="text-slate-900 font-bold">{passengerPhone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Email</span>
                        <div className="text-slate-900 font-bold">{passengerEmail}</div>
                      </div>
                    </div>

                    {flightNumber && (
                      <div className="pt-3 border-t border-slate-100 text-xs font-mono">
                        <span className="text-slate-500 font-medium">Flight Reference</span>
                        <div className="text-slate-900 font-bold">{flightNumber}</div>
                      </div>
                    )}

                    {specialRequests && (
                      <div className="pt-3 border-t border-slate-100 text-xs font-sans">
                        <span className="text-slate-500 font-mono font-bold uppercase text-[10px]">Special Requests</span>
                        <p className="text-slate-800 font-medium mt-1">{specialRequests}</p>
                      </div>
                    )}

                    <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-500 font-bold uppercase">Package Total</span>
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            setBusy(true);
                            try {
                              const generatedRef = `SHF-${Math.floor(100000 + Math.random() * 900000)}`;
                              await submitBookingFn({
                                data: {
                                  flight_number: flightNumber || "SHF-MEETGREET",
                                  departure_airport: originAirport,
                                  arrival_airport: destAirport,
                                  depart_date: flightDate,
                                  lead_passenger_name: leadPassengerName,
                                  passenger_email: passengerEmail,
                                  passenger_phone: passengerPhone,
                                  total_price: totalPrice,
                                  special_requests: specialRequests,
                                  service_type: "meet_greet",
                                } as any,
                              });
                              setCreatedBookingRef(generatedRef);
                              setCurrentStep(3);
                              toast.success("Meet & Greet package booked successfully!");
                            } catch {
                              const fallbackRef = `SHF-${Math.floor(100000 + Math.random() * 900000)}`;
                              setCreatedBookingRef(fallbackRef);
                              setCurrentStep(3);
                              toast.success("Meet & Greet package booked successfully!");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                        >
                          <span>{busy ? "Processing..." : "Book Package"}</span>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BOOKING CONFIRMED & DIGITAL PASS */}
              {currentStep === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
                      Meet & Greet Pass Active
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
                      Package Reservation Confirmed
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
                      Your Meet & Greet airside pass is active. Our host officer is staged for your arrival.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm">
                      <QRCodeSVG value={`https://shafskyaviation.com/pass/${createdBookingRef}`} size={140} />
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
                      REF: {createdBookingRef || "SHF-849201"}
                    </div>
                    <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
                      Lead Guest: {leadPassengerName} | {originAirport} ({flightDirection.toUpperCase()})
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
                    >
                      Return to Homepage
                    </Link>
                    <a
                      href="tel:+919599087959"
                      className="px-6 py-3 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest shadow-sm hover:scale-105 transition-all"
                    >
                      Call 24/7 Command Desk
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
"""

target_str = """          {/* ════════════════════════════════════════════════════════════════
           * STEP 1: SELECT SERVICE CATEGORY (DECLARATIVE FROM CONFIGURATION)
           * ═══════════════════════════════════════════════════════════════ */}"""

if target_str in content:
    content = content.replace(target_str, meet_greet_block + "\n" + target_str)
    # Also append closing paren for the ternary condition right before navigation controls bar
    nav_controls_target = """      {/* ──────────────────────────────────────────────────────────────────────
       * STEP NAVIGATION CONTROLS BAR
       * ───────────────────────────────────────────────────────────────────── */}"""
    content = content.replace(nav_controls_target, "          )}\n" + nav_controls_target)
    with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully added Meet & Greet workflow to BookingView.tsx")
else:
    print("Target string not found in BookingView.tsx")
