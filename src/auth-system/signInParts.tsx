import React from "react";
import {
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";

export type SignInMode = "signin" | "signup" | "forgot" | "reset";

export function formatAuthError(error: unknown): string {
  let rawMsg = "";
  if (error instanceof Error) {
    rawMsg = error.message;
  } else if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      longMessage?: string;
      errors?: { message?: string; longMessage?: string }[];
    };
    rawMsg =
      candidate.errors?.[0]?.longMessage ||
      candidate.errors?.[0]?.message ||
      candidate.longMessage ||
      candidate.message ||
      "Authentication failed";
  } else if (typeof error === "string") {
    rawMsg = error;
  } else {
    rawMsg = "Authentication failed. Please try again.";
  }

  const msg = rawMsg.toLowerCase();
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("identifier or password is invalid") ||
    msg.includes("password is incorrect") ||
    msg.includes("couldn't find your account")
  ) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Your email address has not been confirmed yet. Please verify your inbox.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many login attempts. Please wait a few moments and try again.";
  }
  if (msg.includes("user already registered") || msg.includes("identifier already exists")) {
    return "An account with this email address already exists.";
  }
  return rawMsg;
}

export const SignInLoadingScreen: React.FC = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center p-6 select-none"
    style={{
      background: "radial-gradient(circle at 30% 20%, #f5efe3 0%, #faf5ea 50%, #f0ebe0 100%)",
    }}
  >
    <div className="relative">
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{ border: "2px solid rgba(13,90,110,0.1)", animationDuration: "2s" }}
      />
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "#faf5ea",
          boxShadow: "6px 6px 14px #e0d9ca, -6px -6px 14px #ffffff",
        }}
      >
        <Fingerprint className="h-7 w-7 text-[#0d5a6e] animate-pulse" />
      </div>
    </div>
    <span className="mt-5 text-[10px] font-mono tracking-[0.35em] text-[#5b6b75] uppercase">
      Authenticating Session
    </span>
    <div
      className="mt-3 w-24 h-[2px] rounded-full overflow-hidden"
      style={{ background: "rgba(0,0,0,0.05)" }}
    >
      <div
        className="h-full rounded-full animate-pulse"
        style={{
          width: "60%",
          background: "linear-gradient(90deg, #0d5a6e, #10b981)",
          animationDuration: "1.5s",
        }}
      />
    </div>
  </div>
);

interface SignInHeaderBrandingProps {
  mode: SignInMode;
  staffSignIn: boolean;
  changeMode: (newMode: SignInMode) => void;
}

export const SignInHeaderBranding: React.FC<SignInHeaderBrandingProps> = ({
  mode,
  staffSignIn,
  changeMode,
}) => (
  <>
    {/* Top Row back button (prevents overlap on mobile) */}
    {mode !== "signin" && (
      <div className="mb-4 flex justify-start">
        <button
          onClick={() => changeMode("signin")}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-300 text-[#5b6b75] cursor-pointer hover:text-[#0d5a6e] active:scale-95"
          title="Back to Sign In"
          style={{
            background: "#faf5ea",
            boxShadow: "4px 4px 10px #e0d9ca, -4px -4px 10px #ffffff",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "inset 3px 3px 6px #e0d9ca, inset -3px -3px 6px #ffffff";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "4px 4px 10px #e0d9ca, -4px -4px 10px #ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "4px 4px 10px #e0d9ca, -4px -4px 10px #ffffff";
          }}
        >
          <ArrowLeft size={14} />
        </button>
      </div>
    )}

    {/* Header Branding */}
    <div className="text-center mb-8 sm:mb-9">
      {/* Neumorphic shield badge */}
      <div className="flex justify-center mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center relative"
          style={{
            background: "#faf5ea",
            boxShadow:
              "6px 6px 14px #e0d9ca, -6px -6px 14px #ffffff, inset 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          <ShieldCheck
            className="h-6 w-6 transition-all duration-700"
            style={{
              color: "#0d5a6e",
              filter: "drop-shadow(0 0 6px rgba(13,90,110,0.25))",
            }}
          />
          {/* Subtle rotating ring */}
          <div
            className="absolute inset-[-3px] rounded-full border border-dashed border-[#0d5a6e]/10"
            style={{ animation: "spin 20s linear infinite" }}
          />
        </div>
      </div>

      <h1
        className="text-lg font-extrabold tracking-[0.1em] text-[#0d2a36] uppercase"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          animation: "trackingIn 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both 0.2s",
        }}
      >
        SHAFSKY AVIATION SERVICES
      </h1>
      <p
        className="text-[9px] uppercase tracking-[0.4em] mt-1 font-semibold"
        style={{ color: "#8a9aa3", fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {mode === "signin" && (staffSignIn ? "Staff Entry Console" : "Client & Operations Portal")}
        {mode === "signup" && "Create an Account"}
        {mode === "forgot" && "Reset Link Dispatcher"}
        {mode === "reset" && "Credential Update Console"}
      </p>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <div
          className="h-[1px] w-8 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #c8bfb0)" }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#0d5a6e", boxShadow: "0 0 6px rgba(13,90,110,0.3)" }}
        />
        <div
          className="h-[1px] w-8 rounded-full"
          style={{ background: "linear-gradient(90deg, #c8bfb0, transparent)" }}
        />
      </div>
    </div>
  </>
);

interface SignInBannersProps {
  errorMsg: string | null;
  successMsg: string | null;
}

export const SignInBanners: React.FC<SignInBannersProps> = ({ errorMsg, successMsg }) => (
  <>
    {/* Neumorphic Error Banner */}
    {errorMsg && (
      <div
        className="mb-6 flex items-start gap-3 rounded-2xl p-4 text-red-700 transition-all duration-300"
        style={{
          background: "#faf5ea",
          boxShadow:
            "inset 3px 3px 6px #e0d9ca, inset -3px -3px 6px #ffffff, 0 0 0 1px rgba(239,68,68,0.12)",
        }}
      >
        <AlertCircle
          className="h-4 w-4 shrink-0 mt-0.5"
          style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.3))" }}
        />
        <div
          className="text-[11px] font-semibold leading-relaxed"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {errorMsg}
        </div>
      </div>
    )}

    {/* Neumorphic Success Banner */}
    {successMsg && (
      <div
        className="mb-6 flex items-start gap-3 rounded-2xl p-4 text-emerald-700 transition-all duration-300"
        style={{
          background: "#faf5ea",
          boxShadow:
            "inset 3px 3px 6px #e0d9ca, inset -3px -3px 6px #ffffff, 0 0 0 1px rgba(16,185,129,0.15)",
        }}
      >
        <CheckCircle
          className="h-4 w-4 shrink-0 mt-0.5"
          style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.4))" }}
        />
        <div
          className="text-[11px] font-semibold leading-relaxed"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          {successMsg}
        </div>
      </div>
    )}
  </>
);

interface SignInFooterProps {
  mode: SignInMode;
  awaitingEmailCode: boolean;
  changeMode: (newMode: SignInMode) => void;
}

export const SignInFooter: React.FC<SignInFooterProps> = ({
  mode,
  awaitingEmailCode,
  changeMode,
}) => (
  <div className="mt-9 pt-6 text-center relative">
    {/* Neumorphic divider */}
    <div className="absolute top-0 left-6 right-6 flex items-center gap-3">
      <div
        className="flex-1 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, #ddd5c5 50%, transparent)",
        }}
      />
      <div className="w-1 h-1 rounded-full" style={{ background: "#c8bfb0" }} />
      <div
        className="flex-1 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, #ddd5c5 50%, transparent)",
        }}
      />
    </div>

    {mode === "signin" && !awaitingEmailCode && (
      <p
        className="text-[10px] uppercase tracking-[0.15em] text-[#8a9aa3]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className="font-bold tracking-[0.15em] transition-all duration-300 cursor-pointer px-2.5 py-1 rounded-lg ml-1"
          style={{ color: "#0d5a6e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(13,90,110,0.06)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px rgba(13,90,110,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Sign Up
        </button>
      </p>
    )}

    {mode === "signup" && !awaitingEmailCode && (
      <p
        className="text-[10px] uppercase tracking-[0.15em] text-[#8a9aa3]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => changeMode("signin")}
          className="font-bold tracking-[0.15em] transition-all duration-300 cursor-pointer px-2.5 py-1 rounded-lg ml-1"
          style={{ color: "#0d5a6e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(13,90,110,0.06)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px rgba(13,90,110,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Sign In
        </button>
      </p>
    )}

    {mode === "forgot" && (
      <p
        className="text-[10px] uppercase tracking-[0.15em] text-[#8a9aa3]"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Remembered your credentials?{" "}
        <button
          onClick={() => changeMode("signin")}
          className="font-bold tracking-[0.15em] transition-all duration-300 cursor-pointer px-2.5 py-1 rounded-lg ml-1"
          style={{ color: "#0d5a6e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(13,90,110,0.06)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px rgba(13,90,110,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Sign In
        </button>
      </p>
    )}

    {/* Security badge */}
    <div className="mt-5 flex items-center justify-center gap-1.5">
      <Lock className="h-2.5 w-2.5" style={{ color: "#b0b8be" }} />
      <span
        className="text-[8px] uppercase tracking-[0.3em] font-semibold"
        style={{ color: "#b0b8be", fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        256-bit encrypted
      </span>
    </div>
  </div>
);
