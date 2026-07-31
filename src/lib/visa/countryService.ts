import {
  type Country,
  fetchAllCountries,
  fetchCountriesByKeyword,
  getFlagEmoji,
} from "@/data/countries";

export { type Country, fetchAllCountries, fetchCountriesByKeyword, getFlagEmoji };

/**
 * Convenience wrapper for searching countries by keyword via REST Countries API.
 */
export async function searchCountriesByKeyword(keyword: string): Promise<Country[]> {
  return fetchCountriesByKeyword(keyword);
}
