import { Trash2, Edit2 } from "lucide-react";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "passengers" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function PassengersTab({ ctx }: { ctx: any }) {
  const { notesData, fullName, psName, setPsName, psNat, setPsNat, psPass, setPsPass, psExp, setPsExp, psType, setPsType, editingPassengerId, setEditingPassengerId, handleAddPassenger, handleEditPassenger, handleDeletePassenger } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Saved Companions & Passengers
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Registered Companions
                    </h3>

                    {!notesData.passengers || notesData.passengers.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-black/10 rounded-2xl text-xs font-mono text-[#5b6b75]">
                        No companions registered.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notesData.passengers.map((p: any) => (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl bg-white border border-black/[0.04] flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#0d2a36]">{p.fullName}</div>
                              <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                                {p.type} | {p.nationality}
                              </div>
                              <div className="text-[9px] text-[#5b6b75] font-mono mt-0.5">
                                Pass: {p.passportNumber} (Exp: {p.passportExpiry || "N/A"})
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEditPassenger(p)}
                                className="p-1.5 text-[#5b6b75] hover:text-[#0d2a36] hover:bg-black/5 rounded cursor-pointer"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeletePassenger(p.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Form */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      {editingPassengerId ? "Modify Companion Details" : "Register Companion"}
                    </h3>
                    <form onSubmit={handleAddPassenger} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={psName}
                          onChange={(e) => setPsName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                            Nationality
                          </label>
                          <input
                            type="text"
                            required
                            value={psNat}
                            onChange={(e) => setPsNat(e.target.value)}
                            placeholder="Indian"
                            className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                            Type
                          </label>
                          <select
                            value={psType}
                            onChange={(e) => setPsType(e.target.value as any)}
                            className="w-full h-10 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                          >
                            <option value="adult">Adult</option>
                            <option value="child">Child</option>
                            <option value="infant">Infant</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            required
                            value={psPass}
                            onChange={(e) => setPsPass(e.target.value)}
                            placeholder="Z1234567"
                            className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={psExp}
                            onChange={(e) => setPsExp(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {editingPassengerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPassengerId(null);
                              setPsName("");
                              setPsNat("");
                              setPsPass("");
                              setPsExp("");
                              setPsType("adult");
                            }}
                            className="flex-1 h-10 border border-black/10 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black/5"
                            style={mono}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-grow h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                          style={mono}
                        >
                          {editingPassengerId ? "Update Companion" : "Save Companion"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
  );
}
