import { createServerFn } from "@tanstack/react-start";
import { optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getUserRoles, isStaffUser } from "@/lib/permissions";

export const getSessionInfo = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const roles = await getUserRoles(supabase, userId);
    const isStaff = await isStaffUser(supabase, userId);
    return { userId, roles, isStaff };
  });

export type SessionInfo = Awaited<ReturnType<typeof getSessionInfo>>;
