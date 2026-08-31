// Official Shafsky Aviation Real Photography Assets Dictionary
// Sourced from company authentic archives for the Customer-Facing Homepage
// EXACT PHOTO FIT INVENTORY - PRESERVING 100% COMPLETE UNADULTERATED COMPOSITION

import buggyImg from "@/assets/homepage/buggy.jpeg";
import charter1Img from "@/assets/homepage/charter.png";
import dutyImg from "@/assets/homepage/duty.jpeg";
import greetImg from "@/assets/homepage/greet.jpeg";
import home1Img from "@/assets/homepage/home1.jpeg";
import home2Img from "@/assets/homepage/home2.jpeg";
import home3Img from "@/assets/homepage/home3.jpeg";
import home5Img from "@/assets/homepage/home5.jpeg";
import hotelImg from "@/assets/homepage/hotel.jpeg";
import loungeImg from "@/assets/homepage/lounge.jpeg";
import meetImg from "@/assets/homepage/meet.jpeg";
import transitImg from "@/assets/homepage/transit.jpeg";
import vvipImg from "@/assets/homepage/vvip.jpeg";
import wheelImg from "@/assets/homepage/wheel.jpeg";

export const HOMEPAGE_PHOTOS = {
  // Hero Editorial Visual (1600 x 913 Landscape ~16:9)
  heroJet: {
    src: home2Img,
    width: 1600,
    height: 913,
    aspectRatio: "1600 / 913",
    alt: "Shafsky executive private aircraft in flight over metropolitan skyline during sunset",
    subject: "Executive Jet in Flight over Sunset Skyline",
    orientation: "landscape" as const,
  },

  // VVIP Terminal & Curbside Protocol (1536 x 1024 Landscape 3:2)
  vvipTerminal: {
    src: vvipImg,
    width: 1536,
    height: 1024,
    aspectRatio: "1536 / 1024",
    alt: "VVIP Terminal curbside reception with luxury Maybach sedan, red carpet, and dedicated baggage porter",
    subject: "VVIP Terminal Red Carpet & Curbside Reception",
    orientation: "landscape" as const,
  },

  // Flagship Airside Meet & Greet Escort (1535 x 1024 Landscape 3:2)
  meetGreetEscort: {
    src: meetImg,
    width: 1535,
    height: 1024,
    aspectRatio: "1535 / 1024",
    alt: "Shafsky Guest Relations Officer escorting business traveler with luggage past apron windows",
    subject: "Personal Airside Officer Escort past Runway Apron",
    orientation: "landscape" as const,
  },

  // Suswagatam Traditional Greeting (1023 x 1537 Portrait 2:3)
  suswagatamHostess: {
    src: greetImg || home1Img,
    width: 1023,
    height: 1537,
    aspectRatio: "1023 / 1537",
    alt: "Shafsky airport concierge hostess offering traditional Indian Namaste welcome in terminal concourse",
    subject: "Suswagatam Signature Traditional Indian Welcome",
    orientation: "portrait" as const,
  },

  // VVIP Executive Lounge Sanctuary (1536 x 1024 Landscape 3:2)
  vvipLounge: {
    src: loungeImg,
    width: 1536,
    height: 1024,
    aspectRatio: "1536 / 1024",
    alt: "VVIP Lounge reception sanctuary with chandelier, flight display board, and apron runway views",
    subject: "VVIP Lounge Reception & Runway Apron Views",
    orientation: "landscape" as const,
  },

  // Private Jet & Executive Helicopter Charter (1448 x 1086 Landscape 4:3)
  privateCharter: {
    src: charter1Img,
    width: 1448,
    height: 1086,
    aspectRatio: "1448 / 1086",
    alt: "Luxury private helicopter charter with executive travelers on skyline helipad",
    subject: "Executive Private Helicopter Charter & Skyline Helipad",
    orientation: "landscape" as const,
  },

  // Chauffeured Luxury Ground Fleet (1536 x 1024 Landscape 3:2)
  luxuryFleet: {
    src: home5Img,
    width: 1536,
    height: 1024,
    aspectRatio: "1536 / 1024",
    alt: "Shafsky private jet in flight over luxury sedan and passenger van fleet at dusk",
    subject: "Executive Aircraft Soaring over Chauffeured Ground Fleet",
    orientation: "landscape" as const,
  },

  // Airside Buggy & Passenger Transfer (1254 x 1254 Square 1:1)
  airsideBuggy: {
    src: buggyImg,
    width: 1254,
    height: 1254,
    aspectRatio: "1254 / 1254",
    alt: "Electric passenger buggy cart for terminal transit with uniformed driver",
    subject: "Airside Electric Buggy Passenger Transfer",
    orientation: "square" as const,
  },

  // Wheelchair & Dedicated Assistance (1600 x 900 Landscape 16:9)
  specialAssistance: {
    src: wheelImg,
    width: 1600,
    height: 900,
    aspectRatio: "1600 / 900",
    alt: "Wheelchair assistance passenger escorted through airport terminal concourse",
    subject: "Special Care & Wheelchair Assistance Escort",
    orientation: "landscape" as const,
  },

  // Duty Free & Shopping Concierge (1408 x 768 Wide Landscape 11:6)
  dutyFreeShopping: {
    src: dutyImg,
    width: 1408,
    height: 768,
    aspectRatio: "1408 / 768",
    alt: "Duty Free luxury shopping assistance with dedicated concierge assistant",
    subject: "Personal Duty Free Shopping Concierge",
    orientation: "landscape" as const,
  },

  // Transit Lounge & Layover Comfort (1536 x 1024 Landscape 3:2)
  transitComfort: {
    src: transitImg,
    width: 1536,
    height: 1024,
    aspectRatio: "1536 / 1024",
    alt: "Family and travelers resting comfortably in transit lounge with runway aircraft views",
    subject: "Transit Lounge Relaxation & Runway Takeoff Views",
    orientation: "landscape" as const,
  },

  // Luxury 5-Star Hotel & Palace Estate (1254 x 1254 Square 1:1)
  luxuryHotel: {
    src: hotelImg,
    width: 1254,
    height: 1254,
    aspectRatio: "1254 / 1254",
    alt: "Illuminated luxury palace hotel estate and gardens for VIP transit guests",
    subject: "Luxury Palace Resort & 5-Star Hotel Accommodations",
    orientation: "square" as const,
  },

  // Destination & Occasion Concierge (874 x 1600 Tall Portrait 9:16)
  destinationCelebration: {
    src: home3Img,
    width: 874,
    height: 1600,
    aspectRatio: "874 / 1600",
    alt: "Luxury wedding and milestone celebration in Agra with the Taj Mahal in the background",
    subject: "Destination Wedding & Bespoke VIP Milestone Concierge",
    orientation: "portrait" as const,
  },
};
