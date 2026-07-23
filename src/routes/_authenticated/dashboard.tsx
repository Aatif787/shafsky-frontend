import React, { Suspense } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";

const DashboardView = React.lazy(() => import("@/components/views/DashboardView"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const session = await getSessionInfo().catch(() => null);
    if (!session || !session.userId || session.userId === "guest_user") {
      throw redirect({ to: `/auth?mode=signin` } as any);
    }

    // Redirect staff/admin away from the user dashboard to their correct panels
    const roles = session.roles || [];
    if (roles.includes("super_admin")) {
      throw redirect({ to: `/super-admin` } as any);
    }
    if (roles.includes("admin")) {
      throw redirect({ to: `/admin` } as any);
    }

    return session;
  },
  ssr: true,
  component: UserDashboardComponent,
});

function UserDashboardComponent() {
  const { userId } = Route.useLoaderData();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView userId={userId} />
    </Suspense>
  );
}
