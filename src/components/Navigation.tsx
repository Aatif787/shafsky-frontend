import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSessionInfo } from "@/lib/session";
import { Menu, X, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBranding } from "@/lib/branding/branding.context";

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const NAV: [string, string][] = [
  ["Book", "#book"],
  ["Services", "#services"],
  ["Why Us", "#why"],
  ["Coverage", "#coverage"],
  ["Contact", "/contact"],
];

export function Navigation({ visible = true }: { visible?: boolean }) {
  const { branding } = useBranding();
  const [roles, setRoles] = useState<string[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardPath = () => {
    if (roles.includes("super_admin")) return "/super-admin";
    if (roles.includes("admin")) return "/admin";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (roles.includes("super_admin")) return "Super Admin";
    if (roles.includes("admin")) return "Admin Console";
    return userName || "My Dashboard";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSessionInfo();
        if (!mounted) return;
        setRoles(s.roles || []);
        setIsStaff(Boolean(s.isStaff));
        setUserId(s.userId || null);

        if (s.userId && s.userId !== "guest_user") {
          const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", s.userId)
            .maybeSingle();
          if (data?.full_name && mounted) {
            setUserName(data.full_name);
          }
        }
      } catch (e) {
        // ignore — treat as guest
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-350 ${
        scrolled
          ? "bg-[#06090f]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-lg"
          : "bg-transparent py-6"
      } ${!visible ? "translate-y-[-100%]" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {branding.logo_url ? (
            <img 
              src={branding.logo_dark_url || branding.logo_url} 
              alt={branding.company_name} 
              className="h-9 md:h-[42px] lg:h-[48px] w-auto object-contain" 
            />
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4c09d] to-[#c5a059] flex items-center justify-center text-[#0b1a24] shadow-md group-hover:scale-105 transition-transform duration-300">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-white leading-none">
                  {branding.company_name.split(" ")[0]?.toUpperCase() || "SHAFSKY"}
                </div>
                <div className="text-[7.5px] tracking-[0.45em] text-white/50 uppercase mt-0.5 leading-none">
                  {(branding.company_name.split(" ").slice(1).join(" ") || "AVIATION").toUpperCase()}
                </div>
              </div>
            </>
          )}
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden gap-8 md:flex">
          {NAV.map(([l, href]) => (
            <li key={l} className="relative group">
              {href.startsWith("/") ? (
                <Link
                  to={href}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white transition duration-300 flex items-center"
                >
                  {l}
                </Link>
              ) : (
                <a
                  href={href}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white transition duration-300 flex items-center"
                >
                  {l}
                </a>
              )}
              <span className="absolute -bottom-1.5 left-0 w-full h-px bg-[#c5a059] scale-x-0 origin-left transition-transform duration-350 group-hover:scale-x-100" />
            </li>
          ))}
        </ul>

        {/* CTA Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {userId && userId !== "guest_user" ? (
            <>
              <Link
                to={getDashboardPath() as any}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059] hover:text-white px-3 py-2 font-semibold transition"
              >
                {getDashboardLabel()}
              </Link>
              {roles.length === 1 && roles.includes("customer") && (
                <Link
                  to="/dashboard"
                  search={{ tab: "support" } as any}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white px-3 py-2 transition"
                >
                  Help & Support
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/auth"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white px-4 py-2"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/charter"
            className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 transition duration-300 text-white/90"
            style={{ ...mono, background: "rgba(255,255,255,0.02)" }}
          >
            CHARTER
          </Link>
          <Link
            to="/book"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-[#c5a059] hover:bg-[#b8944d] rounded-xl px-5 py-2.5 transition duration-300 shadow-md font-semibold"
            style={mono}
          >
            BOOK NOW
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white/85 hover:text-white transition duration-300 p-1"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`fixed inset-0 w-full h-screen bg-[#06090f]/98 backdrop-blur-xl px-8 pt-28 pb-12 flex flex-col justify-between transition-all duration-500 ease-in-out md:hidden z-40 ${
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col justify-between h-full">
          <ul className="flex flex-col gap-6 pl-2">
            {NAV.map(([l, href]) => (
              <li key={l}>
                {href.startsWith("/") ? (
                  <Link
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold uppercase tracking-[0.15em] text-white/90 hover:text-white transition duration-300"
                  >
                    {l}
                  </Link>
                ) : (
                  <a
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold uppercase tracking-[0.15em] text-white/90 hover:text-white transition duration-300"
                  >
                    {l}
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          <div className="flex flex-col gap-4">
            {userId && userId !== "guest_user" ? (
              <>
                <Link
                  to={getDashboardPath() as any}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#c5a059] border border-[#c5a059]/30 rounded-xl transition duration-300"
                  style={mono}
                >
                  {getDashboardLabel()}
                </Link>
                {roles.length === 1 && roles.includes("customer") && (
                  <Link
                    to="/dashboard"
                    search={{ tab: "support" } as any}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60 border border-white/10 rounded-xl transition duration-300"
                    style={mono}
                  >
                    Help & Support
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 border border-white/10 rounded-xl transition duration-300"
                style={mono}
              >
                Sign In
              </Link>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/charter"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 border border-white/10 rounded-xl transition duration-300"
                style={mono}
              >
                Charter
              </Link>
              <Link
                to="/book"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3.5 text-xs font-bold uppercase tracking-[0.2em] bg-[#c5a059] text-[#0b1a24] rounded-xl shadow-lg transition duration-300"
                style={mono}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
