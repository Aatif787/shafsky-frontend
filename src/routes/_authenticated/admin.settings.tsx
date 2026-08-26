import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  getSystemSettings,
  updateSystemSettings,
  getEnvConnectionStatus,
} from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Settings,
  Building,
  Palette,
  Plane,
  ConciergeBell,
  DollarSign,
  Users,
  Mail,
  MessageSquare,
  CreditCard,
  ShieldAlert,
  Save,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { CONTACT, NOTIFICATION } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: CentralizedSettingsView,
});

const SettingsSchema = z.object({
  // Company Profile
  businessName: z.string().default("Shafsky Aviation Services Pvt. Ltd."),
  supportEmail: z.string().email().default(String(CONTACT.EMAIL)),
  contactPhone: z.string().default(String(CONTACT.PHONE)),
  hqAddress: z.string().default("Indira Gandhi International Airport, Terminal 3, New Delhi, India"),
  operatingHours: z.string().default("24/7 Ops Desk"),

  // Branding
  platformName: z.string().default("Shafsky Aviation Services Concierge"),
  primaryColor: z.string().default("#5ed3ff"),
  logoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  darkModeDefault: z.boolean().default(true),

  // Pricing & Lead Time
  defaultCurrency: z.string().default("INR"),
  defaultGstRate: z.number().default(18),
  maxDiscountRate: z.number().default(30),
  sixHourRuleThreshold: z.number().int().min(1).max(72).default(6),

  // Email Templates
  resendSenderEmail: z.string().default(String(NOTIFICATION.FROM_EMAIL)),
  emailSubjectConfirmation: z.string().default("Booking Confirmed — Shafsky Aviation Services"),
  emailSubjectQuote: z.string().default("Your VIP Aviation Quote is Ready"),
  emailSubjectReceipt: z.string().default("Official Tax Invoice & Payment Receipt"),
  enableEmailReceipts: z.boolean().default(true),

  // WhatsApp Templates
  twilioSmsSender: z.string().default("+18778481232"),
  whatsappBusinessSender: z.string().default("+919876543210"),
  enableWhatsAppOtp: z.boolean().default(true),
  whatsappBookingTemplate: z.string().default("Hello {{name}}, your Shafsky booking {{ref}} has been updated to {{status}}."),

  // Payment Gateway
  activeGatewayMode: z.enum(["live", "sandbox"]).default("live"),
  razorpayKeyId: z.string().default(""),
  stripePublishableKey: z.string().default(""),
  enableRazorpay: z.boolean().default(true),
  enableStripe: z.boolean().default(true),

  // Security
  sessionTimeoutMinutes: z.number().default(60),
  enforce2FA: z.boolean().default(false),
  auditLogRetainDays: z.number().default(90),
});

type SettingsConfig = z.infer<typeof SettingsSchema>;

type SectionTab =
  | "company"
  | "branding"
  | "airports"
  | "services"
  | "pricing"
  | "staff"
  | "email"
  | "whatsapp"
  | "payment"
  | "security";

function CentralizedSettingsView() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSystemSettings);
  const triggerUpdateSettings = useServerFn(updateSystemSettings);
  const fetchEnvStatus = useServerFn(getEnvConnectionStatus);

  const [activeTab, setActiveTab] = useState<SectionTab>("company");
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState<SettingsConfig>({
    businessName: "Shafsky Aviation Services Pvt. Ltd.",
    supportEmail: String(CONTACT.EMAIL),
    contactPhone: String(CONTACT.PHONE),
    hqAddress: "Indira Gandhi International Airport, Terminal 3, New Delhi, India",
    operatingHours: "24/7 Ops Desk",

    platformName: "Shafsky Aviation Services Concierge",
    primaryColor: "#5ed3ff",
    logoUrl: "",
    faviconUrl: "",
    darkModeDefault: true,

    defaultCurrency: "INR",
    defaultGstRate: 18,
    maxDiscountRate: 30,
    sixHourRuleThreshold: 6,

    resendSenderEmail: String(NOTIFICATION.FROM_EMAIL),
    emailSubjectConfirmation: "Booking Confirmed — Shafsky Aviation Services",
    emailSubjectQuote: "Your VIP Aviation Quote is Ready",
    emailSubjectReceipt: "Official Tax Invoice & Payment Receipt",
    enableEmailReceipts: true,

    twilioSmsSender: "+18778481232",
    whatsappBusinessSender: "+919876543210",
    enableWhatsAppOtp: true,
    whatsappBookingTemplate: "Hello {{name}}, your Shafsky booking {{ref}} has been updated to {{status}}.",

    activeGatewayMode: "live",
    razorpayKeyId: "",
    stripePublishableKey: "",
    enableRazorpay: true,
    enableStripe: true,

    sessionTimeoutMinutes: 60,
    enforce2FA: false,
    auditLogRetainDays: 90,
  });

  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["central-settings-keys"],
    queryFn: () => fetchSettings(),
  });

  const { data: envStatus } = useQuery({
    queryKey: ["admin-env-status"],
    queryFn: () => fetchEnvStatus(),
  });

  useEffect(() => {
    if (dbSettings) {
      const centralRow = dbSettings.find((r: any) => r.key === "central_settings") || dbSettings.find((r: any) => r.key === "admin_settings");
      if (centralRow && centralRow.value) {
        const parsed = SettingsSchema.partial().safeParse(centralRow.value);
        if (parsed.success) {
          setConfig((prev) => ({
            ...prev,
            ...parsed.data,
          }));
        }
      }
    }
  }, [dbSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await triggerUpdateSettings({
        data: {
          key: "central_settings",
          value: config,
        },
      });
      // Also sync admin_settings for backward compatibility
      await triggerUpdateSettings({
        data: {
          key: "admin_settings",
          value: config,
        },
      });
      toast.success("Settings & Automation synchronized successfully");
      queryClient.invalidateQueries({ queryKey: ["central-settings-keys"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#5ed3ff]" style={pageMono}>
          Central Command
        </span>
        <h1 className="text-3xl font-bold text-white mt-1" style={pageDisplay}>
          Settings & Automation Center
        </h1>
        <p className="text-xs text-white/50 font-mono mt-1">
          Manage system parameters, branding, gateways, templates & rules without touching code.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-white/10 pb-2 scrollbar-none font-mono text-xs">
        {[
          { id: "company", label: "Company", icon: Building },
          { id: "branding", label: "Branding", icon: Palette },
          { id: "airports", label: "Airports", icon: Plane },
          { id: "services", label: "Services", icon: ConciergeBell },
          { id: "pricing", label: "Pricing", icon: DollarSign },
          { id: "staff", label: "Staff", icon: Users },
          { id: "email", label: "Email", icon: Mail },
          { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
          { id: "payment", label: "Payment Gateway", icon: CreditCard },
          { id: "security", label: "Security", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-[#5ed3ff]/20 text-[#5ed3ff] border border-[#5ed3ff]/30"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: COMPANY PROFILE */}
        {activeTab === "company" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Building className="w-4 h-4 text-[#5ed3ff]" /> Company Profile Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Business Entity Name</label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Support Email</label>
                <input
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Support Phone</label>
                <input
                  type="text"
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Operating Hours</label>
                <input
                  type="text"
                  value={config.operatingHours}
                  onChange={(e) => setConfig({ ...config, operatingHours: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase text-white/40">HQ Address</label>
                <input
                  type="text"
                  value={config.hqAddress}
                  onChange={(e) => setConfig({ ...config, hqAddress: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 2: BRANDING */}
        {activeTab === "branding" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Palette className="w-4 h-4 text-[#5ed3ff]" /> Branding & Aesthetics Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Platform Name</label>
                <input
                  type="text"
                  value={config.platformName}
                  onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Primary Accent Color (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-9 w-12 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Logo URL</label>
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Favicon URL</label>
                <input
                  type="text"
                  value={config.faviconUrl}
                  onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 3: AIRPORTS SHORTCUT */}
        {activeTab === "airports" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Plane className="w-4 h-4 text-[#5ed3ff]" /> Airports Configuration
            </h3>
            <p className="text-xs text-white/60 font-mono">
              Airport hubs, terminals, images, and active toggles are centrally managed in the Airports module.
            </p>
            <Link
              to="/super-admin/airports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5ed3ff] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#4bc0ed] transition"
            >
              Open Airport Management Module <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Panel>
        )}

        {/* SECTION 4: SERVICES SHORTCUT */}
        {activeTab === "services" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <ConciergeBell className="w-4 h-4 text-[#5ed3ff]" /> Services Configuration
            </h3>
            <p className="text-xs text-white/60 font-mono">
              Concierge services, prices, icons, currencies, and availability rules are centrally managed in the Services module.
            </p>
            <Link
              to="/admin/services"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5ed3ff] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#4bc0ed] transition"
            >
              Open Service Management Module <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Panel>
        )}

        {/* SECTION 5: PRICING & LEAD TIME */}
        {activeTab === "pricing" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <DollarSign className="w-4 h-4 text-[#5ed3ff]" /> Pricing & Lead Time Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Default Currency</label>
                <select
                  value={config.defaultCurrency}
                  onChange={(e) => setConfig({ ...config, defaultCurrency: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Default GST / Tax Rate (%)</label>
                <input
                  type="number"
                  value={config.defaultGstRate}
                  onChange={(e) => setConfig({ ...config, defaultGstRate: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Max Allowable Discount (%)</label>
                <input
                  type="number"
                  value={config.maxDiscountRate}
                  onChange={(e) => setConfig({ ...config, maxDiscountRate: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Min Lead Time Threshold (Hours)</label>
                <input
                  type="number"
                  value={config.sixHourRuleThreshold}
                  onChange={(e) => setConfig({ ...config, sixHourRuleThreshold: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 6: STAFF SHORTCUT */}
        {activeTab === "staff" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Users className="w-4 h-4 text-[#5ed3ff]" /> Staff & Roles Settings
            </h3>
            <p className="text-xs text-white/60 font-mono">
              Manage operational staff, station assignments, shift rosters, and permissions in the Staff Management center.
            </p>
            <Link
              to="/admin/staff"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5ed3ff] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#4bc0ed] transition"
            >
              Open Staff Management Module <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Panel>
        )}

        {/* SECTION 7: EMAIL TEMPLATES */}
        {activeTab === "email" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Mail className="w-4 h-4 text-[#5ed3ff]" /> Email Templates & Delivery Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase text-white/40">Resend Sender Email Address</label>
                <input
                  type="email"
                  value={config.resendSenderEmail}
                  onChange={(e) => setConfig({ ...config, resendSenderEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Confirmation Subject</label>
                <input
                  type="text"
                  value={config.emailSubjectConfirmation}
                  onChange={(e) => setConfig({ ...config, emailSubjectConfirmation: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Quote Email Subject</label>
                <input
                  type="text"
                  value={config.emailSubjectQuote}
                  onChange={(e) => setConfig({ ...config, emailSubjectQuote: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 8: WHATSAPP TEMPLATES */}
        {activeTab === "whatsapp" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <MessageSquare className="w-4 h-4 text-[#5ed3ff]" /> WhatsApp & SMS Dispatch Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Twilio SMS Sender Number</label>
                <input
                  type="text"
                  value={config.twilioSmsSender}
                  onChange={(e) => setConfig({ ...config, twilioSmsSender: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">WhatsApp Business Number</label>
                <input
                  type="text"
                  value={config.whatsappBusinessSender}
                  onChange={(e) => setConfig({ ...config, whatsappBusinessSender: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase text-white/40">Booking Update Message Template</label>
                <textarea
                  rows={3}
                  value={config.whatsappBookingTemplate}
                  onChange={(e) => setConfig({ ...config, whatsappBookingTemplate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 9: PAYMENT GATEWAY */}
        {activeTab === "payment" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <CreditCard className="w-4 h-4 text-[#5ed3ff]" /> Payment Gateway Parameters
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Gateway Mode</label>
                <select
                  value={config.activeGatewayMode}
                  onChange={(e) => setConfig({ ...config, activeGatewayMode: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                >
                  <option value="live">Live Production Mode</option>
                  <option value="sandbox">Sandbox / Test Mode</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Razorpay Key ID</label>
                <input
                  type="text"
                  value={config.razorpayKeyId}
                  onChange={(e) => setConfig({ ...config, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase text-white/40">Stripe Publishable Key</label>
                <input
                  type="text"
                  value={config.stripePublishableKey}
                  onChange={(e) => setConfig({ ...config, stripePublishableKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* SECTION 10: SECURITY */}
        {activeTab === "security" && (
          <Panel tone="dark" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <ShieldAlert className="w-4 h-4 text-[#5ed3ff]" /> Security & Governance Policy
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={config.sessionTimeoutMinutes}
                  onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40">Audit Log Retention (Days)</label>
                <input
                  type="number"
                  value={config.auditLogRetainDays}
                  onChange={(e) => setConfig({ ...config, auditLogRetainDays: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#5ed3ff]"
                />
              </div>
            </div>
          </Panel>
        )}

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5ed3ff] hover:bg-[#4bc0ed] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer font-mono"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
