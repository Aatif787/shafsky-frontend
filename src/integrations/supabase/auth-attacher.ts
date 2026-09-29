import { createMiddleware } from "@tanstack/react-start";

/**
 * Legacy Supabase Auth attacher — pass-through only.
 * Supabase Auth attachment has been removed; authentication is handled via FastAPI JWT tokens.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    return next();
  },
);
