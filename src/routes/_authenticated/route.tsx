import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    return { userId: "guest_user" };
  },
  head: () =>
    pageHead({
      title: "Account | Shafsky Aviation Services",
      description: "Shafsky Aviation operations portal.",
      path: "/dashboard",
      robots: "noindex, nofollow",
    }),
  component: () => <Outlet />,
});
