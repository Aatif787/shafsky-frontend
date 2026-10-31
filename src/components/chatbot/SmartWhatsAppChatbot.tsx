import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  ArrowLeft,
  RotateCcw,
  Phone,
  Mail,
  Plane,
  Crown,
  Hotel,
  Car,
  Ticket,
  FileCheck,
  Sparkles,
  Baby,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { display, mono } from "@/components/home/theme";
import {
  SUPPORT_DEPARTMENTS,
  SupportDepartment,
} from "@/components/navigation/supportData";
import {
  buildWhatsAppUrl,
  VERIFIED_CENTRAL_OPS_PHONE,
  VERIFIED_CENTRAL_OPS_WHATSAPP,
} from "@/lib/chatbot/departmentContacts";
import {
  QUICK_SERVICE_ROUTING,
  QuickServiceRoute,
  buildDepartmentDirectWhatsAppMessage,
} from "@/lib/chatbot/chatbotQuestions";

// Helper icon resolver for quick service chips
function renderServiceIcon(iconName: string, className = "h-3.5 w-3.5 shrink-0") {
  switch (iconName) {
    case "Crown":
      return <Crown className={className} />;
    case "Ticket":
      return <Ticket className={className} />;
    case "Hotel":
      return <Hotel className={className} />;
    case "FileCheck":
      return <FileCheck className={className} />;
    case "Car":
      return <Car className={className} />;
    case "Baby":
      return <Baby className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export function SmartWhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  // Chat State: 3 Canonical Support Departments
  const [selectedDepartment, setSelectedDepartment] = useState<SupportDepartment | null>(null);
  const [showDirectoryOverlay, setShowDirectoryOverlay] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll management:
  // - On initial open, start at the TOP so Department 01 (Meet & Greet and Lounge) is immediately visible!
  // - Only scroll to bottom when a department is selected to reveal the connection action card.
  useEffect(() => {
    if (!isOpen) return;

    if (selectedDepartment) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
      const raf = requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen, selectedDepartment, showDirectoryOverlay]);

  // Keyboard navigation: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Dismiss notification tooltip after 10s
  useEffect(() => {
    const t = setTimeout(() => {
      setShowNotificationBadge(false);
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  const handleStartAgain = () => {
    setSelectedDepartment(null);
    setShowDirectoryOverlay(false);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  };

  const handleBack = () => {
    if (showDirectoryOverlay) {
      setShowDirectoryOverlay(false);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
      return;
    }
    setSelectedDepartment(null);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  };

  const handleQuickRoute = (route: QuickServiceRoute) => {
    const matched = SUPPORT_DEPARTMENTS.find(
      (dept) => dept.departmentNumber === route.departmentNumber
    );
    if (matched) {
      setSelectedDepartment(matched);
      setShowDirectoryOverlay(false);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
       * 1. FLOATING WHATSAPP SUPPORT BUTTON (Bottom Right)
       * ─────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
        {/* Notification Tooltip */}
        <AnimatePresence>
          {!isOpen && showNotificationBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              className="relative flex max-w-[280px] items-center gap-3 rounded-2xl border border-amber-300/40 bg-slate-950/95 p-3.5 text-white shadow-2xl backdrop-blur-md"
            >
              <button
                type="button"
                onClick={() => setShowNotificationBadge(false)}
                className="absolute right-2 top-2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Dismiss message"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-slate-950">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-300">24/7 WhatsApp Support</div>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Tap to connect with official departments on WhatsApp.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNotificationBadge(false);
          }}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all cursor-pointer ${
            isOpen
              ? "bg-slate-900 border-2 border-amber-400/80 text-white"
              : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-2 border-emerald-300/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)]"
          }`}
          aria-label={isOpen ? "Close WhatsApp Support Chat" : "Open 24/7 WhatsApp Support Chat"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-amber-300 transition-transform duration-200" />
          ) : (
            <>
              {/* WhatsApp SVG Icon */}
              <svg className="h-7 w-7 fill-white transition-transform duration-300 group-hover:rotate-6" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {/* Online Pulse Indicator */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300 border-2 border-slate-900" />
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
       * 2. SMART CHATBOT WINDOW
       * ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-[9999] w-[calc(100vw-32px)] sm:w-[420px] max-h-[85vh] sm:max-h-[640px] flex flex-col rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200/90 overflow-hidden font-sans overscroll-contain"
          >
            {/* Header: Deep Navy Blue + Subtle Gold Accent */}
            <div className="relative bg-slate-950 text-white p-4 sm:p-5 border-b border-[#d4af37]/35 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button if in detail view */}
                {(selectedDepartment || showDirectoryOverlay) && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="p-1.5 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
                    aria-label="Previous step"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}

                {/* Avatar with Concierge Icon */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/90 to-amber-600 text-slate-950 font-bold shadow-md">
                  <Plane className="h-5 w-5 -rotate-45" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-white" style={display}>
                      Shafsky Aviation Concierge
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-300 font-mono" style={mono}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>WhatsApp Support Desk • Online</span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleStartAgain}
                  title="Start Again"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Start conversation again"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Top Micro-Bar: Support Helpline */}
            <div className="bg-slate-900/95 px-4 py-2 text-[10.5px] text-slate-300 flex items-center justify-between border-b border-slate-800">
              <span className="font-mono" style={mono}>
                24/7 Helpline: <strong className="text-amber-300 font-semibold">{VERIFIED_CENTRAL_OPS_PHONE}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowDirectoryOverlay(!showDirectoryOverlay)}
                className="text-amber-400 hover:text-amber-300 font-mono font-bold uppercase tracking-wider underline cursor-pointer"
                style={mono}
              >
                {showDirectoryOverlay ? "Back to Chat" : "Directory View"}
              </button>
            </div>

            {/* Chat Body Container */}
            <div
              ref={chatContainerRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-slate-900 text-xs sm:text-sm overscroll-contain"
            >
              {/* FULL DIRECTORY OVERLAY */}
              {showDirectoryOverlay ? (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-slate-950 font-bold font-mono text-xs uppercase" style={mono}>
                    <span>SHAFSKY AVIATION SUPPORT DIRECTORY</span>
                  </div>

                  <div data-lenis-prevent="true" data-lenis-prevent-wheel="true" onWheel={(e) => e.stopPropagation()} className="space-y-2.5 pt-1 max-h-[320px] overflow-y-auto pr-1 overscroll-contain">
                    {SUPPORT_DEPARTMENTS.map((dept) => (
                      <div
                        key={dept.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-500" style={mono}>
                            DEPARTMENT 0{dept.departmentNumber}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                            {dept.categoryBadge}
                          </span>
                        </div>
                        <div className="font-bold text-slate-950 text-xs sm:text-sm">
                          {dept.title}
                        </div>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-700 pt-0.5">
                          {dept.emails.map((em) => (
                            <a key={em.display} href={em.email} className="hover:text-blue-700 inline-flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 text-slate-600 shrink-0" />
                              <span>{em.display}</span>
                            </a>
                          ))}
                          {dept.phones.map((ph) => (
                            <div key={ph.display} className="flex items-center justify-between gap-1">
                              <a href={ph.tel} className="hover:text-emerald-700 inline-flex items-center gap-1.5 font-mono font-semibold" style={mono}>
                                <Phone className="h-3 w-3 text-slate-600 shrink-0" />
                                <span>{ph.display}</span>
                              </a>
                              <a
                                href={buildWhatsAppUrl(ph.display, buildDepartmentDirectWhatsAppMessage(dept))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                                style={mono}
                              >
                                WhatsApp
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <a
                      href={buildWhatsAppUrl(
                        VERIFIED_CENTRAL_OPS_WHATSAPP,
                        "Hello Shafsky Aviation Operations Team, I need immediate assistance."
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-sm"
                      style={mono}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat with Central Operations Desk</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bot Welcome Bubble */}
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                      <Plane className="h-3.5 w-3.5 -rotate-45" />
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-xs max-w-[90%] text-slate-800 leading-relaxed space-y-1.5">
                      <p className="font-semibold text-slate-950">Welcome to Shafsky Aviation! ✈️</p>
                      <p className="text-slate-600 text-xs sm:text-[13px]">
                        Hello! How can we assist you today? Please select your department to connect directly on WhatsApp:
                      </p>
                    </div>
                  </div>

                  {/* ───────────────────────────────────────────────────────
                   * 3 CANONICAL DEPARTMENT SELECTION (Matching Support Cards)
                   * ─────────────────────────────────────────────────────── */}
                  {!selectedDepartment && (
                    <div className="pl-9 space-y-3">
                      {/* Quick Service Routing Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500" style={mono}>
                          Quick Service Shortcuts:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_SERVICE_ROUTING.map((route) => (
                            <button
                              key={route.id}
                              type="button"
                              onClick={() => handleQuickRoute(route)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-900 transition text-[11px] font-medium shadow-xs cursor-pointer"
                            >
                              {renderServiceIcon(route.iconName)}
                              <span>{route.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* The 3 Canonical Department Cards */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block" style={mono}>
                          Select an Official Department:
                        </span>
                        <div className="space-y-2">
                          {SUPPORT_DEPARTMENTS.map((dept) => (
                            <motion.button
                              key={dept.id}
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setSelectedDepartment(dept)}
                              className="w-full text-left p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer shadow-xs"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60" style={mono}>
                                  DEPARTMENT 0{dept.departmentNumber}
                                </span>
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 truncate max-w-[170px]">
                                  {dept.categoryBadge}
                                </span>
                              </div>

                              <div className="font-bold text-slate-900 text-xs sm:text-[13px] group-hover:text-amber-900 transition leading-snug">
                                {dept.title}
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-600 text-[11px]" style={mono}>
                                  {dept.phones[0]?.display}
                                </span>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold group-hover:translate-x-0.5 transition text-[11px] font-mono" style={mono}>
                                  <MessageSquare className="h-3 w-3" />
                                  <span>Connect WhatsApp →</span>
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ───────────────────────────────────────────────────────
                   * DIRECT DEPARTMENT REDIRECTION CARD
                   * ─────────────────────────────────────────────────────── */}
                  {selectedDepartment && (
                    <div className="space-y-3">
                      {/* User's Selection Echo */}
                      <div className="flex justify-end">
                        <div className="bg-slate-950 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-xs space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-amber-300" style={mono}>
                            <span>DEPARTMENT 0{selectedDepartment.departmentNumber}</span>
                            <span>{selectedDepartment.categoryBadge}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-100 leading-snug">
                            {selectedDepartment.title}
                          </div>
                        </div>
                      </div>

                      {/* Bot Response: Immediate Routed Department Card with Direct WhatsApp Button(s) */}
                      <div className="flex items-start gap-2.5">
                        <div className="h-7 w-7 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-emerald-300/80 shadow-md text-slate-900 w-full space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700" style={mono}>
                              CONNECTED TO DEPARTMENT 0{selectedDepartment.departmentNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                              ● WhatsApp Ready
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md inline-block border border-amber-200/60">
                              {selectedDepartment.categoryBadge}
                            </div>
                            <div className="font-bold text-slate-950 text-sm sm:text-base leading-snug">
                              {selectedDepartment.title}
                            </div>
                          </div>

                          {/* Contact Info Box */}
                          <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
                            <div className="flex flex-col gap-1 text-[11px] text-slate-300 font-mono" style={mono}>
                              {selectedDepartment.emails.map((em) => (
                                <div key={em.display} className="flex items-center gap-1.5 truncate">
                                  <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                                  <a href={em.email} className="hover:text-white transition">
                                    {em.display}
                                  </a>
                                </div>
                              ))}
                              {selectedDepartment.phones.map((ph, idx) => (
                                <div key={ph.display} className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 text-amber-400 shrink-0" />
                                  <span>
                                    {selectedDepartment.phones.length > 1 ? `Line ${idx + 1}: ` : ""}
                                    {ph.display}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ACTION BUTTONS: DIRECT WHATSAPP REDIRECTION */}
                          <div className="space-y-2 pt-1">
                            {/* Primary Button(s): Direct WhatsApp Chat for each line */}
                            {selectedDepartment.phones.map((phone, idx) => (
                              <a
                                key={phone.display}
                                href={buildWhatsAppUrl(
                                  phone.display,
                                  buildDepartmentDirectWhatsAppMessage(selectedDepartment)
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
                                style={mono}
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>
                                  {selectedDepartment.phones.length > 1
                                    ? `Chat on WhatsApp (Line ${idx + 1}: ${phone.display})`
                                    : `Chat on WhatsApp (${phone.display})`}
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
                              </a>
                            ))}

                            {/* Direct Phone Call Buttons */}
                            <div className="flex gap-2 pt-1">
                              {selectedDepartment.phones.map((phone, idx) => (
                                <a
                                  key={phone.display}
                                  href={phone.tel}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-bold uppercase transition"
                                  style={mono}
                                >
                                  <Phone className="h-3 w-3 text-emerald-600" />
                                  <span>
                                    {selectedDepartment.phones.length > 1 ? `Call L${idx + 1}` : "Call Now"}
                                  </span>
                                </a>
                              ))}
                              {selectedDepartment.emails[0] && (
                                <a
                                  href={selectedDepartment.emails[0].email}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-bold uppercase transition"
                                  style={mono}
                                >
                                  <Mail className="h-3 w-3 text-blue-600" />
                                  <span>Email</span>
                                </a>
                              )}
                            </div>

                            {/* Option to change department */}
                            <div className="pt-2 text-center">
                              <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 font-mono underline cursor-pointer"
                                style={mono}
                              >
                                <span>← Choose a Different Department</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Footer Micro-Bar */}
            <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono flex items-center justify-between" style={mono}>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                <span>Shafsky Aviation Support Desk</span>
              </span>
              <button
                type="button"
                onClick={handleStartAgain}
                className="hover:text-slate-900 hover:underline cursor-pointer"
              >
                Reset Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SmartWhatsAppChatbot;
