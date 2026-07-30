/**
 * Pure Hotel Intelligence & Stay Calculation Utilities
 * Single Source of Truth for hotel duration, room recommendations, group detection, and VIP flags.
 */

export function calculateStayNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

export function recommendRoomCategory(
  paxAdults: number,
  paxChildren: number,
  paxInfants: number,
  roomType: string
): string {
  if (roomType === "palace") return "Presidential / Palace Suite";
  if (paxAdults === 2 && paxChildren === 0 && paxInfants === 0) return "Deluxe King Suite";
  if (paxAdults === 2 && paxInfants >= 1) return "Deluxe King Suite + Baby Cot";
  if (paxChildren >= 1 || paxAdults > 2) return "Executive Family Suite";
  if (roomType === "heritage_villa") return "Bespoke Heritage Villa";
  if (roomType === "boutique") return "Executive Boutique Suite";
  return "Deluxe Suite";
}

export function detectGroupBooking(roomCount: number): boolean {
  return roomCount >= 5;
}

export function detectVipStay(
  roomType: string,
  nights: number,
  roomCount: number,
  isCorporate?: boolean
): boolean {
  return roomType === "palace" || nights >= 30 || roomCount >= 5 || Boolean(isCorporate);
}

export function calculateHotelEstimate(
  roomType: string,
  roomCount: number,
  nights: number,
  personalization: { airportTransfer?: boolean; spaInterest?: boolean; earlyCheckin?: boolean }
): number {
  let baseNightRate = 35000;
  if (roomType === "palace") baseNightRate = 120000;
  else if (roomType === "heritage_villa") baseNightRate = 75000;
  else if (roomType === "boutique") baseNightRate = 45000;
  else if (roomType === "corporate") baseNightRate = 28000;

  let extraPrice = 0;
  if (personalization.airportTransfer) extraPrice += 6500;
  if (personalization.spaInterest) extraPrice += 8500;
  if (personalization.earlyCheckin) extraPrice += 8500;

  return (baseNightRate * roomCount * nights) + extraPrice;
}
