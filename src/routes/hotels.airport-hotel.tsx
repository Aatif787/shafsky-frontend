import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Wifi, Clock, Bed, ShieldCheck, MapPin } from "lucide-react";
import { HotelDetailTemplate } from "@/components/hotels/HotelDetailTemplate";
import {
  HotelInfo,
  AmenityItem,
  GalleryImage,
  RoomCategory,
} from "@/components/hotels/types";

export const Route = createFileRoute("/hotels/airport-hotel")({
  head: () => ({
    meta: [
      { title: "Airport Hotel New Delhi — Opposite Terminal 1 — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Book Standard, Delux, Luxury and Suite Rooms at Airport Hotel, directly opposite IGI Airport Terminal 1 (Domestic), Mehram Nagar, New Delhi. Official rates from ₹ 3,700/- (+ 12% GST) with breakfast.",
      },
    ],
  }),
  component: HotelAirportHotelPage,
});

const HOTEL_INFO: HotelInfo = {
  id: "airport-hotel",
  name: "Airport Hotel",
  brandTitle: "Airport Hotel, Near IGI Airport-New Delhi",
  stars: 3,
  badge: "Opposite Terminal 1 Domestic",
  bannerImage: "/images/hotels/airport-hotel.jpg",
  hideBrandBar: true,
  address:
    "Indira Gandhi International Airport, Terminal 1, Opp, Domestic, Mehram Nagar, New Delhi, Delhi 110037",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Airport+Hotel+Opposite+Terminal+1+Mehram+Nagar+Delhi",
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=Airport+Hotel+Terminal+1+Mehram+Nagar+New+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed",
  airportProximities: [
    {
      iconType: "domestic",
      title: "IGI Terminal 1 (Domestic)",
      distance: "Directly opposite • 2 mins walking distance",
    },
    {
      iconType: "terminal",
      title: "IGI Terminal 3 & 2",
      distance: "Approx. 6.5 km • 10-12 mins by shuttle/taxi",
    },
    {
      iconType: "metro",
      title: "Terminal 1-IGI Airport Metro",
      distance: "Approx. 350 meters • 3-4 mins walking (Magenta Line)",
    },
  ],
  contactPhone: "+91 99990 17646",
  whatsAppNumber: "919999017646",
  bookingTerms: "Standard, Delux, Luxury & Suite Rooms From ₹ 3,700 / Night (Including 12% GST)",
};

const AMENITIES: AmenityItem[] = [
  { icon: Coffee, label: "Breakfast Options (CPAI)" },
  { icon: Wifi, label: "High-Speed Wi-Fi" },
  { icon: Clock, label: "24/7 Front Desk & Check-in" },
  { icon: Bed, label: "Double, Luxury & Suite Bedding" },
  { icon: ShieldCheck, label: "Flexible – OTA RO" },
  { icon: MapPin, label: "Directly Opp. IGI Terminal 1" },
];

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/hotels/airport-hotel.jpg",
    alt: "Airport Hotel — Overview Hero Banner & Rooms",
  },
  {
    src: "/images/hotels/airport-hotel-building.jpg",
    alt: "Airport Hotel — Building Facade, Restaurant & Private Entrance",
  },
  {
    src: "/images/hotels/airport-hotel-standard-room.jpg",
    alt: "Airport Hotel — Standard Room (Double Beds)",
  },
  {
    src: "/images/hotels/airport-hotel-delux-room.jpg",
    alt: "Airport Hotel — Delux Room (Double)",
  },
  {
    src: "/images/hotels/airport-hotel-luxury-room.jpg",
    alt: "Airport Hotel — Luxury Room (Double Occupancy)",
  },
  {
    src: "/images/hotels/airport-hotel-suite-room.jpg",
    alt: "Airport Hotel — Suite Room (Double Occupancy)",
  },
];

const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "standard-room-double-beds",
    name: "Standard Room (Double Beds)",
    badge: "Standard Room",
    image: "/images/hotels/airport-hotel-standard-room.jpg",
    fits: "Fits 2 Adults",
    bed: "2 Single Beds / Double",
    description:
      "Comfortable twin room equipped with two separate beds, decorative wall art, wall-mounted mirror, air conditioning, and attached private bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "Attached Private Bathroom",
      "Room Service",
      "Housekeeping",
    ],
    plans: [
      {
        id: "ah-std-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 3,700/-",
        priceNumeric: 3700,
        taxNote: "Including 12% GST",
        inclusions: [
          "Complimentary Breakfast Included",
          "Free High-Speed Wi-Fi & AC",
          "Attached Bathroom & Toiletries",
          "Flexible – OTA RO",
        ],
      },
    ],
  },
  {
    id: "delux-room-double",
    name: "Delux Room (Double)",
    badge: "Delux Room",
    image: "/images/hotels/airport-hotel-delux-room.jpg",
    fits: "Fits 2 Adults",
    bed: "1 Double Bed",
    description:
      "Well-furnished deluxe bedroom with decorative panel headboard, comfortable double bed, window with curtains, air conditioning, and en-suite facilities.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "Attached Private Bathroom",
      "Television",
      "Daily Housekeeping",
    ],
    plans: [
      {
        id: "ah-dlx-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 4,500/-",
        priceNumeric: 4500,
        taxNote: "Including 12% GST",
        inclusions: [
          "Complimentary Breakfast Included",
          "Furnished Double Bed & TV",
          "Free High-Speed Wi-Fi & AC",
          "Flexible – OTA RO",
        ],
      },
    ],
  },
  {
    id: "luxury-room-double-occupancy",
    name: "Luxury Room (Double Occupancy)",
    badge: "Luxury Room",
    image: "/images/hotels/airport-hotel-luxury-room.jpg",
    fits: "Fits 2 Adults",
    bed: "1 King / Double Bed",
    description:
      "Spacious luxury bedroom with ornamental wallpaper headboard feature, sofa seating, side table, warm lighting, and private bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "Attached Private Bathroom",
      "Sofa Seating Area",
      "24-Hour Room Service",
    ],
    plans: [
      {
        id: "ah-lux-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 5,300/-",
        priceNumeric: 5300,
        taxNote: "Including 12% GST",
        inclusions: [
          "Complimentary Breakfast Included",
          "Sofa Seating & Premium Decor",
          "High-Speed Wi-Fi & 24/7 Room Service",
          "Flexible – OTA RO",
        ],
      },
    ],
  },
  {
    id: "suite-room-double-occupancy",
    name: "Suite Room (Double Occupancy)",
    badge: "Suite Room",
    image: "/images/hotels/airport-hotel-suite-room.jpg",
    fits: "Fits 2 Adults",
    bed: "1 King / Double Bed",
    description:
      "Premium executive suite featuring high-end panel headboard, living area with plush armchair, coffee table, ambient lighting, and luxury bathroom.",
    amenities: [
      "Air Conditioning",
      "Free High-Speed Wi-Fi",
      "Attached Private Bathroom with Hot Water",
      "Plush Armchair & Coffee Table",
      "24-Hour Concierge & Luggage Assistance",
    ],
    plans: [
      {
        id: "ah-ste-cpai",
        name: "CPAI PLAN: (With Breakfast)",
        price: "₹ 6,400/-",
        priceNumeric: 6400,
        taxNote: "Including 12% GST",
        inclusions: [
          "Complimentary Breakfast Included",
          "Executive Living Area & Armchair",
          "Premium Luxury Bath Amenities",
          "Flexible – OTA RO",
        ],
      },
    ],
  },
];

function HotelAirportHotelPage() {
  return (
    <HotelDetailTemplate
      hotel={HOTEL_INFO}
      amenities={AMENITIES}
      galleryImages={GALLERY_IMAGES}
      categories={ROOM_CATEGORIES}
    />
  );
}
export default HotelAirportHotelPage;
