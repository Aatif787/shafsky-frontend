import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isStaffUser } from "@/lib/permissions";

// ============ VALIDATION UTILITIES ============

/**
 * Calculates age in years from a Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobStr?: string | null): number | null {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Validates passport expiry date.
 * Returns status: 'valid' | 'expiring_soon' (within 6 months) | 'expired'
 */
export function validatePassportExpiry(expiryStr?: string | null): {
  status: "valid" | "expiring_soon" | "expired";
  message: string;
} {
  if (!expiryStr) {
    return { status: "valid", message: "No expiry specified" };
  }
  const exp = new Date(expiryStr);
  if (isNaN(exp.getTime())) {
    return { status: "expired", message: "Invalid expiry date format" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (exp < today) {
    return { status: "expired", message: "Passport has expired" };
  }

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  if (exp < sixMonthsFromNow) {
    return {
      status: "expiring_soon",
      message: "Passport expires in less than 6 months",
    };
  }

  return { status: "valid", message: "Passport valid" };
}

/**
 * Validates visa expiry date.
 */
export function validateVisaExpiry(expiryStr?: string | null): {
  status: "valid" | "expired";
  message: string;
} {
  if (!expiryStr) {
    return { status: "valid", message: "No visa expiry specified" };
  }
  const exp = new Date(expiryStr);
  if (isNaN(exp.getTime())) {
    return { status: "expired", message: "Invalid visa expiry date format" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (exp < today) {
    return { status: "expired", message: "Visa has expired" };
  }
  return { status: "valid", message: "Visa valid" };
}

// ============ ZOD SCHEMAS ============

export const PassengerInputSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  gender: z.enum(["male", "female", "other", "unspecified"]).default("unspecified"),
  date_of_birth: z.string().optional().nullable(),
  nationality: z.string().trim().max(80).optional().nullable(),
  passport_number: z.string().trim().max(50).optional().nullable(),
  passport_expiry: z.string().optional().nullable(),
  visa_number: z.string().trim().max(50).optional().nullable(),
  visa_expiry: z.string().optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(120).optional().nullable().or(z.literal("")),
  special_assistance: z.string().trim().max(500).optional().nullable(),
  meal_preference: z.string().trim().max(200).optional().nullable(),
});

// ============ SERVER FUNCTIONS ============

/**
 * Lists saved passenger profiles belonging to the authenticated customer
 */
export const listUserPassengers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await (supabase as any)
      .from("passengers")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (rows || []).map((p: any) => ({
      ...p,
      age: calculateAge(p.date_of_birth),
      passport_status: validatePassportExpiry(p.passport_expiry),
      visa_status: validateVisaExpiry(p.visa_expiry),
    }));
  });

/**
 * Creates or updates a passenger profile with server-side validations
 */
export const savePassenger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => PassengerInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Validate Duplicate Passport Number for this user if provided
    if (data.passport_number && data.passport_number.trim() !== "") {
      const pNumClean = data.passport_number.trim().toUpperCase();
      let query = (supabase as any)
        .from("passengers")
        .select("id")
        .eq("profile_id", userId)
        .ilike("passport_number", pNumClean);

      if (data.id) {
        query = query.neq("id", data.id);
      }

      const { data: dupes } = await query;
      if (dupes && dupes.length > 0) {
        throw new Error(`A passenger profile with passport number "${pNumClean}" already exists.`);
      }
    }

    // 2. Validate Passport Expiry
    if (data.passport_expiry) {
      const pCheck = validatePassportExpiry(data.passport_expiry);
      if (pCheck.status === "expired") {
        throw new Error("Cannot save profile with an expired passport.");
      }
    }

    // 3. Save to database
    const payload = {
      profile_id: userId,
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender,
      date_of_birth: data.date_of_birth || null,
      nationality: data.nationality || null,
      passport_number: data.passport_number ? data.passport_number.trim().toUpperCase() : null,
      passport_expiry: data.passport_expiry || null,
      visa_number: data.visa_number ? data.visa_number.trim().toUpperCase() : null,
      visa_expiry: data.visa_expiry || null,
      phone: data.phone || null,
      email: data.email || null,
      special_assistance: data.special_assistance || null,
      meal_preference: data.meal_preference || null,
    };

    if (data.id) {
      // Ensure ownership
      const { data: existing } = await (supabase as any)
        .from("passengers")
        .select("profile_id")
        .eq("id", data.id)
        .maybeSingle();

      if (existing && existing.profile_id !== userId) {
        const isStaff = await isStaffUser(supabase, userId);
        if (!isStaff) throw new Error("Forbidden");
      }

      const { data: updated, error } = await (supabase as any)
        .from("passengers")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: created, error } = await (supabase as any)
        .from("passengers")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return created;
    }
  });

/**
 * Deletes a passenger profile owned by the user
 */
export const deletePassenger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await (supabase as any)
      .from("passengers")
      .select("profile_id")
      .eq("id", data.id)
      .maybeSingle();

    if (existing && existing.profile_id !== userId) {
      const isStaff = await isStaffUser(supabase, userId);
      if (!isStaff) throw new Error("Forbidden");
    }

    const { error } = await (supabase as any).from("passengers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

/**
 * Lists the passenger manifest for a specific booking
 */
export const listBookingPassengers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ bookingId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check permissions
    const { data: b } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (b && b.user_id !== userId) {
      const isStaff = await isStaffUser(supabase, userId);
      if (!isStaff) throw new Error("Forbidden");
    }

    // Query manifest joined with passenger table
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("booking_passengers")
      .select(
        `
        id,
        booking_id,
        passenger_id,
        seat_preference,
        is_primary_contact,
        remarks,
        created_at,
        passengers (
          id,
          first_name,
          last_name,
          gender,
          date_of_birth,
          nationality,
          passport_number,
          passport_expiry,
          visa_number,
          visa_expiry,
          phone,
          email,
          special_assistance,
          meal_preference
        )
      `,
      )
      .eq("booking_id", data.bookingId);

    if (error || !rows) return [];

    return rows.map((r: any) => {
      const p = r.passengers || {};
      return {
        manifest_id: r.id,
        booking_id: r.booking_id,
        passenger_id: r.passenger_id,
        seat_preference: r.seat_preference,
        is_primary_contact: r.is_primary_contact,
        remarks: r.remarks,
        first_name: p.first_name || "N/A",
        last_name: p.last_name || "",
        full_name: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        gender: p.gender || "unspecified",
        date_of_birth: p.date_of_birth,
        age: calculateAge(p.date_of_birth),
        nationality: p.nationality || "N/A",
        passport_number: p.passport_number || "N/A",
        passport_expiry: p.passport_expiry,
        passport_status: validatePassportExpiry(p.passport_expiry),
        visa_number: p.visa_number || "N/A",
        visa_expiry: p.visa_expiry,
        visa_status: validateVisaExpiry(p.visa_expiry),
        phone: p.phone,
        email: p.email,
        special_assistance: p.special_assistance,
        meal_preference: p.meal_preference,
      };
    });
  });

/**
 * Assigns or updates passengers on a booking manifest
 */
export const assignPassengersToBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        bookingId: z.string().uuid(),
        passengerIds: z.array(z.string().uuid()),
        seatPreferences: z.record(z.string()).optional(),
        primaryPassengerId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check authorization
    const { data: b } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (b && b.user_id !== userId) {
      const isStaff = await isStaffUser(supabase, userId);
      if (!isStaff) throw new Error("Forbidden");
    }

    // Clear previous manifest for this booking
    await (supabaseAdmin as any)
      .from("booking_passengers")
      .delete()
      .eq("booking_id", data.bookingId);

    if (data.passengerIds.length > 0) {
      const inserts = data.passengerIds.map((pId) => ({
        booking_id: data.bookingId,
        passenger_id: pId,
        seat_preference: data.seatPreferences?.[pId] || null,
        is_primary_contact: pId === data.primaryPassengerId,
      }));

      const { error } = await (supabaseAdmin as any)
        .from("booking_passengers")
        .insert(inserts);

      if (error) throw new Error(error.message);
    }

    return { success: true };
  });
