import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { AIRPORTS } from "@/data/airports";
import { ShowcaseCard } from "@/components/airports/ShowcaseCard";
import { DARK, display, mono, SectionLabel } from "@/components/airports/Atoms";

export const Route = createFileRoute("/airports")({
  head: () => ({
    meta: [
      { title: "Destinations — Shafsky Aviation Airport Explorer" },
      {
        name: "description",
        content:
          "Explore Shafsky Aviation's 19 signature Indian airports and global hubs as cinematic destinations with concierge intelligence.",
      },
      { property: "og:title", content: "Shafsky Aviation — Destinations" },
      {
        property: "og:description",
        content: "Interactive destination explorer covering 19 Indian hubs in the Shafsky network.",
      },
      { property: "og:url", content: "https://aero-launch-sequence.lovable.app/airports" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://aero-launch-sequence.lovable.app/airports" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Shafsky Aviation Destinations",
          url: "https://aero-launch-sequence.lovable.app/airports",
        }),
      },
    ],
  }),
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-[#06090f] text-white">
      <h2 className="text-xl font-bold font-mono text-red-400">Destination Explorer Unavailable</h2>
      <p className="mt-2 text-xs text-white/60 max-w-md">
        Unable to load airport destinations at this time: {error.message}
      </p>
      <Link to="/" className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
        Return to Homepage
      </Link>
    </div>
  ),
  component: AirportsIndex,
});

function AirportsIndex() {
  const location = useLocation();

  if (location.pathname !== "/airports") {
    return <Outlet />;
  }

  return (
    <main style={{ background: DARK.bg, color: DARK.ink }} className="min-h-screen">
      {/* nav */}
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: "rgba(6,9,15,0.6)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${DARK.line}`,
        }}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-8 md:px-14 md:py-5">
          <Link
            to="/"
            className="min-w-0 truncate text-[11px] uppercase tracking-[0.28em] sm:text-[12px] sm:tracking-[0.4em]"
            style={{ ...mono, color: DARK.ink }}
          >
            ← Shafsky Aviation
          </Link>
          <div
            className="shrink-0 text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.4em]"
            style={{ ...mono, color: DARK.blue }}
          >
            Destinations · {AIRPORTS.length}
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-[1600px] px-4 pb-20 pt-40 sm:px-8 md:px-16 md:pt-44">
        <SectionLabel index="00" label="Interactive Destination Explorer" />
        <h1
          className="mt-10 max-w-6xl text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.95]"
          style={{ ...display, letterSpacing: 0 }}
        >
          Every airport is a <span style={{ color: DARK.blue, fontStyle: "italic" }}>city</span>.
          <br />
          Every city is an <span style={{ fontStyle: "italic" }}>arrival.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-[17px] leading-relaxed" style={{ color: DARK.mute }}>
          The Shafsky network covers {AIRPORTS.length} signature destinations. Step inside each
          terminal before you ever board — landmarks, weather, transport and concierge intelligence,
          curated.
        </p>
      </section>

      {/* grid */}
      <section className="mx-auto max-w-[1600px] px-4 pb-32 sm:px-8 md:px-16">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {AIRPORTS.map((a, i) => (
            <ShowcaseCard key={a.code} a={a} idx={i} />
          ))}
        </div>
      </section>

      <footer
        className="border-t px-4 py-12 text-[10px] uppercase tracking-[0.28em] sm:px-8 sm:tracking-[0.4em] md:px-16"
        style={{ borderColor: DARK.line, ...mono, color: DARK.mute }}
      >
        © Shafsky Aviation — Suswagatam Meet & Greet
      </footer>
    </main>
  );
}
