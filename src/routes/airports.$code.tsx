import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { AIRPORTS, getAirport, type Airport } from "@/data/airports";
import { DestinationHero } from "@/components/airports/DestinationHero";
import { DestinationBody } from "@/components/airports/DestinationBody";
import { ShowcaseCard } from "@/components/airports/ShowcaseCard";
import { DARK, display, mono, SectionLabel } from "@/components/airports/Atoms";

export const Route = createFileRoute("/airports/$code")({
  head: ({ params }) => {
    const a = getAirport(params.code);
    const url = `https://aero-launch-sequence.lovable.app/airports/${params.code}`;
    const title = a ? `${a.city} (${a.code}) — Shafsky Aviation` : "Destination — Shafsky Aviation";
    const desc = a
      ? `${a.tagline}. Concierge intelligence for ${a.airport.name}.`
      : "Shafsky destination";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(a?.cover ? [{ property: "og:image", content: a.cover }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: a
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: a.faqs.map(([q, ans]) => ({
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: ans },
                })),
              }),
            },
          ]
        : [],
    };
  },
  loader: ({ params }) => {
    const a = getAirport(params.code);
    if (!a) throw notFound();
    return a;
  },
  component: DestinationPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 style={display} className="text-5xl">
          Destination not found
        </h1>
        <Link to="/airports" className="mt-6 inline-block text-[#5ed3ff]" style={mono}>
          ← Back to all destinations
        </Link>
      </div>
    </div>
  ),
});

function DestinationPage() {
  const a = Route.useLoaderData() as Airport;

  useEffect(() => {
    if (a) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [a]);

  if (!a) {
    return null;
  }

  const related = (a.related || [])
    .map((code) => getAirport(code))
    .filter((item): item is Airport => !!item);

  return (
    <main style={{ background: DARK.bg, color: DARK.ink }}>
      {/* mini nav */}
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: "rgba(6,9,15,0.55)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${DARK.line}`,
        }}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-8 md:px-14 md:py-5">
          <Link
            to="/airports"
            className="min-w-0 truncate text-[11px] uppercase tracking-[0.28em] sm:text-[12px] sm:tracking-[0.4em]"
            style={{ ...mono, color: DARK.ink }}
          >
            ← All Destinations
          </Link>
          <div
            className="shrink-0 text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.4em]"
            style={{ ...mono, color: DARK.blue }}
          >
            {a.code} · {a.city}
          </div>
        </div>
      </header>

      <DestinationHero a={a} />
      <DestinationBody a={a} />

      {/* Related */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28" style={{ background: DARK.bg }}>
        <SectionLabel index="12" label="Related Destinations" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          Continue exploring.
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r, i) => (
            <ShowcaseCard key={r.code} a={r} idx={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="book"
        className="px-4 py-28 text-center sm:px-8 md:px-16 md:py-32"
        style={{ background: DARK.panel }}
      >
        <SectionLabel index="13" label="Book Suswagatam" />
        <h2
          className="mx-auto mt-8 max-w-5xl text-[clamp(2.4rem,6vw,5.4rem)] leading-[1]"
          style={display}
        >
          Luxury in <span style={{ color: DARK.blue, fontStyle: "italic" }}>{a.city}</span> begins
          before you land.
        </h2>
        <a
          href="https://wa.me/919599087959"
          className="mt-12 inline-block max-w-full px-7 py-5 text-[11px] uppercase tracking-[0.28em] transition-colors hover:bg-[#0a84ff] sm:px-12 sm:text-[12px] sm:tracking-[0.4em]"
          style={{
            ...mono,
            color: DARK.ink,
            background: DARK.blueDeep,
            border: `1px solid ${DARK.blue}`,
          }}
        >
          Charter Now · +91 95990 87959
        </a>
      </section>

      <footer
        className="border-t px-4 py-12 text-[10px] uppercase tracking-[0.28em] sm:px-8 sm:tracking-[0.4em] md:px-16"
        style={{ borderColor: DARK.line, ...mono, color: DARK.mute }}
      >
        © Shafsky Aviation
      </footer>
    </main>
  );
}
