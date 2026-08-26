import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { listSystemSettings, upsertSystemSetting } from "@/lib/super-admin.functions";
import { SAPageHeader, saMono, saTheme } from "@/components/super-admin/SAComponents";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(listSystemSettings);
  const execUpsertSetting = useServerFn(upsertSystemSetting);

  const [platformName, setPlatformName] = useState("Shafsky Aviation Services");
  const [supportEmail, setSupportEmail] = useState("concierge@shafsky.com");
  const [sessionTimeout, setSessionTimeout] = useState("3600");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["sa-system-settings"],
    queryFn: () => fetchSettings(),
    staleTime: 30000,
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const nameSet = settings.find((s: any) => s.key === "platform_name");
      const emailSet = settings.find((s: any) => s.key === "support_email");
      const timeoutSet = settings.find((s: any) => s.key === "session_timeout");

      if (nameSet) setPlatformName(String(nameSet.value));
      if (emailSet) setSupportEmail(String(emailSet.value));
      if (timeoutSet) setSessionTimeout(String(timeoutSet.value));
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await execUpsertSetting({ data: { key: "platform_name", value: platformName } });
      await execUpsertSetting({ data: { key: "support_email", value: supportEmail } });
      await execUpsertSetting({
        data: { key: "session_timeout", value: parseInt(sessionTimeout) || 3600 },
      });
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["sa-system-settings"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Platform Settings"
        subtitle="Global platform branding, contact parameters, and token configuration"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Settings" }]}
      />

      <form
        onSubmit={handleSave}
        className="max-w-2xl border border-white/[0.04] rounded-lg p-6 space-y-6"
        style={{ background: saTheme.panel }}
      >
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.03]">
          <Settings className="h-4.5 w-4.5 text-[#a78bfa]" />
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider" style={saMono}>
            Platform Settings Parameters
          </h3>
        </div>

        {isLoading ? (
          <div className="text-xs text-white/30" style={saMono}>
            Loading config...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block"
                style={saMono}
              >
                Platform Branding Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>

            <div>
              <label
                className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block"
                style={saMono}
              >
                Primary Support Contact Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>

            <div>
              <label
                className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block"
                style={saMono}
              >
                Session Expiry Timeout (seconds)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.08] rounded-md text-xs text-white/80 outline-none focus:border-[#a78bfa]/30 transition"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/[0.03] flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#a78bfa] hover:bg-[#9672f5] disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition cursor-pointer"
            style={saMono}
          >
            <Save className="h-3.5 w-3.5" />
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
