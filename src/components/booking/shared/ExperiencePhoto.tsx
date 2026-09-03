import React from "react";

interface ExperiencePhotoProps {
  src: string;
  alt: string;
  badge?: string;
  caption?: string;
  aspectRatio?: string;
  className?: string;
}

export function ExperiencePhoto({
  src,
  alt,
  badge,
  caption,
  aspectRatio = "16 / 10",
  className = "",
}: ExperiencePhotoProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Clean Photo Container - Zero Text Overlays on the Photograph itself */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-sm transition-all duration-300"
        style={{ aspectRatio }}
      >
        <picture className="w-full h-full block">
          <source srcSet={src} type="image/jpeg" />
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover select-none"
          />
        </picture>
      </div>

      {/* External Metadata Row Below the Photo */}
      {(badge || caption) && (
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-500">
          {badge && (
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#b38a2e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              {badge}
            </span>
          )}
          {caption && <span className="text-slate-400 text-right truncate ml-2">{caption}</span>}
        </div>
      )}
    </div>
  );
}
