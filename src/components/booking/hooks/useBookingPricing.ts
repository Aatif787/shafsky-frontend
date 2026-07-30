import { useMemo } from "react";
import { getServicePrice } from "../pricing/pricing";

export function useBookingPricing(serviceId: string) {
  const totalPrice = useMemo(() => getServicePrice(serviceId), [serviceId]);
  return { totalPrice };
}
