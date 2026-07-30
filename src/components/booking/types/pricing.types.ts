import { BookingService } from "./service.types";

export interface ServicePricingRule {
  serviceId: BookingService | string;
  basePrice: number;
  currency: string;
}
