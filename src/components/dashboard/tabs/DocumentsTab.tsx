import { Trash2, Upload } from "lucide-react";
import { display, mono } from "@/components/dashboard/theme";

/** Dashboard "documents" tab. Shared state and handlers come from DashboardView via `ctx`. */
export default function DocumentsTab({ ctx }: { ctx: any }) {
  const { notesData, docType, setDocType, docName, setDocName, docSubmitting, fileNameDisplay, handleFileSelect, handleUploadDocument, handleDeleteDocument } = ctx;
  return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Secure Document Locker
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload document */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4 lg:col-span-1"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Register Document
                    </h3>

                    <form onSubmit={handleUploadDocument} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Document Name
                        </label>
                        <input
                          type="text"
                          required
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="Aariz Passport Page 1"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Category
                        </label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as any)}
                          className="w-full h-10 px-3 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        >
                          <option value="passport">Passport Copy</option>
                          <option value="visa">Visa Copy</option>
                          <option value="id_proof">ID Proof</option>
                        </select>
                      </div>

                      <div className="relative border border-dashed border-black/15 p-4 rounded-xl text-center space-y-2 hover:bg-black/[0.01] transition cursor-pointer">
                        <Upload className="h-6 w-6 text-[#5b6b75] mx-auto opacity-60" />
                        <div className="text-[9px] font-mono uppercase tracking-wider text-[#5b6b75]">
                          {fileNameDisplay
                            ? `Selected: ${fileNameDisplay}`
                            : "Click to select a file copy"}
                        </div>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={docSubmitting}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        style={mono}
                      >
                        Secure Save
                      </button>
                    </form>
                  </div>

                  {/* Documents List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Uploaded Certificates
                    </h3>

                    {!notesData.documents || notesData.documents.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-black/10 rounded-3xl text-xs font-mono text-[#5b6b75]">
                        Locker empty. Upload documents for faster boarding processing.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notesData.documents.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-4 rounded-xl bg-white border border-black/[0.04] space-y-3"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="text-xs font-bold text-[#0d2a36] truncate max-w-[150px]">
                                  {d.name}
                                </div>
                                <div className="text-[8px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                                  {d.type}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteDocument(d.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="pt-2 border-t border-black/[0.03] flex justify-between items-center text-[9px] font-mono text-[#5b6b75]">
                              <span>ID: {d.id}</span>
                              <span>Added: {d.uploaded_at}</span>
                            </div>
                            {(d as any).fileData && (
                              <div className="pt-1.5 text-right">
                                <a
                                  href={(d as any).fileData}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-bold uppercase tracking-widest text-[#0d5a6e] hover:underline"
                                >
                                  View Document Copy
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
  );
}
