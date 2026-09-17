import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Wifi, Clock, Bed, ShieldCheck, MapPin } from "lucide-react";
import { HotelDetailTemplate } from "@/components/hotels/HotelDetailTemplate";
import {
  HotelInfo,
  AmenityItem,
  GalleryImage,
  RoomCategory,
} from "@/components/hotels/types";

export const Route = createFileRoute("/hotels/classic-diplomat")({
  head: () => ({
    meta: [
      { title: "Classic Diplomat Hotel New Delhi — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Book your stay at Classic Diplomat Hotel, Mahipalpur, near IGI Airport New Delhi. Deluxe Premium & Suite Rooms from ₹ 4,100/night with free breakfast. Exclusive Shafsky Aviation rates.",
      },
    ],
  }),
  component: ClassicDiplomatPage,
});

const HOTEL_INFO: HotelInfo = {
  id: "classic-diplomat",
  name: "Classic Diplomat Hotel",
  brandTitle: "Classic Diplomat Hotel New Delhi",
  stars: 4,
  badge: "Verified Shafsky Partner",
  bannerImage: "/images/hotels/classic-diplomat.jpg",
  address:
    "Classic Diplomat Hotel, Mahipalpur, Near IGI Airport, New Delhi, Delhi 110037",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Classic+Diplomat+Hotel+Mahipalpur+New+Delhi",
  googleMapsEmbedUrl:
    "https://maps.google.com/maps?q=Classic+Diplomat+Hotel+Mahipalpur+New+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed",
  airportProximities: [
    {
      iconType: "terminal",
      title: "IGI Terminal 3 & 2",
      distance: "Approx. 4.0 km • 10 mins by taxi",
    },
    {
      iconType: "domestic",
      title: "IGI Terminal 1 (Domestic)",
      distance: "Approx. 4.8 km • 12 mins by taxi",
    },
    {
      iconType: "metro",
      title: "Aerocity Metro Station",
      distance: "Approx. 1.0 km • 4 mins via Airport Exp. line",
    },
  ],
  contactPhone: "+91 99990 17646",
  whatsAppNumber: "919999017646",
};

const AMENITIES: AmenityItem[] = [
  { icon: Coffee, label: "Free Breakfast Included" },
  { icon: Wifi, label: "High-Speed Wi-Fi" },
  { icon: Clock, label: "24/7 Front Desk & Assistance" },
  { icon: Bed, label: "Premium Bedding & Linen" },
  { icon: ShieldCheck, label: "Free Cancellation (24h)" },
  { icon: MapPin, label: "Near IGI Airport" },
];

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/hotels/classic-diplomat-building.jpg",
    alt: "Classic Diplomat Hotel — Building Exterior",
  },
  {
    src: "/images/hotels/classic-diplomat-room-hd.jpg",
    alt: "Deluxe Premium Room Interior (HD)",
  },
  {
    src: "/images/hotels/classic-diplomat-lobby.jpg",
    alt: "Reception & Lobby Lounge",
  },
  {
    src: "/images/hotels/classic-diplomat-suite-3.jpg",
    alt: "Suite Room — Master Suite & Living Lounge",
  },
  {
    src: "/images/hotels/classic-diplomat-suite-1.jpg",
    alt: "Suite Room — Premium Twin / King Bedding",
  },
  {
    src: "/images/hotels/classic-diplomat-suite-2.jpg",
    alt: "Suite Room — Living Area & Sofas",
  },
];

const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "deluxe",
    name: "Deluxe Premium Room",
    badge: "Deluxe Category",
    image: "/images/hotels/classic-diplomat-room-hd.jpg",
    fits: "Fits 2 Adults",
    bed: "1 King Bed or 2 Twin Beds",
    description:
      "300 sq.ft modern deluxe room with plush linens, ambient lighting, work desk, and en-suite marble bathroom.",
    amenities: [
      "Flexible – OTA RO",
      "Complimentary Breakfast Available",
      "24/7 Room Service & Dining",
      "High-Speed Wi-Fi",
    ],
    plans: [
      {
        id: "cp-plan-single",
        name: "Cp Plan Single Room With Free Breakfast",
        price: "₹ 4,100",
        priceNumeric: 4100,
        taxNote: "+ 5% of GST",
        inclusions: [
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "cp-plan-double",
        name: "Cp Plan Double Room With Free Breakfast",
        price: "₹ 4,700",
        priceNumeric: 4700,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Complimentary Breakfast",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "map-single",
        name: "MAP Single Room With Free | Breakfast + One Meal",
        price: "₹ 5,200",
        priceNumeric: 5200,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Free Breakfast",
          "Free One Meal",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "map-double",
        name: "MAP Double Room With Free | Breakfast + One Meal",
        price: "₹ 5,700",
        priceNumeric: 5700,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Free Breakfast",
          "Free One Meal",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "ap-single",
        name: "AP Single Room With Free | Breakfast + Lunch & Dinner",
        price: "₹ 6,200",
        priceNumeric: 6200,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Free Breakfast",
          "Free Lunch & Dinner",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "ap-double",
        name: "AP Double Room With Free | Breakfast + Lunch & Dinner",
        price: "₹ 7,200",
        priceNumeric: 7200,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Free Breakfast",
          "Free Lunch & Dinner",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
  {
    id: "suite",
    name: "Suite Room",
    badge: "Executive Suite",
    image: "/images/hotels/classic-diplomat-suite-3.jpg",
    fits: "Fits 2-3 Adults",
    bed: "King Bed + Separate Living Area",
    description:
      "450 sq.ft executive suite with dedicated living lounge, plush sofa seating, private dining table, and premium guest amenities.",
    amenities: [
      "Flexible – OTA RO",
      "Separate Living Room Lounge",
      "Complimentary Breakfast Available",
      "Full Concierge Support",
    ],
    plans: [
      {
        id: "suite-cp-single",
        name: "CP Plan Single Room With Free Cancellation",
        price: "₹ 5,500",
        priceNumeric: 5500,
        taxNote: "+ 5% GST",
        inclusions: [
          "Breakfast included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "suite-cp-double",
        name: "Cp Double Room With Free Cancellation | Breakfast only",
        price: "₹ 6,000",
        priceNumeric: 6000,
        taxNote: "+ 5% of GST",
        inclusions: [
          "Complimentary Breakfast",
          "No meals included",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "suite-map-single",
        name: "MAP Single Room With Free Breakfast + One Meal",
        price: "₹ 6,700",
        priceNumeric: 6700,
        taxNote: "+ 5% GST",
        inclusions: [
          "Free Breakfast",
          "Free One Meal",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "suite-map-double",
        name: "MAP Double Room With Free Breakfast + One Meal",
        price: "₹ 7,300",
        priceNumeric: 7300,
        taxNote: "+ 5% GST",
        inclusions: [
          "Free Breakfast",
          "Free One Meal",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "suite-ap-single",
        name: "AP Single Room With Free Breakfast + Lunch & Dinner",
        price: "₹ 7,000",
        priceNumeric: 7000,
        taxNote: "+ 5% GST",
        inclusions: [
          "Free Breakfast",
          "Free Lunch & Dinner",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
      {
        id: "suite-ap-double",
        name: "AP Double Room With Free Breakfast + Lunch & Dinner",
        price: "₹ 7,900",
        priceNumeric: 7900,
        taxNote: "+ 5% GST",
        inclusions: [
          "Free Breakfast",
          "Free Lunch & Dinner",
          "Flexible – OTA RO",
          "Free Cancellation till 24 hrs before check in",
        ],
      },
    ],
  },
];

function ClassicDiplomatPage() {
  return (
    <HotelDetailTemplate
      hotel={HOTEL_INFO}
      amenities={AMENITIES}
      galleryImages={GALLERY_IMAGES}
      categories={ROOM_CATEGORIES}
    />
  );
}
