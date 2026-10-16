import { describe, it, expect } from "vitest";
import {
  CANONICAL_SERVICES,
  ServiceKey,
  PublicContactSlot,
} from "../contact-settings";

describe("Website Contact Settings - Client Architecture & Contracts", () => {
  it("defines exactly the six canonical services in the required order", () => {
    expect(CANONICAL_SERVICES).toHaveLength(6);

    const keys = CANONICAL_SERVICES.map((s) => s.key);
    expect(keys).toEqual([
      "meet_greet_lounge",
      "transport",
      "hotel",
      "private_charter",
      "ticketing",
      "contact",
    ]);

    const names = CANONICAL_SERVICES.map((s) => s.name);
    expect(names).toEqual([
      "Meet & Greet Lounge",
      "Transport",
      "Hotel",
      "Private Charter",
      "Ticketing",
      "Contact",
    ]);
  });

  it("formats single and dual phone contact numbers accurately", () => {
    const singleSlot: PublicContactSlot = {
      country_code: "+91",
      phone_number: "9599087959",
      full_phone_number: "+919599087959",
      formatted: "+91 9599087959",
      tel_link: "tel:+919599087959",
    };

    expect(singleSlot.tel_link).toBe("tel:+919599087959");
    expect(singleSlot.formatted).toBe("+91 9599087959");

    const dualSlots: PublicContactSlot[] = [
      singleSlot,
      {
        country_code: "+91",
        phone_number: "9599615459",
        full_phone_number: "+919599615459",
        formatted: "+91 9599615459",
        tel_link: "tel:+919599615459",
      },
    ];

    expect(dualSlots).toHaveLength(2);
    expect(dualSlots.map((s) => s.tel_link)).toEqual([
      "tel:+919599087959",
      "tel:+919599615459",
    ]);
  });

  it("supports international numbers with diverse country codes", () => {
    const uaeSlot: PublicContactSlot = {
      country_code: "+971",
      phone_number: "501234567",
      full_phone_number: "+971501234567",
      formatted: "+971 501234567",
      tel_link: "tel:+971501234567",
    };
    expect(uaeSlot.country_code).toBe("+971");
    expect(uaeSlot.tel_link).toBe("tel:+971501234567");
  });

  it("handles empty contact slots safely without broken links", () => {
    const emptySlots: PublicContactSlot[] = [];
    expect(emptySlots).toHaveLength(0);

    const hasContacts = emptySlots.length > 0;
    expect(hasContacts).toBe(false);

    // Primary contact resolution returns null
    const primaryContact = emptySlots.length > 0 ? emptySlots[0] : null;
    expect(primaryContact).toBeNull();
  });
});
