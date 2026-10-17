import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { PRESTIGIOUS_PROJECTS } from "@/data/prestigiousProjects";
import { PrestigiousProjectsPage } from "@/routes/prestigious-projects";
import { Footer } from "@/components/home/sections/Footer";

// Mock router primitives
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) =>
    React.createElement("a", { ...props, href: to }, children),
  useLocation: () => ({ pathname: "/prestigious-projects", search: "" }),
  useNavigate: () => vi.fn(),
  createFileRoute: () => () => ({}),
}));

vi.mock("@/lib/session", () => ({
  getSessionInfo: vi.fn().mockResolvedValue({ userId: null, roles: [], isStaff: false }),
}));

vi.mock("@/lib/branding/branding.context", () => ({
  useBranding: () => ({
    branding: { logo_url: "/logo.png" },
    isLoading: false,
    refetch: () => {},
  }),
}));

describe("Prestigious Projects Handled — Data & Page Verification", () => {
  it("contains exactly 15 canonical projects with complete metadata", () => {
    expect(PRESTIGIOUS_PROJECTS).toHaveLength(15);

    const ids = new Set<string>();
    const numbers = new Set<string>();

    PRESTIGIOUS_PROJECTS.forEach((proj, idx) => {
      expect(proj.id).toBeTruthy();
      expect(ids.has(proj.id)).toBe(false);
      ids.add(proj.id);

      expect(proj.projectNumber).toBe(String(idx + 1).padStart(2, "0"));
      numbers.add(proj.projectNumber);

      expect(proj.title).toBeTruthy();
      expect(proj.category).toBeTruthy();
      expect(proj.image).toMatch(/^\/images\/prestigious-projects\/.+/);
      expect(proj.imageAlt).toBeTruthy();
      expect(proj.photoContext).toBeTruthy();
      expect(proj.photoSource).toBeTruthy();
    });

    expect(numbers.size).toBe(15);
  });

  it("ensures all 15 authentic project image files exist on disk in public/images/prestigious-projects", () => {
    PRESTIGIOUS_PROJECTS.forEach((proj) => {
      const relPath = proj.image.replace(/^\//, "");
      const fullPath = path.resolve(process.cwd(), "public", relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000); // Must be a valid, non-empty image asset
    });
  });

  it("verifies specific canonical event titles are preserved verbatim", () => {
    const titles = PRESTIGIOUS_PROJECTS.map((p) => p.title);

    expect(titles).toContain("ICC World Cup 2023 (under UPCA)");
    expect(titles).toContain(
      "Indian Premier League (IPL) & Women's Premier League (WPL) Teams 2024 & 2025"
    );
    expect(titles).toContain(
      "IPL, UPCA, BCCI and Election Commission related arrangements (2024)"
    );
    expect(titles).toContain("International Film Festival of India (IFFI) 2025");
    expect(titles).toContain("BWF Badminton Championships 2023 & 2024");
    expect(titles).toContain(
      "Badminton Association of India – Yonex Sunrise India Open 2024 & 2025"
    );
    expect(titles).toContain(
      "Syed Modi International Badminton Tournament (2023 & 2024)"
    );
    expect(titles).toContain("Punjab Cricket Association (2024)");
    expect(titles).toContain("TV9 National Conclave – Delhi (2024)");
    expect(titles).toContain(
      "India Live Scientific Meeting – Fortis Hospitals, Delhi (2024)"
    );
    expect(titles).toContain("Election Commission of India (2024)");
    expect(titles).toContain(
      "Destination Wedding Meet & Greet for UP Cabinet Ministers (2024)"
    );
    expect(titles).toContain(
      "SRK (Shahrukh Khan) Movement for his National Award Ceremony (2025)"
    );
    expect(titles).toContain("Hollywood Singer Akon Movement Handled");
    expect(titles).toContain("CSICON EVENT (77th CSI Annual Conference of CSI)");
  });

  it("renders Footer with Prestigious Projects Handled link", () => {
    const html = renderToString(React.createElement(Footer));
    expect(html).toContain('href="/prestigious-projects"');
    expect(html).toContain("Prestigious Projects Handled");
  });

  it("renders PrestigiousProjectsPage with header, 15 projects, and full footer", () => {
    const html = renderToString(React.createElement(PrestigiousProjectsPage));

    // Header eyebrow & titles
    expect(html).toContain("SHAFSKY AVIATION | OUR EXPERIENCE");
    expect(html).toContain("Prestigious Projects Handled");
    expect(html).toContain(
      "Our portfolio reflects our involvement in major sporting events, institutional engagements, national conferences, entertainment movements and distinguished guest arrangements."
    );

    // Categories
    expect(html).toContain("Sports &amp; Tournaments");
    expect(html).toContain("Governance &amp; Conclaves");
    expect(html).toContain("Entertainment &amp; VIP Delegations");
    expect(html).toContain("Medical &amp; Scientific Conferences");

    // All 15 project titles rendered (decode HTML entities to match verbatim title strings)
    const normalizedHtml = html
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');

    PRESTIGIOUS_PROJECTS.forEach((proj) => {
      expect(normalizedHtml).toContain(proj.title);
    });

    // Full website footer is present at the bottom
    expect(html).toContain("About Shafsky Aviation Services");
    expect(html).toContain("SUSWAGATAM");
    expect(html).toContain("Quick Links");
    expect(html).toContain("Copyright 2024 Shafsky Aviation Services Pvt. Ltd.");
  });
});
