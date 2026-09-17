import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Wifi, Clock, Bed, ShieldCheck, MapPin } from "lucide-react";
import { HotelDetailTemplate } from "@/components/hotels/HotelDetailTemplate";
import {
  HotelInfo,
  AmenityItem,
  GalleryImage,
  RoomCategory,
} from "@/components/hotels/types";

export const Route = createFileRoute("/hotels/castle-blue")({
  head: () => ({
    meta: [
      { title: "Hotel Castle Blue New Delhi — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Book Executive and Deluxe Rooms at Hotel Castle Blue, Mahipalpur, near IGI Airport New Delhi. Partner rates from ₹ 2,500/- (+ 12% GST). CPAI & MAP meal plans with complimentary breakfast and 24/7 concierge.",
      },
    ],
  }),
  component: HotelCastleBluePage,
});

const HOTEL_INFO: HotelInfo = {
  id: "castle-blue",
  name: "Hotel Castle Blue",
  brandTitle: "Castle Blue Hotel New Delhi",
  stars: 3,
  badge: "Verified Shafsky Partner",
  bannerImage: "/images/hotels/castle-blue.jpg",
  hideBrandBar: true,
  address:
    "No.A-109, Road No-5, Near Hotel Lohias, Mahipalpur Extension, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi, Delhi 110037",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Hotel+Castle+Blue+Mahipalpur+New+Delhi",
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=Hotel+Castle+Blue+Mahipalpur+New+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed",
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
  bookingTerms: "Delux, Premium & Family Rooms From ₹ 3,000 / Night (Including 12% GST)",
};

const AMENITIES: AmenityItem[] = [
  { icon: Coffee, label: "Breakfast Options (CPAI & MAP)" },
  { icon: Wifi, label: "High-Speed Wi-Fi" },
  { icon: Clock, label: "24/7 Front Desk & Housekeeping" },
  { icon: Bed, label: "King Bed & Twin Bedding" },
  { icon: ShieldCheck, label: "Flexible – OTA RO" },
  { icon: MapPin, label: "Near IGI Airport T3/T1" },
];

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/hotels/castle-blue-banner.jpg",
    alt: "Hotel Castle Blue — Master Overview Banner",
  },
  {
    src: "/images/hotels/castle-blue-building.jpg",
    alt: "Hotel Castle Blue — Exterior Facade & Signage",
  },
  {
    src: "/images/hotels/castle-blue-dining.jpg",
    alt: "Hotel Castle Blue — Restaurant & Dining Hall",
  },
  {
    src: "/images/hotels/castle-blue-deluxe-room.jpg",
    alt: "Hotel Castle Blue — Delux Room (Double)",
  },
  {
    src: "/images/hotels/castle-blue-premium-room.jpg",
    alt: "Hotel Castle Blue — Premium Room (Double)",
  },
  {
    src: "/images/hotels/castle-blue-family-triple.jpg",
    alt: "Hotel Castle Blue — Family Room (Triple)",
  },
  {
    src: "/images/hotels/castle-blue-family-quad.jpg",
    alt: "Hotel Castle Blue — Family Room (Quad)",
  },
];

const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "delux-room-double",
    name: "Delux Room (Double)",
    badge: "Delux Room",
    image: "/images/hotels/castle-blue-deluxe-room.jpg",
    fits: "Fits 2 Adults",
    bed: "1 Double / King Bed",
    description:
      "Comfortable air-conditioned double room with modern wood paneling, warm ambient cove lighting, sofa seating, and private en-suite bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "24-hour Front Desk & Room Service",
      "Attached Private Bathroom",
      "Daily Housekeeping",
    ],
    plans: [
      {
        id: "cb-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 3,000/-",
        priceNumeric: 3000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 3,700/-",
        priceNumeric: 3700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal)",
        price: "₹ 4,700/-",
        priceNumeric: 4700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "One Time Meal Included L/D",
          "Flexible – OTA RO",
        ],
      },
    ],
  },
  {
    id: "premium-room-double",
    name: "Premium Room (Double)",
    badge: "Premium Room",
    image: "/images/hotels/castle-blue-premium-room.jpg",
    fits: "Fits 2 Adults",
    bed: "1 King Bed",
    description:
      "Spacious premium double room featuring elegant damask wall covering, large window with natural light, plush sofa seating bench, executive work desk, and modern private bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "24-hour Front Desk & Room Service",
      "Executive Work Desk",
      "Attached Private Bathroom",
    ],
    plans: [
      {
        id: "cb-prem-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 3,700/-",
        priceNumeric: 3700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-prem-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 4,300/-",
        priceNumeric: 4300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-prem-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 5,300/-",
        priceNumeric: 5300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
        ],
      },
    ],
  },
  {
    id: "family-room-triple",
    name: "Family Room (Triple)",
    badge: "Family Room",
    image: "/images/hotels/castle-blue-family-triple.jpg",
    fits: "Fits 3 Adults",
    bed: "1 King Bed + 1 Extra Bed",
    description:
      "Comfortable triple family accommodation with king size bedding plus extra bed setup, ambient cove lighting, dressing vanity desk, and private en-suite bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "24-hour Front Desk & Room Service",
      "Attached Private Bathroom",
      "Triple Occupancy Inclusions",
    ],
    plans: [
      {
        id: "cb-fam3-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 4,000/-",
        priceNumeric: 4000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-fam3-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 5,000/-",
        priceNumeric: 5000,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-fam3-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 6,800/-",
        priceNumeric: 6800,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
        ],
      },
    ],
  },
  {
    id: "family-room-quad",
    name: "Family Room (Quad)",
    badge: "Family Quad",
    image: "/images/hotels/castle-blue-family-quad.jpg",
    fits: "Fits 4 Adults",
    bed: "2 Double Beds / King Bed + Extra Beds",
    description:
      "Spacious quad family accommodation designed for 4 guests, featuring golden cove ceiling, premium wood finishes, dressing vanity desk, comfortable armchair seating, and attached bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "24-hour Front Desk & Room Service",
      "Attached Private Bathroom",
      "Quad Occupancy Comfort",
    ],
    plans: [
      {
        id: "cb-fam4-epai",
        name: "EPAI PLAN: (Only Room)",
        price: "₹ 4,300/-",
        priceNumeric: 4300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Not Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-fam4-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 5,300/-",
        priceNumeric: 5300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Breakfast Included",
          "No meals included",
          "Flexible – OTA RO",
        ],
      },
      {
        id: "cb-fam4-map",
        name: "MAP PLAN: (With Breakfast + One Time Meal) (Single)",
        price: "₹ 7,700/-",
        priceNumeric: 7700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Free Breakfast Included",
          "Flexible – OTA RO",
          "One Time Meal Included L/D",
        ],
      },
    ],
  },
];

function HotelCastleBluePage() {
  return (
    <HotelDetailTemplate
      hotel={HOTEL_INFO}
      amenities={AMENITIES}
      galleryImages={GALLERY_IMAGES}
      categories={ROOM_CATEGORIES}
    />
  );
}
