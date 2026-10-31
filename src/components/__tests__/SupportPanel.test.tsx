import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SUPPORT_DEPARTMENTS,
  SupportDepartment,
} from "../navigation/supportData";
import { SupportPage } from "@/components/views/SupportPageView";

// Mock router primitives
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) =>
    React.createElement("a", { ...props, href: to }, children),
  useLocation: () => ({ pathname: "/support", search: "" }),
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

describe("Support Department Directory & Dedicated /support Page Verification", () => {
  it("contains exactly 5 canonical departments with complete data", () => {
    expect(SUPPORT_DEPARTMENTS).toHaveLength(5);
  });

  it("DEPARTMENT 1 — Meet & Greet and Lounge", () => {
    const dept1 = SUPPORT_DEPARTMENTS[0];
    expect(dept1.departmentNumber).toBe(1);
    expect(dept1.title).toBe("Meet & Greet and Lounge");

    // 2 Phone numbers
    expect(dept1.phones).toHaveLength(2);
    expect(dept1.phones[0].display).toBe("+91-9599087959");
    expect(dept1.phones[0].tel).toBe("tel:+919599087959");
    expect(dept1.phones[1].display).toBe("+91 95996 15459");
    expect(dept1.phones[1].tel).toBe("tel:+919599615459");

    // Email
    expect(dept1.emails).toHaveLength(1);
    expect(dept1.emails[0].display).toBe("Gro.shafskyaviation@gmail.com");
    expect(dept1.emails[0].email).toBe("mailto:Gro.shafskyaviation@gmail.com");
  });

  it("DEPARTMENT 2 — Air Ticketing, Event Management, Transportation & Hotels", () => {
    const dept2 = SUPPORT_DEPARTMENTS[1];
    expect(dept2.departmentNumber).toBe(2);
    expect(dept2.title).toBe(
      "Air Ticketing, Event Management, Transportation & Hotels"
    );

    // Phone exact string and tel: link
    expect(dept2.phones).toHaveLength(1);
    expect(dept2.phones[0].display).toBe("+91-9599087957");
    expect(dept2.phones[0].tel).toBe("tel:+919599087957");

    // Email exact string and mailto: link
    expect(dept2.emails).toHaveLength(1);
    expect(dept2.emails[0].display).toBe("shafskyaviation.social@gmail.com");
    expect(dept2.emails[0].email).toBe("mailto:shafskyaviation.social@gmail.com");
  });

  it("DEPARTMENT 3 — Visa Assistance, Air Ticketing, Hotels & General Inquiry", () => {
    const dept3 = SUPPORT_DEPARTMENTS[2];
    expect(dept3.departmentNumber).toBe(3);
    expect(dept3.title).toBe(
      "Visa Assistance, Air Ticketing, Hotels & General Inquiry"
    );

    // Phone exact string and tel: link
    expect(dept3.phones).toHaveLength(1);
    expect(dept3.phones[0].display).toBe("+91 92175 22660");
    expect(dept3.phones[0].tel).toBe("tel:+919217522660");

    // Email exact string and mailto: link
    expect(dept3.emails).toHaveLength(1);
    expect(dept3.emails[0].display).toBe("commercialshafskyaviation@gmail.com");
    expect(dept3.emails[0].email).toBe(
      "mailto:commercialshafskyaviation@gmail.com"
    );
  });

  it("DEPARTMENT 4 — Escalation", () => {
    const dept4 = SUPPORT_DEPARTMENTS[3];
    expect(dept4.departmentNumber).toBe(4);
    expect(dept4.title).toBe("Escalation");

    // 2 Phone numbers
    expect(dept4.phones).toHaveLength(2);
    expect(dept4.phones[0].display).toBe("+91 98188 50755");
    expect(dept4.phones[0].tel).toBe("tel:+919818850755");
    expect(dept4.phones[1].display).toBe("+91 95992 24680");
    expect(dept4.phones[1].tel).toBe("tel:+919599224680");

    // 2 Email addresses
    expect(dept4.emails).toHaveLength(2);
    expect(dept4.emails[0].display).toBe("gm.shafskyaviation@gmail.com");
    expect(dept4.emails[0].email).toBe("mailto:gm.shafskyaviation@gmail.com");
    expect(dept4.emails[1].display).toBe("hr.shafskyaviation@gmail.com");
    expect(dept4.emails[1].email).toBe("mailto:hr.shafskyaviation@gmail.com");
  });

  it("DEPARTMENT 5 — Finance", () => {
    const dept5 = SUPPORT_DEPARTMENTS[4];
    expect(dept5.departmentNumber).toBe(5);
    expect(dept5.title).toBe("Finance");

    // Phone exact string and tel: link
    expect(dept5.phones).toHaveLength(1);
    expect(dept5.phones[0].display).toBe("+91 88006 98554");
    expect(dept5.phones[0].tel).toBe("tel:+918800698554");

    // Email exact string and mailto: link
    expect(dept5.emails).toHaveLength(1);
    expect(dept5.emails[0].display).toBe("financeshafskyaviation@gmail.com");
    expect(dept5.emails[0].email).toBe(
      "mailto:financeshafskyaviation@gmail.com"
    );
  });

  it("renders dedicated SupportPage with all 5 department titles and contact details", () => {
    const html = renderToString(React.createElement(SupportPage));

    // Page Introduction
    expect(html).toContain("SUPPORT &amp; CONTACT");
    expect(html).toContain("How can we help you?");
    expect(html).toContain(
      "Connect directly with the right Shafsky Aviation team for reservations, travel assistance, guest relations, escalations, and finance enquiries."
    );

    // All Department titles
    expect(html).toContain("Air Ticketing, Event Management, Transportation &amp; Hotels");
    expect(html).toContain("Visa Assistance, Air Ticketing, Hotels &amp; General Inquiry");
    expect(html).toContain("Meet &amp; Greet and Lounge");
    expect(html).toContain("Escalation");
    expect(html).toContain("Finance");

    // Every phone number visible
    expect(html).toContain("+91-9599087957");
    expect(html).toContain("+91 92175 22660");
    expect(html).toContain("+91-9599087959");
    expect(html).toContain("+91 95996 15459");
    expect(html).toContain("+91 98188 50755");
    expect(html).toContain("+91 95992 24680");
    expect(html).toContain("+91 88006 98554");

    // Every email address visible
    expect(html).toContain("shafskyaviation.social@gmail.com");
    expect(html).toContain("commercialshafskyaviation@gmail.com");
    expect(html).toContain("Gro.shafskyaviation@gmail.com");
    expect(html).toContain("gm.shafskyaviation@gmail.com");
    expect(html).toContain("hr.shafskyaviation@gmail.com");
    expect(html).toContain("financeshafskyaviation@gmail.com");

    // Action links
    expect(html).toContain('href="tel:+919599087957"');
    expect(html).toContain('href="tel:+919217522660"');
    expect(html).toContain('href="tel:+919599087959"');
    expect(html).toContain('href="tel:+919599615459"');
    expect(html).toContain('href="tel:+919818850755"');
    expect(html).toContain('href="tel:+919599224680"');
    expect(html).toContain('href="tel:+918800698554"');

    expect(html).toContain('href="mailto:shafskyaviation.social@gmail.com"');
    expect(html).toContain('href="mailto:commercialshafskyaviation@gmail.com"');
    expect(html).toContain('href="mailto:Gro.shafskyaviation@gmail.com"');
    expect(html).toContain('href="mailto:gm.shafskyaviation@gmail.com"');
    expect(html).toContain('href="mailto:hr.shafskyaviation@gmail.com"');
    expect(html).toContain('href="mailto:financeshafskyaviation@gmail.com"');

    // Call and Email buttons
    expect(html).toContain(">Call Now</span>");
    expect(html).toContain(">Send Email</span>");

    // Full website footer is present at the bottom
    expect(html).toContain("About Shafsky Aviation Services");
    expect(html).toContain("SUSWAGATAM");
    expect(html).toContain("Quick Links");
    expect(html).toContain("Contact Us");
    expect(html).toContain("Copyright 2024 Shafsky Aviation Services Pvt. Ltd.");
  });
});
