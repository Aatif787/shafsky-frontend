import type { BlogArticle } from "@/data/blogArticles";

/** Renders [label](/path) inline markup as links. */
function renderRichText(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return (
        <a key={i} href={m[2]} className="text-blue-700 underline hover:text-blue-900">
          {m[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function BlogArticleView({ article }: { article: BlogArticle }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative w-full py-16 sm:py-20 lg:py-24 bg-slate-900">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Shafsky Aviation Guides
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-sans tracking-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
            {article.description}
          </p>
          <p className="mt-4 text-xs text-white/60">
            Published {article.publishedDate} · Shafsky Aviation Services
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <article className="text-[15px] sm:text-base leading-relaxed font-sans text-gray-700">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mb-4">
                  {renderRichText(p)}
                </p>
              ))}
            </section>
          ))}
        </article>

        {/* FAQ */}
        {article.faqs.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {article.faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-bold text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related links */}
        {article.relatedLinks.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related</h2>
            <ul className="space-y-2">
              {article.relatedLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-slate-900 px-6 py-8 text-white text-center">
          <p className="font-bold text-xl">Need airport assistance in India?</p>
          <p className="mt-2 text-slate-300 text-sm">
            Book Meet &amp; Greet, fast-track, lounge or transfers across 20 Indian
            airports — with a transparent quote and host details before you travel.
          </p>
          <a
            href="/book"
            className="mt-5 inline-block rounded-xl bg-white px-8 py-3 font-bold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  );
}
