import { createFileRoute } from "@tanstack/react-router";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us | Shafsky Aviation Services Pvt. Ltd. (SUSWAGATAM)" },
      {
        name: "description",
        content:
          "Learn about Shafsky Aviation Services Pvt. Ltd. and brand SUSWAGATAM – delivering bespoke airport Meet & Greet and concierge experiences with a legacy dating back to 1986.",
      },
    ],
  }),
  component: AboutUsPage,
});

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div
        className="relative w-full py-16 sm:py-20 lg:py-24 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(14,19,27,0.92), rgba(14,19,27,0.75)), url('/images/footer-plane-bg.webp')",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-[#cca028] font-bold tracking-widest text-xs uppercase mb-3">
            WHO WE ARE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-serif tracking-tight">
            About Shafsky Aviation Services
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 font-sans max-w-2xl mx-auto">
            Shafsky Aviation Services Pvt. Ltd. &mdash; Brand &ldquo;SUSWAGATAM&rdquo;
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <article className="prose prose-slate max-w-none text-[15px] sm:text-base leading-relaxed font-sans text-gray-700 space-y-6">
          <div className="border-l-4 border-[#cca028] pl-5 py-1 bg-amber-50/50 rounded-r-md">
            <p className="text-gray-900 font-medium leading-relaxed m-0">
              We would like to introduce ourselves as Shafsky Aviation Services Pvt. Ltd. with brand name &ldquo;SUSWAGATAM&rdquo;. &ldquo;Welcome &amp; Assist Services&rdquo; providing Meet &amp; Greet and Lounge Service to domestic and international passengers.
            </p>
          </div>

          <p>
            Shafsky Aviation Services Pvt. Ltd., under the distinguished brand SUSWAGATAM &ndash; Welcome &amp; Assist Services, delivers bespoke airport concierge experiences for discerning domestic and international travelers.
          </p>

          <p>
            With a rich aviation legacy dating back to 1986, we bring unparalleled expertise across Safety &amp; Security, Operations, Commercial Services, and Ground Handling. Our highly trained professionals ensure every interaction reflects precision, discretion, and world-class service standards.
          </p>

          {ICICI_REVIEW_MODE ? (
            <p>
              From personalized Meet &amp; Greet and exclusive lounge access to seamless airport assistance&mdash;our services are designed to elevate every airport journey into a seamless and refined experience.
            </p>
          ) : (
            <p>
              From personalized Meet &amp; Greet and exclusive lounge access to curated travel, luxury transport, hotel arrangements, air charters, and event management&mdash;our services are designed to elevate every journey into a seamless and refined experience.
            </p>
          )}

          <p>
            We further specialize in VIP/CIP security assistance, foreign exchange facilitation, infant care, and dedicated support for elderly and differently-abled passengers. At SUSWAGATAM, every detail is thoughtfully managed to deliver comfort, safety, and effortless travel with understated elegance.
          </p>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50/60 text-center">
              <span className="block text-2xl font-bold text-[#cca028] font-serif mb-1">1986</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Aviation Legacy</span>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50/60 text-center">
              <span className="block text-2xl font-bold text-[#cca028] font-serif mb-1">SUSWAGATAM</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Welcome &amp; Assist</span>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg bg-gray-50/60 text-center">
              <span className="block text-2xl font-bold text-[#cca028] font-serif mb-1">VIP &amp; CIP</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Bespoke Concierge</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
