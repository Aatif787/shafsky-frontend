import { createMiddleware } from "@tanstack/react-start";

// Simplified for Clerk authentication integration
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    return next();
  },
);
