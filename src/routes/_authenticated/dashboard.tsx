import React, { Suspense } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { dashboardRedirectTarget, readApplicationSession } from "@/auth/ensureSession";
import { getSessionInfo } from "@/lib/session";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";

const DashboardView = React.lazy(() => import("@/components/views/DashboardView"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const live = readApplicationSession();
    const session = live ?? (await getSessionInfo().catch(() => null));
    const target = dashboardRedirectTarget(session);
    if (!session || target) {
      throw redirect({ to: target ?? "/auth?mode=signin" } as any);
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
