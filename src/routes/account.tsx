import { createFileRoute, redirect } from "@tanstack/react-router";
import { readApplicationSession } from "@/auth/ensureSession";
import { getSessionInfo } from "@/lib/session";

export const Route = createFileRoute("/account")({
  // Session lives in the browser (in-memory FastAPI token), so resolve client-side only.
  ssr: false,
  loader: async () => {
    const session = readApplicationSession() ?? (await getSessionInfo().catch(() => null));
    if (!session?.userId || session.userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    throw redirect({ to: "/dashboard" } as any);
  },
  component: () => null,
});
