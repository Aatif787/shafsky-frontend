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

  it("renders the hero carousel with images, thumbnails, and badges", () => {
    const html = renderToString(<LoungeHeroCarousel />);

    expect(html).toContain("VIP Lounge Access");
    expect(html).toContain("/images/lounge/lounge1.png");
    expect(html).toContain("/images/lounge/lounge2.png");
    expect(html).toContain("/images/lounge/lounge3.png");
    expect(html).toContain("/images/lounge/lounge4.png");
    expect(html).toContain("Executive First Class Lounge");
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
