import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  LoungeHeroCarousel,
  LoungeGalleryGrid,
  LOUNGE_IMAGES,
} from "../lounge/LoungeGalleryShowcase";

describe("LoungeGalleryShowcase Component", () => {
  it("includes all 4 lounge images from /images/lounge/", () => {
    expect(LOUNGE_IMAGES).toHaveLength(4);
    expect(LOUNGE_IMAGES.map((img) => img.src)).toEqual([
      "/images/lounge/lounge1.png",
      "/images/lounge/lounge2.png",
      "/images/lounge/lounge3.png",
      "/images/lounge/lounge4.png",
    ]);
  });

  it("renders the hero showcase carousel with pure clean images and navigation controls without text on images", () => {
    const html = renderToString(<LoungeHeroCarousel />);

    // STRICT REQUIREMENT: Absolutely no text overlays written on the image
    expect(html).not.toContain("VIP Lounge Access");

    // All 4 high-resolution lounge photos rendered
    expect(html).toContain("/images/lounge/lounge1.png");
    expect(html).toContain("/images/lounge/lounge2.png");
    expect(html).toContain("/images/lounge/lounge3.png");
    expect(html).toContain("/images/lounge/lounge4.png");

    // Navigation and slide indicators present
    expect(html).toContain("Previous photo");
    expect(html).toContain("Next photo");
    expect(html).toContain("Go to slide 1");
  });

  it("renders the 100% mobile-first gallery grid with all 4 lounge spaces", () => {
    const html = renderToString(<LoungeGalleryGrid />);

    expect(html).toContain("Explore Premier Airport Lounge Spaces");
    expect(html).toContain("Executive First Class Lounge");
    expect(html).toContain("Private Rest &amp; Wellness Pods");
    expect(html).toContain("Executive Business Sanctuaries");
    expect(html).toContain("Artisanal Gourmet Dining &amp; Bar");

    // All 4 image sources present
    LOUNGE_IMAGES.forEach((item) => {
      expect(html).toContain(item.src);
    });
  });
});
