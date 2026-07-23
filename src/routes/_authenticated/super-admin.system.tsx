import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listFeatureFlags, toggleFeatureFlag } from "@/lib/super-admin.functions";
import { SAPageHeader, saMono, saTheme } from "@/components/super-admin/SAComponents";
import { Cpu, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/system")({
  component: SystemPage,
});

function SystemPage() {
  const queryClient = useQueryClient();
  const fetchFlags = useServerFn(listFeatureFlags);
  const execToggleFlag = useServerFn(toggleFeatureFlag);

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["sa-feature-flags"],
    queryFn: () => fetchFlags(),
    staleTime: 30000,
  });

  const handleToggle = async (id: string, is_enabled: boolean) => {
    try {
      await execToggleFlag({ data: { id, is_enabled } });
      toast.success(`Feature ${is_enabled ? "enabled" : "disabled"}`);
      queryClient.invalidateQueries({ queryKey: ["sa-feature-flags"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update feature flag");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="System Settings"
        subtitle="Configure feature flags, integrations, and messaging templates"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "System" }]}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feature Flags Section */}
        <div
          className="border border-white/[0.04] rounded-lg p-5 space-y-4"
          style={{ background: saTheme.panel }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4.5 w-4.5 text-[#a78bfa]" />
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider" style={saMono}>
              Feature Toggles (Flags)
            </h3>
          </div>

          {isLoading ? (
            <div className="text-xs text-white/30" style={saMono}>
              Loading toggles...
            </div>
          ) : flags.length === 0 ? (
            <div className="text-xs text-white/35" style={saMono}>
              No system flags initialized.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03] space-y-3">
              {flags.map((flag: any) => (
                <div
                  key={flag.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-white/85 font-mono" style={saMono}>
                      {flag.id}
                    </span>
                    {flag.description && (
                      <p className="text-[10px] text-white/35 mt-0.5">{flag.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggle(flag.id, !flag.is_enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      flag.is_enabled ? "bg-[#a78bfa]" : "bg-white/[0.08]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.is_enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messaging Templates */}
        <div
          className="border border-white/[0.04] rounded-lg p-5 space-y-4"
          style={{ background: saTheme.panel }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4.5 w-4.5 text-[#a78bfa]" />
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider" style={saMono}>
              Notification Templates Preview
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Charter Quoted Email",
                channel: "Email",
                preview:
                  "Subject: Shaftsky Aviation — Charter Quote Generated for booking Ref {{booking_ref}}",
                icon: Mail,
              },
              {
                title: "Booking Confirmation WhatsApp",
                channel: "WhatsApp",
                preview:
                  "Hello {{name}}, your premium charter is confirmed for flight from {{origin}} to {{destination}}.",
                icon: MessageSquare,
              },
              {
                title: "Tarmac Gate Escort Update",
                channel: "Push / SMS",
                preview: "Your airport concierge is ready at Terminal {{terminal}} entrance.",
                icon: MessageSquare,
              },
            ].map((tmpl) => (
              <div key={`tmpl-${tmpl.title}`} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white/80" style={saMono}>
                    {tmpl.title}
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 font-semibold"
                    style={saMono}
                  >
                    {tmpl.channel}
                  </span>
                </div>
                <div className="text-[10px] text-white/35 font-mono leading-relaxed" style={saMono}>
                  {tmpl.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
