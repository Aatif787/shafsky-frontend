import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/auth-system/signIn";

export const Route = createFileRoute("/auth")({
  component: SignInPage,
});
