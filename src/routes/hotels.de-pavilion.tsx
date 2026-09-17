import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Wifi, Clock, Bed, ShieldCheck, MapPin } from "lucide-react";
import { HotelDetailTemplate } from "@/components/hotels/HotelDetailTemplate";
import {
  HotelInfo,
  AmenityItem,
  GalleryImage,
  RoomCategory,
} from "@/components/hotels/types";

export const Route = createFileRoute("/hotels/de-pavilion")({
  head: () => ({
    meta: [
      { title: "Hotel De Pavilion New Delhi — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Book Delux, Premium & Family (Triple/Quad) Rooms at Hotel De Pavilion, Mahipalpur, near IGI Airport New Delhi. Official partner rates from ₹ 3,000/- (Including 12% GST). EPAI, CPAI and MAP meal plans.",
      },
    ],
  }),
  component: HotelDePavilionPage,
});

const HOTEL_INFO: HotelInfo = {
  id: "de-pavilion",
  name: "Hotel De Pavilion",
  brandTitle: "Hotel De Pavilion New Delhi",
  stars: 4,
  badge: "Verified Shafsky Partner",
  bannerImage: "/images/hotels/de-pavilion.jpg",
  address:
    "Hotel De Pavilion, A-Block, Road No. 4, Mahipalpur Extension, Near IGI Airport, New Delhi, Delhi 110037",
  googleMapsUrl: "https://maps.app.goo.gl/i8fZY1mkFGH58yYj7",
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=28.5498118,77.1299222&t=&z=15&ie=UTF8&iwloc=&output=embed",
  airportProximities: [
    {
      iconType: "terminal",
      title: "IGI Terminal 3 & 2",
      distance: "Approx. 4.5 km • 10-12 mins by taxi",
    },
    {
      iconType: "domestic",
      title: "IGI Terminal 1 (Domestic)",
      distance: "Approx. 5.0 km • 12-15 mins by taxi",
    },
    {
      iconType: "metro",
      title: "Aerocity Metro Station",
      distance: "Approx. 1.2 km • 5 mins via Airport Exp. line",
    },
  ],
  contactPhone: "+91 99990 17646",
  whatsAppNumber: "919999017646",
};

const AMENITIES: AmenityItem[] = [
  { icon: Coffee, label: "Breakfast Options (CPAI & MAP)" },
  { icon: Wifi, label: "High-Speed Wi-Fi" },
  { icon: Clock, label: "24/7 Front Desk & Housekeeping" },
  { icon: Bed, label: "Double, King & Family Bedding" },
  { icon: ShieldCheck, label: "Flexible – OTA RO" },
  { icon: MapPin, label: "Near IGI Airport T3/T1" },
];

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/hotels/de-pavilion-lobby.jpg",
    alt: "Hotel De Pavilion — Lobby Lounge & Seating Area",
  },
  {
    src: "/images/hotels/de-pavilion-reception.jpg",
    alt: "Hotel De Pavilion — Reception & Front Desk",
  },
  {
    src: "/images/hotels/de-pavilion-delux-room.jpg",
    alt: "Hotel De Pavilion — Delux Room (Double)",
  },
  {
    src: "/images/hotels/de-pavilion-premium-room.jpg",
    alt: "Hotel De Pavilion — Premium Room (Double)",
  },
  {
    src: "/images/hotels/de-pavilion-family-room.jpg",
    alt: "Hotel De Pavilion — Family Room (Triple / Quad)",
  },
  {
    src: "/images/hotels/de-pavilion-banner.jpg",
    alt: "Hotel De Pavilion — Master Overview Banner",
  },
];

const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "delux-double",
    name: "Delux Room (Double)",
    badge: "Delux Category",
    image: "/images/hotels/de-pavilion-delux-room.jpg",
    fits: "Fits 2 Adults",
    bed: "Double Bed",
    description:
      "Comfortable Delux Room featuring elegant headboard paneling, modern cove lighting, en-suite bathroom, vanity mirror desk, and air conditioning.",
    amenities: [
      "Flexible – OTA RO",
      "24/7 Front Desk & Housekeeping",
      "High-Speed Wi-Fi",
      "Air Conditioning",
    ],
    plans: [
      {
        id: "dp-delux-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 3,000/-",
        priceNumeric: 3000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-delux-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 3,700/-",
        priceNumeric: 3700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-delux-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal)",
        price: "₹ 4,700/-",
        priceNumeric: 4700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "One Time Meal Included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
  {
    id: "premium-double",
    name: "Premium Room (Double)",
    badge: "Premium Category",
    image: "/images/hotels/de-pavilion-premium-room.jpg",
    fits: "Fits 2 Adults",
    bed: "King Bed",
    description:
      "Spacious Premium Double Room with rich wooden wall accents, plush king-size bedding, flat-screen television, work desk, and ambient bedside lighting.",
    amenities: [
      "Flexible – OTA RO",
      "Premium King Bedding",
      "24/7 Room Service & Dining",
      "High-Speed Wi-Fi",
    ],
    plans: [
      {
        id: "dp-premium-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 3,700/-",
        priceNumeric: 3700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-premium-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 4,300/-",
        priceNumeric: 4300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-premium-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 5,300/-",
        priceNumeric: 5300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
  {
    id: "family-triple",
    name: "Family Room (Triple)",
    badge: "Family Suite",
    image: "/images/hotels/de-pavilion-family-room.jpg",
    fits: "Fits 3 Adults",
    bed: "King Bed + Extra Bed",
    description:
      "Spacious family suite with rich wood paneling, framed wall art, vanity dressing desk, comfortable leather seating, and decorative cove lighting.",
    amenities: [
      "Flexible – OTA RO",
      "Accommodates 3 Adults",
      "Dedicated Vanity Desk",
      "24/7 Housekeeping",
    ],
    plans: [
      {
        id: "dp-family-triple-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 4,000/-",
        priceNumeric: 4000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-family-triple-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 5,000/-",
        priceNumeric: 5000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-family-triple-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 6,800/-",
        priceNumeric: 6800,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
  {
    id: "family-quad",
    name: "Family Room (Quad)",
    badge: "Large Family Suite",
    image: "/images/hotels/de-pavilion-family-quad.jpg",
    fits: "Fits 4 Adults",
    bed: "2 King / Queen Beds",
    description:
      "Executive family suite designed for larger groups or families, with dual comfortable sleeping setups, spacious seating, and full luxury amenities.",
    amenities: [
      "Flexible – OTA RO",
      "Accommodates 4 Adults",
      "Spacious Living / Sleeping Zone",
      "Full Concierge Support",
    ],
    plans: [
      {
        id: "dp-family-quad-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 4,300/-",
        priceNumeric: 4300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-family-quad-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 5,300/-",
        priceNumeric: 5300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "dp-family-quad-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 7,700/-",
        priceNumeric: 7700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
];

function HotelDePavilionPage() {
  return (
    <HotelDetailTemplate
      hotel={HOTEL_INFO}
      amenities={AMENITIES}
      galleryImages={GALLERY_IMAGES}
      categories={ROOM_CATEGORIES}
    />
  );
}
