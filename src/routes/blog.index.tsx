import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_ARTICLES } from "@/data/blogArticles";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  head: () =>
    pageHead({
      title: "Airport Guides & Travel Tips | Shafsky Aviation Blog",
      description:
        "Practical guides to airport Meet & Greet, fast-track clearance, lounge access and transfers across India — written by the Shafsky Aviation team.",
      path: "/blog",
      jsonLd: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])],
    }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full py-16 sm:py-20 bg-slate-900">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-sans tracking-tight">
            Airport Guides &amp; Travel Tips
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
            Honest, practical guides to Meet &amp; Greet, fast-track, lounges and
            transfers at Indian airports.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {BLOG_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              to="/blog/$slug"
              params={{ slug: article.slug }}
              className="block rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
                {article.publishedDate}
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900 font-sans">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {article.description}
              </p>
              <span className="mt-4 inline-block text-sm font-bold text-blue-700">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
