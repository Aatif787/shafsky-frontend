export interface Country {
  name: string;
  code: string;
  flag: string;
}

/**
 * Converts a 2-letter ISO 3166-1 alpha-2 country code (e.g. "US", "FR") into a flag emoji.
 */
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// In-memory cache for fetched countries dataset
let cachedCountriesPromise: Promise<Country[]> | null = null;
let cachedCountriesList: Country[] = [];

/**
 * Dynamically fetches the complete list of 250+ countries worldwide via CDN endpoint.
 */
export async function fetchAllCountries(): Promise<Country[]> {
  if (cachedCountriesList.length > 0) {
    return cachedCountriesList;
  }

  if (cachedCountriesPromise) {
    return cachedCountriesPromise;
  }

  cachedCountriesPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json",
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const formatted: Country[] = data
        .map((item: any) => {
          const name = (item.name || "").trim();
          const code = (item.code || "").toUpperCase();
          const flag = item.emoji || getFlagEmoji(code);
          return { name, code, flag };
        })
        .filter((c) => Boolean(c.name && c.code))
        .sort((a, b) => a.name.localeCompare(b.name));

      cachedCountriesList = formatted;
      return formatted;
    } catch (error) {
      console.warn("Failed primary country API fetch, trying mirror:", error);
      try {
        const mirrorRes = await fetch("https://restcountries.com/v3.1/all");
        const mirrorData = await mirrorRes.json();
        if (Array.isArray(mirrorData)) {
          const formatted: Country[] = mirrorData
            .map((item: any) => {
              const name = item.name?.common || item.name?.official || "";
              const code = (item.cca2 || "").toUpperCase();
              const flag = item.flag || getFlagEmoji(code);
              return { name, code, flag };
            })
            .filter((c) => Boolean(c.name && c.code))
            .sort((a, b) => a.name.localeCompare(b.name));

          cachedCountriesList = formatted;
          return formatted;
        }
      } catch {
        // Ignored
      }
      return cachedCountriesList;
    } finally {
      cachedCountriesPromise = null;
    }
  })();

  return cachedCountriesPromise;
}

/**
 * Dynamically searches and filters countries by keyword with prefix prioritization.
 */
export async function fetchCountriesByKeyword(keyword: string): Promise<Country[]> {
  const allCountries = await fetchAllCountries();
  const q = (keyword || "").trim().toLowerCase();

  if (!q) {
    return allCountries;
  }

  // Prioritize prefix matches, followed by substring matches, then code matches
  const prefixMatches: Country[] = [];
  const substringMatches: Country[] = [];

  allCountries.forEach((c) => {
    const nameLower = c.name.toLowerCase();
    const codeLower = c.code.toLowerCase();

    if (nameLower.startsWith(q) || codeLower === q) {
      prefixMatches.push(c);
    } else if (nameLower.includes(q)) {
      substringMatches.push(c);
    }
  });

  return [...prefixMatches, ...substringMatches];
}

/**
 * Backwards compatibility array export.
 */
export const ALL_COUNTRIES: Country[] = [];
