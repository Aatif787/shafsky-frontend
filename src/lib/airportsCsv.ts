import rawCsvData from "@/data/airports.csv?raw";
import { getAirportPrimaryImage } from "./airport-assets";

export interface CsvAirportItem {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode?: string;
  stateCountry: string;
  servicesCount: number;
  featured: boolean;
  cover?: string;
  elevation?: string;
  timezone?: string;
}

const KNOWN_COUNTRY_CODES: Record<string, string> = {
  india: "IN",
  "united arab emirates": "AE",
  uae: "AE",
  qatar: "QA",
  singapore: "SG",
  "united kingdom": "GB",
  uk: "GB",
  "united states": "US",
  usa: "US",
  germany: "DE",
  france: "FR",
  japan: "JP",
  australia: "AU",
  thailand: "TH",
  malaysia: "MY",
  "saudi arabia": "SA",
  saudi: "SA",
  turkey: "TR",
  switzerland: "CH",
  netherlands: "NL",
  canada: "CA",
  indonesia: "ID",
  italy: "IT",
  spain: "ES",
};

/**
 * Robust CSV parser that handles:
 * - Comma delimiters
 * - Quoted fields containing commas
 * - Escaped double quotes ("")
 * - Windows (CRLF) and Unix (LF) line breaks
 */
function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // Skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses raw CSV text into typed CsvAirportItem array.
 * Supports both standard and OurAirports column headers.
 */
export function parseAirportsCsv(csvText: string): CsvAirportItem[] {
  if (!csvText || !csvText.trim()) return [];

  const rawRows = parseCsvRows(csvText);
  if (rawRows.length < 2) return [];

  const headers = rawRows[0].map((h) => h.toLowerCase().trim().replace(/['"]/g, ""));

  // Header resolution index
  const getIdx = (...names: string[]): number => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const codeIdx = getIdx("code", "iata_code", "iata", "ident");
  const nameIdx = getIdx("name", "airport_name", "airport");
  const cityIdx = getIdx("city", "municipality");
  const countryIdx = getIdx("country", "iso_country");
  const stateCountryIdx = getIdx("statecountry", "state_country", "region");
  const servicesCountIdx = getIdx("servicescount", "services_count", "services");
  const featuredIdx = getIdx("featured", "is_featured");
  const coverIdx = getIdx("cover", "image", "coverimage", "cover_image");
  const elevationIdx = getIdx("elevation", "elevation_ft");
  const timezoneIdx = getIdx("timezone", "tz");

  const results: CsvAirportItem[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const code = (codeIdx !== -1 && row[codeIdx] ? row[codeIdx] : "").toUpperCase().trim();
    if (!code || code.length < 2) continue;

    const city = cityIdx !== -1 && row[cityIdx] ? row[cityIdx] : code;
    const country = countryIdx !== -1 && row[countryIdx] ? row[countryIdx] : "India";
    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `${city} Airport`;
    const stateCountry =
      stateCountryIdx !== -1 && row[stateCountryIdx] ? row[stateCountryIdx] : `${city}, ${country}`;

    const rawServicesCount = servicesCountIdx !== -1 && row[servicesCountIdx] ? row[servicesCountIdx] : "4";
    const servicesCount = parseInt(rawServicesCount, 10) || 4;

    const rawFeatured = featuredIdx !== -1 && row[featuredIdx] ? row[featuredIdx].toLowerCase() : "";
    const featured =
      rawFeatured === "true" ||
      rawFeatured === "1" ||
      rawFeatured === "yes" ||
      ["DEL", "BOM", "HYD", "BLR", "AMD", "MAA", "JAI", "DXB", "LHR", "SIN"].includes(code);

    const coverFromCsv = coverIdx !== -1 && row[coverIdx] ? row[coverIdx] : undefined;
    const primaryImg = getAirportPrimaryImage(code);
    const cover = coverFromCsv || primaryImg || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85";

    const elevation = elevationIdx !== -1 && row[elevationIdx] ? row[elevationIdx] : undefined;
    const timezone = timezoneIdx !== -1 && row[timezoneIdx] ? row[timezoneIdx] : undefined;

    const countryCodeIdx = getIdx("country_code", "countrycode", "iso_country");
    let countryCode = countryCodeIdx !== -1 && row[countryCodeIdx] ? row[countryCodeIdx].toUpperCase().trim() : undefined;
    if (!countryCode || countryCode.length > 3) {
      countryCode = KNOWN_COUNTRY_CODES[country.toLowerCase().trim()] || (country === "India" ? "IN" : code.slice(0, 2));
    }

    results.push({
      code,
      name,
      city,
      country,
      countryCode,
      stateCountry,
      servicesCount,
      featured,
      cover,
      elevation,
      timezone,
    });
  }

  return results;
}

// In-memory cached static dataset from bundled airports.csv?raw
let _cachedStaticAirports: CsvAirportItem[] | null = null;

export function getStaticAirportsFromCsv(): CsvAirportItem[] {
  if (!_cachedStaticAirports) {
    _cachedStaticAirports = parseAirportsCsv(rawCsvData);
  }
  return _cachedStaticAirports;
}

export function getCsvAirport(code: string): CsvAirportItem | undefined {
  const upper = (code || "").toUpperCase().trim();
  return getStaticAirportsFromCsv().find((a) => a.code.toUpperCase() === upper);
}

/**
 * Dynamically fetches /data/airports.csv in the browser.
 * Falls back to bundled raw CSV if fetch is unavailable.
 */
export async function fetchAirportsCsv(): Promise<CsvAirportItem[]> {
  if (typeof window === "undefined") {
    return getStaticAirportsFromCsv();
  }

  const urls = ["/data/airports.csv", "/airports.csv"];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseAirportsCsv(text);
        if (parsed.length > 0) {
          _cachedStaticAirports = parsed;
          return parsed;
        }
      }
    } catch {
      // Try next URL fallback
    }
  }

  return getStaticAirportsFromCsv();
}
