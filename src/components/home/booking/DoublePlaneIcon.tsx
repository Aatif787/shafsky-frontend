import React from "react";
import { Plane } from "lucide-react";

export function DoublePlaneIcon({ className }: { className?: string }) {
  return (
    <span
      className={`relative flex items-center justify-center h-4.5 w-4.5 shrink-0 ${className || ""}`}
    >
      {/* Background Curved Exchange Arrows SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 w-full h-full text-current pointer-events-none"
      >
        {/* Left curved arrow */}
        <path d="M10 3.5A8.5 8.5 0 0 0 3 11.5" />
        <polyline points="1 9.5 3 11.5 5 9.5" />

        {/* Right curved arrow */}
        <path d="M14 20.5a8.5 8.5 0 0 0 7-8" />
        <polyline points="23 14.5 21 12.5 19 14.5" />
      </svg>

      {/* Top-Right Plane */}
      <Plane className="w-3.5 h-3.5 text-current translate-x-[2.5px] translate-y-[-2.5px] shrink-0 relative z-10" />

      {/* Bottom-Left Plane */}
      <Plane className="absolute w-3.5 h-3.5 text-current translate-x-[-2.5px] translate-y-[2.5px] rotate-180 shrink-0 z-10" />
    </span>
  );
}
