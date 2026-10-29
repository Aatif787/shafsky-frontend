import { describe, it, expect } from "vitest";
import {
  CHATBOT_MAIN_SERVICES,
  CHATBOT_OTHER_SERVICES,
  buildDepartmentDirectWhatsAppMessage,
  resolveServiceDepartment,
} from "../chatbotQuestions";
import {
  DEPARTMENT_CONTACTS,
  normalizePhoneNumber,
  buildWhatsAppUrl,
} from "../departmentContacts";

describe("Smart WhatsApp Chatbot Service & Department Architecture", () => {
  it("defines the 10 top-level services in the EXACT required order with Meet & Greet first", () => {
    expect(CHATBOT_MAIN_SERVICES).toHaveLength(10);

    const labels = CHATBOT_MAIN_SERVICES.map((s) => s.label);
    expect(labels).toEqual([
      "Meet & Greet",
      "Lounge Services",
      "Flight Support / Air Ticketing",
      "Hotel Booking",
      "Holidays / Tour & Travel",
      "Visa Assistance",
      "Transportation",
      "Door-to-Door Assistance",
      "Event Support",
      "Other Services",
    ]);

    // Meet & Greet must always be first
    expect(CHATBOT_MAIN_SERVICES[0].id).toBe("meet_greet");
    expect(CHATBOT_MAIN_SERVICES[0].label).toBe("Meet & Greet");
  });

  it("configures all department contacts with normalized phone numbers and emails matching official support", () => {
    // 1. Meet & Greet (Department 03: GRO & VIP Care)
    expect(DEPARTMENT_CONTACTS.meet_greet.email).toBe("Gro.shafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.meet_greet.phoneDisplay).toBe("+91-9599087959");
    expect(DEPARTMENT_CONTACTS.meet_greet.normalizedPhone).toBe("919599087959");

    // 2. Flight Support (Department 01: Aviation & Logistics)
    expect(DEPARTMENT_CONTACTS.flight.email).toBe("shafskyaviation.social@gmail.com");
    expect(DEPARTMENT_CONTACTS.flight.phoneDisplay).toBe("+91-9599087957");
    expect(DEPARTMENT_CONTACTS.flight.normalizedPhone).toBe("919599087957");

    // 3. Hotel Support (Department 02: Visa & General Desks)
    expect(DEPARTMENT_CONTACTS.hotel.email).toBe("commercialshafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.hotel.phoneDisplay).toBe("+91 92175 22660");
    expect(DEPARTMENT_CONTACTS.hotel.normalizedPhone).toBe("919217522660");

    // 4. Holidays (Department 02: Visa & General Desks)
    expect(DEPARTMENT_CONTACTS.holidays.email).toBe("commercialshafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.holidays.phoneDisplay).toBe("+91 92175 22660");
    expect(DEPARTMENT_CONTACTS.holidays.normalizedPhone).toBe("919217522660");

    // 5. Visa (Department 02: Visa & General Desks)
    expect(DEPARTMENT_CONTACTS.visa.email).toBe("commercialshafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.visa.phoneDisplay).toBe("+91 92175 22660");
    expect(DEPARTMENT_CONTACTS.visa.normalizedPhone).toBe("919217522660");

    // 6. Transportation (Department 01: Aviation & Logistics)
    expect(DEPARTMENT_CONTACTS.transport.email).toBe("shafskyaviation.social@gmail.com");
    expect(DEPARTMENT_CONTACTS.transport.phoneDisplay).toBe("+91-9599087957");
    expect(DEPARTMENT_CONTACTS.transport.normalizedPhone).toBe("919599087957");

    // 7. Door-to-Door Assistance (Department 03: GRO & VIP Care)
    expect(DEPARTMENT_CONTACTS.doortodoor.email).toBe("Gro.shafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.doortodoor.phoneDisplay).toBe("+91-9599087959");
    expect(DEPARTMENT_CONTACTS.doortodoor.normalizedPhone).toBe("919599087959");

    // 8. Event Support (Department 01: Aviation & Logistics)
    expect(DEPARTMENT_CONTACTS.events.email).toBe("shafskyaviation.social@gmail.com");
    expect(DEPARTMENT_CONTACTS.events.phoneDisplay).toBe("+91-9599087957");
    expect(DEPARTMENT_CONTACTS.events.normalizedPhone).toBe("919599087957");

    // 9. Escalations (Department 04: Management & HR Escalation)
    expect(DEPARTMENT_CONTACTS.escalations.email).toBe("gm.shafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.escalations.phoneDisplay).toBe("+91 98188 50755");
    expect(DEPARTMENT_CONTACTS.escalations.normalizedPhone).toBe("919818850755");

    // 10. Finance (Department 05: Billing & Accounts)
    expect(DEPARTMENT_CONTACTS.finance.email).toBe("financeshafskyaviation@gmail.com");
    expect(DEPARTMENT_CONTACTS.finance.phoneDisplay).toBe("+91 88006 98554");
    expect(DEPARTMENT_CONTACTS.finance.normalizedPhone).toBe("918800698554");
  });

  it("correctly normalizes phone numbers without +, spaces or brackets", () => {
    expect(normalizePhoneNumber("+91-9599087959")).toBe("919599087959");
    expect(normalizePhoneNumber("+91 (92175) 22660")).toBe("919217522660");
  });

  it("builds official WhatsApp Click-to-Chat URLs with encoded messages", () => {
    const url = buildWhatsAppUrl("+91-9599087959", "Hello Shafsky Team,\nI need assistance.");
    expect(url).toContain("https://wa.me/919599087959?text=");
    expect(url).toContain(encodeURIComponent("Hello Shafsky Team,\nI need assistance."));
  });

  it("formats direct pre-filled WhatsApp inquiry message immediately upon service selection", () => {
    const meetGreetService = CHATBOT_MAIN_SERVICES[0];
    const message = buildDepartmentDirectWhatsAppMessage(meetGreetService);
    expect(message).toContain("Hello Shafsky Aviation Team,");
    expect(message).toContain("Meet & Greet");
    expect(message).toContain("Please assist me with availability, procedure, and pricing details.");
    expect(message).toContain("Thank you.");
  });

  it("provides real existing services under Other Services", () => {
    const otherLabels = CHATBOT_OTHER_SERVICES.map((s) => s.label);
    expect(otherLabels).toContain("Infant Care");
    expect(otherLabels).toContain("Spa & Wellness");
    expect(otherLabels).toContain("Pet Transfer (Cargo & Avi Pet)");
    expect(otherLabels).toContain("Cargo Services");
    expect(otherLabels).toContain("Air Ambulance");
    expect(otherLabels).toContain("Train Ambulance");
    expect(otherLabels).toContain("Human Remains Transfer (HUM)");
    expect(otherLabels).toContain("PSO & Security Services");
    expect(otherLabels).toContain("Onboard Meals");
  });

  const route = (label: string) => {
    const all = [...CHATBOT_MAIN_SERVICES, ...CHATBOT_OTHER_SERVICES];
    const svc = all.find((s) => s.label === label)!;
    expect(svc).toBeDefined();
    return resolveServiceDepartment(svc);
  };

  it("routes services to the correct department number from the official support directory", () => {
    expect(route("Meet & Greet").phoneDisplay).toBe("+91-9599087959");
    expect(route("Lounge Services").phoneDisplay).toBe("+91-9599087959");
    expect(route("Flight Support / Air Ticketing").phoneDisplay).toBe("+91-9599087957");
    expect(route("Hotel Booking").phoneDisplay).toBe("+91 92175 22660");
    expect(route("Holidays / Tour & Travel").phoneDisplay).toBe("+91 92175 22660");
    expect(route("Visa Assistance").phoneDisplay).toBe("+91 92175 22660");
    expect(route("Transportation").phoneDisplay).toBe("+91-9599087957");
    expect(route("Door-to-Door Assistance").phoneDisplay).toBe("+91-9599087959");
    expect(route("Event Support").phoneDisplay).toBe("+91-9599087957");
  });

  it("maps specialized services under Other Services to valid department contacts", () => {
    expect(route("Infant Care").name).toBe("Door to Door Assistance");
    expect(route("Spa & Wellness").name).toBe("Tour, Travel & Holidays");
    expect(route("Pet Transfer (Cargo & Avi Pet)").name).toBe("Transportation & Luxury Fleet");
    expect(route("Cargo Services").name).toBe("Transportation & Luxury Fleet");
    expect(route("Air Ambulance").name).toBe("Management & HR Escalation");
    expect(route("Train Ambulance").name).toBe("Management & HR Escalation");
    expect(route("Human Remains Transfer (HUM)").name).toBe("Management & HR Escalation");
    expect(route("PSO & Security Services").name).toBe("Event Management & Logistics");
    expect(route("Onboard Meals").name).toBe("Air Ticketing & Flight Support");
  });

  it("only uses the 5 official department numbers from the Support Directory", () => {
    const approved = [
      "918800698554", // Finance & Accounts
      "919217522660", // Visa & General Desks
      "919599087957", // Aviation & Logistics
      "919599087959", // Whole Guest Relationship Department
      "919818850755", // Management & HR Escalation
    ];
    const uniquePhones = Array.from(new Set(Object.values(DEPARTMENT_CONTACTS).map((d) => d.normalizedPhone))).sort();
    expect(uniquePhones).toEqual(approved);
    [...CHATBOT_MAIN_SERVICES, ...CHATBOT_OTHER_SERVICES].forEach((s) => {
      expect(approved).toContain(DEPARTMENT_CONTACTS[s.departmentId].normalizedPhone);
    });
  });
});

