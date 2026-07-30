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

      <AnimatedBookingTimeline activeStep={activeStep} />

      <div className="mt-4 flex flex-col gap-8 pb-24">
        {/* ══════════════════════════════════════════════════
            1. FLIGHT VALIDATED SECTION
        ══════════════════════════════════════════════════ */}
        <section className="w-full animate-fadeIn">
          <AnimatePresence mode="wait">
            {!isFlightValidated ? (
              <motion.div
                key="flight-unvalidated"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl panel-luxury p-6 sm:p-8 shadow-luxury-md"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[#0c3b46]/5 dark:bg-[#c5a059]/5 border border-[#0c3b46]/10 dark:border-[#c5a059]/10 text-[#0c3b46] dark:text-[#c5a059] flex items-center justify-center">
                    <Search size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#c5a059]" style={pageMono}>
                      FLIGHT LOOKUP
                    </h3>
                    <h2
                      className="text-lg font-bold text-gray-900 mt-0.5 leading-snug"
                      style={pageDisplay}
                    >
                      Verify Commercial Flight Coordinates
                    </h2>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <FlightInput
                      label="Flight Number"
                      value={flightNum}
                      onChange={setFlightNum}
                      error={validationError}
                      isValidating={isValidating}
                      isValid={isFlightValidated}
                    />

                    {form.trip_type === "multi_city" && (
                      <FlightInput
                        label="Connecting Flight Number"
                        value={flightNum2}
                        onChange={setFlightNum2}
                        error={validationError2}
                        isValidating={isValidating}
                        isValid={isFlightValidated}
                        className="animate-slideDown"
                      />
                    )}

                    <div className="grid gap-4 grid-cols-2">
                      <div className="flex flex-col gap-1 w-full">
                        <span
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                          style={pageMono}
                        >
                          {form.trip_type === "multi_city" ? "Flight 1 Date" : "Travel Date"}
                        </span>
                        <input
                          type="date"
                          value={form.depart_date}
                          onChange={(e) => handleDateChange(true, e.target.value)}
                          className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                          style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                        />
                      </div>

                      {form.trip_type === "multi_city" && (
                        <div className="flex flex-col gap-1 w-full animate-slideDown">
                          <span
                            className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                            style={pageMono}
                          >
                            Flight 2 Date
                          </span>
                          <input
                            type="date"
                            value={form.return_date}
                            onChange={(e) => handleDateChange(false, e.target.value)}
                            className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                            style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <span
                        className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                        style={pageMono}
                      >
                        Passenger & Guest Count
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50 text-left flex items-center justify-between"
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
                              <span className="font-semibold w-4 text-center">
                                {form.pax_adults}
                              </span>
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
                              <span className="font-semibold w-4 text-center">
                                {form.pax_children}
                              </span>
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

                  <div className="flex flex-col justify-between rounded-xl bg-black/[0.015] border border-black/[0.05] p-5 relative min-h-[220px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2 border-black/[0.05]">
                        <ShieldCheck size={14} style={{ color: creamTheme.teal }} />
                        <h4
                          className="text-[9px] uppercase tracking-[0.24em] font-bold text-teal-800"
                          style={{ ...pageMono, color: creamTheme.teal }}
                        >
                          Aviation Safe Harbor Guard
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-body-luxury">
                        We fetch live operational schedules from airline carrier dispatch systems to
                        verify coordinates, gate terminals, and baggage tracking numbers.
                      </p>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-body-luxury">
                        If validation is unavailable due to carrier outages or schedules not yet
                        published, you may proceed with custom manual overrides.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualMode(true);
                          if (form.trip_type === "multi_city") {
                            setIsManualMode2(true);
                          }
                          // Fake positive state transition to open layout forms
                          setIsFlightValidated(true);
                        }}
                        className="text-[9px] uppercase tracking-[0.16em] font-bold text-teal-700 hover:text-teal-900 transition flex items-center gap-1 cursor-pointer"
                        style={{ ...pageMono, color: creamTheme.teal }}
                      >
                        Enter Manually <ArrowRight size={10} />
                      </button>

                      <button
                        type="button"
                        disabled={isValidating || !flightNum || !form.depart_date}
                        onClick={() => executeValidation(flightNum, flightNum2, true, false)}
                        className="btn-primary-luxury shrink-0 cursor-pointer"
                      >
                        {isValidating ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            <span>Verifying...</span>
                          </div>
                        ) : (
                          "Verify Flight"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="flight-validated"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-teal-700" />
                    <h3
                      className="text-[10px] uppercase tracking-[0.24em] font-bold text-teal-700"
                      style={{ ...pageMono, color: creamTheme.teal }}
                    >
                      Coordinates Verified
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetValidation}
                    className="text-[9px] uppercase tracking-[0.16em] font-bold text-gray-400 hover:text-gray-700 transition"
                    style={pageMono}
                  >
                    Change Flight Coordinates
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-12 items-center">
                  <div className="md:col-span-8">
                    <div className="space-y-4">
                      {flightDetails && <BoardingPassCard details={flightDetails} />}
                      {flightDetails2 && (
                        <BoardingPassCard details={flightDetails2} label="Connecting Segment" />
                      )}
                    </div>
                  </div>

                  <div
                    className="md:col-span-4 rounded-2xl bg-black/[0.02] border p-5 flex flex-col gap-4"
                    style={{ borderColor: creamTheme.line }}
                  >
                    <h3
                      className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-60"
                      style={pageMono}
                    >
                      Terminal & Airline
                    </h3>
                    <div className="divide-y divide-black/5 text-xs">
                      <div className="flex justify-between py-2">
                        <span className="opacity-60">Airline Carrier</span>
                        <span className="font-semibold text-right">
                          {flightDetails?.carrierName || flightDetails?.flightNum.slice(0, 2)}
                        </span>
                      </div>
                      {flightDetails?.depTerminal && (
                        <div className="flex justify-between py-2">
                          <span className="opacity-60">Departure Terminal</span>
                          <span className="font-semibold">{flightDetails.depTerminal}</span>
                        </div>
                      )}
                      {flightDetails?.arrTerminal && (
                        <div className="flex justify-between py-2">
                          <span className="opacity-60">Arrival Terminal</span>
                          <span className="font-semibold">{flightDetails.arrTerminal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {isFlightValidated && (
          <>
            {/* ══════════════════════════════════════════════════
                2. TWO-COLUMN ROW BELOW IT
            ══════════════════════════════════════════════════ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Left Column: Booking Summary */}
              <div className="rounded-2xl panel-luxury p-6 shadow-luxury-md flex flex-col justify-between">
                <div>
                  <div
                    className="flex items-center gap-2 border-b pb-3 mb-4"
                    style={{ borderColor: creamTheme.line }}
                  >
                    <Sparkles size={14} style={{ color: creamTheme.teal }} />
                    <h3
                      className="text-[10px] uppercase tracking-[0.24em] font-bold"
                      style={{ ...pageMono, color: creamTheme.teal }}
                    >
                      Booking Summary
                    </h3>
                  </div>

                  <div className="divide-y divide-black/5 text-xs">
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Flight Number
                      </span>
                      <span className="font-mono font-bold tracking-wider">
                        {flightNum.toUpperCase()}
                        {flightNum2 ? ` / ${flightNum2.toUpperCase()}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Route
                      </span>
                      <span className="font-semibold">
                        {flightDetails?.originCode} →{" "}
                        {flightDetails2 ? flightDetails2.destCode : flightDetails?.destCode}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        {form.trip_type === "one_way"
                          ? "Departure Date"
                          : form.trip_type === "round_trip"
                            ? "Arrival Date"
                            : "Travel Dates"}
                      </span>
                      <span className="font-semibold">
                        {form.trip_type === "multi_city"
                          ? `${form.depart_date} ${departTime} / ${form.return_date ? `${form.return_date} ${returnTime}` : "—"}`
                          : `${form.depart_date} ${departTime}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Passenger Count
                      </span>
                      <span className="font-semibold">
                        {totalPax} Traveler{totalPax > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="opacity-60" style={pageMono}>
                        Selected Services
                      </span>
                      <span
                        className="font-semibold text-teal-800"
                        style={{ color: creamTheme.teal }}
                      >
                        {selectedServiceIds.length} Added
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-6 pt-4 border-t flex flex-col gap-1.5"
                  style={{ borderColor: creamTheme.line }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold opacity-60"
                      style={pageMono}
                    >
                      Total Summary Price
                    </span>
                    <span
                      className="text-2xl font-black text-teal-900 bg-teal-800/[0.04] border border-teal-800/10 px-3 py-1 rounded-2xl shadow-[inset_0_1px_2px_rgba(13,90,110,0.03)] animate-pulse-subtle"
                      style={{ color: creamTheme.teal }}
                    >
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    className="flex justify-end text-[9px] text-gray-400 font-bold tracking-wider"
                    style={pageMono}
                  >
                    Inclusive of luxury duties
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Details Form */}
              <div className="rounded-2xl panel-luxury p-6 shadow-luxury-md flex flex-col gap-5">
                <div
                  className="flex items-center gap-2 border-b pb-3"
                  style={{ borderColor: creamTheme.line }}
                >
                  <User size={14} style={{ color: creamTheme.teal }} />
                  <h3
                    className="text-[10px] uppercase tracking-[0.24em] font-bold"
                    style={{ ...pageMono, color: creamTheme.teal }}
                  >
                    Traveler Credentials
                  </h3>
                </div>

                {isManualMode && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-800 font-bold leading-normal tracking-wide uppercase flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                    Manual Verification Mode: Ensure manually keyed fields represent accurate passport coordinates.
                  </div>
                )}

                <div className="flex flex-col gap-3.5">
                  {/* Manual Coordinates Form */}
                  <AnimatePresence>
                    {isManualMode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid gap-3 grid-cols-2 bg-black/[0.015] p-4 rounded-xl border border-black/5 mb-2 overflow-hidden"
                      >
                        <div className="col-span-2 text-[9px] font-bold uppercase tracking-widest text-[#576875] border-b pb-1 mb-1">
                          Flight 1 Manual Override
                        </div>
                        <div className="col-span-2">
                          <FormInput
                            label="Airline Carrier"
                            required
                            value={manualAirline}
                            onChange={setManualAirline}
                            placeholder="e.g. Air India, Emirates"
                          />
                        </div>
                        <AirportSearchInput
                          label="Departure (Origin) *"
                          query={manualOriginQuery}
                          setQuery={setManualOriginQuery}
                          selectedCode={manualOrigin}
                          setSelectedCode={setManualOrigin}
                          suggestions={matchingOrigins}
                          placeholder="BOM, DEL..."
                        />
                        <AirportSearchInput
                          label="Arrival (Destination) *"
                          query={manualDestQuery}
                          setQuery={setManualDestQuery}
                          selectedCode={manualDest}
                          setSelectedCode={setManualDest}
                          suggestions={matchingDests}
                          placeholder="DEL, BLR..."
                        />
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                          <FormInput
                            label="Dep Time (24h) *"
                            required
                            value={manualTime}
                            onChange={setManualTime}
                            placeholder="HH:MM"
                          />
                          <FormInput
                            label="Arr Date (Optional)"
                            value={manualArrivalDate}
                            onChange={setManualArrivalDate}
                            placeholder="YYYY-MM-DD"
                          />
                        </div>

                        {form.trip_type === "multi_city" && (
                          <>
                            <div className="col-span-2 text-[9px] font-bold uppercase tracking-widest text-[#576875] border-b pb-1 mt-3 mb-1">
                              Flight 2 Manual Override
                            </div>
                            <div className="col-span-2">
                              <FormInput
                                label="Flight 2 Airline"
                                required
                                value={manualAirline2}
                                onChange={setManualAirline2}
                                placeholder="e.g. Lufthansa"
                              />
                            </div>
                            <AirportSearchInput
                              label="Flight 2 Origin *"
                              query={manualOriginQuery2}
                              setQuery={setManualOriginQuery2}
                              selectedCode={manualOrigin2}
                              setSelectedCode={setManualOrigin2}
                              suggestions={matchingOrigins2}
                              placeholder="FRA, CDG..."
                            />
                            <AirportSearchInput
                              label="Flight 2 Destination *"
                              query={manualDestQuery2}
                              setQuery={setManualDestQuery2}
                              selectedCode={manualDest2}
                              setSelectedCode={setManualDest2}
                              suggestions={matchingDests2}
                              placeholder="DEL, BOM..."
                            />
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                              <FormInput
                                label="Dep Time (24h) *"
                                required
                                value={manualTime2}
                                onChange={setManualTime2}
                                placeholder="HH:MM"
                              />
                              <FormInput
                                label="Arr Date (Optional)"
                                value={manualArrivalDate2}
                                onChange={setManualArrivalDate2}
                                placeholder="YYYY-MM-DD"
                              />
                            </div>
                          </>
                        )}

                        <div className="col-span-2 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualMode(false);
                              setIsManualMode2(false);
                              setIsFlightValidated(false);
                              setFlightDetails(null);
                              setFlightDetails2(null);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-black/15 text-[9px] font-bold uppercase tracking-wider text-gray-500 hover:bg-black/5"
                          >
                            Use Auto-Lookup
                          </button>
                          <button
                            type="button"
                            onClick={handleManualValidation}
                            className="px-3 py-1.5 rounded-lg bg-teal-800 text-white text-[9px] font-bold uppercase tracking-wider hover:brightness-110"
                            style={{ backgroundColor: creamTheme.teal }}
                          >
                            Verify manual fields
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <FormInput
                    id="contact_name"
                    label="Lead Passenger Name"
                    required
                    value={form.contact_name}
                    onChange={(v) => setForm((prev) => ({ ...prev, contact_name: v }))}
                    placeholder="e.g. Aatif Aariz"
                  />

                  <FormInput
                    id="contact_email"
                    label="Email Address"
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={(v) => setForm((prev) => ({ ...prev, contact_email: v }))}
                    placeholder="e.g. guest@shafsky.com"
                  />

                  <div className="flex flex-col gap-1 w-full">
                    <span className="block font-mono-luxury text-gray-400">
                      Phone Number <span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <div className="flex gap-2 mt-1 relative">
                      <Popover open={countryDropdownOpen} onOpenChange={setCountryDropdownOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            id="contact_phone"
                            className="h-11 rounded-xl border bg-white/60 px-3 text-xs font-semibold flex items-center gap-1 shrink-0 transition hover:bg-black/[0.02]"
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
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountryDropdownOpen(false);
                              }}
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
                        className="flex-1 h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                        style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                      />
                    </div>
                    {phoneError && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        {phoneError}
                      </span>
                    )}
                  </div>

                  <FormInput
                    label="Corporate / Company Name (Optional)"
                    value={form.company}
                    onChange={(v) => setForm((prev) => ({ ...prev, company: v }))}
                    placeholder="e.g. Acme Corporation"
                  />

                  {/* Documents Section */}
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
              </div>
            </section>

            {/* ══════════════════════════════════════════════════
                3. SERVICE CUSTOMIZATION SECTION
            ══════════════════════════════════════════════════ */}
            <section className="w-full rounded-2xl panel-luxury p-6 sm:p-8 shadow-luxury-md flex flex-col gap-6">
              <div
                className="flex items-center gap-2 border-b pb-3"
                style={{ borderColor: creamTheme.line }}
              >
                <Package size={14} style={{ color: creamTheme.teal }} />
                <h3
                  className="text-[10px] uppercase tracking-[0.24em] font-bold"
                  style={{ ...pageMono, color: creamTheme.teal }}
                >
                  Bespoke Airport Services
                </h3>
              </div>

              {/* Show only relevant services dynamically based on trip_type and auto-detected airport capabilities */}
              <div className="space-y-6">
                {(form.trip_type === "one_way" || form.trip_type === "multi_city") && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-teal-800" style={pageMono}>
                        Departure Staging ({departureAirportName})
                      </span>
                      <button
                        type="button"
                        onClick={() => setDepSectionOpen((prev) => !prev)}
                        className="text-[9px] uppercase tracking-[0.16em] font-bold text-gray-400 hover:text-gray-700 transition"
                        style={pageMono}
                      >
                        {depSectionOpen ? "Collapse [-]" : "Expand [+]"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {depSectionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid gap-4 sm:grid-cols-2 overflow-hidden"
                        >
                          {departureServices.map((svc) => (
                            <ServiceGridCard
                              key={svc.id}
                              svc={svc}
                              selected={selectedServiceIds.includes(svc.id)}
                              onClick={() => toggleServiceId(svc.id)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {(form.trip_type === "round_trip" || form.trip_type === "multi_city") && (
                  <div className="space-y-4 border-t pt-4 border-black/5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-teal-800" style={pageMono}>
                        Arrival Destination Staging ({arrivalAirportName})
                      </span>
                      <button
                        type="button"
                        onClick={() => setArrSectionOpen((prev) => !prev)}
                        className="text-[9px] uppercase tracking-[0.16em] font-bold text-gray-400 hover:text-gray-700 transition"
                        style={pageMono}
                      >
                        {arrSectionOpen ? "Collapse [-]" : "Expand [+]"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {arrSectionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid gap-4 sm:grid-cols-2 overflow-hidden"
                        >
                          {arrivalServices.map((svc) => (
                            <ServiceGridCard
                              key={svc.id}
                              svc={svc}
                              selected={selectedServiceIds.includes(svc.id)}
                              onClick={() => toggleServiceId(svc.id)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════
                4. DISPATCH INSTRUCTIONS & SUBMISSION
            ══════════════════════════════════════════════════ */}
            <section className="rounded-2xl panel-luxury p-6 sm:p-8 shadow-luxury-md flex flex-col gap-4">
              <div
                className="flex items-center gap-2 border-b pb-3 mb-2"
                style={{ borderColor: creamTheme.line }}
              >
                <FileText size={14} style={{ color: creamTheme.teal }} />
                <h3
                  className="text-[10px] uppercase tracking-[0.24em] font-bold"
                  style={{ ...pageMono, color: creamTheme.teal }}
                >
                  Special Dispatch Instructions
                </h3>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <span
                  className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                  style={pageMono}
                >
                  Additional VIP / Handler Notes
                </span>
                <textarea
                  placeholder="e.g. Dietary preferences, wheelchair assistance, tarmac coordination notes..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="mt-1.5 w-full min-h-[90px] p-3 text-xs bg-white/60 border rounded-xl outline-none transition-all focus:border-teal/50 font-body-luxury"
                  style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                />
              </div>
            </section>

            {validationWarning && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={16} className="text-amber-800 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 font-semibold leading-relaxed">
                  <span className="block font-bold uppercase text-[9px] tracking-wider mb-0.5" style={pageMono}>
                    Operational Guard Advisory
                  </span>
                  {validationWarning}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={busy || selectedServiceIds.length === 0}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 bg-teal-800 text-white text-[11px] font-bold uppercase tracking-[0.26em] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-lg animate-fadeIn"
              style={{
                backgroundColor: creamTheme.teal,
                boxShadow: "0 8px 30px -4px rgba(13,90,110,0.3)",
              }}
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
          </>
        )}
      </div>
    </PageContainer>
  );