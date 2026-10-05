import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "billing" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function BillingTab({ ctx }: { ctx: any }) {
  const { customerPayments, loadingCustomerPayments, convertQuote } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div>
                    <h2
                      className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                      style={display}
                    >
                      Payment History & Receipts Ledger
                    </h2>
                    <p className="text-xs text-[#5b6b75] font-mono mt-1">
                      Official transaction ledger, payment receipts, and gateway settlements.
                    </p>
                  </div>
                </div>

                {loadingCustomerPayments ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0d5a6e]" />
                  </div>
                ) : customerPayments.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-black/10 rounded-3xl text-xs font-mono text-[#5b6b75]">
                    No payment ledger records found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerPayments.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#5b6b75] uppercase font-bold">
                              Ref: {p.booking_ref}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[8px] font-mono uppercase font-bold rounded ${p.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                  : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"
                                }`}
                            >
                              {p.status}
                            </span>
                            <span className="px-2 py-0.5 text-[8px] font-mono uppercase font-semibold bg-black/5 text-black/60 rounded">
                              {p.provider}
                            </span>
                          </div>

                          <div className="text-base font-bold text-[#0d2a36]" style={display}>
                            Amount: {convertQuote(p.amount, p.currency || "INR")}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-[#5b6b75] pt-1">
                            <div>
                              <span className="text-black/40">Transaction ID: </span>
                              <span className="font-semibold text-black/80">{p.transaction_id}</span>
                            </div>
                            <div>
                              <span className="text-black/40">Route: </span>
                              <span className="font-semibold text-black/80">{p.route}</span>
                            </div>
                            <div>
                              <span className="text-black/40">Date & Time: </span>
                              <span>{new Date(p.transaction_time || p.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (!p.receipt_path) {
                              toast.info("Official receipt PDF is being processed.");
                              return;
                            }
                            try {
                              const { data: sData, error: sErr } = await supabase.storage
                                .from("booking-docs")
                                .createSignedUrl(p.receipt_path, 300);
                              if (sErr || !sData?.signedUrl) throw new Error(sErr?.message || "Failed");
                              window.open(sData.signedUrl, "_blank");
                            } catch (e) {
                              toast.error("Failed to open receipt document");
                            }
                          }}
                          className="px-4 py-2 border border-black/10 hover:bg-black/5 rounded-xl text-[10px] font-bold uppercase tracking-widest shrink-0 cursor-pointer flex items-center gap-1.5 self-start md:self-center"
                          style={mono}
                        >
                          <Download size={13} className="text-[#0d5a6e]" /> Download Receipt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  );
}
