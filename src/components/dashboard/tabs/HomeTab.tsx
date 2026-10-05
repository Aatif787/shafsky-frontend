import { Bell } from "lucide-react";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "home" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function HomeTab({ ctx }: { ctx: any }) {
  const { setActiveTab, fullName, bookings, totalBookings, pendingBookings, completedBookings, confirmedBookings, profileCompletion } = ctx;
  return (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Welcome section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#0d2a36] to-[#0a4252] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 rounded-full bg-white/[0.03] pointer-events-none" />
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider" style={display}>
                      Welcome back, {fullName || "Guest User"}!
                    </h2>
                    <p className="text-[11px] text-white/60 tracking-wider uppercase font-mono mt-1">
                      Cleared for operations console | Member tier: Gold
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("new-booking")}
                    className="bg-[#5fb5ad] text-[#0d2a36] hover:bg-[#4ea8a0] transition-colors rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest active:scale-95 shadow-md"
                    style={mono}
                  >
                    Request Flight →
                  </button>
                </div>

                {/* Main stats block */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Bookings", val: totalBookings, color: "#0d5a6e" },
                    { label: "Confirmed Flights", val: confirmedBookings, color: "#5fb5ad" },
                    { label: "Pending Reviews", val: pendingBookings, color: "#d97706" },
                    { label: "Completed Journeys", val: completedBookings, color: "#10b981" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-5 rounded-2xl bg-[#faf5ea] border border-white/50 text-left transition duration-300"
                      style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#5b6b75] font-mono">
                        {stat.label}
                      </div>
                      <div className="text-3xl font-bold text-[#0d2a36] mt-2" style={display}>
                        {stat.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Completion */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                        Profile Completion Meter
                      </h3>
                      <span className="text-[11px] font-bold font-mono text-[#0d5a6e]">
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0d5a6e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#5b6b75] leading-relaxed">
                      Complete passport information and companion listings to reach 100% and access
                      fast-track checkout capabilities.
                    </p>
                  </div>

                  {/* System Announcement */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-3 flex items-start gap-4"
                    style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                        Operations Update
                      </h3>
                      <p className="text-xs text-[#0d2a36] font-semibold mt-1">
                        New VIP Lounge Open at New Delhi (DEL)
                      </p>
                      <p className="text-[10px] text-[#5b6b75] leading-relaxed mt-1">
                        Shafsky clients now possess automated elite access credentials to the
                        private rest suite at DEL airport. No reservation required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications & Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#0d2a36]">
                    Recent Activity Timeline
                  </h3>
                  <div className="rounded-2xl border border-black/[0.04] p-5 space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[#5b6b75] font-mono">
                        No recent operations or activities logged.
                      </div>
                    ) : (
                      bookings.slice(0, 3).map((b: any) => (
                        <div key={b.id} className="flex gap-4 items-start text-left">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0d5a6e] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0d2a36]">
                              Flight {b.booking_ref} requested: {b.origin} → {b.destination}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                              Status: {b.status} | Date: {b.depart_date}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
  );
}
