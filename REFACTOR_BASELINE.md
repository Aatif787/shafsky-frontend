# REFACTOR BASELINE — Hero.tsx Audit

**Date**: August 13, 2026  
**File**: `src/components/Hero.tsx`  
**Total Lines of Code (LOC)**: **3282 lines**  

---

## 1. Git Status & Environment Baseline
- **Branch**: `main`
- **Working Copy State**: `Hero.tsx` is restored to full original 3282 LOC monolith.

---

## 2. Imports Audit (47 imports)
```typescript
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Navigation } from "./Navigation";
import { HeroAircraft } from "./hero/HeroAircraft";
import { EnterpriseServicesPlatform } from "./services/EnterpriseServicesPlatform";
import { useBranding } from "@/lib/branding/branding.context";
import {
import { useNavigate, Link } from "@tanstack/react-router";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import { FlightData } from "@/services/flight/FlightTypes";
import { ManualFlightEntryForm } from "@/components/booking/shared/ManualFlightEntryForm";
import { supabase } from "@/integrations/supabase/client";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { getRequiredBookingFields } from "@/components/booking/config/services.config";
import {
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import heroJet from "@/assets/hero-jet.png";
import clouds from "@/assets/clouds.jpg";
import interior from "@/assets/interior.jpg";
import jetTarmac from "@/assets/jet-tarmac.jpg";
import cargo from "@/assets/cargo.jpg";
import medical from "@/assets/medical.jpg";
import concierge from "@/assets/concierge.jpg";
import ctaBg from "@/assets/cta-bg.jpg";
import lounge from "@/assets/lounge.png";
import meetVideo from "@/assets/meet.mp4";
import vipTransport1 from "@/assets/vip-transport-1.png";
import vipTransport2 from "@/assets/vip-transport-2.png";
import vipTransport3 from "@/assets/vip-transport-3.png";
import vipTransport4 from "@/assets/vip-transport-4.png";
import vipTransport5 from "@/assets/vip-transport-5.png";
import hotelImg from "@/assets/hotel.png";
import fastTrackImg from "@/assets/fast-track.png";
import cargoAssistImg from "@/assets/cargo-assist.png";
import medicalAssistImg from "@/assets/medical-assist.png";
import vipConciergeImg from "@/assets/vip-concierge.png";
import meetGreetImg from "@/assets/meet-greet.png";
import slide0 from "@/assets/image.png";
import slide1 from "@/assets/image1.png";
import slide2 from "@/assets/image2.png";
import slide3 from "@/assets/image3.png";
import world from "@/assets/world.png";
import { AirportShowcase } from "./airports/AirportShowcase";
import { OFFICIAL_SHAFSKY_SERVICES, OFFICIAL_SHAFSKY_CATEGORIES } from "@/services/catalog";
```

---

## 3. Top-Level Functions & Components (24)
| Line | Component / Function Name |
| :--- | :--- |
| L57 | `formatFlightLookupError` |
| L129 | `ScrollSection` |
| L175 | `Hero` |
| L224 | `HeroSection` |
| L357 | `DoublePlaneIcon` |
| L403 | `ServicesSelectorBar` |
| L484 | `BookingPanel` |
| L1559 | `Field` |
| L1571 | `Select` |
| L1599 | `WhyChooseUs` |
| L1712 | `Counter` |
| L1740 | `TrustBar` |
| L1792 | `SectionLabel` |
| L1824 | `SignatureConciergeSection` |
| L1965 | `SolutionPanel` |
| L2168 | `EnterpriseSolutions` |
| L2293 | `Coverage` |
| L2349 | `Fleet` |
| L2484 | `Spec` |
| L2498 | `Journey` |
| L2617 | `Testimonials` |
| L2918 | `FAQ` |
| L3008 | `FinalCTA` |
| L3089 | `Footer` |

---

## 4. State Audit (28 useState declarations)
| Line | State Variable | Setter Function | Code Snippet |
| :--- | :--- | :--- | :--- |
| L229 | `currentIdx` | `setCurrentIdx` | `const [currentIdx, setCurrentIdx] = useState(0);` |
| L486 | `validatingFlight` | `setValidatingFlight` | `const [validatingFlight, setValidatingFlight] = useState(false);` |
| L487 | `selectedService` | `setSelectedService` | `const [selectedService, setSelectedService] = useState<string | null>("Meet & Greet");` |
| L488 | `selectedAirportCode` | `setSelectedAirportCode` | `const [selectedAirportCode, setSelectedAirportCode] = useState<string>("DEL");` |
| L489 | `tab` | `setTab` | `const [tab, setTab] = useState<"arrival" | "departure" | "connection">("arrival");` |
| L490 | `showPassengerModal` | `setShowPassengerModal` | `const [showPassengerModal, setShowPassengerModal] = useState(false);` |
| L491 | `adults` | `setAdults` | `const [adults, setAdults] = useState(1);` |
| L492 | `childrenCount` | `setChildrenCount` | `const [childrenCount, setChildrenCount] = useState(0);` |
| L493 | `infants` | `setInfants` | `const [infants, setInfants] = useState(0);` |
| L494 | `bags` | `setBags` | `const [bags, setBags] = useState(1);` |
| L495 | `flightNumber` | `setFlightNumber` | `const [flightNumber, setFlightNumber] = useState("");` |
| L496 | `departDate` | `setDepartDate` | `const [departDate, setDepartDate] = useState("");` |
| L497 | `datePopoverOpen` | `setDatePopoverOpen` | `const [datePopoverOpen, setDatePopoverOpen] = useState(false);` |
| L500 | `flightNumber2` | `setFlightNumber2` | `const [flightNumber2, setFlightNumber2] = useState("");` |
| L501 | `departDate2` | `setDepartDate2` | `const [departDate2, setDepartDate2] = useState("");` |
| L502 | `datePopoverOpen2` | `setDatePopoverOpen2` | `const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);` |
| L505 | `heroFlightStateMode` | `setHeroFlightStateMode` | `const [heroFlightStateMode, setHeroFlightStateMode] = useState<"IDLE" | "LOADING" | "VERIFIED" | "ERROR" | "MANUAL">("IDLE");` |
| L506 | `heroFlightError` | `setHeroFlightError` | `const [heroFlightError, setHeroFlightError] = useState<string | null>(null);` |
| L507 | `verifiedHeroFlight` | `setVerifiedHeroFlight` | `const [verifiedHeroFlight, setVerifiedHeroFlight] = useState<FlightData | null>(null);` |
| L508 | `isManualMode` | `setIsManualMode` | `const [isManualMode, setIsManualMode] = useState(false);` |
| L509 | `pendingVerifiedFlight` | `setPendingVerifiedFlight` | `const [pendingVerifiedFlight, setPendingVerifiedFlight] = useState<FlightData | null>(null);` |
| L528 | `touched` | `setTouched` | `const [touched, setTouched] = useState({` |
| L1572 | `v` | `setV` | `const [v, setV] = useState(options[0]);` |
| L1713 | `v` | `setV` | `const [v, setV] = useState(0);` |
| L2700 | `cardsPerView` | `setCardsPerView` | `const [cardsPerView, setCardsPerView] = useState(3);` |
| L2701 | `current` | `setCurrent` | `const [current, setCurrent] = useState(0);` |
| L2702 | `direction` | `setDirection` | `const [direction, setDirection] = useState(1);` |
| L2941 | `open` | `setOpen` | `const [open, setOpen] = useState<number | null>(0);` |

---

## 5. Hooks Used (10)
`useBranding, useCallback, useEffect, useInView, useMemo, useNavigate, useRef, useScroll, useState, useTransform`

---

## 6. Key Handlers & Callback Functions (10)
| Line | Handler Name |
| :--- | :--- |
| L412 | `handleSelect` |
| L576 | `handleHomepageSearchFlight` |
| L697 | `proceedWithFlightData` |
| L2024 | `handleMouseMove` |
| L2049 | `handleMouseLeave` |
| L2706 | `handleResize` |
| L2726 | `startAutoPlay` |
| L2741 | `goTo` |
| L2747 | `prev` |
| L2752 | `next` |

---

## 7. API Calls & Data Integration
- **Flight API Validation**: L618 (`ApiClient.fetchWithAuth("/api/flight/validate", ...)`).
- **Branding Hook**: L3090 (`useBranding()`).
- **Airport Registry**: L20 (`AIRPORT_REGISTRY`).
- **Services Catalog**: L1821 (`OFFICIAL_SHAFSKY_SERVICES`, `OFFICIAL_SHAFSKY_CATEGORIES`).

---

## 8. Service & Booking Logic Baseline
- **`SELECTOR_SERVICES`**: 9 Services (`Meet & Greet`, `VIP Lounge`, `Fast Track`, `Airport Transfer`, `Porter Service`, `Baggage Assistance`, `Visa Assistance`, `Hotel Booking`, `Wheelchair Assistance`).
- **Service Rules**: Driven by `getRequiredBookingFields(serviceId)` from `@/components/booking/config/services.config`.
- **Journey Tabs**: `arrival`, `departure`, `connection`.
- **Passenger Counters**: `adults`, `childrenCount`, `infants`, `bags`.
- **Flight Machine**: `IDLE`, `LOADING`, `VERIFIED`, `ERROR`, `MANUAL`.

---

## 9. Top-Level Page Composition Sequence
1. `<Navigation visible={visible} />`
2. `<HeroSection visible={visible} />`
3. `<BookingPanel />`
4. `<SignatureConciergeSection />`
5. `<WhyChooseUs />` (ScrollSection)
6. `<TrustBar />` (ScrollSection)
7. `<EnterpriseServicesPlatform />` (ScrollSection)
8. `<EnterpriseSolutions />`
9. `<Coverage />` (ScrollSection)
10. `<Fleet />` (ScrollSection)
11. `<Journey />` (ScrollSection)
12. `<Testimonials />` (ScrollSection)
13. `<FAQ />` (ScrollSection)
14. `<FinalCTA />` (ScrollSection)
15. `<Footer />` (ScrollSection isLast)

