import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SUPPORT_DEPARTMENTS,
  SupportDepartment,
} from "../navigation/supportData";
import {
  SupportPanel,
  DepartmentCard,
  SupportMobileAccordion,
} from "../navigation/SupportPanel";

// Mock router primitives
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) =>
    React.createElement("a", { ...props, href: to }, children),
}));

describe("Support Department Directory & Panel Verification", () => {
  it("contains exactly 5 canonical departments with complete data", () => {
    expect(SUPPORT_DEPARTMENTS).toHaveLength(5);
  });

  it("DEPARTMENT 1 — Air Ticketing, Event Management, Transportation & Hotels", () => {
    const dept1 = SUPPORT_DEPARTMENTS[0];
    expect(dept1.departmentNumber).toBe(1);
    expect(dept1.title).toBe(
      "Air Ticketing, Event Management, Transportation & Hotels"
    );

    // Phone exact string and tel: link
    expect(dept1.phones).toHaveLength(1);
    expect(dept1.phones[0].display).toBe("+91-9599087957");
    expect(dept1.phones[0].tel).toBe("tel:+919599087957");

    // Email exact string and mailto: link
    expect(dept1.emails).toHaveLength(1);
    expect(dept1.emails[0].display).toBe("shafskyaviation.social@gmail.com");
    expect(dept1.emails[0].email).toBe("mailto:shafskyaviation.social@gmail.com");
  });

  it("DEPARTMENT 2 — Visa Assistance, Air Ticketing, Hotels & General Inquiry", () => {
    const dept2 = SUPPORT_DEPARTMENTS[1];
    expect(dept2.departmentNumber).toBe(2);
    expect(dept2.title).toBe(
      "Visa Assistance, Air Ticketing, Hotels & General Inquiry"
    );

    // Phone exact string and tel: link
    expect(dept2.phones).toHaveLength(1);
    expect(dept2.phones[0].display).toBe("+91 92175 22660");
    expect(dept2.phones[0].tel).toBe("tel:+919217522660");

    // Email exact string and mailto: link
    expect(dept2.emails).toHaveLength(1);
    expect(dept2.emails[0].display).toBe("commercialshafskyaviation@gmail.com");
    expect(dept2.emails[0].email).toBe(
      "mailto:commercialshafskyaviation@gmail.com"
    );
  });

  it("DEPARTMENT 3 — Whole Guest Relationship Department", () => {
    const dept3 = SUPPORT_DEPARTMENTS[2];
    expect(dept3.departmentNumber).toBe(3);
    expect(dept3.title).toBe("Whole Guest Relationship Department");

    // Email exact string and mailto: link
    expect(dept3.emails).toHaveLength(1);
    expect(dept3.emails[0].display).toBe("Gro.shafskyaviation@gmail.com");
    expect(dept3.emails[0].email).toBe("mailto:Gro.shafskyaviation@gmail.com");

    // Two Phone numbers exact string and tel: link
    expect(dept3.phones).toHaveLength(2);
    expect(dept3.phones[0].display).toBe("+91-9599087959");
    expect(dept3.phones[0].tel).toBe("tel:+919599087959");
    expect(dept3.phones[1].display).toBe("+91 95996 15459");
    expect(dept3.phones[1].tel).toBe("tel:+919599615459");
  });

  it("DEPARTMENT 4 — Escalation with two emails and two phone numbers clearly distinct", () => {
    const dept4 = SUPPORT_DEPARTMENTS[3];
    expect(dept4.departmentNumber).toBe(4);
    expect(dept4.title).toBe("Escalation");

    // Two emails exact strings and mailto: links
    expect(dept4.emails).toHaveLength(2);
    expect(dept4.emails[0].display).toBe("gm.shafskyaviation@gmail.com");
    expect(dept4.emails[0].email).toBe("mailto:gm.shafskyaviation@gmail.com");
    expect(dept4.emails[1].display).toBe("hr.shafskyaviation@gmail.com");
    expect(dept4.emails[1].email).toBe("mailto:hr.shafskyaviation@gmail.com");

    // Two phone numbers exact strings and tel: links
    expect(dept4.phones).toHaveLength(2);
    expect(dept4.phones[0].display).toBe("+91 98188 50755");
    expect(dept4.phones[0].tel).toBe("tel:+919818850755");
    expect(dept4.phones[1].display).toBe("+91 95992 24680");
    expect(dept4.phones[1].tel).toBe("tel:+919599224680");
  });

  it("DEPARTMENT 5 — Finance", () => {
    const dept5 = SUPPORT_DEPARTMENTS[4];
    expect(dept5.departmentNumber).toBe(5);
    expect(dept5.title).toBe("Finance");

    // Email exact string and mailto: link
    expect(dept5.emails).toHaveLength(1);
    expect(dept5.emails[0].display).toBe("financeshafskyaviation@gmail.com");
    expect(dept5.emails[0].email).toBe(
      "mailto:financeshafskyaviation@gmail.com"
    );

    // Phone exact string and tel: link
    expect(dept5.phones).toHaveLength(1);
    expect(dept5.phones[0].display).toBe("+91 88006 98554");
    expect(dept5.phones[0].tel).toBe("tel:+918800698554");
  });

  it("renders SupportPanel when open with all 5 department titles and contact details", () => {
    const html = renderToString(
      React.createElement(SupportPanel, {
        isOpen: true,
        onClose: vi.fn(),
      })
    );

    // Header & Dialog structure
    expect(html).toContain("Shafsky Aviation Support Directory");
    expect(html).toContain("Departmental Contact Directory");
    expect(html).toContain('role="dialog"');

    // All Department titles
    expect(html).toContain("Air Ticketing, Event Management, Transportation &amp; Hotels");
    expect(html).toContain("Visa Assistance, Air Ticketing, Hotels &amp; General Inquiry");
    expect(html).toContain("Whole Guest Relationship Department");
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
    expect(html).toContain(">Call</span>");
    expect(html).toContain(">Email</span>");

    // Link to Full Contact page
    expect(html).toContain('href="/contact"');
    expect(html).toContain("Visit Full Contact &amp; Inquiry Page");
  });

  it("does not render SupportPanel markup when isOpen is false", () => {
    const html = renderToString(
      React.createElement(SupportPanel, {
        isOpen: false,
        onClose: vi.fn(),
      })
    );
    expect(html).toBe("");
  });

  it("renders SupportMobileAccordion with all 5 departments and Call/Email buttons", () => {
    const html = renderToString(
      React.createElement(SupportMobileAccordion, {
        onClose: vi.fn(),
      })
    );

    expect(html).toContain("Air Ticketing, Event Management, Transportation &amp; Hotels");
    expect(html).toContain("Visa Assistance, Air Ticketing, Hotels &amp; General Inquiry");
    expect(html).toContain("Whole Guest Relationship Department");
    expect(html).toContain("Escalation");
    expect(html).toContain("Finance");

    // Both Call and Email action buttons present
    expect(html).toContain(">Call</span>");
    expect(html).toContain(">Email</span>");

    // Full contact link present
    expect(html).toContain('href="/contact"');
    expect(html).toContain("Open Full Contact Form");
  });
});
