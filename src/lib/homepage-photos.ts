// Official Shafsky Aviation Real Photography Assets Dictionary
// Sourced from company authentic archives for the Customer-Facing Homepage
// EXACT PHOTO FIT INVENTORY - PRESERVING 100% COMPLETE UNADULTERATED COMPOSITION

import buggyImg from "@/assets/homepage/widescreen/buggy.jpeg";
import charter1Img from "@/assets/homepage/widescreen/charter.png";
import dutyImg from "@/assets/homepage/widescreen/duty.jpeg";
import greetImg from "@/assets/homepage/widescreen/greet.jpeg";
import home2Img from "@/assets/homepage/widescreen/home2.jpeg";
import home3Img from "@/assets/homepage/widescreen/home3.jpeg";
import home5Img from "@/assets/homepage/widescreen/home5.jpeg";
import hotelImg from "@/assets/homepage/widescreen/hotel.jpeg";
import loungeImg from "@/assets/homepage/widescreen/lounge.jpeg";
import meetImg from "@/assets/homepage/widescreen/meet.jpeg";
import transitImg from "@/assets/homepage/widescreen/transit.jpeg";
import vvipImg from "@/assets/homepage/widescreen/vvip.jpeg";
import wheelImg from "@/assets/homepage/widescreen/wheel.jpeg";

export const HOMEPAGE_PHOTOS = {
  // Hero Editorial Visual (Widescreen 16:9)
  heroJet: {
    src: home2Img,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Shafsky executive private aircraft in flight over metropolitan skyline during sunset",
    subject: "Executive Jet in Flight over Sunset Skyline",
    orientation: "landscape" as const,
  },

  // VVIP Terminal & Curbside Protocol (Widescreen 16:9)
  vvipTerminal: {
    src: vvipImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "VVIP Terminal curbside reception with luxury Maybach sedan, red carpet, and dedicated baggage porter",
    subject: "VVIP Terminal Red Carpet & Curbside Reception",
    orientation: "landscape" as const,
  },

  // Flagship Airside Meet & Greet Escort (Widescreen 16:9)
  meetGreetEscort: {
    src: meetImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Shafsky Guest Relations Officer escorting business traveler with luggage past apron windows",
    subject: "Personal Airside Officer Escort past Runway Apron",
    orientation: "landscape" as const,
  },

  // Suswagatam Traditional Greeting (Widescreen 16:9)
  suswagatamHostess: {
    src: greetImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Shafsky airport concierge hostess offering traditional Indian Namaste welcome in terminal concourse",
    subject: "Suswagatam Signature Traditional Indian Welcome",
    orientation: "landscape" as const,
  },

  // VVIP Executive Lounge Sanctuary (Widescreen 16:9)
  vvipLounge: {
    src: loungeImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "VVIP Lounge reception sanctuary with chandelier, flight display board, and apron runway views",
    subject: "VVIP Lounge Reception & Runway Apron Views",
    orientation: "landscape" as const,
  },

  // Private Jet & Executive Helicopter Charter (Widescreen 16:9)
  privateCharter: {
    src: charter1Img,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Luxury private helicopter charter with executive travelers on skyline helipad",
    subject: "Executive Private Helicopter Charter & Skyline Helipad",
    orientation: "landscape" as const,
  },

  // Chauffeured Luxury Ground Fleet (Widescreen 16:9)
  luxuryFleet: {
    src: home5Img,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Shafsky private jet in flight over luxury sedan and passenger van fleet at dusk",
    subject: "Executive Aircraft Soaring over Chauffeured Ground Fleet",
    orientation: "landscape" as const,
  },

  // Airside Buggy & Passenger Transfer (Widescreen 16:9)
  airsideBuggy: {
    src: buggyImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Electric passenger buggy cart for terminal transit with uniformed driver",
    subject: "Airside Electric Buggy Passenger Transfer",
    orientation: "landscape" as const,
  },

  // Wheelchair & Dedicated Assistance (Widescreen 16:9)
  specialAssistance: {
    src: wheelImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Wheelchair assistance passenger escorted through airport terminal concourse",
    subject: "Special Care & Wheelchair Assistance Escort",
    orientation: "landscape" as const,
  },

  // Duty Free & Shopping Concierge (Widescreen 16:9)
  dutyFreeShopping: {
    src: dutyImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Duty Free luxury shopping assistance with dedicated concierge assistant",
    subject: "Personal Duty Free Shopping Concierge",
    orientation: "landscape" as const,
  },

  // Transit Lounge & Layover Comfort (Widescreen 16:9)
  transitComfort: {
    src: transitImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Family and travelers resting comfortably in transit lounge with runway aircraft views",
    subject: "Transit Lounge Relaxation & Runway Takeoff Views",
    orientation: "landscape" as const,
  },

  // Luxury 5-Star Hotel & Palace Estate (Widescreen 16:9)
  luxuryHotel: {
    src: hotelImg,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Illuminated luxury palace hotel estate and gardens for VIP transit guests",
    subject: "Luxury Palace Resort & 5-Star Hotel Accommodations",
    orientation: "landscape" as const,
  },

  // Destination & Occasion Concierge (Widescreen 16:9)
  destinationCelebration: {
    src: home3Img,
    width: 1920,
    height: 1080,
    aspectRatio: "16 / 9",
    alt: "Luxury wedding and milestone celebration in Agra with the Taj Mahal in the background",
    subject: "Destination Wedding & Bespoke VIP Milestone Concierge",
    orientation: "landscape" as const,
  },
};

