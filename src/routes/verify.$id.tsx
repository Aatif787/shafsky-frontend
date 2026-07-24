import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getActiveBrandingServer } from "@/lib/branding/branding.server";
import { CheckCircle2, Plane, AlertTriangle, Calendar, Users, Shield, ArrowRight } from "lucide-react";

// Server function to securely fetch public booking details without exposing sensitive info
const fetchPublicBooking = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: bookingId }) => {
    try {
      const { getPublicBookingVerificationServer } = await import("@/lib/bookings.functions");
      const bookingData = await getPublicBookingVerificationServer({ data: bookingId });
      const branding = await getActiveBrandingServer();

      return {
        booking: bookingData,
        branding,
      };
    } catch (e) {
      console.error("[Verify] Error fetching public booking:", e);
      return null;
    }
  });

export const Route = createFileRoute("/verify/$id")({
  component: VerifyRouteComponent,
});

function VerifyRouteComponent() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["public-booking", id],
    queryFn: () => fetchPublicBooking({ data: id }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbfa]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c5a059]"></div>
        <p className="text-xs text-[#576875] mt-4 tracking-widest font-mono uppercase">Verifying Reservation...</p>
      </div>
    );
  }

  if (!data || !data.booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbfa] px-6">
        <div className="max-w-md w-full bg-white border border-[#e2e8f0] rounded-2xl p-8 text-center shadow-lg">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-semibold text-[#0b1a24] mb-2">Verification Failed</h2>
          <p className="text-sm text-[#576875] mb-6">
            This reservation code could not be verified or does not exist. If you believe this is an error, please contact dispatch operations.
          </p>
          <Link
            to="/"
            className="inline-block w-full py-3 bg-[#0d2a36] text-[#c5a059] font-medium rounded-xl hover:bg-[#123847] transition duration-200"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const { booking, branding } = data;

  // Mask name for privacy (e.g. Tariq -> T****q)
  const maskName = (name: string) => {
    if (name.length <= 2) return name;
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col items-center py-12 px-6">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        {branding.logo_url ? (
          <img
            src={branding.logo_dark_url || branding.logo_url}
            alt={branding.company_name}
            className="h-12 md:h-16 w-auto object-contain mx-auto"
          />
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold uppercase tracking-[0.25em] text-[#0b1a24]">
              {branding.company_name}
            </h1>
            <p className="text-[10px] tracking-[0.45em] text-[#576875] uppercase mt-1">
              SUSWAGATAM
            </p>
          </div>
        )}
      </div>

      {/* Verification Card */}
      <div className="max-w-xl w-full bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Luxury Top Bar */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-[#c5a059]" />

        {/* Verification Status Banner */}
        <div className="flex flex-col items-center gap-4 text-center pb-6 border-b border-dashed border-[#e2e8f0]">
          <div className="h-16 w-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059] flex items-center justify-center text-[#c5a059]">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold tracking-wider uppercase mb-2">
              <Shield size={10} /> Digital Passport Verified
            </span>
            <h2 className="text-2xl font-bold text-[#0b1a24] font-serif">
              Reservation Confirmed
            </h2>
            <p className="text-xs text-[#576875] mt-1 font-mono tracking-widest uppercase">
              REF: {booking.booking_ref}
            </p>
          </div>
        </div>

        {/* Booking Details Table */}
        <div className="py-6 border-b border-dashed border-[#e2e8f0] flex flex-col gap-4 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-[#576875] flex items-center gap-2"><Users size={14} /> Passenger</span>
            <span className="font-semibold text-[#0b1a24]">{maskName(booking.contact_name)}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#576875] flex items-center gap-2"><Plane size={14} /> Flight Class</span>
            <span className="font-semibold text-[#0b1a24]">{booking.service_type || "VVIP First Class"}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#576875] flex items-center gap-2"><ArrowRight size={14} /> Routing</span>
            <span className="font-semibold text-[#0b1a24] font-mono">{booking.origin} → {booking.destination}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#576875] flex items-center gap-2"><Calendar size={14} /> Depart Date</span>
            <span className="font-semibold text-[#0b1a24] font-mono">{booking.depart_date}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#576875] flex items-center gap-2"><Users size={14} /> Travelers</span>
            <span className="font-semibold text-[#0b1a24]">
              {booking.pax_adults} Adult(s)
              {booking.pax_children > 0 && `, ${booking.pax_children} Child(ren)`}
              {booking.pax_infants > 0 && `, ${booking.pax_infants} Infant(s)`}
            </span>
          </div>

          {booking.services.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[#576875]">Concierge Add-ons:</span>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex flex-col gap-1.5">
                {booking.services.map((s: any, idx: number) => (
                  <div key={`svc-${s.id || s.service_name || idx}`} className="flex justify-between text-[11px] font-semibold text-[#334155]">
                    <span>• {s.service_name}</span>
                    <span>Qty: {s.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed border-[#e2e8f0] pt-4 mt-2">
            <span className="uppercase text-[10px] tracking-wider text-[#576875] font-mono">
              Total Quote Price
            </span>
            <span className="text-xl font-bold text-[#0c3b46] dark:text-[#c5a059]">
              {booking.quote_currency || "INR"} {Number(booking.quote_amount || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Verification Meta Footer */}
        <div className="pt-6 text-center text-[10px] text-[#64748b] leading-relaxed">
          <p>This digital receipt serves as secure verification of airside slots, fast-track escorts, and airport concierge pre-staging.</p>
          <p className="mt-2 font-mono">Verified Hash: {booking.id.slice(0, 8).toUpperCase()}-{booking.booking_ref}</p>
        </div>
      </div>

      {/* Support Details */}
      <div className="mt-8 text-center text-xs text-[#576875]">
        <p>Need emergency changes? Contact 24/7 Dispatch:</p>
        <p className="mt-1 font-semibold text-[#0b1a24]">{branding.support_email}  ·  {branding.support_phone}</p>
      </div>
    </div>
  );
}
