import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPermission } from "@/lib/permissions";

// 3. Pricing Overrides & Exchange Engine
export const listExchangeRates = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await (supabase as any)
      .from("currency_rates")
      .select("*")
      .order("code", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateExchangeRates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        code: z.string().length(3),
        rateToInr: z.number().positive(),
        syncMode: z.enum(["auto", "manual"]).default("manual"),
        providerMetadata: z.record(z.string(), z.any()).default({}),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const auditFields = {
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const { data: rate, error } = await (supabase as any)
      .from("currency_rates")
      .upsert({
        code: data.code.toUpperCase(),
        rate_to_inr: data.rateToInr,
        sync_mode: data.syncMode,
        provider_metadata: data.providerMetadata,
        audit_fields: auditFields,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish("currency.synced", { code: data.code, rate: data.rateToInr }, userId);

    return rate;
  });

export const calculatePriceForBooking = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        addonIds: z.array(z.string()).default([]),
        airportCode: z.string().optional(),
        corporateName: z.string().optional(),
        isVIP: z.boolean().default(false),
        couponCode: z.string().optional(),
        targetCurrency: z.string().default("INR"),
        bookingTime: z.string().optional(),
        bookingDate: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { PricingEngine } = await import("@/services/PricingEngine");

    // Fetch baseline package pricing
    const { data: pkgPricing } = await (supabase as any)
      .from("service_pricing")
      .select("*")
      .eq("package_id", data.packageId)
      .is("addon_id", null);

    let priceOverride = pkgPricing?.[0];

    // Filter overrides if airport or corporate matches
    if (data.airportCode && pkgPricing) {
      const match = pkgPricing.find((p: any) => p.airport_code === data.airportCode);
      if (match) priceOverride = match;
    }
    if (data.corporateName && pkgPricing) {
      const match = pkgPricing.find((p: any) => p.corporate_name === data.corporateName);
      if (match) priceOverride = match;
    }

    if (!priceOverride) {
      throw new Error("Pricing profile not resolved for this package");
    }

    // Resolve exchange rates
    let exchangeRate = 1.0;
    if (data.targetCurrency !== "INR") {
      const { data: rateRow } = await (supabase as any)
        .from("currency_rates")
        .select("rate_to_inr")
        .eq("code", data.targetCurrency.toUpperCase())
        .maybeSingle();
      if (rateRow?.rate_to_inr) {
        exchangeRate = 1 / Number(rateRow.rate_to_inr);
      }
    }

    // Check temporal rules
    const isWeekend = data.bookingDate ? PricingEngine.checkWeekend(data.bookingDate) : false;
    const isNightShift = data.bookingTime ? PricingEngine.checkNightShift(data.bookingTime) : false;

    // Check coupon discount
    let couponDiscount = 0;
    if (data.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("discount_percent, is_active, expires_at")
        .eq("code", data.couponCode.toUpperCase())
        .maybeSingle();

      if (coupon?.is_active) {
        const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
        if (!isExpired) {
          couponDiscount = coupon.discount_percent;
        }
      }
    }

    // Calculate core price
    const finalCalc = PricingEngine.calculate({
      basePrice: Number(priceOverride.base_price),
      currency: "INR",
      targetCurrency: data.targetCurrency,
      exchangeRate,
      isWeekend,
      weekendMarkupAmount: Number(priceOverride.weekend_markup || 0),
      isNightShift,
      nightMarkupAmount: Number(priceOverride.night_markup || 0),
      peakMultiplier: Number(priceOverride.peak_multiplier || 1.0),
      isVIP: data.isVIP,
      couponDiscountPercent: couponDiscount,
      taxPercent: Number(priceOverride.taxes || 18),
    });

    return finalCalc;
  });

// 4. Dependencies, Conflict & Slot Booking
export const detectBookingConflicts = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        airportId: z.string().uuid(),
        slotDate: z.string(),
        startTime: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // 1. Check if the slot limits are exceeded
    const { data: slot } = await (supabase as any)
      .from("service_slots")
      .select("max_bookings, current_bookings")
      .eq("package_id", data.packageId)
      .eq("airport_id", data.airportId)
      .eq("slot_date", data.slotDate)
      .eq("start_time", data.startTime)
      .maybeSingle();

    if (slot && slot.current_bookings >= slot.max_bookings) {
      return {
        conflictDetected: true,
        message:
          "Maximum capacity reached for this time slot. Booking will be placed on the Waitlist.",
        recommendWaitlist: true,
      };
    }

    return { conflictDetected: false };
  });

export const checkServiceDependencies = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        serviceId: z.string(),
        selectedServiceIds: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: deps } = await (supabase as any)
      .from("service_dependencies")
      .select("dependent_service_id, dependency_type")
      .eq("service_id", data.serviceId);

    if (!deps || deps.length === 0) return { meetsDependencies: true };

    const missing: string[] = [];
    for (const d of deps) {
      if (
        d.dependency_type === "required" &&
        !data.selectedServiceIds.includes(d.dependent_service_id)
      ) {
        const { data: svcName } = await (supabase as any)
          .from("services")
          .select("name")
          .eq("id", d.dependent_service_id)
          .maybeSingle();
        missing.push(svcName?.name || d.dependent_service_id);
      }
    }

    if (missing.length > 0) {
      return {
        meetsDependencies: false,
        missingServices: missing,
        message: `Missing required dependency services: ${missing.join(", ")}. Please add them to your booking.`,
      };
    }

    return { meetsDependencies: true };
  });

export const releaseCmsSlotAndPromote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        airportId: z.string().uuid(),
        slotDate: z.string(),
        startTime: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    // 1. Release slot bookings by 1
    const { data: slot } = await (supabase as any)
      .from("service_slots")
      .select("id, current_bookings")
      .eq("package_id", data.packageId)
      .eq("airport_id", data.airportId)
      .eq("slot_date", data.slotDate)
      .eq("start_time", data.startTime)
      .maybeSingle();

    if (slot && slot.current_bookings > 0) {
      await (supabase as any)
        .from("service_slots")
        .update({ current_bookings: slot.current_bookings - 1 })
        .eq("id", slot.id);
    }

    // 2. Query waitlist for next priority customer
    const { data: waitlist } = await (supabase as any)
      .from("service_waitlist")
      .select("*")
      .eq("package_id", data.packageId)
      .eq("slot_date", data.slotDate)
      .eq("slot_time", data.startTime)
      .eq("status", "waiting")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waitlist) {
      // Promote waitlisted customer
      await (supabase as any)
        .from("service_waitlist")
        .update({ status: "promoted", updated_at: new Date().toISOString() })
        .eq("id", waitlist.id);

      // Re-increment slot bookings
      if (slot) {
        await (supabase as any)
          .from("service_slots")
          .update({ current_bookings: slot.current_bookings })
          .eq("id", slot.id);
      }

      // Publish event
      const { EventBus } = await import("@/services/EventBus");
      await EventBus.publish(
        "waitlist.promoted",
        {
          waitlistId: waitlist.id,
          userId: waitlist.user_id,
          packageId: data.packageId,
          slotDate: data.slotDate,
          startTime: data.startTime,
        },
        userId,
      );

      return { promoted: true, user_id: waitlist.user_id };
    }

    return { promoted: false };
  });

export const getCancellationRefundAmount = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        packageId: z.string(),
        bookingDepartDate: z.string(),
        pricePaid: z.number(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Calculate hours before departure
    let hoursDiff = 0;
    try {
      const depDate = new Date(data.bookingDepartDate);
      const now = new Date();
      hoursDiff = (depDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    } catch {
      return { refundPercentage: 0, refundAmount: 0 };
    }

    const { data: policies } = await (supabase as any)
      .from("cancellation_policies")
      .select("hours_before_departure, refund_percentage")
      .eq("package_id", data.packageId)
      .order("hours_before_departure", { ascending: true });

    let refundPct = 100;
    if (policies && policies.length > 0) {
      const policyMatch = policies.find((p: any) => hoursDiff >= p.hours_before_departure);
      if (policyMatch) {
        refundPct = Number(policyMatch.refund_percentage);
      } else {
        refundPct = 0;
      }
    }

    const refundAmount = data.pricePaid * (refundPct / 100);
    return {
      refundPercentage: refundPct,
      refundAmount: Number(refundAmount.toFixed(2)),
    };
  });

// 5. AI Recommendations Vector Engine
export const getServiceRecommendations = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        airportCode: z.string().optional(),
        airline: z.string().optional(),
        corporateName: z.string().optional(),
        isVIP: z.boolean().default(false),
        customerId: z.string().uuid().optional(),
        currentBookingServiceCodes: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Fetch active published services
    const { data: allServices } = await (supabase as any)
      .from("services")
      .select("*")
      .eq("status", "published")
      .limit(10);

    if (!allServices || allServices.length === 0) return [];

    const scored = allServices.map((svc: any) => {
      let score = svc.priority || 0;

      // Airport vector match
      if (data.airportCode && svc.available_airports) {
        const ar = svc.available_airports as string[];
        if (ar.includes(data.airportCode)) score += 30;
      }

      // VIP vector match
      if (data.isVIP && svc.name.toLowerCase().includes("vip")) score += 25;

      // Corporate vector match
      if (data.corporateName && svc.name.toLowerCase().includes("corporate")) score += 20;

      // Frequently bought together
      if (data.currentBookingServiceCodes.length > 0) {
        const matches = {
          "meet-greet": ["lounge", "transfers"],
          lounge: ["meet-greet", "fast-track"],
          transfers: ["lounge"],
        };
        for (const code of data.currentBookingServiceCodes) {
          const lowerCode = code.toLowerCase();
          for (const [key, value] of Object.entries(matches)) {
            if (
              lowerCode.includes(key) &&
              value.some((v: string) => svc.id.toLowerCase().includes(v))
            ) {
              score += 35;
            }
          }
        }
      }

      return {
        ...svc,
        recommendationScore: score,
      };
    });

    return (scored as any[])
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  });

// 6. Cms Reviews Moderator
export const listCmsReviews = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .validator((d: unknown) => z.object({ serviceId: z.string() }).parse(d))
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await (supabase as any)
      .from("service_reviews")
      .select(
        `
        *,
        profile:profiles(full_name, avatar_url)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createCmsReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        serviceId: z.string(),
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().min(3),
        mediaUrls: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: reviews, error } = await (supabase as any)
      .from("service_reviews")
      .insert({
        service_id: data.serviceId,
        user_id: userId,
        rating: data.rating,
        review_text: data.reviewText,
        media_urls: data.mediaUrls,
        is_verified: true,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "review.submitted",
      { serviceId: data.serviceId, rating: data.rating },
      userId,
    );

    return reviews;
  });

export const moderateCmsReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        reviewId: z.string().uuid(),
        status: z.enum(["approved", "rejected"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPermission(supabase, userId, "services:write");

    const { data: review, error } = await (supabase as any)
      .from("service_reviews")
      .update({ status: data.status })
      .eq("id", data.reviewId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { EventBus } = await import("@/services/EventBus");
    await EventBus.publish(
      "review.moderated",
      { reviewId: data.reviewId, status: data.status },
      userId,
    );

    return review;
  });
