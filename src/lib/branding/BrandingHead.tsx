import { useBranding } from "./branding.context";

export function BrandingHead() {
  const { branding } = useBranding();

  const fullTitle = `${branding.company_name} — ${branding.company_tagline || "Welcome Begins Before You Land."}`;
  const desc = `${branding.company_name} delivers luxury private charter, cargo coordination, medical evacuation, and premium Suswagatam airport concierge services globally.`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="author" content={branding.company_name} />
      
      {/* Dynamic Favicons */}
      <link rel="icon" href={branding.favicon_url || "/favicon.ico"} />
      <link rel="shortcut icon" href={branding.favicon_url || "/favicon.ico"} />
      <link rel="apple-touch-icon" href={branding.favicon_url || "/favicon.ico"} />
      
      {/* OpenGraph / Facebook */}
      <meta property="og:site_name" content={branding.company_name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={branding.website} />
      <meta property="og:image" content={branding.logo_url} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={branding.logo_url} />

      {/* JSON-LD Organization Schema (Sanitized against script breakouts) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": branding.company_name,
            "url": branding.website,
            "logo": branding.logo_url,
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": branding.support_phone,
                "contactType": "customer service",
                "email": branding.support_email,
              },
            ],
            "sameAs": [
              branding.linkedin_url,
              branding.facebook_url,
              branding.instagram_url,
              branding.youtube_url,
              branding.twitter_url,
            ].filter(Boolean),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
export default BrandingHead;
