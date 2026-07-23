import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";

export const Route = createFileRoute("/account")({
  loader: async () => {
    const session = await getSessionInfo();
    if (!session.userId || session.userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }
    throw redirect({ to: "/dashboard" } as any);
  },
  component: () => null,
});
