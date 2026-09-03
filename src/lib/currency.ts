/**
 * Multi-Currency Engine for Shafsky Aviation.
 * Provides live/cached FX conversion, formatting, and auto-region detection
 * for global luxury travelers (INR, USD, AED, EUR, GBP, SAR).
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateToINR: number; // 1 Unit of Currency in INR (e.g. 1 USD = 86.5 INR)
  fractionDigits: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    rateToINR: 1,
    fractionDigits: 0,
  },
  AED: {
    code: "AED",
    symbol: "AED ",
    name: "UAE Dirham",
    flag: "🇦🇪",
    rateToINR: 23.55,
    fractionDigits: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    rateToINR: 86.50,
    fractionDigits: 0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    rateToINR: 93.20,
    fractionDigits: 0,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    rateToINR: 110.40,
    fractionDigits: 0,
  },
  SAR: {
    code: "SAR",
    symbol: "SAR ",
    name: "Saudi Riyal",
    flag: "🇸🇦",
    rateToINR: 23.05,
    fractionDigits: 0,
  },
};

/**
 * Converts a base INR price to the target currency.
 * Always rounds up to a clean integer for luxury pricing clarity.
 */
export function convertFromINR(inrAmount: number, targetCurrency: string): number {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.INR;
  if (config.code === "INR") return inrAmount;
  const converted = inrAmount / config.rateToINR;
  return Math.ceil(converted);
}

/**
 * Formats a currency amount with symbol and regional number formatting.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  return `${config.symbol}${amount.toLocaleString("en-US")}`;
}

/**
 * Auto-detects the visitor's preferred currency based on browser timezone / locale.
 */
export function detectDefaultCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Dubai") || tz.includes("Muscat") || tz.includes("Abu_Dhabi")) return "AED";
    if (tz.includes("Riyadh") || tz.includes("Kuwait") || tz.includes("Qatar") || tz.includes("Bahrain")) return "SAR";
    if (tz.includes("London") || tz.includes("Dublin")) return "GBP";
    if (
      tz.includes("Paris") ||
      tz.includes("Berlin") ||
      tz.includes("Rome") ||
      tz.includes("Madrid") ||
      tz.includes("Amsterdam") ||
      tz.includes("Brussels") ||
      tz.includes("Vienna")
    ) {
      return "EUR";
    }
    if (
      tz.includes("New_York") ||
      tz.includes("Los_Angeles") ||
      tz.includes("Chicago") ||
      tz.includes("Denver") ||
      tz.includes("Toronto") ||
      tz.includes("America")
    ) {
      return "USD";
    }
    if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Colombo")) {
      return "INR";
    }
  } catch {
    /* fallback to INR */
  }
  return "INR";
}
