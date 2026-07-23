import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useBranding } from "@/lib/branding/branding.context";
import { updateBrandingSettings } from "@/lib/branding/branding.service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Globe, Mail, Phone, MapPin, Upload, Sparkles, 
  RefreshCw, CheckCircle, Smartphone, Eye, Layout, Palette
} from "lucide-react";
import { saTheme, saMono, saDisplay } from "@/components/super-admin/SAComponents";

export const Route = createFileRoute("/_authenticated/super-admin/branding")({
  component: SuperAdminBranding,
});

function SuperAdminBranding() {
  const { branding, refetch } = useBranding();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ ...branding });
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    setFormData({ ...branding });
  }, [branding]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, fileKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    // Validate format
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid format. Please upload PNG, JPG, SVG, or WEBP.");
      return;
    }

    const toastId = toast.loading(`Uploading ${fieldName}...`);

    try {
      // Extract file extension
      const extension = file.name.split(".").pop() || "png";
      const filename = `${fileKey}-${Date.now()}.${extension}`;

      const { data, error } = await supabase.storage
        .from("branding")
        .upload(filename, file, { 
          cacheControl: "3600",
          upsert: true 
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("branding")
        .getPublicUrl(filename);

      setFormData((prev) => ({ ...prev, [fieldName]: urlData.publicUrl }));
      toast.success(`${fieldName} uploaded successfully!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving brand settings...");

    try {
      await updateBrandingSettings({ data: formData });
      await refetch();
      toast.success("Branding settings saved successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save settings: ${err.message}`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...branding });
    toast.info("Form values reset to current active branding.");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`${saDisplay} text-3xl font-bold tracking-tight text-white`}>
            Enterprise Branding Console
          </h1>
          <p className="text-sm text-slate-400">
            Configure global brand colors, logos, icons, metadata, and communications details.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 py-2 text-sm font-medium text-slate-950 transition disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="space-y-6 lg:col-span-7">
          {/* Section 1: Company Profile */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layout className="h-5 w-5 text-yellow-500" />
              Company Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Company Tagline</label>
                <input
                  type="text"
                  name="company_tagline"
                  value={formData.company_tagline}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Copyright Text</label>
                <input
                  type="text"
                  name="copyright_text"
                  value={formData.copyright_text}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-yellow-500" />
              Contact & Comms details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Booking Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    name="booking_email"
                    value={formData.booking_email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    name="support_email"
                    value={formData.support_email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Reply-To Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    name="reply_email"
                    value={formData.reply_email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Support Phone</label>
                <input
                  type="text"
                  name="support_phone"
                  value={formData.support_phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Brand Assets Upload */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-yellow-500" />
              Brand Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Logo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Brand Logo (Default/Light)</label>
                <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-slate-850 rounded overflow-hidden">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-medium text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Logo
                    <input
                      type="file"
                      accept=".png,.jpeg,.jpg,.webp,.svg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "logo_url", "logo")}
                    />
                  </label>
                </div>
              </div>

              {/* Logo Dark */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Brand Logo (Dark Theme)</label>
                <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-slate-850 rounded overflow-hidden">
                    {formData.logo_dark_url ? (
                      <img src={formData.logo_dark_url} alt="Dark Logo" className="h-full w-full object-contain" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-medium text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Dark Logo
                    <input
                      type="file"
                      accept=".png,.jpeg,.jpg,.webp,.svg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "logo_dark_url", "logo-dark")}
                    />
                  </label>
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Browser Favicon</label>
                <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-slate-900 border border-slate-850 rounded overflow-hidden">
                    {formData.favicon_url ? (
                      <img src={formData.favicon_url} alt="Favicon" className="h-6 w-6 object-contain" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-medium text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Favicon
                    <input
                      type="file"
                      accept=".png,.jpeg,.jpg,.webp,.svg"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "favicon_url", "favicon")}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Brand Colors */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-yellow-500" />
              Brand Colors (Theming)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleColorChange("primary_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleColorChange("secondary_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleColorChange("accent_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    name="accent_color"
                    value={formData.accent_color}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Social Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Social Media Channels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Facebook Page URL</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Instagram Profile URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Twitter / X URL</label>
                <input
                  type="url"
                  name="twitter_url"
                  value={formData.twitter_url || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Preview Side Pane */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-yellow-500" />
                Live Brand Mockup
              </h2>
              <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewTab("desktop")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${previewTab === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("mobile")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${previewTab === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className={`mx-auto rounded-xl border border-slate-800 bg-slate-950 overflow-hidden transition-all duration-300 shadow-2xl ${previewTab === "mobile" ? "max-w-[280px]" : "w-full"}`}>
              {/* Simulated Browser Bar */}
              <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500/80"></span>
                  <span className="h-2 w-2 rounded-full bg-yellow-500/80"></span>
                  <span className="h-2 w-2 rounded-full bg-green-500/80"></span>
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 text-[10px] text-slate-400 text-center py-0.5 rounded flex items-center justify-center gap-1.5">
                  {formData.favicon_url && (
                    <img src={formData.favicon_url} alt="" className="h-3 w-3 object-contain" />
                  )}
                  {formData.company_name || "Shafsky"} website
                </div>
              </div>

              {/* Simulated Page Content */}
              <div className="p-4 space-y-6">
                {/* Simulated Header Navbar */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="max-h-[30px] w-auto object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-white tracking-wider">
                        {formData.company_name.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="h-1.5 w-6 rounded bg-slate-850"></span>
                    <span className="h-1.5 w-6 rounded bg-slate-850"></span>
                    <span className="h-1.5 w-10 rounded" style={{ backgroundColor: formData.secondary_color || "#c5a059" }}></span>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="text-center py-6 space-y-3">
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: formData.secondary_color || "#c5a059" }}>
                    Suswagatam · Premium Airport Concierge
                  </span>
                  <h3 className="text-md font-bold text-white leading-tight">
                    {formData.company_tagline || "Welcome Begins Before You Land."}
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-[320px] mx-auto">
                    Suswagatam concierge service meets you at the aerobridge and fast-tracks every checkpoint.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-1.5 text-[10px] font-bold text-slate-950 rounded transition"
                      style={{ backgroundColor: formData.secondary_color || "#c5a059" }}
                    >
                      Book Services
                    </button>
                    <button
                      type="button"
                      className="px-4 py-1.5 text-[10px] font-bold text-white border border-slate-800 rounded hover:bg-slate-900"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="rounded-lg border border-slate-900 bg-slate-900/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: formData.primary_color || "#0d2a36" }}>
                      ✓
                    </div>
                    <span className="text-[10px] font-semibold text-white">Contact & Support Desk</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                    <div>📞 {formData.support_phone}</div>
                    <div>✉️ {formData.support_email}</div>
                  </div>
                </div>

                {/* Simulated Footer */}
                <div className="border-t border-slate-900 pt-4 text-center space-y-2">
                  <p className="text-[8px] text-slate-500">
                    {formData.copyright_text || `© 2026 ${formData.company_name}. All Rights Reserved.`}
                  </p>
                  <div className="flex justify-center gap-3 text-[8px] text-slate-500">
                    <span>Address: {formData.business_address}, {formData.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
