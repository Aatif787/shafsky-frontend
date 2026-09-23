import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ApiClient } from "@/lib/ApiClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";

const searchSchema = z.object({
  ref: z.string().optional().catch(""),
  status: z.string().optional().catch(""),
  gateway: z.string().optional().catch(""),
});

export const Route = createFileRoute("/book/payment-result")({
  validateSearch: searchSchema,
  component: PaymentResultPage,
});

function PaymentResultPage() {
  const { ref, status, gateway } = Route.useSearch();
  const [phase, setPhase] = useState<"checking" | "paid" | "pending" | "failed">("checking");
  const [message, setMessage] = useState("Verifying payment with the bank…");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      if (status === "cancelled") {
        setPhase("failed");
        setMessage(
          "Payment was cancelled. Your booking is still unpaid — you can retry checkout when ready."
        );
        return;
      }

      if (!ref) {
        setPhase(status === "success" || status === "pending" ? "pending" : "failed");
        setMessage(
          status === "success" || status === "pending"
            ? "Payment submitted. We could not locate a booking reference — contact support with your payment receipt."
            : "Payment was not confirmed."
        );
        return;
      }

      attempts += 1;
      try {
        const res = await ApiClient.fetchWithAuth(`/api/bookings/${encodeURIComponent(ref)}/status`);
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && (data?.data?.status === "CONFIRMED" || data?.data?.paymentStatus === "PAID")) {
          setPhase("paid");
          setMessage("Payment verified. Your booking is confirmed.");
          return;
        }
      } catch {
        /* keep polling */
      }

      if (cancelled) return;
      if (attempts >= 12) {
        setPhase(status === "success" || status === "pending" ? "pending" : "failed");
        setMessage(
          status === "success" || status === "pending"
            ? "Payment is still being verified. Your booking will confirm once the bank response is processed. Do not pay again."
            : "Payment was not confirmed. You can retry from your booking if it is still pending."
        );
        return;
      }
      window.setTimeout(poll, 2500);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [ref, status]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ef]">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            {gateway === "icici" ? "ICICI Bank payment" : "Payment result"}
          </p>
          <h1 className="text-3xl font-serif text-stone-900">
            {phase === "paid"
              ? "Booking confirmed"
              : phase === "checking"
                ? "Processing payment…"
                : phase === "pending"
                  ? "Verification in progress"
                  : "Payment not confirmed"}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">{message}</p>
          {ref ? <p className="text-xs text-stone-500">Booking reference: {ref}</p> : null}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="px-5 py-2.5 bg-stone-900 text-white text-sm">
              Home
            </Link>
            {ref ? (
              <Link
                to="/book"
                search={{ service: "meet-greet" }}
                className="px-5 py-2.5 border border-stone-300 text-sm text-stone-800"
              >
                Back to booking
              </Link>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
