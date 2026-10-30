import { getAirportGuide } from "@/data/airportGuides";

/**
 * Long-form SEO guide content for airport destination pages.
 * Renders only when guide data exists for the airport code.
 */
export function AirportGuide({ code }: { code: string }) {
  const guide = getAirportGuide(code);
  if (!guide) return null;

  return (
    <section
      aria-label={`${guide.code} airport guide`}
      className="px-4 py-14 sm:px-8 md:px-16 md:py-20 bg-white border-t border-slate-200"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-sans">
          {guide.code} Airport Guide: Meet &amp; Greet, Fast-Track &amp; Transfers
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">{guide.intro}</p>

        {guide.sections.map((section) => (
          <div key={section.heading} className="mt-10">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-sans">
              {section.heading}
            </h3>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-4 text-slate-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <div className="mt-10 rounded-2xl bg-slate-900 px-6 py-6 text-white">
          <p className="font-bold text-lg">Ready to book your airport assistance?</p>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Choose {guide.code} on the booking page, pick arrival or departure, and get a
            transparent quote with your host details before travel day.
          </p>
          <a
            href="/book"
            className="mt-4 inline-block rounded-xl bg-white px-6 py-3 font-bold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Book {guide.code} Meet &amp; Greet
          </a>
        </div>
      </div>
    </section>
  );
}
