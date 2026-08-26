import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/auth-system/signIn";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Secure portal sign-in for Shafsky Aviation Services customers, officers, and administrators.",
      },
    ],
  }),
  component: SignInPage,
});
