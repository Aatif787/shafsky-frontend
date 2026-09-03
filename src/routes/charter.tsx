import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/charter")({
  beforeLoad: () => {
    throw redirect({ to: "/solutions/aviation" });
  },
});

