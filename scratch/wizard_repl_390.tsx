  return (
    <PageContainer tone="cream">
      <RouteTopbar>
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70 flex items-center gap-2 text-[#576875]"
        >
          ← Shafsky Aviation
        </Link>
      </RouteTopbar>

      {/* Dynamic wizard-based progress bar */}
      <AnimatedBookingTimeline activeStep={
        wizardStep === 1 ? 1 :
        (wizardStep === 2 || wizardStep === 3 || wizardStep === 4) ? 2 :
        wizardStep === 5 ? 3 :
        wizardStep === 6 ? 4 : 5
      } />

      <div className="mx-auto max-w-4xl px-4 py-4 min-h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: CHOOSE TRAVEL MODE */}
          {wizardStep === 1 && (
            <motion.div
              key="wizard-step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full grid gap-6 sm:grid-cols-3"
            >
              {[
                { type: "round_trip" as const, title: "Arrival Service", subtitle: "Welcome upon landing", desc: "Escort from aircraft gate, fast-track customs clearance, and bag assistance to curbside.", icon: PlaneLanding },
                { type: "one_way" as const, title: "Departure Service", subtitle: "VIP terminal departure", desc: "Meet at terminal entrance, check-in assistance, security fast-track, and boarding escort.", icon: PlaneTakeoff },
                { type: "multi_city" as const, title: "Transit / Connection", subtitle: "Sleek airport transfer", desc: "Expedited gate-to-gate connection escort, baggage transfer management, and lounge relaxation.", icon: Shuffle }
              ].map(({ type, title, subtitle, desc, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectMode(type)}
                  className="relative overflow-hidden group rounded-2xl p-6 border text-left bg-white/50 border-black/5 hover:bg-white/90 hover:border-[#c5a059]/30 hover:shadow-luxury-md transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0c3b46]/5 text-[#0c3b46] dark:text-[#c5a059] group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-6 w-6" style={{ color: creamTheme.teal }} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-mono-luxury font-extrabold uppercase tracking-wider text-[#576875]" style={pageMono}>
                        {subtitle}
                      </h3>
                      <h2 className="text-lg font-bold text-[#0b1a24] mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed font-body-luxury">
                    {desc}
                  </p>
                </button>
              ))}
            </motion.div>
          )}

          {/* STEP 2: ENTER FLIGHT NUMBER */}
          {wizardStep === 2 && (
            <motion.div
              key="wizard-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl panel-luxury p-6 sm:p-8 rounded-2xl shadow-luxury-md flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                  Step 2 · Flight Coordinates
                </h3>
                <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Identify Your Flight
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Flight Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#576875]" style={pageMono}>
                    Flight Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI9811 or EK501"
                    value={flightNum}
                    onChange={(e) => setFlightNum(e.target.value.toUpperCase())}
                    className="w-full h-12 rounded-xl border bg-white/60 px-4 text-xs font-semibold uppercase outline-none focus:border-teal/50"
                    style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                  />
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#576875]" style={pageMono}>
                      {form.trip_type === "round_trip" ? "Arrival Date" : "Departure Date"}
                    </label>
                    <input
                      type="date"
                      value={form.depart_date}
                      onChange={(e) => handleDateChange(true, e.target.value)}
                      className="w-full h-12 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>

                  {form.trip_type === "multi_city" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#576875]" style={pageMono}>
                        Connection Departure Date
                      </label>
                      <input
                        type="date"
                        value={form.return_date}
                        onChange={(e) => handleDateChange(false, e.target.value)}
                        className="w-full h-12 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                        style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                      />
                    </div>
                  )}
                </div>

                {/* Travelers Popover Trigger */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#576875]" style={pageMono}>
                    Travelers & Guest Count
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-12 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none text-left flex items-center justify-between"
                        style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                      >
                        <span className="flex items-center gap-2">
                          <Users size={14} style={{ color: creamTheme.teal }} />
                          {totalPax} Traveler{totalPax > 1 ? "s" : ""}
                        </span>
                        <ChevronDown size={14} className="opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 flex flex-col gap-4 bg-white border rounded-xl shadow-lg z-50">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Adults</span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                pax_adults: Math.max(1, prev.pax_adults - 1),
                              }))
                            }
                            className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-semibold w-4 text-center">{form.pax_adults}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                pax_adults: Math.min(20, prev.pax_adults + 1),
                              }))
                            }
                            className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Children (2-12)</span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                pax_children: Math.max(0, prev.pax_children - 1),
                              }))
                            }
                            className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-semibold w-4 text-center">{form.pax_children}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                pax_children: Math.min(10, prev.pax_children + 1),
                              }))
                            }
                            className="h-7 w-7 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {isValidating && (
                <div className="p-4 rounded-xl bg-teal-800/5 border border-teal-800/10 flex items-center gap-3 animate-fadeIn">
                  <Loader2 size={16} className="animate-spin text-teal-800 shrink-0" />
                  <span className="text-xs text-teal-950 font-semibold">Live validation in progress...</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                  style={pageMono}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={isValidating || !flightNum || !form.depart_date}
                  onClick={() => {
                    executeValidation(flightNum, flightNum2, true, false);
                  }}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  {isValidating ? "Validating..." : "Find Flight"}
                  <ArrowRight size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsManualMode(true);
                  if (form.trip_type === "multi_city") setIsManualMode2(true);
                  setWizardStep(3);
                }}
                className="text-center text-xs font-semibold underline text-teal hover:opacity-85 transition block mx-auto -mt-2 cursor-pointer"
                style={{ ...pageMono, color: creamTheme.teal }}
              >
                Can't find your flight? Continue manually.
              </button>
            </motion.div>
          )}

          {/* STEP 3: MINIMAL MANUAL FORM */}
          {wizardStep === 3 && (
            <motion.div
              key="wizard-step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl panel-luxury p-6 sm:p-8 rounded-2xl shadow-luxury-md flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-700" style={pageMono}>
                  Step 2 · Manual Coordinates
                </h3>
                <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Manual Flight Entry
                </h2>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Enter details manually to build coordinates.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    value={flightNum}
                    onChange={(e) => setFlightNum(e.target.value.toUpperCase())}
                    className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                    style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                    Airline / Carrier *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Air India"
                    value={manualAirline}
                    onChange={(e) => setManualAirline(e.target.value)}
                    className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                    style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                  />
                </div>

                <AirportSearchInput
                  label="Departure Airport (Origin) *"
                  query={manualOriginQuery}
                  setQuery={setManualOriginQuery}
                  selectedCode={manualOrigin}
                  setSelectedCode={setManualOrigin}
                  suggestions={matchingOrigins}
                  placeholder="IATA Code..."
                />

                <AirportSearchInput
                  label="Arrival Airport (Destination) *"
                  query={manualDestQuery}
                  setQuery={setManualDestQuery}
                  selectedCode={manualDest}
                  setSelectedCode={setManualDest}
                  suggestions={matchingDests}
                  placeholder="IATA Code..."
                />

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    value={form.depart_date}
                    onChange={(e) => handleDateChange(true, e.target.value)}
                    className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                    style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                  style={pageMono}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!flightNum || !manualAirline || !manualOrigin || !manualDest || !form.depart_date}
                  onClick={() => {
                    const oAir = AIRPORTS.find(a => a.code.toUpperCase() === manualOrigin.toUpperCase());
                    const dAir = AIRPORTS.find(a => a.code.toUpperCase() === manualDest.toUpperCase());
                    setFlightDetails({
                      flightNum: flightNum,
                      originCode: manualOrigin,
                      originCity: oAir?.city || "Manual Origin",
                      destCode: manualDest,
                      destCity: dAir?.city || "Manual Dest",
                      depTime: "12:00",
                      arrTime: "14:30",
                      depDate: form.depart_date,
                      arrDate: form.depart_date,
                      duration: "—",
                      depTerminal: "",
                      arrTerminal: "",
                      carrierName: manualAirline,
                      isManual: true,
                    });
                    setIsFlightValidated(true);
                    setWizardStep(5);
                  }}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  Confirm & Load Services
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: VERIFY / CONFIRM AUTO-DETECTED */}
          {wizardStep === 4 && (
            <motion.div
              key="wizard-step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl panel-luxury p-6 sm:p-8 rounded-2xl shadow-luxury-md flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                  Step 2 · Verify coordinates
                </h3>
                <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Confirm Flight Details
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Review and make edits to the prefilled details.
                </p>
              </div>

              {flightDetails && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                      Flight Number
                    </label>
                    <input
                      type="text"
                      value={flightNum}
                      onChange={(e) => setFlightNum(e.target.value.toUpperCase())}
                      className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                      Airline
                    </label>
                    <input
                      type="text"
                      value={airline || flightDetails.carrierName || ""}
                      onChange={(e) => setAirline(e.target.value)}
                      className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                      Departure Airport (Origin)
                    </label>
                    <input
                      type="text"
                      value={origin || flightDetails.originCode}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50 uppercase"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={pageMono}>
                      Arrival Airport (Destination)
                    </label>
                    <input
                      type="text"
                      value={destination || flightDetails.destCode}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50 uppercase"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                  style={pageMono}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (flightDetails) {
                      if (!origin) setOrigin(flightDetails.originCode);
                      if (!destination) setDestination(flightDetails.destCode);
                      if (!airline) setAirline(flightDetails.carrierName || "");
                    }
                    setIsFlightValidated(true);
                    setWizardStep(5);
                  }}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg transition"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  Confirm & Load Services
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SELECT BESPOKE SERVICES */}
          {wizardStep === 5 && (
            <motion.div
              key="wizard-step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl flex flex-col gap-6"
            >
              {activeServiceForPackage ? (
                /* Package Selection Sub-screen */
                <div className="flex flex-col gap-6 animate-fadeIn w-full">
                  <div className="text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                      Select Package Option
                    </h3>
                    <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {activeServiceForPackage.title} Services at {getAirportName(resolvedAirportCode)}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto w-full">
                    {activeServiceForPackage.packages?.map((pkg) => {
                      const isSelected = customMeetGreetTitle === pkg.title;
                      return (
                        <div
                          key={pkg.id}
                          className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-300 relative bg-white/60 ${
                            isSelected
                              ? "border-[#c5a059] ring-2 ring-[#c5a059]/20 shadow-md"
                              : "border-black/5 hover:border-black/15"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#c5a059] text-white flex items-center justify-center text-[10px]">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                          <div>
                            <h3 className="text-[10px] font-mono-luxury font-extrabold uppercase tracking-wider text-[#576875]" style={pageMono}>
                              Package Type
                            </h3>
                            <h2 className="text-lg font-bold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {pkg.title}
                            </h2>
                            <p className="text-xs text-gray-500 mt-3 leading-relaxed font-body-luxury">
                              {pkg.desc}
                            </p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                            <span className="text-xl font-extrabold text-[#0c3b46] font-display-luxury">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomMeetGreetPrice(pkg.price);
                                setCustomMeetGreetTitle(pkg.title);
                                setCustomMeetGreetDesc(pkg.desc);

                                const localSvcId = form.trip_type === "round_trip" ? "arr_meet_greet" : "dep_meet_greet";
                                if (!selectedServiceIds.includes(localSvcId)) {
                                  setSelectedServiceIds(prev => [...prev, localSvcId]);
                                }
                                setActiveServiceForPackage(null);
                              }}
                              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-teal rounded-lg hover:brightness-110 shadow-sm"
                              style={{ ...pageMono, backgroundColor: creamTheme.teal }}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setActiveServiceForPackage(null)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                      style={pageMono}
                    >
                      ← Back to services
                    </button>
                  </div>
                </div>
              ) : (
                /* Services List Screen */
                <div className="flex flex-col gap-6 w-full animate-fadeIn">
                  <div className="text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                      Step 3 · Customize experiences
                    </h3>
                    <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Bespoke Services at {getAirportName(resolvedAirportCode)}
                    </h2>
                    <p className="text-xs text-gray-500 mt-2 font-body-luxury">
                      Select options matching your premium travel requirements. Hiding unavailable services automatically.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto w-full">
                    {resolvedServices.map((svc) => {
                      const isPackageBased = svc.type === "package";
                      const localId = getLocalServiceId(svc.id);
                      const isSelected = selectedServiceIds.includes(localId);

                      return (
                        <div
                          key={svc.id}
                          className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-300 relative bg-white/60 ${
                            isSelected
                              ? "border-[#c5a059] ring-2 ring-[#c5a059]/20 shadow-md animate-pulse-subtle"
                              : "border-black/5 hover:border-black/15"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-[9px] font-mono-luxury font-extrabold uppercase tracking-wider text-gray-400" style={pageMono}>
                                {isPackageBased ? "Package based" : "Direct booking"}
                              </h3>
                              {isSelected && (
                                <span className="h-5 w-5 rounded-full bg-[#c5a059] text-white flex items-center justify-center text-[10px] shrink-0">
                                  <Check size={11} strokeWidth={3.5} />
                                </span>
                              )}
                            </div>
                            <h2 className="text-base font-bold text-[#0b1a24] mt-1 font-body-luxury">
                              {svc.title}
                            </h2>
                            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed font-body-luxury">
                              {svc.desc}
                            </p>

                            {isPackageBased && isSelected && customMeetGreetTitle && (
                              <div className="mt-3 p-2.5 rounded-xl bg-teal-800/[0.03] border border-teal-800/10 text-[11px] text-[#0b1a24] font-semibold animate-fadeIn">
                                <span className="block font-bold uppercase text-[9px] text-[#576875] tracking-wider" style={pageMono}>Active Choice:</span>
                                {customMeetGreetTitle} (₹{customMeetGreetPrice?.toLocaleString("en-IN")})
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-3.5 border-t border-black/5 flex items-center justify-between">
                            <span className="text-base font-extrabold text-[#0c3b46] font-display-luxury">
                              {isPackageBased
                                ? isSelected && customMeetGreetPrice
                                  ? `₹${customMeetGreetPrice.toLocaleString("en-IN")}`
                                  : "Rates vary"
                                : `₹${svc.price?.toLocaleString("en-IN")}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isPackageBased) {
                                  setActiveServiceForPackage(svc);
                                } else {
                                  toggleServiceId(localId);
                                }
                              }}
                              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-teal rounded-lg hover:brightness-110 shadow-sm"
                              style={{ ...pageMono, backgroundColor: creamTheme.teal }}
                            >
                              {isPackageBased
                                ? isSelected
                                  ? "Change"
                                  : "Choose"
                                : isSelected
                                  ? "Added"
                                  : "Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Details Box */}
                  {selectedServiceIds.length > 0 && (
                    <div className="p-5 rounded-2xl bg-teal-800/[0.02] border border-teal-800/10 max-w-xl mx-auto w-full mt-4 animate-fadeIn">
                      <h4 className="text-xs font-mono-luxury font-extrabold uppercase tracking-wider text-teal-950 mb-3" style={pageMono}>
                        Journey Selection summary
                      </h4>
                      <div className="space-y-2 text-xs text-gray-700">
                        {selectedServiceIds.map((id) => {
                          const svc = allServices.find((s) => s.id === id);
                          if (!svc) return null;
                          return (
                            <div key={id} className="flex justify-between">
                              <span>{svc.title} × {totalPax} Pax</span>
                              <span>₹{(svc.price * totalPax).toLocaleString("en-IN")}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between border-t border-black/5 pt-3 mt-1 font-bold text-sm text-teal-950">
                          <span>Subtotal</span>
                          <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-black/5 pt-4 max-w-4xl mx-auto w-full">
                    <button
                      type="button"
                      onClick={() => setWizardStep(isManualMode ? 3 : 4)}
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                      style={pageMono}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={selectedServiceIds.length === 0}
                      onClick={() => setWizardStep(6)}
                      className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                      style={{ backgroundColor: creamTheme.teal }}
                    >
                      Confirm & Continue
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: CONTACT & GUEST DETAILS */}
          {wizardStep === 6 && (
            <motion.div
              key="wizard-step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl panel-luxury p-6 sm:p-8 rounded-2xl shadow-luxury-md flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                  Step 4 · Contact details
                </h3>
                <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Passenger & Contact Details
                </h2>
                <p className="text-xs text-gray-500 mt-2 font-body-luxury">
                  Provide credentials for host stagings.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <FormInput
                  label="Full Name"
                  required
                  value={form.contact_name}
                  onChange={(v) => setForm({ ...form, contact_name: v })}
                  placeholder="e.g. Aatif Aariz"
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={(v) => setForm({ ...form, contact_email: v })}
                  placeholder="e.g. guest@shafsky.com"
                />

                <div className="flex flex-col gap-1 w-full">
                  <span className="block font-mono-luxury text-gray-400">
                    Phone Number <span className="text-red-500 ml-0.5">*</span>
                  </span>
                  <div className="flex gap-2 mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="h-11 rounded-xl border bg-white/60 px-3 text-xs font-semibold flex items-center gap-1 shrink-0"
                          style={{ borderColor: creamTheme.line }}
                        >
                          <span>{selectedCountry.flag}</span>
                          <span className="text-gray-500">{selectedCountry.dial}</span>
                          <ChevronDown size={12} className="opacity-60" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2 max-h-60 overflow-y-auto bg-white border rounded-xl shadow-lg z-50">
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setSelectedCountry(c)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 rounded transition"
                          >
                            <span className="mr-2">{c.flag}</span>
                            <span className="font-bold text-gray-500 mr-1.5">{c.dial}</span>
                            <span className="text-gray-800">{c.name}</span>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <input
                      type="tel"
                      value={phoneBody}
                      onChange={(e) => setPhoneBody(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="flex-1 h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none focus:border-teal/50"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    />
                  </div>
                  {phoneError && <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">{phoneError}</span>}
                </div>

                <FormInput
                  label="Company Name"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder="e.g. Acme Corporation"
                />

                <div className="grid gap-3 grid-cols-2 border-t pt-4 border-black/5 mt-2">
                  <FileUploadCard
                    label="Passport Copy (Optional)"
                    file={passportFile}
                    onChange={setPassportFile}
                  />
                  <FileUploadCard
                    label="Visa Copy (Optional)"
                    file={visaFile}
                    onChange={setVisaFile}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(5)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                  style={pageMono}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!form.contact_name || !form.contact_email || !phoneBody || !!phoneError}
                  onClick={() => setWizardStep(7)}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  Proceed to Final Review
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: FINAL REVIEW & SUBMIT */}
          {wizardStep === 7 && (
            <motion.div
              key="wizard-step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl panel-luxury p-6 sm:p-8 rounded-2xl shadow-luxury-md flex flex-col gap-6"
            >
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                  Step 5 · Review & confirm
                </h3>
                <h2 className="text-2xl font-extrabold text-[#0b1a24] mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Confirm Booking details
                </h2>
                <p className="text-xs text-gray-500 mt-2 font-body-luxury">
                  Inspect coordinates and guest details before completing your order.
                </p>
              </div>

              <div className="divide-y divide-black/5 text-xs font-body-luxury">
                <div className="flex justify-between py-2.5">
                  <span className="opacity-60" style={pageMono}>Journey Type</span>
                  <span className="font-semibold text-gray-800 uppercase tracking-wide">
                    {form.trip_type === "round_trip" ? "Arrival" : form.trip_type === "one_way" ? "Departure" : "Transit"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="opacity-60" style={pageMono}>Flight Number</span>
                  <span className="font-mono font-bold text-gray-900">{flightNum}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="opacity-60" style={pageMono}>Route</span>
                  <span className="font-semibold text-gray-800">
                    {origin || flightDetails?.originCode} → {destination || flightDetails?.destCode}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="opacity-60" style={pageMono}>Traveler Count</span>
                  <span className="font-semibold text-gray-800">{totalPax} Guest(s)</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="opacity-60" style={pageMono}>Contact Person</span>
                  <span className="font-semibold text-gray-800">{form.contact_name}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-black/5">
                  <span className="opacity-60" style={pageMono}>Phone</span>
                  <span className="font-semibold text-gray-800">{selectedCountry.dial} {phoneBody}</span>
                </div>
              </div>

              {/* Added Services Summary */}
              <div className="rounded-xl bg-teal-800/[0.02] border border-teal-800/10 p-4">
                <span className="block font-mono-luxury text-[9px] uppercase tracking-wider text-teal-800 mb-2" style={pageMono}>
                  Requested Airport Services
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedServiceIds.map((id) => {
                    const svc = allServices.find((s) => s.id === id);
                    if (!svc) return null;
                    return (
                      <div key={id} className="flex justify-between font-medium">
                        <span>{svc.title}</span>
                        <span>₹{(svc.price * totalPax).toLocaleString("en-IN")}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between border-t border-black/5 pt-2.5 mt-2 font-bold text-sm text-[#0c3b46]">
                    <span>Total Amount</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="flex flex-col gap-1">
                <span className="block font-mono-luxury text-[9px] uppercase tracking-wider text-gray-400" style={pageMono}>
                  Special Requests / Dietary / VIP notes
                </span>
                <textarea
                  placeholder="e.g. Dietary preferences, wheelchair assistance, tarmac coordination notes..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full min-h-[60px] p-3 text-xs bg-white/60 border rounded-xl outline-none focus:border-teal/50 font-body-luxury"
                  style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(6)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition"
                  style={pageMono}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg disabled:opacity-50 transition"
                  style={{ backgroundColor: creamTheme.teal }}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm & Request Airport Services
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );