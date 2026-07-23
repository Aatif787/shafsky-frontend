export interface PriceCalculationResult {
  basePrice: number;
  seasonMarkup: number;
  weekendMarkup: number;
  nightMarkup: number;
  peakMarkup: number;
  corporateDiscount: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface PricingParameters {
  basePrice: number;
  currency?: string;
  targetCurrency?: string;
  exchangeRate?: number;
  corporateContractPrice?: number | null;
  isVIP?: boolean;
  vipDiscountPercent?: number;
  isPeakSeason?: boolean;
  peakMultiplier?: number;
  isWeekend?: boolean;
  weekendMarkupAmount?: number;
  isNightShift?: boolean;
  nightMarkupAmount?: number;
  taxPercent?: number;
  couponDiscountPercent?: number;
}

export class PricingEngine {
  /**
   * Main calculation algorithm for all aviation & concierge services
   */
  public static calculate(params: PricingParameters): PriceCalculationResult {
    const currency = params.targetCurrency || params.currency || "INR";
    const exchangeRate = params.exchangeRate || 1.0;

    // 1. Resolve base price (prefer corporate contract if available)
    let rawBase = params.basePrice;
    let corporateDiscount = 0;

    if (params.corporateContractPrice !== undefined && params.corporateContractPrice !== null) {
      corporateDiscount = Math.max(0, rawBase - params.corporateContractPrice);
      rawBase = params.corporateContractPrice;
    }

    // Convert base price to target currency
    const baseInTarget = rawBase * exchangeRate;
    const corpDiscountInTarget = corporateDiscount * exchangeRate;

    // 2. Add seasonal markups
    let seasonMarkup = 0;
    if (params.isPeakSeason) {
      const multiplier = params.peakMultiplier || 1.15; // default 15% markup
      seasonMarkup = baseInTarget * (multiplier - 1);
    }

    // 3. Add weekend markup
    let weekendMarkup = 0;
    if (params.isWeekend) {
      weekendMarkup = (params.weekendMarkupAmount || 0) * exchangeRate;
    }

    // 4. Add night shift markup (operational night hours)
    let nightMarkup = 0;
    if (params.isNightShift) {
      nightMarkup = (params.nightMarkupAmount || 0) * exchangeRate;
    }

    // 5. VIP tier adjustments
    let vipDiscount = 0;
    if (params.isVIP) {
      const vipPct = params.vipDiscountPercent || 10; // default 10% off for VIP
      vipDiscount = (baseInTarget + seasonMarkup + weekendMarkup + nightMarkup) * (vipPct / 100);
    }

    // 6. Coupon code discount
    let couponDiscount = 0;
    if (params.couponDiscountPercent && params.couponDiscountPercent > 0) {
      const pct = Math.min(100, params.couponDiscountPercent);
      couponDiscount =
        (baseInTarget + seasonMarkup + weekendMarkup + nightMarkup - vipDiscount) * (pct / 100);
    }

    const totalDiscounts = corpDiscountInTarget + vipDiscount + couponDiscount;
    const subtotal = Math.max(
      0,
      baseInTarget + seasonMarkup + weekendMarkup + nightMarkup - vipDiscount - couponDiscount,
    );

    // 7. Dynamic Tax calculation
    const taxPct = params.taxPercent !== undefined ? params.taxPercent : 18; // default 18% GST/VAT
    const taxes = subtotal * (taxPct / 100);
    const total = subtotal + taxes;

    return {
      basePrice: Number(baseInTarget.toFixed(2)),
      seasonMarkup: Number(seasonMarkup.toFixed(2)),
      weekendMarkup: Number(weekendMarkup.toFixed(2)),
      nightMarkup: Number(nightMarkup.toFixed(2)),
      peakMarkup: Number((seasonMarkup + weekendMarkup + nightMarkup).toFixed(2)),
      corporateDiscount: Number(totalDiscounts.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      total: Number(total.toFixed(2)),
      currency,
    };
  }

  /**
   * Helper to check if a booking date falls on a weekend
   */
  public static checkWeekend(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    } catch {
      return false;
    }
  }

  /**
   * Helper to check if time falls into night shift hours (22:00 to 06:00)
   */
  public static checkNightShift(timeString: string): boolean {
    try {
      // Expects HH:MM or ISO datetime
      let hours = 0;
      if (timeString.includes("T") || timeString.includes("-")) {
        hours = new Date(timeString).getHours();
      } else {
        const parts = timeString.split(":");
        hours = parseInt(parts[0], 10);
      }
      return hours >= 22 || hours < 6;
    } catch {
      return false;
    }
  }
}
