import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "support" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function SupportTab({ ctx }: { ctx: any }) {
  const { notesData, tkSub, setTkSub, tkPriority, setTkPriority, tkMsg, setTkMsg, ticketSubmitting, handleCreateTicket } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Operations Support Desk
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create ticket */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4 lg:col-span-1"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Open Support Ticket
                    </h3>

                    <form onSubmit={handleCreateTicket} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Subject
                        </label>
                        <input
                          type="text"
                          required
                          value={tkSub}
                          onChange={(e) => setTkSub(e.target.value)}
                          placeholder="Urgent baggage issue at Gate"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Priority
                        </label>
                        <select
                          value={tkPriority}
                          onChange={(e) => setTkPriority(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High (Urgent)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Description
                        </label>
                        <textarea
                          required
                          value={tkMsg}
                          onChange={(e) => setTkMsg(e.target.value)}
                          placeholder="Please detail your request..."
                          className="w-full h-24 p-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        style={mono}
                      >
                        Submit Ticket
                      </button>
                    </form>
                  </div>

                  {/* Tickets List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Open Operations Tickets
                    </h3>

                    {!notesData.tickets || notesData.tickets.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-black/10 rounded-3xl text-xs font-mono text-[#5b6b75]">
                        No active support tickets. Need help? Open a ticket on the left.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notesData.tickets.map((t: any) => (
                          <div
                            key={t.id}
                            className="p-5 rounded-xl bg-white border border-black/[0.04] space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] font-mono text-[#5b6b75] bg-black/5 px-2 py-0.5 rounded mr-2">
                                  {t.id}
                                </span>
                                <span
                                  className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono ${t.priority === "high"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-black/5 text-[#5b6b75]"
                                    }`}
                                >
                                  {t.priority}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono font-bold uppercase text-[#0d5a6e]">
                                {t.status}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-[#0d2a36]">{t.subject}</div>
                            <p className="text-[11px] text-[#5b6b75] leading-relaxed">
                              "{t.message}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
  );
}
