import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Navigation, NAV_ITEMS, PRIMARY_SERVICES } from "../Navigation";

// Mock router primitives
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) =>
    React.createElement("a", { ...props, href: to }, children),
  useLocation: () => ({ pathname: "/", search: "" }),
  useNavigate: () => vi.fn(),
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

describe("Navigation navbar (Direct Individual Links)", () => {
  it("defines NAV_ITEMS in the exact required order with correct routes", () => {
    expect(NAV_ITEMS).toHaveLength(8);

    expect(NAV_ITEMS[0]).toEqual({
      label: "Meet & Greet & Lounge",
      href: "/solutions/concierge",
    });
    expect(NAV_ITEMS[1]).toEqual({
      label: "Transport",
      href: "/solutions/transport",
    });
    expect(NAV_ITEMS[2]).toEqual({
      label: "Hotel",
      href: "/solutions/hotels",
    });
    expect(NAV_ITEMS[3]).toEqual({
      label: "Private Charter",
      href: "/solutions/aviation",
    });
    expect(NAV_ITEMS[4]).toEqual({
      label: "Ticketing",
      href: "/solutions/special-services?sub=ticketing",
    });
    expect(NAV_ITEMS[5]).toEqual({
      label: "Airports",
      href: "/airports",
    });
    expect(NAV_ITEMS[6]).toEqual({
      label: "Gallery",
      href: "/gallery",
    });
    expect(NAV_ITEMS[7]).toEqual({
      label: "Contact",
      href: "/contact",
    });
  });

  it("renders all 8 individual links directly in the navbar without a dropdown or mega-menu", () => {
    const html = renderToString(React.createElement(Navigation, { visible: true }));

    // NO dropdown or mega-menu trigger
    expect(html).not.toContain('aria-haspopup="true"');
    expect(html).not.toContain(">Services</span>");

    // All 5 services appear directly as links
    expect(html).toContain('href="/solutions/concierge"');
    expect(html).toContain("Meet &amp; Greet &amp; Lounge");

    expect(html).toContain('href="/solutions/transport"');
    expect(html).toContain(">Transport</span>");

    expect(html).toContain('href="/solutions/hotels"');
    expect(html).toContain(">Hotel</span>");

    expect(html).toContain('href="/solutions/aviation"');
    expect(html).toContain(">Private Charter</span>");

    expect(html).toContain('href="/solutions/special-services?sub=ticketing"');
    expect(html).toContain(">Ticketing</span>");

    // Other nav items
    expect(html).toContain('href="/airports"');
    expect(html).toContain(">Airports</span>");

    expect(html).toContain('href="/gallery"');
    expect(html).toContain(">Gallery</span>");

    expect(html).toContain('href="/contact"');
    expect(html).toContain(">Contact</span>");

    // Right-side items
    expect(html).toContain("+91 9599087959");
    expect(html).toContain('href="/login"');
    expect(html).toContain("Sign In");
    expect(html).toContain('href="/#book"');
    expect(html).toContain("Book Now");
  });

  it("keeps PRIMARY_SERVICES definition for backwards compatibility", () => {
    expect(PRIMARY_SERVICES).toHaveLength(5);
    expect(PRIMARY_SERVICES[0].href).toBe("/solutions/concierge");
  });
});
