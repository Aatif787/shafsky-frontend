import { useBranding } from "./branding.context";

/** Favicons only — page titles, descriptions, and Open Graph live in route `head()`. */
export function BrandingHead() {
  const { branding } = useBranding();
  const icon = branding.favicon_url || "/favicon.ico";

  return (
    <>
      <link rel="icon" href={icon} />
      <link rel="shortcut icon" href={icon} />
      <link rel="apple-touch-icon" href={icon} />
    </>
  );
}

export default BrandingHead;
