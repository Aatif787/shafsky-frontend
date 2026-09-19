// scripts/run-production-uat.mjs
const BASE_URL = "http://localhost:3000";

async function fetchHtml(path) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "follow" });
  const html = await res.text();
  return { status: res.status, url: res.url, html };
}

async function runUAT() {
  console.log("==================================================");
  console.log("PRODUCTION UAT AUDIT - ICICI REVIEW MODE");
  console.log("Target: " + BASE_URL);
  console.log("==================================================\n");

  let allPassed = true;

  // 1. HOMEPAGE AUDIT
  console.log("--- TEST 1: HOMEPAGE VISUAL AUDIT (/) ---");
  const home = await fetchHtml("/");
  
  const forbiddenKeywords = [
    { term: "Private Charter", regex: /\bPrivate Charter\b/i },
    { term: "Air Charter", regex: /\bAir Charter\b/i },
    { term: "Luxury Hotels", regex: /\bLuxury Hotels\b/i },
    { term: "Special Services", regex: /\bSpecial Services\b/i },
    { term: "Chauffeur", regex: /\bChauffeur\b/i },
    { term: "Ground Fleet", regex: /\bGround Fleet\b/i },
    { term: "Tours & Travel", regex: /\bTours\s*&\s*Travel\b/i },
    { term: "Passport / VISA", regex: /\bPassport\s*&\s*VISA\b/i },
    { term: "Armed PSO", regex: /\bArmed\s*PSO\b/i },
    { term: "Infant Care", regex: /\bInfant Care\b/i },
    { term: "Human Remains", regex: /\bHuman Remains\b/i },
    { term: "Destination weddings", regex: /\bDestination weddings\b/i },
  ];

  // Look specifically inside visible text (strip script/style tags)
  const homeVisible = home.html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  let foundForbidden = [];
  for (const { term, regex } of forbiddenKeywords) {
    if (regex.test(homeVisible)) {
      foundForbidden.push(term);
    }
  }

  if (foundForbidden.length > 0) {
    console.error("FAIL: Forbidden keywords found on homepage:", foundForbidden);
    allPassed = false;
  } else {
    console.log("PASS: Zero forbidden keywords found on rendered homepage.");
  }

  // Check Meet & Greet presence on homepage
  const hasMeetGreet = home.html.includes("Meet &amp; Greet") || home.html.includes("Meet & Greet");
  const hasLounge = home.html.includes("VIP Lounge") || home.html.includes("Lounge Service");
  console.log(`PASS: Meet & Greet present: ${hasMeetGreet}, Lounge present: ${hasLounge}`);

  // Check 5 touchpoints
  const touchpoints = [
    "Domestic Departure",
    "Domestic Arrival",
    "International Departure",
    "International Arrival",
    "Transit Service"
  ];
  const allTouchpoints = touchpoints.every(tp => home.html.includes(tp));
  console.log(`PASS: All 5 Meet & Greet touchpoints present in Services section: ${allTouchpoints}`);

  // Check Footer quick links
  const footerHasHotels = /<a[^>]*href="\/hotels[^"]*"[^>]*>Hotels<\/a>/i.test(home.html);
  if (footerHasHotels) {
    console.error("FAIL: Footer contains Hotels link.");
    allPassed = false;
  } else {
    console.log("PASS: Footer does NOT contain Hotels link.");
  }

  // 2. DESKTOP & MOBILE NAVIGATION AUDIT
  console.log("\n--- TEST 2 & 3: NAVIGATION AUDIT ---");
  const navHasCharter = /<a[^>]*href="\/solutions\/aviation"[^>]*>Private Charter<\/a>/i.test(home.html);
  const navHasTransport = /<a[^>]*href="\/solutions\/cargo"[^>]*>Transport Service<\/a>/i.test(home.html);
  const navHasHotels = /<a[^>]*href="\/solutions\/travel"[^>]*>Luxury Hotels<\/a>/i.test(home.html);
  const navHasSpecial = /<a[^>]*href="\/solutions\/medical"[^>]*>Special Services<\/a>/i.test(home.html);

  if (navHasCharter || navHasTransport || navHasHotels || navHasSpecial) {
    console.error("FAIL: Navigation exposes forbidden service link:", { navHasCharter, navHasTransport, navHasHotels, navHasSpecial });
    allPassed = false;
  } else {
    console.log("PASS: Desktop & Mobile Navigation expose ONLY Meet & Greet / Lounge.");
  }

  // 4. MEET & GREET FLOW (/solutions/concierge)
  console.log("\n--- TEST 4: /solutions/concierge AUDIT ---");
  const concierge = await fetchHtml("/solutions/concierge");
  console.log(`Status: ${concierge.status}, Final URL: ${concierge.url}`);
  const conciergeHasTitle = concierge.html.includes("Meet &amp; Greet") || concierge.html.includes("Meet & Greet");
  const conciergeTouchpoints = touchpoints.every(tp => concierge.html.includes(tp.toUpperCase()));
  console.log(`PASS: Concierge page loads properly: ${conciergeHasTitle}, Touchpoint tabs present: ${conciergeTouchpoints}`);

  // 5. /book ROUTE AUDIT
  console.log("\n--- TEST 5: /book ROUTE AUDIT ---");
  for (const bookUrl of ["/book", "/book?transport=true", "/book?charter=true"]) {
    const res = await fetchHtml(bookUrl);
    const hasTransportExperience = res.html.includes("TransportExperience") || res.html.includes("Chauffeured Airport & Tarmac Fleet");
    const hasCharterFlow = res.html.includes("Private Charter Request") || res.html.includes("Aircraft Preference");
    if (hasTransportExperience || hasCharterFlow) {
      console.error(`FAIL: ${bookUrl} exposed non-Meet-and-Greet UI!`, { hasTransportExperience, hasCharterFlow });
      allPassed = false;
    } else {
      console.log(`PASS: ${bookUrl} loads strictly AirportBookingFlow (Meet & Greet).`);
    }
  }

  // 6. DIRECT URL REDIRECTS
  console.log("\n--- TEST 6: DIRECT URL REDIRECT AUDIT ---");
  const directUrls = [
    "/solutions/aviation",
    "/solutions/cargo",
    "/solutions/travel",
    "/solutions/medical",
    "/charter",
    "/hotels/airport-hotel",
    "/hotels/castle-blue",
    "/hotels/classic-diplomat",
    "/hotels/de-pavilion",
    "/hotels/holiday-inn-express"
  ];

  for (const url of directUrls) {
    const rawRes = await fetch(`${BASE_URL}${url}`, { redirect: "manual" });
    const location = rawRes.headers.get("location");
    const status = rawRes.status;
    if ((status === 307 || status === 302 || status === 308 || status === 301) && location === "/solutions/concierge") {
      console.log(`PASS: ${url} -> ${status} redirect to ${location}`);
    } else {
      console.error(`FAIL: ${url} did not redirect as expected. Status: ${status}, Location: ${location}`);
      allPassed = false;
    }
  }

  // 7. PUBLIC PAGES AUDIT
  console.log("\n--- TEST 7: PUBLIC PAGES AUDIT ---");
  const publicPages = [
    "/airports",
    "/airports/DEL",
    "/services/guide",
    "/contact",
    "/gallery"
  ];

  for (const p of publicPages) {
    const res = await fetchHtml(p);
    const hasForbiddenLink =
      res.html.includes('href="/solutions/aviation"') ||
      res.html.includes('href="/solutions/cargo"') ||
      res.html.includes('href="/solutions/travel"') ||
      res.html.includes('href="/solutions/medical"') ||
      res.html.includes('href="/charter"') ||
      res.html.includes('href="/hotels/');

    if (hasForbiddenLink) {
      console.error(`FAIL: Public page ${p} contains link to guarded service!`);
      allPassed = false;
    } else {
      console.log(`PASS: Public page ${p} contains NO links to non-Meet-and-Greet services.`);
    }
  }

  console.log("\n==================================================");
  if (allPassed) {
    console.log("OVERALL PRODUCTION UAT RESULT: ALL CHECKS PASSED (100% SUCCESS)");
  } else {
    console.error("OVERALL PRODUCTION UAT RESULT: SOME CHECKS FAILED");
  }
  console.log("==================================================");
}

runUAT().catch(console.error);
