/* ─────────────────────────────────────────────────────────────────────────────
   MEGA CAB TARIFF & COST CALCULATION SPECIFICATION (PAGE 9)
   Maintained separately as tariff calculation rather than synthetic vehicle model.
   ───────────────────────────────────────────────────────────────────────────── */

export interface MegaCabTariffStructure {
  provider: "Mega Cab";
  baseRatePerKm: number;
  baseFareGstPercent: number;
  airportParkingCharges: number;
  airportParkingGstPercent: number;
  fixedRoutes: Array<{
    route: string;
    fare: number;
    currency: string;
    conditions?: string;
  }>;
}

export const MEGA_CAB_TARIFF: MegaCabTariffStructure = {
  provider: "Mega Cab",
  baseRatePerKm: 32,
  baseFareGstPercent: 5,
  airportParkingCharges: 205,
  airportParkingGstPercent: 18,
  fixedRoutes: [
    {
      route: "Delhi Airport Terminal 1, Terminal 2, Terminal 3 to Indian Habitat Centre",
      fare: 900,
      currency: "INR",
      conditions: "Excluding applicable GST and Airport Fees",
    },
    {
      route: "Indian Habitat Centre to Delhi Airport Terminal 1, Terminal 2, Terminal 3",
      fare: 500,
      currency: "INR",
    },
  ],
};
