import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/auth-system/signIn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    pageHead({
      title: "Sign In | Shafsky Aviation Services",
      description: "Secure portal sign-in for Shafsky Aviation Services customers and operations staff.",
      path: "/login",
      robots: "noindex, nofollow",
    }),
  component: SignInPage,
});
