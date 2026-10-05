import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "new-booking" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function NewBookingTab({ ctx }: { ctx: any }) {
  const { setActiveTab, notesData, fullName, bkOrigin, setBkOrigin, bkDest, setBkDest, bkDate, setBkDate, bkService, setBkService, bkAdults, setBkAdults, bkNotes, setBkNotes, bookingSubmitting, bookingSuccess, setBookingSuccess, bookings, handleCreateBooking } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Request Flight Concierge
                </h2>

                {bookingSuccess ? (
                  <div className="text-center py-16 space-y-6">
                    <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0d2a36]" style={display}>
                        Request Dispatched Successfully
                      </h3>
                      <p className="text-xs text-[#5b6b75] mt-1 max-w-sm mx-auto leading-relaxed">
                        Your flight logistics have been logged. An operations officer will reach out
                        with the quote and service coordinator details.
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setBookingSuccess(false);
                          setActiveTab("bookings");
                        }}
                        className="px-4 py-2 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/[0.02]"
                        style={mono}
                      >
                        View Bookings
                      </button>
                      <button
                        onClick={() => setBookingSuccess(false)}
                        className="px-4 py-2 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
                        style={mono}
                      >
                        New Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateBooking} className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                          Origin Airport
                        </label>
                        <input
                          type="text"
                          required
                          value={bkOrigin}
                          onChange={(e) => setBkOrigin(e.target.value)}
                          placeholder="DEL (Indira Gandhi Int'l)"
                          className="w-full h-11 px-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                          Destination Airport
                        </label>
                        <input
                          type="text"
                          required
                          value={bkDest}
                          onChange={(e) => setBkDest(e.target.value)}
                          placeholder="LHR (London Heathrow)"
                          className="w-full h-11 px-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                          Departure Date
                        </label>
                        <input
                          type="date"
                          required
                          value={bkDate}
                          onChange={(e) => setBkDate(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                          Adult Guests
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={bkAdults}
                          onChange={(e) => setBkAdults(parseInt(e.target.value))}
                          className="w-full h-11 px-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                          Service Tier
                        </label>
                        <select
                          value={bkService}
                          onChange={(e) => setBkService(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e]"
                        >
                          <option value="Meet & Greet Concierge">Meet & Greet Concierge</option>
                          <option value="Fast-Track Security">Fast-Track Security</option>
                          <option value="First Class Lounge Access">
                            First Class Lounge Access
                          </option>
                          <option value="Luxury Tarmac Transfer">Luxury Tarmac Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#5b6b75] font-bold font-mono">
                        Special Directives & Requests
                      </label>
                      <textarea
                        value={bkNotes}
                        onChange={(e) => setBkNotes(e.target.value)}
                        placeholder="Specify luggage counts, gate wheelchair requirements, infant dietary specifications, etc."
                        className="w-full h-24 p-4 rounded-xl border border-black/10 bg-transparent text-xs font-semibold outline-none transition focus:border-[#0d5a6e] resize-none"
                      />
                    </div>

                    {/* Pre-fill from saved passengers helper */}
                    {notesData.passengers && notesData.passengers.length > 0 && (
                      <div className="p-4 bg-black/[0.01] border border-black/[0.04] rounded-2xl space-y-2">
                        <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono font-semibold">
                          Quick Select Companion
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {notesData.passengers.map((p: any) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setBkNotes(
                                  (prev: any) =>
                                    (prev ? prev + "\n" : "") +
                                    `Companions: ${p.fullName} (${p.passportNumber})`,
                                );
                                toast.info(`Added companion details to requests.`);
                              }}
                              className="px-2.5 py-1 text-[9px] font-mono border border-black/10 hover:bg-black/5 rounded"
                            >
                              + {p.fullName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full h-11 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-[11px] font-bold uppercase tracking-[0.25em] rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                      style={mono}
                    >
                      {bookingSubmitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" /> Dispatching Request...
                        </>
                      ) : (
                        "Dispatch Flight Request"
                      )}
                    </button>
                  </form>
                )}
              </div>
  );
}
