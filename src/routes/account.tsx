import { createFileRoute, redirect } from "@tanstack/react-router";
import { ensureApplicationSession } from "@/auth/ensureSession";
import { getSessionInfo } from "@/lib/session";

export const Route = createFileRoute("/account")({
  ssr: false,
  loader: async () => {
    const live = await ensureApplicationSession();
    const session = live ?? (await getSessionInfo().catch(() => null));
    if (!session?.userId || session.userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    throw redirect({ to: "/dashboard" } as any);
  },
  component: () => null,
});
