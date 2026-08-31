import React, { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  User,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";

export function SignInPage() {
  const {
    user,
    profile,
    loading,
    signInWithPassword,
    signUp,
    resetPasswordForEmail,
    updatePassword,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize mode from URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "signup" || modeParam === "forgot" || modeParam === "reset") {
        setMode(modeParam as any);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && user && profile && mode !== "reset") {
      const userRole = profile.role || "customer";
      if (userRole === "super_admin" || userRole === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, [user, profile, loading, mode]);

  const changeMode = (newMode: "signin" | "signup" | "forgot" | "reset") => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword("");
    setConfirmPassword("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", newMode);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Common validations
    if (mode === "signin") {
      if (!email.trim() || !password.trim()) {
        setErrorMsg("Please enter both email and password.");
        return;
      }
    } else if (mode === "signup") {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMsg("Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
    } else if (mode === "forgot") {
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
    } else if (mode === "reset") {
      if (!password.trim()) {
        setErrorMsg("Please enter a new password.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) {
          translateError(error);
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          translateError(error);
        } else {
          setSuccessMsg(
            "Verification email sent! Please check your inbox to confirm your registration.",
          );
          // Clear inputs
          setEmail("");
          setFullName("");
          setPassword("");
          setConfirmPassword("");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPasswordForEmail(email.trim());
        if (error) {
          translateError(error);
        } else {
          setSuccessMsg(
            "Reset link sent! Check your inbox for instructions to set your new password.",
          );
          setEmail("");
        }
      } else if (mode === "reset") {
        const { error } = await updatePassword(password);
        if (error) {
          translateError(error);
        } else {
          setSuccessMsg("Password updated successfully! You can now Sign In.");
          setPassword("");
          setConfirmPassword("");
          setTimeout(() => changeMode("signin"), 3000);
        }
      }
    } catch (err) {
      setErrorMsg(
        "An unexpected connection error occurred. Please check your network and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const translateError = (error: Error) => {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      setErrorMsg("Incorrect email or password. Please try again.");
    } else if (msg.includes("email not confirmed")) {
      setErrorMsg("Your email address has not been confirmed yet. Please verify your inbox.");
    } else if (msg.includes("rate limit")) {
      setErrorMsg("Too many login attempts. Please wait a few moments and try again.");
    } else if (msg.includes("user already registered")) {
      setErrorMsg("An account with this email address already exists.");
    } else {
      setErrorMsg(error.message);
    }
  };

  // Prevent flash of page content if user session is already active or resolving
  if (loading || (user && profile && mode !== "reset")) {
    return (
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
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 xs:p-6 sm:p-8 relative overflow-x-hidden overflow-y-auto"
      style={{
        background: "radial-gradient(circle at 30% 20%, #f5efe3 0%, #faf5ea 50%, #f0ebe0 100%)",
      }}
    >
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0d2a36 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      />

      <style>{`
        @keyframes fadeInZoom {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes trackingIn {
          0% { letter-spacing: -0.2em; opacity: 0; }
          40% { opacity: 0.6; }
          100% { letter-spacing: 0.1em; opacity: 1; }
        }
      `}</style>

      {/* Main card */}
      <div
        className="w-full max-w-[440px] rounded-[24px] sm:rounded-[32px] bg-[#faf5ea] border border-white/50 p-5 xs:p-8 sm:p-10 text-left transition-all duration-500 relative z-10 my-auto hover:shadow-xl"
        style={{
          boxShadow: "16px 16px 40px #e2dace, -16px -16px 40px #ffffff",
          animation: "fadeInZoom 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      >
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
              animation: "trackingIn 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both 0.2s"
            }}
          >
            SHAFSKY AVIATION SERVICES
          </h1>
          <p
            className="text-[9px] uppercase tracking-[0.4em] mt-1 font-semibold"
            style={{ color: "#8a9aa3", fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {mode === "signin" && "Secure Entry Console"}
            {mode === "signup" && "Guest Register Portal"}
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

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label
                className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold block"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6b75]/50 z-10" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border-none text-xs font-semibold outline-none transition-all duration-300 hover:scale-[1.01] hover:shadow-md text-[#0d2a36] placeholder:text-[#b0b8be]"
                  style={{
                    background: "#faf5ea",
                    boxShadow: "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(13,90,110,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff";
                  }}
                />
              </div>
            </div>
          )}

          {mode !== "reset" && (
            <div className="space-y-1.5">
              <label
                className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold block"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b6b75]/50 z-10" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@shafsky.com"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border-none text-xs font-semibold outline-none transition-all duration-300 hover:scale-[1.01] hover:shadow-md text-[#0d2a36] placeholder:text-[#b0b8be]"
                  style={{
                    background: "#faf5ea",
                    boxShadow: "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(13,90,110,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff";
                  }}
                />
              </div>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <label
                className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold block"
                htmlFor="password"
              >
                {mode === "reset" ? "New Password" : "Password"}
              </label>
              <div className="relative group">
                {/* Animated lock icon — glows teal on focus */}
                <Lock
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-500 ease-out"
                  style={{
                    color: password.length > 0 ? "#0d5a6e" : "#5b6b75",
                    opacity: password.length > 0 ? 1 : 0.45,
                    filter:
                      password.length > 0 ? "drop-shadow(0 0 4px rgba(13,90,110,0.35))" : "none",
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-11 pr-12 rounded-xl border-none text-xs font-semibold outline-none transition-all duration-300 hover:scale-[1.01] hover:shadow-md text-[#0d2a36] placeholder:text-[#b0b8be]"
                  style={{
                    background: "#faf5ea",
                    boxShadow: "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(13,90,110,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff";
                  }}
                />
                {/* Neumorphic eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer outline-none transition-all duration-300 ease-out active:scale-90"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  style={{
                    background: "#faf5ea",
                    boxShadow: showPassword
                      ? "inset 3px 3px 6px #e0d9ca, inset -3px -3px 6px #ffffff"
                      : "3px 3px 6px #e0d9ca, -3px -3px 6px #ffffff",
                  }}
                >
                  <span
                    className="flex items-center justify-center transition-all duration-400 ease-out"
                    style={{
                      transform: showPassword
                        ? "scale(1) rotate(0deg)"
                        : "scale(0.85) rotate(-180deg)",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-[14px] w-[14px] transition-all duration-400"
                        style={{
                          color: "#0d5a6e",
                          filter: "drop-shadow(0 0 4px rgba(13,90,110,0.35))",
                        }}
                      />
                    ) : (
                      <Eye
                        className="h-[14px] w-[14px] transition-all duration-400"
                        style={{ color: "#8a9aa3" }}
                      />
                    )}
                  </span>
                </button>
                {/* Password strength micro-bar */}
                {password.length > 0 && (
                  <div className="absolute -bottom-1.5 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-black/5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width:
                          password.length >= 12
                            ? "100%"
                            : password.length >= 8
                              ? "66%"
                              : password.length >= 4
                                ? "33%"
                                : "10%",
                        background:
                          password.length >= 12
                            ? "linear-gradient(90deg, #0d5a6e, #10b981)"
                            : password.length >= 8
                              ? "linear-gradient(90deg, #0d5a6e, #3b82f6)"
                              : password.length >= 4
                                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                                : "#ef4444",
                        boxShadow: password.length >= 8 ? "0 0 8px rgba(13,90,110,0.4)" : "none",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {(mode === "signup" || mode === "reset") && (
            <div className="space-y-1.5">
              <label
                className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold block"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-500 ease-out"
                  style={{
                    color:
                      confirmPassword.length > 0 && confirmPassword === password
                        ? "#10b981"
                        : confirmPassword.length > 0
                          ? "#ef4444"
                          : "#5b6b75",
                    opacity: confirmPassword.length > 0 ? 1 : 0.45,
                    filter:
                      confirmPassword.length > 0 && confirmPassword === password
                        ? "drop-shadow(0 0 4px rgba(16,185,129,0.4))"
                        : "none",
                  }}
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-11 pr-12 rounded-xl border-none text-xs font-semibold outline-none transition-all duration-300 hover:scale-[1.01] hover:shadow-md text-[#0d2a36] placeholder:text-[#b0b8be]"
                  style={{
                    background: "#faf5ea",
                    boxShadow:
                      confirmPassword.length > 0 && confirmPassword === password
                        ? "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(16,185,129,0.2)"
                        : confirmPassword.length > 0
                          ? "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(239,68,68,0.15)"
                          : "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(13,90,110,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 4px 4px 8px #e0d9ca, inset -4px -4px 8px #ffffff";
                  }}
                />
                {/* Neumorphic eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer outline-none transition-all duration-300 ease-out active:scale-90"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  style={{
                    background: "#faf5ea",
                    boxShadow: showConfirmPassword
                      ? "inset 3px 3px 6px #e0d9ca, inset -3px -3px 6px #ffffff"
                      : "3px 3px 6px #e0d9ca, -3px -3px 6px #ffffff",
                  }}
                >
                  <span
                    className="flex items-center justify-center transition-all duration-400 ease-out"
                    style={{
                      transform: showConfirmPassword
                        ? "scale(1) rotate(0deg)"
                        : "scale(0.85) rotate(-180deg)",
                    }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        className="h-[14px] w-[14px] transition-all duration-400"
                        style={{
                          color: "#0d5a6e",
                          filter: "drop-shadow(0 0 4px rgba(13,90,110,0.35))",
                        }}
                      />
                    ) : (
                      <Eye
                        className="h-[14px] w-[14px] transition-all duration-400"
                        style={{ color: "#8a9aa3" }}
                      />
                    )}
                  </span>
                </button>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="absolute -bottom-1.5 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-black/5">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: confirmPassword === password ? "100%" : "40%",
                        background:
                          confirmPassword === password
                            ? "linear-gradient(90deg, #10b981, #0d5a6e)"
                            : "linear-gradient(90deg, #ef4444, #f59e0b)",
                        boxShadow:
                          confirmPassword === password ? "0 0 8px rgba(16,185,129,0.5)" : "none",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => changeMode("forgot")}
                className="text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer px-3 py-1.5 rounded-lg"
                style={{
                  color: "#0d5a6e",
                  background: "transparent",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(13,90,110,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-2xl text-white text-[11px] font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 cursor-pointer active:scale-[0.97]"
            style={{
              background: "linear-gradient(145deg, #0e6378, #0c5264)",
              boxShadow: submitting
                ? "inset 3px 3px 6px #0a4252, inset -3px -3px 6px #10718a"
                : "5px 5px 12px #d8d0c1, -5px -5px 12px #ffffff, inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            onMouseDown={(e) => {
              if (!submitting)
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "inset 3px 3px 6px #0a4252, inset -3px -3px 6px #10718a";
            }}
            onMouseUp={(e) => {
              if (!submitting)
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "5px 5px 12px #d8d0c1, -5px -5px 12px #ffffff, inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              if (!submitting)
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "5px 5px 12px #d8d0c1, -5px -5px 12px #ffffff, inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
                {mode === "reset" && "Update Password"}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
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

          {mode === "signin" && (
            <p
              className="text-[10px] uppercase tracking-[0.15em] text-[#8a9aa3]"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              New to Shafsky Aviation Services?{" "}
              <button
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

          {mode === "signup" && (
            <p
              className="text-[10px] uppercase tracking-[0.15em] text-[#8a9aa3]"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              Already have an account?{" "}
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
      </div>
    </div>
  );
}
