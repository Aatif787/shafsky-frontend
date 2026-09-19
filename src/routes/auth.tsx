import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/auth-system/signIn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead({
      title: "Sign In | Shafsky Aviation Services",
      description: "Secure authentication for Shafsky Aviation Services.",
      path: "/auth",
      robots: "noindex, nofollow",
    }),
  component: SignInPage,
});
