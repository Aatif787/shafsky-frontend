/**
 * Long-form SEO guide sections for top airport pages.
 * Rendered by <AirportGuide /> inside the airport destination page.
 * Content rules: honest only — no invented prices, stats, reviews or awards.
 */

export interface GuideSection {
  heading: string;
  paragraphs: string[];
}

export interface AirportGuide {
  code: string;
  intro: string;
  sections: GuideSection[];
}

export const AIRPORT_GUIDES: Record<string, AirportGuide> = {
  DEL: {
    code: "DEL",
    intro:
      "Indira Gandhi International Airport is India's busiest airport, with three terminals spread across a large campus. A little planning goes a long way here — this guide explains where your host meets you, how arrivals and departures flow, and which add-ons make the biggest difference at DEL.",
    sections: [
      {
        heading: "Terminal-by-terminal meeting points at Delhi Airport",
        paragraphs: [
          "Delhi Airport (DEL) operates three passenger terminals. Terminal 3 handles international flights and most full-service domestic operations, Terminal 1 serves domestic low-cost carriers, and Terminal 2 handles overflow domestic traffic. Always check your ticket or airline app for the terminal before you travel — arriving at the wrong terminal at DEL can cost you 20–30 minutes in transit.",
          "For departures, your Shafsky host meets you curbside at the departure forecourt of your terminal, holding a name placard. They stay with you from the drop-off point: helping with luggage trolleys, guiding you to the right check-in counters, and escorting you through the security hold area toward your gate or lounge.",
          "For arrivals, the meeting point depends on your flight type. On international arrivals at Terminal 3, your host greets you as you exit the aerobridge — before immigration — so you are accompanied through the entire arrivals process. On domestic arrivals, the host meets you at the aerobridge exit or in the arrival hall, again with a name placard, and escorts you to baggage reclaim and then to your waiting car.",
          "If you are transiting between terminals (for example, arriving at T1 and departing from T3), tell the team in advance. The inter-terminal transfer at DEL takes time, and your host will plan the handoff so you are not navigating the shuttle or roadway alone.",
        ],
      },
      {
        heading: "How the arrival and departure flows work with Meet & Greet",
        paragraphs: [
          "On arrival, the flow is: aerobridge greeting, immigration (with fast-track lane access where the airport authority permits), baggage reclaim with porter assistance, customs, and then an escorted walk to your chauffeur or the lounge. Your host monitors your flight, so if you land early or late, the team adjusts — you are never left searching for your greeter.",
          "On departure, the flow is: curbside greeting, check-in assistance (including help with excess-baggage or special-service counters if needed), fast-track through security where available, and an escort to the gate or lounge. For families, the host keeps the group together through each checkpoint, which is where most of the stress at a big airport like DEL comes from.",
          "Elderly travellers and passengers with reduced mobility get wheelchair coordination as part of the service — the host arranges the wheelchair with the airline or airport staff and stays with the passenger until handover at the aircraft or the car.",
          "One practical tip: keep your passport, visa documents and boarding pass easily reachable. Even with an escort, document checks are yours to clear — the host's job is to get you to the right counter, at the right time, without detours.",
        ],
      },
      {
        heading: "Fast-track clearance, lounge access and transfers at IGI",
        paragraphs: [
          "Fast-track is the single biggest time-saver at DEL during peak hours. Where the airport authority allows, your host routes you through priority immigration and security lanes, which can turn a 45-minute queue into a few minutes. Availability of fast-track lanes is controlled by the airport, not by any service provider — a point worth knowing when you compare options.",
          "Lounge access can be added at Terminal 3, which has the airport's main lounge facilities. It is a sensible add-on for long layovers, early-morning arrivals before hotel check-in, or business travellers who want a quiet place to work between flights.",
          "Airside buggy transfers inside the terminal are available subject to airport allocation — useful in T3, where some gates are a long walk from security. Your host requests the buggy and coordinates boarding; it cannot be guaranteed at peak times, so treat it as a comfort add-on rather than a certainty.",
          "For ground transport, private chauffeur transfers connect the airport with Delhi, Gurugram, Noida and Faridabad. The car waits at the pickup point while your host brings you out, so there is no hunting for your driver in the arrivals crowd. For exact fares, contact the team for a transparent quote — pricing depends on vehicle type and distance.",
        ],
      },
      {
        heading: "Who benefits most, and how early to book",
        paragraphs: [
          "Meet & Greet at DEL pays for itself in four situations: families travelling with children or elderly parents, business travellers on tight schedules, first-time visitors to India who do not know the airport layout, and VIP or celebrity travellers who want discretion. If none of these apply and you know DEL well, you may not need it — and an honest provider will tell you that.",
          "As a rule of thumb, book at least 12 hours ahead for domestic flights and 24 hours ahead for international ones. This gives the team time to assign your host, confirm terminal and flight details, and arrange any add-ons like lounge access or a specific vehicle.",
          "Travelling last-minute? Call or WhatsApp +91 9599087959. The operations team runs 24/7 and regularly accommodates requests with just a few hours' notice, subject to host availability at your terminal.",
          "To book online, head to the booking page, choose Delhi (DEL) as your airport, pick arrival or departure, and select your package. You will get a confirmation with your host's details before your travel date.",
        ],
      },
    ],
  },
  BOM: {
    code: "BOM",
    intro:
      "Mumbai's Chhatrapati Shivaji Maharaj International Airport runs across two main terminals that feel like different airports. This guide covers where you are met at each terminal, how the arrival and departure flows work, and when fast-track, lounge or a chauffeur transfer is worth adding at BOM.",
    sections: [
      {
        heading: "Terminal-by-terminal meeting points at Mumbai Airport",
        paragraphs: [
          "Mumbai Airport (BOM) has two passenger terminals: Terminal 1 at Santacruz for domestic flights, and the landmark Terminal 2 at Sahar for international flights and most full-service domestic operations. The two terminals are several kilometres apart, so confirming your terminal before you leave for the airport is essential — a wrong-terminal arrival in Mumbai traffic can easily cost you an hour.",
          "For departures, your host meets you curbside at the departure level of your terminal with a name placard. At T2, the sweeping departure forecourt is where the greeting happens; at T1, the meeting point is at the terminal entrance. From there, the host helps with luggage, walks you to check-in, and escorts you through security toward your gate or lounge.",
          "For international arrivals at T2, your host greets you at the aerobridge exit — before immigration — and stays with you through immigration, baggage reclaim and customs to the arrivals hall. For domestic arrivals at T1 or T2, the greeting is at the aerobridge exit or arrival hall, followed by an escorted walk to baggage and your waiting car.",
          "Mumbai Airport's T2 is architecturally striking but large; first-time visitors often underestimate walking distances inside it. Having an escort who knows the shortcuts between immigration, baggage belts and exits makes a real difference here.",
        ],
      },
      {
        heading: "How the arrival and departure flows work with Meet & Greet",
        paragraphs: [
          "On international arrival at T2, the sequence is: aerobridge greeting, immigration (fast-track lane where the airport permits), baggage reclaim with porter help, customs clearance, and escort to your chauffeur in the arrivals pickup zone. Your host tracks your flight in real time, so early or delayed landings are handled without you having to call anyone.",
          "On departure, the flow is: curbside greeting, check-in assistance, security, and escort to the gate or lounge. At T2's vast departures level, the host's knowledge of which security hold area serves your gate saves the backtracking that unguided travellers often do.",
          "For passengers with reduced mobility, wheelchair assistance is coordinated with the airline and airport staff, and the host remains with the passenger through every handover — from car to check-in to aircraft, or the reverse on arrival.",
          "Mumbai's monsoon season (roughly June to September) regularly causes delays and terminal congestion. If you are travelling then, build in extra buffer time and share your flight number at booking so the team can monitor changes.",
        ],
      },
      {
        heading: "Fast-track clearance, lounge access and transfers at BOM",
        paragraphs: [
          "During peak international banks at T2, immigration queues can be long. Fast-track lane access, where the airport authority allows it, is the highest-value add-on at BOM. It is subject to airport allocation, so it is arranged rather than guaranteed — ask the team about current availability when you book.",
          "Lounge access is available at T2's lounges and is worth considering for long layovers or for business travellers who want to work before a red-eye departure. Your host can escort you to the lounge entrance after security.",
          "Chauffeur transfers connect the airport with South Mumbai, Bandra, Juhu, Powai, Thane and Navi Mumbai. Given Mumbai's traffic, a pre-booked car with a host who brings you straight to it removes the two biggest arrival frictions: finding your driver and negotiating fares. Contact the team for a transparent quote based on your destination and vehicle preference.",
          "For departures during evening peak hours, leave for the airport earlier than you think necessary. Your host cannot shorten the road journey, but they can make everything after the terminal doors fast and predictable.",
        ],
      },
      {
        heading: "Monsoon and peak-season travel tips for Mumbai Airport",
        paragraphs: [
          "Mumbai's monsoon, roughly June to September, is the single biggest disruptor at BOM. Heavy rain causes flight delays, waterlogging on approach roads, and congestion inside the terminals as delayed passengers accumulate. If you travel in these months, add at least an extra hour to your airport timeline and share your flight number at booking so the team can monitor changes in real time.",
          "The festive season (October to November) and the December to January holiday period bring the year's heaviest passenger loads. Security and immigration queues lengthen, and lounge and buggy availability tightens. Booking earlier than the standard lead times during these peaks gives the team room to secure your host and add-ons.",
          "For road transfers in the monsoon, discuss pickup timing with the team rather than fixing it rigidly. A chauffeur who leaves based on live traffic conditions beats one working to a fixed schedule, and your host coordinates the terminal handoff around the car's actual arrival.",
          "Inside the terminal, the strategy is simple: get through check-in and security early, then wait airside rather than landside. Your host manages exactly this sequencing, which is why the escort matters more in difficult seasons, not less.",
        ],
      },
      {
        heading: "Who benefits most, and how early to book",
        paragraphs: [
          "At BOM, the service is most valuable for international arrivals (immigration plus a big unfamiliar terminal), families with children or elderly members, business travellers heading straight to meetings, and anyone arriving during peak hours or the monsoon season.",
          "Book at least 12 hours ahead for domestic and 24 hours ahead for international flights. For early-morning international departures from T2 — when counters and security are at their busiest — earlier booking helps the team assign a host who knows that shift's layout.",
          "Last-minute plans are common in Mumbai. The operations team works 24/7 on +91 9599087959 and can often arrange a host with a few hours' notice, depending on terminal availability.",
          "To book, choose Mumbai (BOM) on the booking page, select arrival or departure, and pick your package. Your confirmation includes host details ahead of travel day.",
        ],
      },
    ],
  },
  BLR: {
    code: "BLR",
    intro:
      "Bengaluru's Kempegowda International Airport is one of India's fastest-growing airports, with two terminals including the garden-themed Terminal 2. This guide explains meeting points, arrival and departure flows, and the add-ons that matter most at BLR.",
    sections: [
      {
        heading: "Terminal-by-terminal meeting points at Bengaluru Airport",
        paragraphs: [
          "Kempegowda International Airport (BLR) operates Terminal 1, which handles domestic and international flights, and Terminal 2 — the much-talked-about 'terminal in a garden' — which handles international operations and select domestic flights. Check your airline's terminal allocation on your ticket, because it varies by carrier and route.",
          "For departures, your host meets you curbside at the departure level of your terminal with a name placard, assists with luggage, guides you to check-in, and escorts you through security to your gate or lounge. T2's departures area is spacious but spread out, so the escort is genuinely useful there.",
          "For arrivals, international passengers are greeted at the aerobridge exit before immigration and accompanied through immigration, baggage reclaim and customs to the arrivals hall. Domestic arrivals are met at the aerobridge exit or arrival hall and escorted to baggage and the waiting car.",
          "BLR is about 35–40 km from the city centre, and the airport road can be slow during peak hours. Factor the road journey into your plans separately — the Meet & Greet covers everything inside the terminal, and your chauffeur transfer covers the road.",
        ],
      },
      {
        heading: "How the arrival and departure flows work with Meet & Greet",
        paragraphs: [
          "On international arrival, the flow is: aerobridge greeting, immigration (fast-track where permitted), baggage reclaim with porter assistance, customs, and escort to your car in the arrivals pickup area. Flight monitoring means your host adjusts for delays without you needing to update anyone.",
          "On departure, the flow is: curbside greeting, check-in help, security escort, and onward to the gate or lounge. For business travellers on the early-morning Bengaluru–Delhi or Bengaluru–Mumbai shuttles, the host's familiarity with peak-hour security queues keeps things moving.",
          "Wheelchair assistance for elderly or reduced-mobility passengers is coordinated with airline and airport staff, with the host staying through each handover from car to aircraft or aircraft to car.",
          "Bengaluru's weather is generally mild, but the airport's rapid growth means construction and layout changes happen. Hosts are briefed on current terminal conditions, which is a quiet advantage over navigating alone.",
        ],
      },
      {
        heading: "Fast-track clearance, lounge access and transfers at BLR",
        paragraphs: [
          "Fast-track immigration and security lanes, where the airport authority permits, are the best defence against peak-hour queues at BLR — particularly for international arrivals. Availability is controlled by the airport, so confirm with the team when booking.",
          "Lounge access suits long layovers and the many red-eye connections that pass through Bengaluru. Your host escorts you to the lounge after security so you do not waste time finding it.",
          "Chauffeur transfers serve Whitefield, Electronic City, MG Road, Koramangala, Hebbal and beyond. Pre-booking with a host handover at arrivals removes the usual scramble for cabs after a long flight. For fares, contact the team for a transparent quote based on destination and vehicle.",
          "If you are connecting between T1 and T2, mention it at booking — the inter-terminal transfer needs planning, and your host will manage the handoff.",
        ],
      },
      {
        heading: "Getting to and from Bengaluru Airport",
        paragraphs: [
          "Kempegowda International Airport sits 35 to 40 kilometres north of the city centre, and the airport road is the one part of the journey your host cannot speed up. During morning and evening peaks, the drive from Whitefield, Electronic City or MG Road can take well over an hour — plan the road leg separately from the terminal leg.",
          "A pre-booked chauffeur is the most predictable option: the driver follows your flight, waits at the designated pickup point, and your host brings you straight to the car. For late-night arrivals, when app-based cabs are scarce and surge-priced, having a confirmed car waiting is worth a great deal.",
          "The airport is also connected by bus services to major city points, which suit solo travellers with light luggage and flexible timing. For groups, families with children, or anyone with checked baggage, the private transfer remains the sensible choice.",
          "When you book, share your destination in Bengaluru so the team can quote transparently and brief the driver on the route. The host's responsibility ends at the car door; the driver's begins there — and the handoff between them is coordinated, not left to chance.",
        ],
      },
      {
        heading: "Who benefits most, and how early to book",
        paragraphs: [
          "The service is ideal for international arrivals, tech professionals on tight itineraries, families with young children or elderly parents, and first-time visitors to Bengaluru who are unfamiliar with the airport's scale.",
          "Book at least 12 hours ahead for domestic flights and 24 hours ahead for international flights. During festive seasons and long weekends, when BLR sees heavy traffic, booking earlier is wise.",
          "For last-minute needs, the 24/7 operations team on +91 9599087959 can often arrange a host within a few hours, subject to availability at your terminal.",
          "Booking is simple: select Bengaluru (BLR) on the booking page, choose arrival or departure, and pick a package. Host details arrive before your travel date.",
        ],
      },
    ],
  },
  HYD: {
    code: "HYD",
    intro:
      "Hyderabad's Rajiv Gandhi International Airport runs domestic and international operations from a single integrated terminal, which makes it one of the easier large airports to navigate — but peak-hour queues still bite. This guide covers meeting points, flows and the add-ons worth considering at HYD.",
    sections: [
      {
        heading: "Meeting points at Hyderabad Airport's integrated terminal",
        paragraphs: [
          "Rajiv Gandhi International Airport (HYD) operates from one integrated passenger terminal serving both domestic and international flights. That single-terminal design removes the wrong-terminal risk you get at Delhi or Mumbai, but the terminal is large and peak-hour congestion is real.",
          "For departures, your host meets you curbside at the departure forecourt with a name placard, helps with luggage, walks you to the correct check-in counters, and escorts you through security toward your gate or lounge.",
          "For international arrivals, the greeting happens at the aerobridge exit — before immigration — and your host stays with you through immigration, baggage reclaim and customs to the arrivals hall. Domestic arrivals are met at the aerobridge exit or arrival hall and escorted to baggage and your waiting car.",
          "Because everything is under one roof, hosts at HYD can move efficiently between the greeting point and the exits — which is part of why the service feels seamless here.",
        ],
      },
      {
        heading: "How the arrival and departure flows work with Meet & Greet",
        paragraphs: [
          "On international arrival: aerobridge greeting, immigration (fast-track lane where permitted), baggage reclaim with porter help, customs, and escort to your chauffeur. Your host monitors your flight, so delays are absorbed without phone calls from your side.",
          "On departure: curbside greeting, check-in assistance, security escort, and onward to the gate or lounge. For the busy Hyderabad–Delhi and Hyderabad–Bengaluru business corridors, the host's sense of peak-hour timing matters.",
          "Wheelchair assistance is coordinated with the airline and airport staff for elderly or reduced-mobility passengers, with the host present at every handover.",
          "Hyderabad's airport is about 25–30 km from the city, and the Outer Ring Road usually keeps the drive smooth. Still, allow buffer time during morning and evening peaks.",
        ],
      },
      {
        heading: "Fast-track clearance, lounge access and transfers at HYD",
        paragraphs: [
          "Fast-track lanes for immigration and security, where the airport authority allows, are the most effective queue-beaters at HYD during international arrival banks. Ask the team about current availability when you book, since allocation is controlled by the airport.",
          "Lounge access is a good add-on for layovers or for travellers who reach the airport early and want a comfortable wait. Your host takes you to the lounge entrance after security.",
          "Chauffeur transfers connect the airport with Gachibowli, HITEC City, Banjara Hills, Jubilee Hills, Secunderabad and the old city. A pre-booked car with a host handover means no queueing for cabs after landing. Contact the team for a transparent quote for your destination and vehicle choice.",
          "For international departures, arriving three hours early remains the safe rule even with an escort — the host makes the terminal fast, but airline counters and security still run on their own schedules.",
        ],
      },
      {
        heading: "What first-time visitors should know about Hyderabad Airport",
        paragraphs: [
          "If you have never flown through Hyderabad, the good news is that the single integrated terminal removes the most common big-airport mistake: going to the wrong terminal. Domestic and international operations share one building, so your planning can focus on timing rather than navigation.",
          "The terminal is still large, and the walk from the entrance to the farthest gates is significant. Your host's value here is routing — knowing which entry gate, which security hold area and which lounge or gate gets you there fastest.",
          "Hyderabad's airport is known for efficient operations, but the international arrival banks still produce queues at immigration. Fast-track lane access, where the airport permits, is worth requesting when you book.",
          "For departures, the airport's food and retail options airside are solid, so arriving with comfortable buffer time is not a hardship. Your host will tell you when to start moving toward the gate — trust that timing over the departure board's generic advice.",
        ],
      },
      {
        heading: "Business travel at HYD: the IT corridor run",
        paragraphs: [
          "A large share of Hyderabad Airport traffic is business travel to Gachibowli, HITEC City, the Financial District and Genome Valley. For these travellers, the airport experience is judged on one metric: predictability. A host who gets you kerbside-to-car without variance is worth more than any lounge.",
          "If you are heading straight to a meeting, mention it when booking. The team can prioritise a fast terminal exit — porter-ready baggage handling and a car positioned at the nearest pickup point — over a leisurely lounge stop.",
          "For visiting clients and executives, the escorted arrival also sets the tone: being met at the aerobridge by name signals organisation in a way no taxi voucher does. Corporate travel desks can [contact the team](/contact) about recurring arrangements.",
        ],
      },
      {
        heading: "Who benefits most, and how early to book",
        paragraphs: [
          "At HYD, the service suits international arrivals, business travellers on the Hyderabad IT corridor, families with children or elderly members, and anyone who wants a predictable, assisted transit through a busy terminal.",
          "Book at least 12 hours ahead for domestic flights and 24 hours ahead for international flights. The 24/7 team on +91 9599087959 can often handle last-minute requests within a few hours, depending on host availability.",
          "To book, select Hyderabad (HYD) on the booking page, choose arrival or departure, and select your package. You will receive your host's details before you travel.",
        ],
      },
    ],
  },
  MAA: {
    code: "MAA",
    intro:
      "Chennai International Airport is expanding rapidly, with new integrated terminal facilities coming online alongside the older terminals. This guide explains where you are met, how arrivals and departures flow, and which add-ons help most at MAA.",
    sections: [
      {
        heading: "Meeting points at Chennai Airport",
        paragraphs: [
          "Chennai Airport (MAA) has been transitioning toward modern integrated terminal facilities, with older domestic and international terminals being redeveloped. Because the layout is evolving, confirming your terminal with your airline close to travel day is more important at MAA than at most Indian airports.",
          "For departures, your host meets you curbside at the departure level of your terminal with a name placard, assists with luggage, guides you to check-in, and escorts you through security to your gate or lounge.",
          "For international arrivals, the greeting is at the aerobridge exit before immigration, with the host accompanying you through immigration, baggage reclaim and customs to the arrivals hall. Domestic arrivals are met at the aerobridge exit or arrival hall and escorted to baggage and your waiting car.",
          "If your flight is reallocated to a different terminal due to the ongoing terminal transition, share the update with the team — your host's meeting point adjusts accordingly.",
        ],
      },
      {
        heading: "How the arrival and departure flows work with Meet & Greet",
        paragraphs: [
          "On international arrival: aerobridge greeting, immigration (fast-track where the airport permits), baggage reclaim with porter assistance, customs, and escort to your chauffeur. Flight monitoring means schedule changes are handled proactively.",
          "On departure: curbside greeting, check-in help, security escort, and onward to the gate or lounge. Chennai's early-morning international departure banks can be busy, and an escort who knows the current terminal layout keeps things efficient.",
          "Wheelchair assistance for elderly or reduced-mobility passengers is coordinated with airline and airport staff, with the host present through every handover.",
          "Chennai's heat and humidity are worth planning around — a lounge add-on before departure or an air-conditioned chauffeur waiting at arrivals makes the journey noticeably more comfortable.",
        ],
      },
      {
        heading: "Fast-track clearance, lounge access and transfers at MAA",
        paragraphs: [
          "Fast-track immigration and security lanes, where permitted by the airport authority, help most during peak international arrival and departure periods. Confirm availability with the team when you book.",
          "Lounge access is useful for layovers and for travellers who prefer to wait in comfort rather than the general departure areas. Your host escorts you to the lounge after security.",
          "Chauffeur transfers serve Guindy, Adyar, OMR, Porur, Anna Nagar and the rest of the city. Pre-booking with a host handover at arrivals avoids the taxi queues outside the terminal. For fares, contact the team for a transparent quote based on destination and vehicle.",
          "Metro connectivity to the airport exists and is improving; if you prefer it, your host can guide you to the station — but for groups with luggage, the chauffeur remains the easier option.",
        ],
      },
      {
        heading: "Chennai airport's terminal transition: what to expect",
        paragraphs: [
          "Chennai Airport has been undergoing a major terminal redevelopment, with new integrated facilities progressively replacing the older terminals. For travellers, this means the airport you remember from two years ago may not be the airport you land at today — layouts, entry gates and even terminal allocations have shifted.",
          "The practical response is simple: reconfirm your terminal with your airline 24 hours before travel, and share any update with the Shafsky team. Your host's meeting point is set from current operational information, not from outdated maps.",
          "Construction phases can also mean temporary walkways, relocated check-in counters and changing signage. An unguided traveller reads the signs; a host who was briefed this week knows which signs are current.",
          "The redevelopment is good news long-term — the new integrated terminal facilities are a genuine step up. Short-term, it is exactly the kind of fluid situation where having a dedicated escort pays off most.",
        ],
      },
      {
        heading: "Weather and comfort tips for Chennai Airport",
        paragraphs: [
          "Chennai's heat and humidity are a genuine factor in airport comfort, especially for elderly travellers and young children. The terminal is air-conditioned, but the walks between drop-off, check-in and gates — plus any waiting in non-air-conditioned transit areas during the terminal transition — can be draining.",
          "A lounge add-on before departure gives you a cool, seated base for the wait rather than the general concourse. On arrival, a pre-booked air-conditioned chauffeur waiting at the pickup point beats any queue for cabs in the heat.",
          "Carry water, particularly for domestic departures where the pre-security areas can be warm. Your host keeps the terminal time efficient, which is itself a comfort measure — less time on your feet, more time seated.",
        ],
      },
      {
        heading: "Who benefits most, and how early to book",
        paragraphs: [
          "The service is most valuable for international arrivals, elderly travellers, families with children, business visitors on tight schedules, and first-time visitors navigating Chennai's changing terminal layout.",
          "Book at least 12 hours ahead for domestic flights and 24 hours ahead for international flights. The 24/7 operations team on +91 9599087959 can often accommodate last-minute bookings within a few hours.",
          "To book, choose Chennai (MAA) on the booking page, select arrival or departure, and pick your package. Host details are shared before your travel date.",
        ],
      },
    ],
  },
};

export function getAirportGuide(code: string): AirportGuide | undefined {
  return AIRPORT_GUIDES[code.toUpperCase()];
}
