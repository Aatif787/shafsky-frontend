import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Edit2 } from "lucide-react";
import { BookingProgressHeader } from "../../shared/BookingProgressHeader";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { useAirportWorkflow, resolveBookingServiceTime } from "../../hooks/useAirportWorkflow";
import { AirportServiceSelection } from "./AirportServiceSelection";
import { EditJourneyDrawer } from "../../shared/EditJourneyDrawer";
import { BookingSummaryReviewStep } from "./BookingSummaryReviewStep";
import { PassengerDetailsStep } from "./PassengerDetailsStep";
import { ApiClient } from "@/lib/ApiClient";
import { toRazorpayContact } from "../../validation/sharedValidation";
import {
  AIRPORT_WORKFLOW_STEP_CONFIGS,
  extractBookingApiError,
  loadRazorpayCheckoutScript,
  AirportWorkflowStep1Journey,
  AirportServiceErrorAndUncoveredState,
} from "./AirportWorkflowParts";

export {
  AIRPORT_WORKFLOW_STEP_CONFIGS,
  extractBookingApiError,
  loadRazorpayCheckoutScript,
  AirportWorkflowStep1Journey,
  AirportServiceErrorAndUncoveredState,
};

interface AirportWorkflowProps {
  searchParams?: any;
}

export function AirportWorkflow({ searchParams }: AirportWorkflowProps) {
  const navigate = useNavigate();
  const [paymentToken, setPaymentToken] = useState<string | null>(null);

  const {
    currentStep,
    setCurrentStep,
    busy,
    setBusy,
    bookingRef,
    setBookingRef,
    state,
    updateState,
    validateAndSearchFlight,
    setManualFlightData,
    selectPackage,
    validateWithBackend,
    saveDraftWithBackend,
    priceBreakdown,
    totalPrice,
  } = useAirportWorkflow(searchParams);

  const isAirportPageBooking = state.bookingSource === "airport_page";

  const applyServiceDirection = useCallback(
    (dir: "arrival" | "departure" | "transit") => {
      const locked = (state.airportCode || "").trim().toUpperCase();
      const next: Parameters<typeof updateState>[0] = {
        direction: dir,
        isFlightValidated: false,
        validatedFlightData: null,
        flightErrorMessage: undefined,
        routeMatchError: undefined,
      };
      if (isAirportPageBooking && locked) {
        next.airportCode = locked;
        next.airportName = state.airportName;
        if (dir === "arrival") {
          next.destCode = locked;
          next.transitCode = "";
        } else if (dir === "departure") {
          next.originCode = locked;
          next.transitCode = "";
        } else {
          next.transitCode = locked;
        }
      }
      updateState(next);
    },
    [isAirportPageBooking, state.airportCode, state.airportName, updateState]
  );

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (currentStep === 4) {
      const selectedSlugs =
        state.bookingMode === "package"
          ? [state.selectedPackage || state.selectedService || "platinum"]
          : (state as any).selectedExtras?.length > 0
          ? (state as any).selectedExtras
          : [state.selectedService || "platinum"];

      ApiClient.fetchWithAuth("/api/journey/validate-booking", {
        method: "POST",
        body: JSON.stringify({
          airport_code: state.airportCode,
          journey_type: state.direction.toUpperCase(),
          service_date: state.serviceDate || new Date().toISOString().split("T")[0],
          service_time: state.serviceTime || undefined,
          flight_type: state.travelType?.toUpperCase(),
          selected_service_slugs: selectedSlugs,
          guest_count: state.guestCount || 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false && data.booking_reference) {
            setBookingRef(data.booking_reference);
          }
        })
        .catch((err) => console.warn("[AirportWorkflow] Pre-payment validation error:", err));
    }
  }, [
    currentStep,
    state.airportCode,
    state.direction,
    state.serviceDate,
    state.serviceTime,
    state.selectedService,
    state.selectedPackage,
    state.bookingMode,
    state.guestCount,
    setBookingRef,
  ]);

  const stepConfigs = useMemo(() => AIRPORT_WORKFLOW_STEP_CONFIGS, []);

  const currentConfig = useMemo(
    () => stepConfigs[Math.min(currentStep - 1, stepConfigs.length - 1)],
    [stepConfigs, currentStep]
  );

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem("shafsky_booking_draft", JSON.stringify({ service: "airport", state, updatedAt: new Date().toISOString() }));
    toast.success("Airport concierge draft saved locally.");
  }, [state]);

  const getRefPrefix = useCallback(() => {
    const map: Record<string, string> = {
      meet_greet: "SHF-[#MEET]-",
      lounge: "SHF-[#LOUNGE]-",
      fast_track: "SHF-FT-",
      transport: "SHF-TRP-",
      platinum: "SHF-PLT-",
      elite: "SHF-ELT-",
      silver: "SHF-SLV-",
      gold: "SHF-GLD-",
    };
    return map[state.selectedService] || map[state.selectedPackage] || "SHF-[#MEET]-";
  }, [state.selectedService, state.selectedPackage]);

  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "OPEN" | "VERIFYING" | "FAILED" | "DISMISSED" | "SUCCESS">("IDLE");

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return loadRazorpayCheckoutScript();
  }, []);

  const pollBookingConfirmation = useCallback(async (targetRef: string, maxAttempts = 10): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await ApiClient.fetchWithAuth(`/api/bookings/${targetRef}/status`);
        const data = await res.json().catch(() => null);
        if (res.ok && (data?.data?.status === "CONFIRMED" || data?.data?.paymentStatus === "PAID")) {
          toast.success("Payment confirmed by gateway! Booking is active.");
          setCurrentStep(5);
          setPaymentStatus("SUCCESS");
          return true;
        }
      } catch (err) {
        console.warn(`[Poll] Attempt ${attempt} error:`, err);
      }
    }
    // Payment was NOT confirmed after all poll attempts — do NOT assume success
    toast.error("Payment could not be confirmed. If you were charged, please contact support or retry.");
    setPaymentStatus("FAILED");
    return false;
  }, [setCurrentStep]);

  const launchRazorpayModal = useCallback(async (
    orderId: string,
    keyId: string,
    amount: number,
    currency: string,
    targetRef: string,
    amountPaise?: number
  ) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
      setBusy(false);
      return;
    }

    const paise = Number.isFinite(Number(amountPaise)) && Number(amountPaise) >= 100
      ? Math.round(Number(amountPaise))
      : Math.round(Number(amount) * 100);
    const contact = toRazorpayContact(state.phone);

    try {
      const previous = (window as any).__shafskyRzp;
      if (previous && typeof previous.close === "function") {
        previous.close();
      }
    } catch {
      /* previous checkout instance may already be gone */
    }

    const options: Record<string, unknown> = {
      key: keyId,
      amount: paise,
      currency: currency || "INR",
      name: "Shafsky Aviation Services Concierge",
      description: `Airport Service — ${targetRef}`,
      order_id: orderId,
      prefill: {
        name: state.fullName,
        email: state.email,
        ...(contact ? { contact } : {}),
      },
      remember_customer: false,
      retry: { enabled: false },
      theme: {
        color: "#d97706",
      },
      handler: async (response: any) => {
        setBusy(true);
        setPaymentStatus("VERIFYING");
        toast.loading("Verifying payment with bank...", { id: "payment-verify" });

        try {
          const verifyRes = await ApiClient.fetchWithAuth("/api/payments/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_ref: targetRef,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => null);
          toast.dismiss("payment-verify");

          if (verifyRes.ok && verifyData?.success) {
            toast.success("Payment verified! Booking confirmed.");
            setPaymentStatus("SUCCESS");
            setCurrentStep(5);
          } else {
            toast.info("Awaiting payment webhook confirmation. Checking status...");
            await pollBookingConfirmation(targetRef);
          }
        } catch (vErr) {
          toast.dismiss("payment-verify");
          console.error("Payment verification error:", vErr);
          await pollBookingConfirmation(targetRef);
        } finally {
          setBusy(false);
        }
      },
      modal: {
        ondismiss: () => {
          setBusy(false);
          setPaymentStatus("DISMISSED");
          toast.info("Payment window closed. You can retry payment anytime.");
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      (window as any).__shafskyRzp = rzp;
      rzp.on("payment.failed", (failRes: any) => {
        setBusy(false);
        setPaymentStatus("FAILED");
        toast.error(`Payment failed: ${failRes.error?.description || "Gateway transaction failed"}`);
      });
      setPaymentStatus("OPEN");
      rzp.open();
    } catch (openErr) {
      console.error("Razorpay open error:", openErr);
      toast.error("Unable to open checkout modal. Please try again.");
      setBusy(false);
    }
  }, [loadRazorpayScript, state.fullName, state.email, state.phone, setBusy, setCurrentStep, pollBookingConfirmation]);

  const handleSubmit = useCallback(async () => {
    if (!state.fullName || !state.phone || !state.email) {
      toast.error("Please fill in Lead Guest Name, Phone Number, and Email.");
      return;
    }
    if (!state.isFlightValidated || !(state.flightNumber || "").trim()) {
      toast.error("Please verify the flight number or enter flight details manually before payment.");
      return;
    }

    const serviceClock = resolveBookingServiceTime(state) || state.serviceTime;
    if (!state.serviceDate || !serviceClock) {
      toast.error("Flight date and time are required before payment.");
      return;
    }

    const originCode = (
      state.validatedFlightData?.origin?.code ||
      state.originCode ||
      (state.direction === "departure" ? state.airportCode : "")
    )
      .toString()
      .trim()
      .toUpperCase();
    const destCode = (
      state.validatedFlightData?.destination?.code ||
      state.destCode ||
      (state.direction === "arrival" ? state.airportCode : "")
    )
      .toString()
      .trim()
      .toUpperCase();

    if (!originCode || !destCode) {
      toast.error("Origin and destination airport codes are required. Please verify the flight first.");
      return;
    }

    const serviceAt = new Date(`${state.serviceDate}T${serviceClock}:00`);
    if (Number.isNaN(serviceAt.getTime())) {
      toast.error("The flight date or time is invalid. Please go back and verify the itinerary.");
      return;
    }

    const direction = (state.direction || "arrival").toLowerCase();
    const departureTime = direction === "arrival" ? undefined : serviceAt.toISOString();
    const arrivalTime = direction === "departure" ? undefined : serviceAt.toISOString();
    const packageSlug = (state.selectedPackageId || state.selectedPackage || state.selectedService || "gold")
      .toString()
      .trim()
      .toLowerCase();

    // Prefer the last validated authoritative total so Razorpay matches the review screen.
    const reviewTotal =
      Number(state.authoritativeValidationResult?.total) > 0
        ? Number(state.authoritativeValidationResult.total)
        : totalPrice;

    setBusy(true);
    const ref = bookingRef || `${getRefPrefix()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const res = await ApiClient.fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          preferredGateway: "RAZORPAY",
          passengerName: state.fullName,
          passengerEmail: state.email,
          passengerPhone: state.phone,
          serviceCategory: "Airport Assistance",
          serviceType: packageSlug,
          flightNum: state.flightNumber || "MANUAL-ENTRY",
          originCode,
          destCode,
          metadataJson: {
            journey_type: direction.toUpperCase(),
            direction,
            flight_type: (state.travelType || "domestic").toUpperCase(),
            travel_type: (state.travelType || "domestic").toUpperCase(),
            origin_iata: originCode,
            destination_iata: destCode,
            transit_code: state.transitCode || undefined,
            service_airport: (state.airportCode || "").toUpperCase(),
            terminal: state.selectedTerminal || undefined,
            pax_adults: state.guestCount || 1,
            guest_count: state.guestCount || 1,
            package: packageSlug,
            unit_price:
              Number(state.authoritativeValidationResult?.selectedPackage?.price) ||
              Number(priceBreakdown?.unitTotal) ||
              undefined,
          },
          departureTime,
          arrivalTime,
          totalAmount: reviewTotal,
          currency: state.catalogCurrency || "INR",
          notes: state.specialRequests || `Airport: ${state.airportCode}, Direction: ${state.direction}`,
        }),
      });
      const result = await res.json().catch(() => null);
      const apiError = extractBookingApiError(result);

      if (res.ok && result && result.success) {
        const confirmedRef = result.data?.bookingRef || result.data?.booking_ref || ref;
        setBookingRef(confirmedRef);
        if (result.data?.payment_token) {
          setPaymentToken(String(result.data.payment_token));
        }

        const orderId = result.data?.razorpay_order_id;
        const keyId = result.data?.razorpay_key_id;
        const iciciRedirect = result.data?.icici_redirect_url;
        const paymentGateway = String(result.data?.payment_gateway || "").toUpperCase();
        const authoritativeAmount = Number(result.data?.totalAmount || reviewTotal);
        const currency = result.data?.currency || state.catalogCurrency || "INR";
        const amountPaise = result.data?.razorpay_amount_paise;

        if (
          Number.isFinite(reviewTotal) &&
          Number.isFinite(authoritativeAmount) &&
          Math.abs(authoritativeAmount - reviewTotal) > 1
        ) {
          console.warn(
            `[AirportWorkflow] Charge ₹${authoritativeAmount} differs from review ₹${reviewTotal}`
          );
        }

        if (paymentGateway === "ICICI" || iciciRedirect) {
          if (!iciciRedirect || typeof iciciRedirect !== "string") {
            setPaymentStatus("DISMISSED");
            toast.error(apiError || result?.error || "Booking saved. ICICI payment could not be started — use Retry Payment.");
            setBusy(false);
            return;
          }
          setPaymentStatus("OPEN");
          toast.loading("Redirecting to ICICI Bank secure payment…", { id: "icici-redirect" });
          window.location.assign(iciciRedirect);
          return;
        }

        if (orderId && keyId && !String(orderId).startsWith("order_sim_")) {
          await launchRazorpayModal(orderId, keyId, authoritativeAmount, currency, confirmedRef, amountPaise);
        } else {
          setPaymentStatus("DISMISSED");
          toast.error(apiError || result?.error || "Booking saved. Payment could not be started — use Retry Payment.");
          setBusy(false);
        }
      } else {
        toast.error(apiError || "Error creating booking. Please try again.");
        setBusy(false);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to submit booking. Please try again.");
      setBusy(false);
    }
  }, [state, totalPrice, priceBreakdown, getRefPrefix, setCurrentStep, setBusy, setBookingRef, bookingRef, launchRazorpayModal]);

  const handleRetryPayment = useCallback(async () => {
    if (!bookingRef) {
      toast.error("No active booking found to retry. Please submit your details.");
      return;
    }

    setBusy(true);
    try {
      const res = await ApiClient.fetchWithAuth("/api/payments/retry", {
        method: "POST",
        body: JSON.stringify({
          booking_ref: bookingRef,
          payment_token: paymentToken,
          preferred_gateway: "RAZORPAY",
        }),
      });
      const result = await res.json().catch(() => null);
      const apiError = extractBookingApiError(result);

      if (res.ok && result && result.success) {
        if (result.data?.payment_token) {
          setPaymentToken(String(result.data.payment_token));
        }
        const orderId = result.data?.razorpay_order_id;
        const keyId = result.data?.razorpay_key_id;
        const iciciRedirect = result.data?.icici_redirect_url;
        const paymentGateway = String(result.data?.gateway || result.data?.payment_gateway || "").toUpperCase();
        const authoritativeAmount = Number(result.data?.totalAmount || totalPrice);
        const currency = result.data?.currency || state.catalogCurrency || "INR";
        const amountPaise = result.data?.razorpay_amount_paise;

        if (paymentGateway === "ICICI" || iciciRedirect) {
          if (!iciciRedirect || typeof iciciRedirect !== "string") {
            toast.error(apiError || "Unable to generate ICICI payment session for retry.");
            setBusy(false);
            return;
          }
          toast.loading("Redirecting to ICICI Bank secure payment…", { id: "icici-redirect" });
          window.location.assign(iciciRedirect);
          return;
        }

        if (orderId && keyId && !String(orderId).startsWith("order_sim_")) {
          await launchRazorpayModal(orderId, keyId, authoritativeAmount, currency, bookingRef, amountPaise);
        } else {
          toast.error(apiError || "Unable to generate payment order for retry.");
          setBusy(false);
        }
      } else {
        toast.error(apiError || "Payment retry failed. Please try again.");
        setBusy(false);
      }
    } catch (err) {
      console.error("Retry payment error:", err);
      toast.error("Failed to retry payment.");
      setBusy(false);
    }
  }, [bookingRef, paymentToken, totalPrice, state.catalogCurrency, launchRazorpayModal, setBusy]);


  const handleGoBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentStep <= 1) {
      const code = (state.airportCode || "").trim().toUpperCase();
      if (code) {
        navigate({ to: "/airports/$code", params: { code } });
        return;
      }
      navigate({ to: "/" });
      return;
    }
    if (currentStep >= 5) {
      navigate({ to: "/" });
      return;
    }
    setCurrentStep(currentStep - 1);
  }, [currentStep, state.airportCode, navigate, setCurrentStep]);

  return (
    <div className="space-y-6">
      <BookingProgressHeader
        currentStep={Math.min(currentStep, 5)}
        maxSteps={5}
        progress={currentConfig.progress}
        title={currentConfig.title}
        estTime={currentConfig.estTime}
        onSaveDraft={handleSaveDraft}
        onBack={handleGoBack}
      />

      <div className="w-full">
        {/* Main Workflow Form Card */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-visible text-slate-900"
            >
              {/* STEP 1: SEARCH & ENTER JOURNEY DETAILS */}
              {currentStep === 1 && (
                <AirportWorkflowStep1Journey
                  state={state}
                  isAirportPageBooking={isAirportPageBooking}
                  applyServiceDirection={applyServiceDirection}
                  updateState={updateState}
                  onNavigateToAirportHub={(code) => navigate({ to: "/airports/$code", params: { code } })}
                  onGoBack={handleGoBack}
                  onContinueToPackages={() => {
                    if (!state.airportCode) {
                      toast.error(
                        isAirportPageBooking
                          ? "Booking airport is missing. Please return to the airport page and try again."
                          : "Please complete origin and destination."
                      );
                      return;
                    }
                    if (!state.serviceDate) {
                      toast.error("Please select a travel date.");
                      return;
                    }
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}

              {/* STEP 2: SELECT SERVICES FROM MASTER AIRPORT CATALOG */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <AirportServiceErrorAndUncoveredState
                    state={state}
                    isAirportPageBooking={isAirportPageBooking}
                    updateState={updateState}
                    onOpenEditDrawer={() => setIsEditDrawerOpen(true)}
                    onGoBack={handleGoBack}
                  />

                  {/* COVERED AIRPORT STATE */}
                  {!state.isLoadingServices && !state.serviceFetchError && state.isAirportCovered !== false && (
                    <>
                      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                            Step 2 of 5 — Package
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold mt-2">
                            Select Airport Package
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1 font-medium">
                            Airport-filtered package catalog for {state.resolvedAirport?.name || state.airportName || state.airportCode}. Select an available package to proceed.
                          </p>
                        </div>
                        {!state.isFlightLocked && (
                          <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Journey</span>
                          </button>
                        )}
                      </div>

                      {/* Airport Package Grid */}
                      <AirportServiceSelection
                        state={state}
                        onChange={(fields) => updateState(fields)}
                        availablePackages={state.availablePackagesList}
                        catalogCurrency={state.catalogCurrency}
                        priceBreakdown={priceBreakdown}
                        onSelectPackage={(id) => selectPackage(id)}
                        selectedTerminal={state.selectedTerminal}
                      />

                      {/* Action Buttons */}
                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleGoBack}
                          className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!state.selectedPackageId) {
                              toast.error("Please select a package to continue.");
                              return;
                            }
                            setCurrentStep(3);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-mono text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3: GUEST DETAILS + FLIGHT */}
              {currentStep === 3 && (
                <PassengerDetailsStep
                  state={state}
                  onChange={(fields) => updateState(fields)}
                  onBack={() => setCurrentStep(2)}
                  onLookupFlight={validateAndSearchFlight}
                  onManualFlight={(manualData) => setManualFlightData(manualData)}
                  lookupBusy={busy}
                  onSaveDraft={async () => {
                    const saved = await saveDraftWithBackend();
                    if (saved) {
                      setCurrentStep(4);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    return saved;
                  }}
                  priceBreakdown={priceBreakdown}
                />
              )}

              {/* STEP 4: REVIEW SUMMARY & VALIDATION */}
              {currentStep === 4 && (
                <BookingSummaryReviewStep
                  state={state}
                  bookingRef={bookingRef || "SHF-DRAFT"}
                  priceBreakdown={priceBreakdown}
                  paymentStatus={paymentStatus}
                  onRetryPayment={handleRetryPayment}
                  onEditJourney={() => setCurrentStep(1)}
                  onEditServices={() => setCurrentStep(2)}
                  onEditPassengers={() => setCurrentStep(3)}
                  onBack={handleGoBack}
                  onProceedToPayment={handleSubmit}
                  validateWithBackend={validateWithBackend}
                />
              )}

              {/* STEP 5: BOOKING CONFIRMED */}
              {currentStep === 5 && (
                <BookingSuccessPass
                  title="Booking Confirmed"
                  subtitle={`Your concierge service at ${state.airportCode} has been requested.`}
                  badge="SUCCESS"
                  bookingRef={bookingRef || "SHF-AIR-CONFIRMED"}
                  guestSummary={`${state.fullName || "Guest"} — ${state.guestCount} Pax`}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Edit Journey Drawer */}
        <EditJourneyDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          flightData={state.validatedFlightData}
          serviceDate={state.serviceDate}
          onSave={(updatedData) => {
            updateState({
              flightNumber: updatedData.flightNum,
              serviceDate: updatedData.date,
              serviceTime: updatedData.time,
            });
            setIsEditDrawerOpen(false);
          }}
        />
      </div>
    </div>
  );
}
