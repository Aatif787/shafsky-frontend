import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { PRESTIGIOUS_PROJECTS, PrestigiousProject } from "@/data/prestigiousProjects";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { mono } from "@/components/home/theme";
import { ShieldCheck, Award, Calendar, Layers, Camera } from "lucide-react";

export const Route = createFileRoute("/prestigious-projects")({
  head: () =>
    pageHead({
      title: "Prestigious Projects Handled | Shafsky Aviation Services",
      description:
        "Our portfolio reflects our involvement in major sporting events, institutional engagements, national conferences, entertainment movements and distinguished guest arrangements.",
      path: "/prestigious-projects",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Prestigious Projects Handled", path: "/prestigious-projects" },
        ]),
      ],
    }),
  component: PrestigiousProjectsPage,
});

type CategoryFilter = "All" | "Sports & Tournaments" | "Governance & Conclaves" | "Entertainment & VIP Delegations" | "Medical & Scientific Conferences";

export function PrestigiousProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");

  const categories: CategoryFilter[] = [
    "All",
    "Sports & Tournaments",
    "Governance & Conclaves",
    "Entertainment & VIP Delegations",
    "Medical & Scientific Conferences",
  ];

  const filteredProjects = selectedCategory === "All"
    ? PRESTIGIOUS_PROJECTS
    : PRESTIGIOUS_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between selection:bg-lime-200 selection:text-slate-950">
      {/* 1. Global Navigation Bar */}
      <Navigation visible={true} />

      {/* 2. Main Page Content */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20 sm:pb-28">
        {/* Header Introduction */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-[#0a196f] bg-[#0a196f]/5 border border-[#0a196f]/15 px-3 py-1 rounded-full"
              style={mono}
            >
              <Award size={13} className="text-[#0a196f]" />
              <span>SHAFSKY AVIATION | OUR EXPERIENCE</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-950 tracking-tight leading-[1.15] mb-4 font-serif">
            Prestigious Projects Handled
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            Our portfolio reflects our involvement in major sporting events, institutional engagements, national conferences, entertainment movements and distinguished guest arrangements.
          </p>

          {/* Editorial Category Filters */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const count = category === "All"
                ? PRESTIGIOUS_PROJECTS.length
                : PRESTIGIOUS_PROJECTS.filter((p) => p.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100/90 border border-slate-200/90"
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* 3. Portfolio Editorial Grid */}
        <section aria-label="Projects Portfolio">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 xl:gap-8 items-stretch">
            {filteredProjects.map((project: PrestigiousProject) => (
              <article
                key={project.id}
                className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Authentic Photography Frame */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 select-none"
                    />

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs border border-white/80">
                        {project.projectNumber}
                      </span>
                      {project.year && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-900 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs border border-white/80">
                          <Calendar size={11} className="text-lime-700" />
                          <span>{project.year}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 sm:p-6">
                    {/* Category Label */}
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0a196f] bg-[#0a196f]/5 border border-[#0a196f]/15 px-2.5 py-0.5 rounded-md inline-block">
                        {project.category}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h2 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#0a196f] transition-colors mb-3">
                      {project.title}
                    </h2>

                    {/* Verified Documentary Context */}
                    <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-2">
                      {project.photoContext}
                    </p>
                  </div>
                </div>

                {/* Attribution & Provenance Footer */}
                <div className="px-5 sm:px-6 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 truncate">
                    <Camera size={11} className="shrink-0 text-slate-400" />
                    <span className="truncate" title={project.photoSource}>
                      {project.photoSource}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-lime-800 uppercase tracking-wider bg-lime-50 px-2 py-0.5 rounded-sm border border-lime-200/60 shrink-0">
                    Official Record
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Assurance & Governance Note */}
        <section className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="w-10 h-10 rounded-xl bg-[#0a196f]/10 border border-[#0a196f]/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-[#0a196f]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Institutional Discretion &amp; Aviation Standards
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Shafsky Aviation Services operates with high protocol standards, discretion, and airside logistics compliance. Event imagery is presented for documented public venue and tournament record identification under respective public archive attributions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Complete Reusable Website Footer */}
      <Footer />
    </div>
  );
}

export default PrestigiousProjectsPage;
