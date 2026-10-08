import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js/min";

/**
 * Country data for the phone picker.
 *
 * Nothing is hardcoded: the country list and dial codes come from
 * libphonenumber-js metadata, and each flag is derived from the ISO 3166-1
 * alpha-2 code via regional-indicator code points.
 *
 * The metadata is ~200 KB, so it is loaded with a dynamic import and kept in a
 * module-level cache. It becomes its own on-demand chunk instead of weighing
 * down the entry bundle for visitors who never open a phone field.
 */

interface PhoneMeta {
  getCountries: () => string[];
  getCountryCallingCode: (c: CountryCode) => string;
  parsePhoneNumberFromString: (v: string) => {
    country?: CountryCode;
    countryCallingCode?: string;
    nationalNumber?: string;
  } | undefined;
}

let metaPromise: Promise<PhoneMeta> | null = null;

/** Loads the phone metadata once, on demand. */
export function loadPhoneMeta(): Promise<PhoneMeta> {
  if (!metaPromise) {
    metaPromise = import("libphonenumber-js/min").then((m) => m as unknown as PhoneMeta);
  }
  return metaPromise;
}

export interface DialCountry {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

/** ISO code -> flag emoji via regional indicator symbols. No lookup table. */
export function flagForIsoCode(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const base = 0x1f1e6; // regional indicator symbol letter A
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => base + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

/** Human-readable country name, resolved by the runtime's own locale data. */
function displayName(code: string): string {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(code) || code;
  } catch {
    return code;
  }
}

let cachedList: DialCountry[] | null = null;

/** Builds the dial-code list once, sorted by country name. */
export async function getDialCountries(): Promise<DialCountry[]> {
  if (cachedList) return cachedList;
  const meta = await loadPhoneMeta();
  const list: DialCountry[] = [];
  for (const code of meta.getCountries() as CountryCode[]) {
    try {
      list.push({
        code,
        name: displayName(code),
        dial: `+${meta.getCountryCallingCode(code)}`,
        flag: flagForIsoCode(code),
      });
    } catch {
      // A territory without a calling code is skipped rather than guessed.
    }
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  cachedList = list;
  return list;
}

/** Best-effort default country from the browser locale, falling back to India.
 *
 * The fallback is a single documented default, not a country table: the list
 * itself always comes from libphonenumber-js metadata.
 */
export async function detectDefaultCountry(): Promise<CountryCode> {
  const FALLBACK = "IN" as CountryCode;
  try {
    if (typeof navigator === "undefined") return FALLBACK;
    const meta = await loadPhoneMeta();
    const all = meta.getCountries();
    const locales = [navigator.language, ...(navigator.languages || [])];
    for (const loc of locales) {
      if (!loc) continue;
      const region = new Intl.Locale(loc).maximize().region;
      if (region && all.includes(region)) {
        return region as CountryCode;
      }
    }
  } catch {
    // Locale data unavailable; fall through.
  }
  return FALLBACK;
}

/**
 * Splits a stored phone value into a country + national part so an existing
 * number keeps its country when the user edits the form.
 *
 * Uses the library's own parser rather than prefix matching: roughly 25
 * territories share +1 (US, Canada, Bahamas, ...) and only metadata can tell
 * them apart.
 */
export async function splitPhoneValue(value: string, countries: DialCountry[]): Promise<{
  country: CountryCode;
  national: string;
}> {
  const raw = (value || "").trim();
  if (raw.startsWith("+")) {
    const meta = await loadPhoneMeta();
    const parsed = meta.parsePhoneNumberFromString(raw);
    if (parsed?.country) {
      const cc = parsed.countryCallingCode || "";
      const national = parsed.nationalNumber || raw.slice(cc.length + 1);
      return { country: parsed.country, national };
    }
    // Unparseable but still prefixed: fall back to the longest dial-code match.
    const byDial = [...countries].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of byDial) {
      if (raw.startsWith(c.dial)) {
        return { country: c.code, national: raw.slice(c.dial.length).trim() };
      }
    }
  }
  return { country: await detectDefaultCountry(), national: raw.replace(/^\+/, "") };
}

/** Joins country + national into the single string the backend stores. */
let dialCache = new Map<string, string>();

/** Dial code for a country, from cached metadata. */
async function dialFor(country: CountryCode): Promise<string> {
  const cached = dialCache.get(country);
  if (cached) return cached;
  try {
    const meta = await loadPhoneMeta();
    const dial = meta.getCountryCallingCode(country);
    dialCache.set(country, dial);
    return dial;
  } catch {
    return "";
  }
}

/** Joins country + national into the single string the backend stores. */
export async function joinPhoneValue(country: CountryCode, national: string): Promise<string> {
  const digits = (national || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  const dial = await dialFor(country);
  return dial ? `+${dial}${digits}` : digits;
}

export interface PhoneInputProps {
  /** Full stored value, e.g. "+919876543210". */
  value: string;
  /** Receives the full value including dial code. */
  onChange: (value: string) => void;
  /** Optional ISO code to force the initial country. */
  defaultCountry?: CountryCode;
  placeholder?: string;
  className?: string;
  /** Classes for the surrounding wrapper. */
  wrapperClassName?: string;
  id?: string;
  required?: boolean;
  name?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

/**
 * Phone input with a searchable country-code picker showing flags.
 *
 * Reusable across forms; emits a single E.164-style string (+<dial><national>)
 * so backend schemas and existing callers keep working unchanged.
 */
export function PhoneInput({
  value,
  onChange,
  defaultCountry,
  placeholder = "Mobile number",
  className,
  wrapperClassName,
  id,
  required,
  name,
  disabled,
  ...rest
}: PhoneInputProps) {
  // Metadata is fetched on demand; the picker renders once it is available.
  const [countries, setCountries] = useState<DialCountry[]>([]);
  const [country, setCountry] = useState<CountryCode>(defaultCountry || "IN");
  const [national, setNational] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hydratedRef = useRef(false);

  // Load metadata once, then split whatever value was passed in.
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getDialCountries();
      if (!alive) return;
      setCountries(list);
      const parsed = await splitPhoneValue(value, list);
      if (!alive) return;
      if (value) {
        setCountry(defaultCountry || parsed.country);
        setNational(parsed.national);
      } else {
        setCountry(defaultCountry || (await detectDefaultCountry()));
      }
      hydratedRef.current = true;
    })();
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the external value in sync when the form resets it (e.g. after submit).
  useEffect(() => {
    if (!hydratedRef.current) return;
    (async () => {
      if (!value) {
        setNational("");
        return;
      }
      const parsed = await splitPhoneValue(value, countries);
      const currentFull = await joinPhoneValue(country, national);
      if (value !== currentFull) {
        setCountry(parsed.country);
        setNational(parsed.national);
      }
    })();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const selected = countries.find((c) => c.code === country) || countries[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.dial.replace("+", "").startsWith(q.replace("+", "")),
    );
  }, [countries, query]);

  const emit = async (nextCountry: CountryCode, nextNational: string) => {
    onChange(await joinPhoneValue(nextCountry, nextNational));
  };

  return (
    <div ref={wrapRef} className={`relative flex ${wrapperClassName || ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-label="Select country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 hover:bg-slate-100 disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {selected?.flag}
        </span>
        <span className="font-mono text-xs">{selected?.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true" className="opacity-60">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </button>

      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        value={national}
        onChange={(e) => {
          setNational(e.target.value);
          void emit(country, e.target.value);
        }}
        placeholder={placeholder}
        className={className}
        {...rest}
      />

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-slate-500">No match</li>
            )}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry(c.code);
                    setOpen(false);
                    setQuery("");
                    void emit(c.code, national);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    c.code === country ? "bg-slate-50 font-semibold" : ""
                  }`}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {c.flag}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono text-xs text-slate-500">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export interface CountryCodeSelectProps {
  /** Selected dial code, e.g. "+91". */
  value: string;
  /** Receives the dial code (e.g. "+971"). */
  onChange: (dialCode: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Standalone country-code picker showing flags, for forms that store the dial
 * code separately from the phone number (the charter backend persists
 * `country_code` and `phone` as distinct columns).
 *
 * Options come from libphonenumber-js metadata; nothing is hardcoded.
 */
export function CountryCodeSelect({ value, onChange, className, disabled }: CountryCodeSelectProps) {
  const [countries, setCountries] = useState<DialCountry[]>([]);
  useEffect(() => {
    let alive = true;
    getDialCountries().then((list) => {
      if (alive) setCountries(list);
    });
    return () => {
      alive = false;
    };
  }, []);
  const selected = countries.find((c) => c.dial === value) || countries.find((c) => c.code === "IN");

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      aria-label="Country calling code"
    >
      {countries.map((c) => (
        <option key={c.code} value={c.dial}>
          {c.flag} {c.name} ({c.dial})
        </option>
      ))}
      {selected ? null : <option value={value}>{value}</option>}
    </select>
  );
}

export default PhoneInput;
