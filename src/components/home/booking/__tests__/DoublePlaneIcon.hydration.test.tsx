import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { DoublePlaneIcon } from "../DoublePlaneIcon";

describe("DoublePlaneIcon and BookingPanel Hydration Verification", () => {
  it("DoublePlaneIcon renders deterministic valid SVG markup", () => {
    const html1 = renderToString(<DoublePlaneIcon className="h-4 w-4 text-emerald-500" />);
    const html2 = renderToString(<DoublePlaneIcon className="h-4 w-4 text-emerald-500" />);

    // Deterministic markup: multiple renders must match character-by-character
    expect(html1).toBe(html2);

    // Must be a pure SVG root element, not a span
    expect(html1.startsWith("<svg")).toBe(true);
    expect(html1.endsWith("</svg>")).toBe(true);
    expect(html1).toContain('viewBox="0 0 24 24"');
    expect(html1).toContain("text-emerald-500");
  });

  it("DoublePlaneIcon handles undefined or empty className gracefully", () => {
    const html = renderToString(<DoublePlaneIcon />);
    expect(html.startsWith("<svg")).toBe(true);
    expect(html).toContain('aria-hidden="true"');
  });
});
