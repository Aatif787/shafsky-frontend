import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {
  PhoneCall,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  Car,
  Hotel as HotelIcon,
  Plane,
  Ticket,
  Headphones,
} from "lucide-react";
import { toast } from "sonner";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  getAdminContactSettings,
  updateAdminContactSettings,
  CANONICAL_SERVICES,
  ServiceKey,
  ServiceContactConfig,
  ContactSettingsUpdateRequest,
} from "@/lib/contact-settings";
import { PUBLIC_CONTACTS_QUERY_KEY } from "@/hooks/useWebsiteContacts";

export const Route = createFileRoute("/_authenticated/admin/contact-settings")({
  component: WebsiteContactSettingsAdminView,
});

const POPULAR_COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+61", label: "Australia (+61)" },
];

const SERVICE_ICONS: Record<ServiceKey, any> = {
  meet_greet_lounge: Sparkles,
  transport: Car,
  hotel: HotelIcon,
  private_charter: Plane,
  ticketing: Ticket,
  contact: Headphones,
};

interface LocalSlotState {
  slot_index: number;
  country_code: string;
  phone_number: string;
  is_active: boolean;
}

interface LocalServiceState {
  service_key: ServiceKey;
  service_name: string;
  slots: [LocalSlotState, LocalSlotState];
}

function WebsiteContactSettingsAdminView() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: remoteServices,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-contact-settings"],
    queryFn: getAdminContactSettings,
    staleTime: 10 * 1000,
  });

  // Local draft state for editing
  const [formState, setFormState] = useState<Record<ServiceKey, LocalServiceState>>(() => {
    const initial: Record<string, LocalServiceState> = {};
    for (const s of CANONICAL_SERVICES) {
      initial[s.key] = {
        service_key: s.key,
        service_name: s.name,
        slots: [
          { slot_index: 1, country_code: "+91", phone_number: "", is_active: true },
          { slot_index: 2, country_code: "+91", phone_number: "", is_active: true },
        ],
      };
    }
    return initial as Record<ServiceKey, LocalServiceState>;
  });

  // Synchronize remote data into local state when fetched
  useEffect(() => {
    if (!remoteServices || remoteServices.length === 0) return;

    setFormState((prev) => {
      const next = { ...prev };
      for (const s of remoteServices) {
        const slot1 = s.slots.find((slot) => slot.slot_index === 1);
        const slot2 = s.slots.find((slot) => slot.slot_index === 2);

        next[s.service_key] = {
          service_key: s.service_key,
          service_name: s.service_name,
          slots: [
            {
              slot_index: 1,
              country_code: slot1?.country_code || "+91",
              phone_number: slot1?.phone_number || "",
              is_active: slot1?.is_active ?? true,
            },
            {
              slot_index: 2,
              country_code: slot2?.country_code || "+91",
              phone_number: slot2?.phone_number || "",
              is_active: slot2?.is_active ?? true,
            },
          ],
        };
      }
      return next;
    });
  }, [remoteServices]);

  // Compute dirty (unsaved) status
  const hasUnsavedChanges = useMemo(() => {
    if (!remoteServices) return false;
    for (const s of remoteServices) {
      const current = formState[s.service_key];
      if (!current) continue;
      const remoteSlot1 = s.slots.find((slot) => slot.slot_index === 1);
      const remoteSlot2 = s.slots.find((slot) => slot.slot_index === 2);

      const s1Changed =
        (current.slots[0].phone_number || "") !== (remoteSlot1?.phone_number || "") ||
        (current.slots[0].country_code || "+91") !== (remoteSlot1?.country_code || "+91") ||
        current.slots[0].is_active !== (remoteSlot1?.is_active ?? true);

      const s2Changed =
        (current.slots[1].phone_number || "") !== (remoteSlot2?.phone_number || "") ||
        (current.slots[1].country_code || "+91") !== (remoteSlot2?.country_code || "+91") ||
        current.slots[1].is_active !== (remoteSlot2?.is_active ?? true);

      if (s1Changed || s2Changed) return true;
    }
    return false;
  }, [remoteServices, formState]);

  // Field change handler
  const handleSlotChange = (
    serviceKey: ServiceKey,
    slotIndex: 1 | 2,
    field: "country_code" | "phone_number" | "is_active",
    val: any
  ) => {
    setSaveSuccess(false);
    setSaveError(null);
    setFormState((prev) => {
      const service = prev[serviceKey];
      if (!service) return prev;
      const slotIdx = slotIndex - 1;
      const updatedSlots = [...service.slots] as [LocalSlotState, LocalSlotState];
      updatedSlots[slotIdx] = {
        ...updatedSlots[slotIdx],
        [field]: val,
      };
      return {
        ...prev,
        [serviceKey]: {
          ...service,
          slots: updatedSlots,
        },
      };
    });
  };

  // Clear a specific slot
  const handleClearSlot = (serviceKey: ServiceKey, slotIndex: 1 | 2) => {
    setSaveSuccess(false);
    setSaveError(null);
    setFormState((prev) => {
      const service = prev[serviceKey];
      if (!service) return prev;
      const slotIdx = slotIndex - 1;
      const updatedSlots = [...service.slots] as [LocalSlotState, LocalSlotState];
      updatedSlots[slotIdx] = {
        ...updatedSlots[slotIdx],
        phone_number: "",
        country_code: "+91",
        is_active: true,
      };
      return {
        ...prev,
        [serviceKey]: {
          ...service,
          slots: updatedSlots,
        },
      };
    });
    toast.info(`Slot ${slotIndex} cleared for ${CANONICAL_SERVICES.find((s) => s.key === serviceKey)?.name}. Save to publish.`);
  };

  // Reset all to remote
  const handleReset = () => {
    if (!remoteServices) return;
    refetch();
    toast.info("Contact settings restored to saved values.");
  };

  // Validation
  const validateForm = (): string | null => {
    for (const s of CANONICAL_SERVICES) {
      const state = formState[s.key];
      if (!state) continue;
      for (const slot of state.slots) {
        const phone = (slot.phone_number || "").trim();
        if (phone) {
          const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
          if (!/^\d{5,15}$/.test(cleaned)) {
            return `${s.name} (Slot ${slot.slot_index}): Phone number must have 5 to 15 digits.`;
          }
          const cc = (slot.country_code || "").trim();
          if (cc && !/^\+[1-9]\d{0,3}$/.test(cc)) {
            return `${s.name} (Slot ${slot.slot_index}): Country code must start with '+' followed by 1 to 4 digits (e.g. +91).`;
          }
        }
      }
    }
    return null;
  };

  // Save changes
  const handleSaveAll = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload: ContactSettingsUpdateRequest = {
        services: Object.values(formState).map((service) => ({
          service_key: service.service_key,
          slots: service.slots.map((slot) => ({
            slot_index: slot.slot_index,
            country_code: slot.country_code.trim() || "+91",
            phone_number: slot.phone_number.trim(),
            is_active: slot.is_active,
          })),
        })),
      };

      const updated = await updateAdminContactSettings(payload);

      // Invalidate both admin and public queries so active tabs and public pages update instantly
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      await queryClient.invalidateQueries({ queryKey: PUBLIC_CONTACTS_QUERY_KEY });

      setSaveSuccess(true);
      toast.success("Website contact numbers updated successfully! Public website updated.");
    } catch (err: any) {
      const msg = err?.message || "Failed to save contact settings. Please try again.";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-8 h-8 text-[#5ed3ff] animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-white/60 font-mono">
          Loading Website Contact Settings...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-white">
        <Panel tone="dark" className="p-8 border border-red-500/30 bg-red-500/5 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold font-mono text-red-300">Failed to Load Contact Settings</h2>
          <p className="text-xs text-white/60">
            {(error as any)?.message || "A network or database error occurred while fetching settings."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white rounded-lg transition"
          >
            Retry Loading
          </button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & GLOBAL ACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5ed3ff]/10 border border-[#5ed3ff]/30 text-[#5ed3ff] text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <PhoneCall size={12} />
            <span>Website Contact Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={pageDisplay}>
            Service Contact Management.
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl mt-1 leading-relaxed">
            Manage two independently configured phone numbers for each of the six public services. Changes persist to PostgreSQL and reflect on the public website immediately without redeployment.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving || !hasUnsavedChanges}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-mono text-white/80 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Discard</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5ed3ff] hover:bg-[#3bc4f8] active:scale-95 text-slate-950 text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#5ed3ff]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={15} className="shrink-0 text-amber-400" />
            <span>You have unsaved changes. Click &quot;Save All Changes&quot; to publish to the public website.</span>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="underline hover:text-white font-bold shrink-0 cursor-pointer"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs font-mono">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span>All service contact settings successfully saved and published! Public website updated.</span>
        </div>
      )}

      {/* Error Banner */}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-mono">
          <AlertTriangle size={16} className="shrink-0 text-red-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. THE SIX SERVICE CONTACT CARDS (2 SLOTS EACH)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CANONICAL_SERVICES.map((serviceDef) => {
          const serviceState = formState[serviceDef.key];
          const Icon = SERVICE_ICONS[serviceDef.key] || PhoneCall;
          const slots = serviceState?.slots || [
            { slot_index: 1, country_code: "+91", phone_number: "", is_active: true },
            { slot_index: 2, country_code: "+91", phone_number: "", is_active: true },
          ];

          return (
            <Panel
              key={serviceDef.key}
              tone="dark"
              className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#0B101B]/80 backdrop-blur-md space-y-5 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 flex items-center justify-center text-[#5ed3ff]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight" style={pageDisplay}>
                        {serviceDef.name}
                      </h2>
                      <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase">
                        Key: {serviceDef.key}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                    2 Slots
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {serviceDef.description}
                </p>
              </div>

              {/* Both Slots Form */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                {([1, 2] as const).map((slotIdx) => {
                  const slot = slots[slotIdx - 1];
                  const hasNumber = Boolean(slot.phone_number?.trim());
                  const fullFormatted = hasNumber
                    ? `${slot.country_code || "+91"} ${slot.phone_number.trim()}`
                    : "Not Configured (Hidden on Website)";

                  return (
                    <div
                      key={slotIdx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-3"
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#5ed3ff]/80 inline-block" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">
                            Phone Number {slotIdx}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasNumber ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 size={10} />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                              Empty / Hidden
                            </span>
                          )}

                          {hasNumber && (
                            <button
                              type="button"
                              onClick={() => handleClearSlot(serviceDef.key, slotIdx)}
                              className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
                              title="Clear this slot"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inputs: Country Code + Subscriber Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        {/* Country Code */}
                        <div className="sm:col-span-5 relative">
                          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
                            Country Code
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={slot.country_code}
                              placeholder="+91"
                              onChange={(e) =>
                                handleSlotChange(serviceDef.key, slotIdx, "country_code", e.target.value)
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-[#5ed3ff] rounded-lg text-xs font-mono text-white placeholder-white/30 focus:outline-hidden transition"
                            />
                            {/* Quick Selector Dropdown helper */}
                            <select
                              aria-label="Popular Country Codes"
                              value={POPULAR_COUNTRY_CODES.some((p) => p.code === slot.country_code) ? slot.country_code : ""}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleSlotChange(serviceDef.key, slotIdx, "country_code", e.target.value);
                                }
                              }}
                              className="absolute right-1 top-1 bottom-1 bg-transparent text-white/40 hover:text-white text-[11px] font-mono border-0 focus:outline-hidden cursor-pointer"
                            >
                              <option value="" disabled className="bg-slate-900 text-white/50">
                                Popular
                              </option>
                              {POPULAR_COUNTRY_CODES.map((p) => (
                                <option key={p.code} value={p.code} className="bg-slate-900 text-white">
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Phone Number Input */}
                        <div className="sm:col-span-7">
                          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1">
                            Subscriber Number
                          </label>
                          <input
                            type="text"
                            value={slot.phone_number}
                            placeholder="e.g. 9599087959"
                            onChange={(e) =>
                              handleSlotChange(serviceDef.key, slotIdx, "phone_number", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-[#5ed3ff] rounded-lg text-xs font-mono text-white placeholder-white/30 focus:outline-hidden transition"
                          />
                        </div>
                      </div>

                      {/* Live Preview / Tel Link */}
                      <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono text-white/50">
                        <span className="truncate">
                          Live: <span className={hasNumber ? "text-white font-semibold" : "text-white/40 italic"}>{fullFormatted}</span>
                        </span>

                        {hasNumber && (
                          <a
                            href={`tel:${(slot.country_code || "+91") + slot.phone_number.replace(/\D/g, "")}`}
                            className="inline-flex items-center gap-1 text-[#5ed3ff] hover:underline shrink-0"
                            title="Test tel: link"
                          >
                            <span>Test tel:</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick service-level save */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
                <span>Active Slots: {slots.filter((s) => Boolean(s.phone_number?.trim())).length} / 2</span>
                <span className="text-[11px] text-white/40">Updates instantly on save</span>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-[#5ed3ff] shrink-0" />
          <p className="text-xs text-white/70 leading-snug">
            All updates are authenticated and transactionally committed. When a slot is cleared, it is immediately hidden on the website so visitors never see broken buttons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5ed3ff] hover:bg-[#3bc4f8] active:scale-95 text-slate-950 text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#5ed3ff]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
