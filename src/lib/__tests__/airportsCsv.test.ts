import { describe, it, expect } from "vitest";
import { parseAirportsCsv, getStaticAirportsFromCsv, getCsvAirport } from "../airportsCsv";
import { getAirport } from "@/data/airports";

describe("airports.csv dynamic parser and loader suite", () => {
  it("parses valid CSV text with headers, quotes, and commas", () => {
    const sampleCsv = `code,name,city,country,stateCountry,servicesCount,featured,cover,elevation,timezone
DEL,"Indira Gandhi International Airport",New Delhi,India,"New Delhi, India",4,true,/images/del.webp,777,Asia/Kolkata
DXB,"Dubai International Airport",Dubai,"United Arab Emirates","Dubai, UAE",4,true,/images/dxb.webp,62,Asia/Dubai`;

    const parsed = parseAirportsCsv(sampleCsv);
    expect(parsed).toHaveLength(2);

    expect(parsed[0].code).toBe("DEL");
    expect(parsed[0].name).toBe("Indira Gandhi International Airport");
    expect(parsed[0].city).toBe("New Delhi");
    expect(parsed[0].country).toBe("India");
    expect(parsed[0].countryCode).toBe("IN");
    expect(parsed[0].servicesCount).toBe(4);
    expect(parsed[0].featured).toBe(true);
    expect(parsed[0].elevation).toBe("777");
    expect(parsed[0].timezone).toBe("Asia/Kolkata");

    expect(parsed[1].code).toBe("DXB");
    expect(parsed[1].city).toBe("Dubai");
    expect(parsed[1].country).toBe("United Arab Emirates");
    expect(parsed[1].countryCode).toBe("AE");
  });

  it("loads airports dynamically from bundled airports.csv", () => {
    const airports = getStaticAirportsFromCsv();
    expect(airports.length).toBeGreaterThan(50);

    const del = airports.find((a) => a.code === "DEL");
    expect(del).toBeDefined();
    expect(del?.city).toBe("New Delhi");
    expect(del?.country).toBe("India");

    const bom = airports.find((a) => a.code === "BOM");
    expect(bom).toBeDefined();
    expect(bom?.city).toBe("Mumbai");
  });

  it("getCsvAirport retrieves airport by code case-insensitively", () => {
    const hyd = getCsvAirport("hyd");
    expect(hyd).toBeDefined();
    expect(hyd?.code).toBe("HYD");
    expect(hyd?.city).toBe("Hyderabad");

    const nonExistent = getCsvAirport("XYZ999");
    expect(nonExistent).toBeUndefined();
  });

  it("getAirport in airports.ts resolves hubs defined in airports.csv", () => {
    // SXR (Srinagar) is in airports.csv
    const sxr = getAirport("SXR");
    expect(sxr).toBeDefined();
    expect(sxr.code).toBe("SXR");
    expect(sxr.city).toBe("Srinagar");
    expect(sxr.country).toBe("India");
    expect(sxr.airport.name).toContain("Sheikh ul-Alam");
  });
});
