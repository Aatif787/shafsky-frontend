import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "notifications" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function NotificationsTab({ ctx }: { ctx: any }) {
  const { userId, queryClient, notifications, unreadCount, markAllNotificationsRead } = ctx;
  return (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                  <div>
                    <h3
                      className="text-sm font-bold uppercase tracking-wider text-[#0d5a6e]"
                      style={mono}
                    >
                      Operational Alerts & Notifications
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-[#5b6b75] mt-1 font-mono">
                      Realtime flight updates and concierge notifications
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="px-4 py-2 text-[9px] font-bold uppercase tracking-wider bg-[#0d5a6e]/5 hover:bg-[#0d5a6e]/10 text-[#0d5a6e] border border-[#0d5a6e]/10 rounded-xl transition duration-300 cursor-pointer"
                      style={mono}
                    >
                      Mark All Read
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div
                      className="text-center py-16 bg-white border border-black/[0.04] rounded-3xl"
                      style={{
                        boxShadow: "inset 2px 2px 8px #f0ebde, inset -2px -2px 8px #ffffff",
                      }}
                    >
                      <Bell className="h-8 w-8 text-[#5b6b75]/40 mx-auto mb-3" />
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest text-[#5b6b75]"
                        style={mono}
                      >
                        No notifications to display
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => {
                      const isUnread = !notif.read_at;
                      return (
                        <div
                          key={notif.id}
                          className={`p-5 rounded-2xl border transition-all duration-300 ${isUnread
                              ? "bg-[#faf5ea] border-[#0d5a6e]/20"
                              : "bg-[#faf5ea]/50 border-black/[0.04]"
                            }`}
                          style={{
                            boxShadow: isUnread
                              ? "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff"
                              : "none",
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d5a6e] animate-pulse" />
                                )}
                                <h4 className="text-xs font-bold text-[#0d2a36] uppercase tracking-wider">
                                  {notif.title}
                                </h4>
                              </div>
                              {notif.body && (
                                <p className="text-xs text-[#5b6b75] leading-relaxed">
                                  {notif.body}
                                </p>
                              )}
                              <span
                                className="block text-[9px] text-black/40 uppercase tracking-widest mt-1.5"
                                style={mono}
                              >
                                {new Date(notif.created_at).toLocaleString()}
                              </span>
                            </div>

                            {isUnread && (
                              <button
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from("notifications")
                                      .update({ read_at: new Date().toISOString() } as never)
                                      .eq("id", notif.id);
                                    if (error) throw error;
                                    queryClient.invalidateQueries({
                                      queryKey: ["client-notifications", userId],
                                    });
                                    toast.success("Alert dismissed.");
                                  } catch (e) {
                                    console.error(e);
                                    toast.error("Failed to dismiss alert.");
                                  }
                                }}
                                className="text-[9px] font-bold uppercase tracking-wider text-[#0d5a6e] hover:text-[#0d2a36] transition cursor-pointer"
                                style={mono}
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
  );
}
