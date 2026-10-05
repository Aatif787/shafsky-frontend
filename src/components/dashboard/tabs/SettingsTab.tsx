import { Settings } from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "settings" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function SettingsTab({ ctx }: { ctx: any }) {
  const { notesData, fullName, setFullName, phone, setPhone, company, setCompany, savingProfile, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword, updatingPassword, saveNotesToDB, handleSaveProfile, handleChangePassword, accountFields } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Account & Console Settings
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Profile */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Account
                    </h3>
                    <dl className="space-y-2">
                      {accountFields.map((field: any) => (
                        <div key={field.label} className="flex items-baseline justify-between gap-3">
                          <dt className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold shrink-0">
                            {field.label}
                          </dt>
                          <dd className="text-xs font-semibold text-[#0d2a36] text-right truncate">
                            {field.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Update Profile Information
                    </h3>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 99999 99999"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Company / Corporate Affiliation
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Shafsky Aviation Services Pvt Ltd"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        style={mono}
                      >
                        {savingProfile ? "Syncing..." : "Sync Profile Changes"}
                      </button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Update Security Credentials
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                        style={mono}
                      >
                        {updatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>

                  {/* Preferences settings */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Console Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-black/[0.04]">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">Preferred Currency</div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Quote conversions
                          </div>
                        </div>
                        <select
                          value={notesData.currency || "INR"}
                          onChange={(e) =>
                            saveNotesToDB({ ...notesData, currency: e.target.value })
                          }
                          className="h-9 px-2.5 rounded border border-black/10 bg-transparent text-xs outline-none font-semibold"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-black/[0.04]">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">Visual Theme</div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Light or dark presentation
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newMode = !notesData.dark_mode;
                            saveNotesToDB({ ...notesData, dark_mode: newMode });
                            toast.info(`Theme set to ${newMode ? "Dark" : "Light"} mode.`);
                          }}
                          className="px-3 py-1.5 border border-black/10 rounded text-[9px] font-bold uppercase tracking-wider font-mono hover:bg-black/5"
                        >
                          {notesData.dark_mode ? "Dark Mode" : "Light Mode"}
                        </button>
                      </div>

                      <div className="flex justify-between items-center pb-3">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">
                            Two-Factor Authorization
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Security code validation
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Simulated / Off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  );
}
