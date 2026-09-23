import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { applicationRouteForRole } from "@/auth/ensureSession";
import { useAuth } from "@/auth-system/useAuth";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/auth/sso-callback")({
  head: () =>
    pageHead({
      title: "Completing Google Sign-In | Shafsky Aviation Services",
      description: "Finishing Google authentication for Shafsky Aviation Services.",
      path: "/auth/sso-callback",
      robots: "noindex, nofollow",
    }),
  component: GoogleSsoCallbackPage,
});

function GoogleSsoCallbackPage() {
  const { completeGoogleReturn, loading } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (loading || hasRun.current) return;
    hasRun.current = true;

    void (async () => {
      const result = await completeGoogleReturn();
      if (result.error) {
        setErrorMsg(result.error.message);
        return;
      }
      await navigate({ to: applicationRouteForRole(result.role) });
    })();
  }, [completeGoogleReturn, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#faf5ea] flex flex-col items-center justify-center p-6 text-center">
      <div id="clerk-captcha" />
      {errorMsg ? (
        <div className="max-w-md space-y-4">
          <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-xl bg-[#0d5a6e] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-[#5b6b75]">
          <Loader2 className="h-7 w-7 animate-spin text-[#0d5a6e]" />
          <p className="text-xs font-mono uppercase tracking-widest">Completing Google sign-in…</p>
        </div>
      )}
    </div>
  );
}
