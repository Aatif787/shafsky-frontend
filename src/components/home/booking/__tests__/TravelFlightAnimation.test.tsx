import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { TravelFlightAnimation, TRAVEL_FLIGHT_PATH } from "../TravelFlightAnimation";

describe("TravelFlightAnimation Unit & Hydration Tests", () => {
  it("renders deterministic valid SVG markup matching video viewBox", () => {
    const html1 = renderToString(<TravelFlightAnimation />);
    const html2 = renderToString(<TravelFlightAnimation />);

    // Deterministic rendering
    expect(html1).toBe(html2);

    // Root SVG element
    expect(html1.startsWith("<svg")).toBe(true);
    expect(html1.endsWith("</svg>")).toBe(true);
    expect(html1).toContain('viewBox="0 0 1170 696"');
  });

  it("contains exact path from Map Pin 2 (right) through the down-loop to Map Pin 1 (left)", () => {
    const html = renderToString(<TravelFlightAnimation />);
    
    // Path starts at Map Pin 2 (949.0, 417.0) on the right
    expect(TRAVEL_FLIGHT_PATH.startsWith("M 949.0 417.0")).toBe(true);
    // Path ends at Map Pin 1 (279.0, 152.0) on the left
    expect(TRAVEL_FLIGHT_PATH.endsWith("279.0 152.0")).toBe(true);
    // Path is referenced in definitions and animation
    expect(html).toContain('id="travel-flight-path"');
    expect(html).toContain('<mpath href="#travel-flight-path"');
    // Follows the down way into the center loop down to y=239.4
    expect(TRAVEL_FLIGHT_PATH.includes("693.9 239.4")).toBe(true);
    // Enters loop through crossover point
    expect(TRAVEL_FLIGHT_PATH.includes("681.5 77.1")).toBe(true);
  });

  it("configures animateMotion with auto-rotation and default duration", () => {
    const html = renderToString(<TravelFlightAnimation />);
    expect(html).toContain('rotate="auto"');
    expect(html).toContain('dur="4.2s"');
    expect(html).toContain('repeatCount="indefinite"');
  });

  it("applies custom className cleanly", () => {
    const html = renderToString(<TravelFlightAnimation className="custom-flight-layer" />);
    expect(html).toContain("custom-flight-layer");
    expect(html).toContain("pointer-events-none");
  });
});
