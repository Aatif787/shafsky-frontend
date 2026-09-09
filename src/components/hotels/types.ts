import { LucideIcon } from "lucide-react";

export interface AmenityItem {
  icon: LucideIcon;
  label: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface RoomPlan {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  taxNote: string;
  inclusions: string[];
}

export interface RoomCategory {
  id: string;
  name: string;
  badge: string;
  image: string;
  fits: string;
  bed: string;
  description: string;
  amenities: string[];
  plans: RoomPlan[];
}

export interface AirportProximity {
  iconType: "terminal" | "domestic" | "metro";
  title: string;
  distance: string;
}

export interface HotelInfo {
  id: string;
  name: string;
  brandTitle?: string;
  stars: number;
  badge?: string;
  bannerImage: string;
  address: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  airportProximities: AirportProximity[];
  contactPhone?: string;
  whatsAppNumber?: string;
  bookingTerms?: string;
  hideBrandBar?: boolean;
}
