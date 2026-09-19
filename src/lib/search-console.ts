function readEnv(name: string): string {
  const vite = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[name];
  if (vite && vite.trim()) return vite.trim();
  if (typeof process !== "undefined" && process.env?.[name]?.trim()) {
    return process.env[name]!.trim();
  }
  return "";
}

/** Meta tags for Search Console / Bing Webmaster once tokens are set in env. */
export function searchConsoleMeta(): Array<{ name: string; content: string }> {
  const google = readEnv("VITE_GOOGLE_SITE_VERIFICATION");
  const bing = readEnv("VITE_BING_SITE_VERIFICATION");
  const tags: Array<{ name: string; content: string }> = [];
  if (google) tags.push({ name: "google-site-verification", content: google });
  if (bing) tags.push({ name: "msvalidate.01", content: bing });
  return tags;
}
