import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { listAllCustomers, listCustomerAuditLogs } from "@/lib/bookings.functions";
import {
  getCustomer360,
  updateCustomer360,
  getCustomerTimeline,
  getCustomerMetrics,
  getCustomerPayments,
  getCustomerDocuments,
  uploadCustomerDocument,
  listSupportTickets,
  addTicketMessage,
  updateTicketStatus,
  listTicketMessages,
  listCustomerNotes,
  createCustomerNote,
  listCommunicationHistory,
  retryCommunication,
} from "@/lib/crm.functions";
import { toast } from "sonner";
import { z } from "zod";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Loader2,
  AlertTriangle,
  Search,
  User,
  Plane,
  Mail,
  History,
  FileText,
  CreditCard,
  Headphones,
  Bookmark,
  Gift,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  buildAllCustomersList,
  CustomerTimelineTab,
  CustomerBookingsTab,
  CustomerBillingTab,
  CustomerDocumentsTab,
  CustomerSupportTab,
  CustomerNotesTab,
  CustomerLoyaltyTab,
  CustomerCommsTab,
  type CustomerProfileRow,
  type CustomerBookingRow,
  type CrmTabId,
} from "@/components/admin/customers/CustomerAdminParts";

export { type CustomerProfileRow, type CustomerBookingRow, type CrmTabId };

export const Route = createFileRoute("/_authenticated/admin/customers")({
  validateSearch: (search) =>
    z
      .object({
        search: z.string().optional(),
        selectedId: z.string().optional(),
      })
      .parse(search),
  component: CustomersManagerView,
});

function CustomersManagerView() {
  const { search, selectedId } = Route.useSearch();
  const fetchCustomers = useServerFn(listAllCustomers);
  const _triggerCustomerAudits = useServerFn(listCustomerAuditLogs);

  // CRM Server Functions
  const runGetCustomer360 = useServerFn(getCustomer360);
  const runUpdateCustomer360 = useServerFn(updateCustomer360);
  const runGetCustomerTimeline = useServerFn(getCustomerTimeline);
  const runGetCustomerMetrics = useServerFn(getCustomerMetrics);
  const runGetCustomerPayments = useServerFn(getCustomerPayments);
  const runGetCustomerDocuments = useServerFn(getCustomerDocuments);
  const runUploadDocument = useServerFn(uploadCustomerDocument);
  const runListTickets = useServerFn(listSupportTickets);
  const runAddTicketMessage = useServerFn(addTicketMessage);
  const runUpdateTicketStatus = useServerFn(updateTicketStatus);
  const runListTicketMessages = useServerFn(listTicketMessages);
  const runListNotes = useServerFn(listCustomerNotes);
  const runCreateNote = useServerFn(createCustomerNote);
  const runListComms = useServerFn(listCommunicationHistory);
  const runRetryComm = useServerFn(retryCommunication);

  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(search || "");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(selectedId || null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // CRM Tab State
  const [crmTab, setCrmTab] = useState<CrmTabId>("dossier");

  // Support thread state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [_ticketAssigneeId, _setTicketAssigneeId] = useState("");

  // Customer Note Form state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"private" | "important" | "vip" | "preference">(
    "private",
  );

  // Profile Edit Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Document Upload Form
  const [uploadKind, setUploadKind] = useState("passport");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadBase64, setUploadBase64] = useState("");

  const {
    data: customerData,
    isLoading,
    error,
  } = useQuery<{ profiles: CustomerProfileRow[]; bookings: CustomerBookingRow[] }>({
    queryKey: ["admin-customers"],
    queryFn: async () =>
      (await fetchCustomers()) as {
        profiles: CustomerProfileRow[];
        bookings: CustomerBookingRow[];
      },
  });

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  // Build customer list (distinct profiles & guest contacts) safely
  const profiles = customerData?.profiles || [];
  const bookings = customerData?.bookings || [];
  const allCustomers = buildAllCustomersList(profiles, bookings);

  // Filtering
  const filtered = allCustomers.filter((c) => {
    const q = debouncedQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q)
    );
  });

  const selectedCustomer = allCustomers.find((c) => c.id === selectedCustomerId) || allCustomers[0];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CRM Queries
  const { data: customer360, refetch: refetch360 } = useQuery({
    queryKey: ["crm-360", selectedCustomer?.id],
    queryFn: () => runGetCustomer360({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: timeline } = useQuery({
    queryKey: ["crm-timeline", selectedCustomer?.id],
    queryFn: () =>
      runGetCustomerTimeline({
        data: { customerId: selectedCustomer!.id, email: selectedCustomer!.email },
      }),
    enabled: !!selectedCustomer,
  });

  const { data: metrics } = useQuery({
    queryKey: ["crm-metrics", selectedCustomer?.id],
    queryFn: () => runGetCustomerMetrics({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: payments } = useQuery({
    queryKey: ["crm-payments", selectedCustomer?.id],
    queryFn: () => runGetCustomerPayments({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ["crm-documents", selectedCustomer?.id],
    queryFn: () => runGetCustomerDocuments({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: tickets, refetch: refetchTickets } = useQuery({
    queryKey: ["crm-tickets", selectedCustomer?.id],
    queryFn: () => runListTickets({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ["crm-notes", selectedCustomer?.id],
    queryFn: () => runListNotes({ data: { customerId: selectedCustomer!.id } }),
    enabled: !!selectedCustomer,
  });

  const { data: comms } = useQuery({
    queryKey: ["crm-comms", selectedCustomer?.id],
    queryFn: () =>
      runListComms({ data: { customerId: selectedCustomer!.id, email: selectedCustomer!.email } }),
    enabled: !!selectedCustomer,
  });

  const { data: ticketMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["crm-ticket-messages", selectedTicketId],
    queryFn: () => runListTicketMessages({ data: { ticketId: selectedTicketId! } }),
    enabled: !!selectedTicketId,
  });

  // Profile Edit fields
  const [prefMeal, setPrefMeal] = useState("");
  const [prefSeat, setPrefSeat] = useState("");
  const [passportNum, setPassportNum] = useState("");
  const [passportExp, setPassportExp] = useState("");
  const [prefAirport, setPrefAirport] = useState("");
  const [prefLounge, setPrefLounge] = useState("");
  const [vipFlag, setVipFlag] = useState(false);
  const [tierSelect, setTierSelect] = useState("Standard");
  const [gstNum, setGstNum] = useState("");

  useEffect(() => {
    if (customer360) {
      setPrefMeal(customer360.travel_preferences?.meal_preference || "");
      setPrefSeat(customer360.travel_preferences?.seat_preference || "");
      setPassportNum(customer360.passport_details?.passport_number || "");
      setPassportExp(customer360.passport_details?.passport_expiry || "");
      setPrefAirport(customer360.preferred_airport || "");
      setPrefLounge(customer360.preferred_lounge || "");
      setVipFlag(customer360.vip_status);
      setTierSelect(customer360.loyalty_tier);
      setGstNum(customer360.gst_number || "");
    }
  }, [customer360]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5ed3ff]" />
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <Panel tone="dark" className="p-6 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">Failed to load customer registry.</span>
        </div>
      </Panel>
    );
  }

  const handleUpdateProfile = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await runUpdateCustomer360({
        data: {
          customerId: selectedCustomer!.id,
          passport_details: {
            passport_number: passportNum,
            passport_expiry: passportExp,
            nationality: "Indian",
          },
          travel_preferences: {
            meal_preference: prefMeal,
            seat_preference: prefSeat,
            concierge_level: tierSelect,
          },
          preferred_airport: prefAirport,
          preferred_lounge: prefLounge,
          vip_status: vipFlag,
          loyalty_tier: tierSelect,
          gst_number: gstNum,
        },
      });
      toast.success("CRM 360 profile updated successfully");
      setIsEditingProfile(false);
      refetch360();
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleCreateNoteSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      await runCreateNote({
        data: {
          customerId: selectedCustomer!.id,
          content: newNoteContent,
          noteType: newNoteType,
        },
      });
      toast.success("Internal note added");
      setNewNoteContent("");
      refetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    }
  };

  const handleSendTicketMessage = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;
    try {
      await runAddTicketMessage({
        data: {
          ticketId: selectedTicketId,
          message: replyText,
          isInternalNote,
        },
      });
      toast.success("Reply recorded");
      setReplyText("");
      refetchMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to record reply");
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await runUpdateTicketStatus({ data: { ticketId, status: "resolved" } });
      toast.success("Ticket resolved");
      refetchTickets();
      if (selectedTicketId === ticketId) refetchMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve ticket");
    }
  };

  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFileName || !uploadBase64) {
      toast.error("Please select a file to upload");
      return;
    }
    try {
      await runUploadDocument({
        data: {
          customerId: selectedCustomer!.id,
          kind: uploadKind,
          fileName: uploadFileName,
          base64Data: uploadBase64,
        },
      });
      toast.success("Document added successfully");
      setUploadFileName("");
      setUploadBase64("");
      refetchDocs();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    }
  };

  const handleRetryCommLog = async (logId: string) => {
    try {
      await runRetryComm({ data: { logId } });
      toast.success("Outbound message queued for delivery retry");
    } catch (err: any) {
      toast.error(err.message || "Failed to retry notification");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold leading-tight" style={pageDisplay}>
          Customer <em className="text-[#5ed3ff]">CRM.</em>
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest mt-1" style={pageMono}>
          Enterprise Relationship Management & Support Desk
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Search Registry */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, passport, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/10 px-3 py-2 pl-8 text-xs outline-none focus:border-[#5ed3ff] text-white"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
          </div>

          <div className="border border-white/10 divide-y divide-white/5 max-h-[700px] overflow-y-auto bg-[#090d16]/20">
            {paginated.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCustomerId(c.id);
                  setSelectedTicketId(null);
                }}
                className={`w-full text-left p-4 transition-colors block ${
                  selectedCustomer?.id === c.id
                    ? "bg-white/[0.04] border-l-2 border-[#5ed3ff]"
                    : "hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-xs text-white/90 truncate max-w-[150px]">
                    {c.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-semibold font-mono ${
                      c.type === "MEMBER"
                        ? "bg-[#5ed3ff]/10 text-[#5ed3ff]"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
                <div className="text-[10px] text-white/40 truncate mt-1">{c.email}</div>
                <div
                  className="flex justify-between text-[9px] text-white/30 mt-2"
                  style={pageMono}
                >
                  <span>Spend Tier: {customer360?.loyalty_tier || "Standard"}</span>
                  <span>Bookings: {c.bookingCount}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-white/30 py-8 text-xs">
                No customers matched query.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-[10px] text-white/50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                Prev
              </button>
              <span className="font-mono">
                {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Tab Deck panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCustomer ? (
            <Panel tone="dark" className="p-6 space-y-6">
              {/* Header Profile Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-white/50" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                      {selectedCustomer.name}
                      {customer360?.vip_status && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 uppercase tracking-widest font-mono">
                          VIP VVIP
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] text-white/45 uppercase tracking-widest mt-0.5 font-mono">
                      Loyalty Tier:{" "}
                      <strong className="text-[#5ed3ff]">
                        {customer360?.loyalty_tier || "Standard"}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {crmTab === "dossier" && (
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      {isEditingProfile ? "Cancel" : "Edit Dossier"}
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs (9 categories) */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
                {[
                  { id: "dossier", label: "Dossier 360°", icon: User },
                  { id: "timeline", label: "Timeline", icon: History },
                  { id: "bookings", label: "Bookings", icon: Plane },
                  { id: "billing", label: "Billing Ledger", icon: CreditCard },
                  { id: "documents", label: "Documents Locker", icon: FileText },
                  { id: "support", label: "Support Desk", icon: Headphones },
                  { id: "notes", label: "Staff Notes", icon: Bookmark },
                  { id: "loyalty", label: "Loyalty Benefits", icon: Gift },
                  { id: "comms", label: "Outbox Logs", icon: Mail },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setCrmTab(t.id as CrmTabId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                        crmTab === t.id
                          ? "bg-[#5ed3ff]/10 text-[#5ed3ff] border-[#5ed3ff]/30"
                          : "bg-white/5 border-transparent text-white/60 hover:text-white"
                      }`}
                    >
                      <Icon size={12} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT: DOSSIER 360 */}
              {crmTab === "dossier" && (
                <div className="space-y-6">
                  {isEditingProfile ? (
                    <form
                      onSubmit={handleUpdateProfile}
                      className="space-y-4 text-xs text-white/80"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={passportNum}
                            onChange={(e) => setPassportNum(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Passport Expiry
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={passportExp}
                            onChange={(e) => setPassportExp(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Preferred Meal
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Vegetarian, Gluten Free"
                            value={prefMeal}
                            onChange={(e) => setPrefMeal(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Preferred Seat
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Window, Aisle"
                            value={prefSeat}
                            onChange={(e) => setPrefSeat(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Preferred Airport
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. BOM, DEL"
                            value={prefAirport}
                            onChange={(e) => setPrefAirport(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Preferred Lounge
                          </label>
                          <input
                            type="text"
                            value={prefLounge}
                            onChange={(e) => setPrefLounge(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            Loyalty Tier
                          </label>
                          <select
                            value={tierSelect}
                            onChange={(e) => setTierSelect(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-2 py-2 text-xs text-white outline-none"
                          >
                            <option value="Standard">Standard</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Corporate">Corporate</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase font-mono block">
                            GST Number
                          </label>
                          <input
                            type="text"
                            value={gstNum}
                            onChange={(e) => setGstNum(e.target.value)}
                            className="w-full bg-[#0c121b] border border-white/10 px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="edit-vip"
                            checked={vipFlag}
                            onChange={(e) => setVipFlag(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor="edit-vip"
                            className="text-[10px] text-white/80 font-semibold uppercase font-mono"
                          >
                            VVIP Status
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#5ed3ff] hover:bg-[#5ed3ff]/90 text-black font-semibold uppercase tracking-wider text-xs"
                      >
                        Save 360° Profile
                      </button>
                    </form>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6 text-xs text-white/80">
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            Passport Details
                          </span>
                          <span className="font-mono font-semibold">
                            {customer360?.passport_details?.passport_number
                              ? `${customer360.passport_details.passport_number} (Exp: ${customer360.passport_details.passport_expiry})`
                              : "Not provided"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            Travel Preferences
                          </span>
                          <span className="font-semibold block">
                            Meal: {customer360?.travel_preferences?.meal_preference || "Standard"}
                          </span>
                          <span className="font-semibold block">
                            Seat:{" "}
                            {customer360?.travel_preferences?.seat_preference || "No preference"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            Affiliated Corporate Client
                          </span>
                          <span className="font-semibold">{selectedCustomer.company}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            Airport Preferences
                          </span>
                          <span className="font-semibold block">
                            Preferred Airport: {customer360?.preferred_airport || "Not set"}
                          </span>
                          <span className="font-semibold block">
                            Preferred Lounge: {customer360?.preferred_lounge || "Not set"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            GST Number
                          </span>
                          <span className="font-semibold font-mono">
                            {customer360?.gst_number || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">
                            Contact details
                          </span>
                          <span className="block font-mono">Email: {selectedCustomer.email}</span>
                          <span className="block font-mono">Phone: {selectedCustomer.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: TIMELINE */}
              {crmTab === "timeline" && <CustomerTimelineTab timeline={timeline} />}

              {/* TAB CONTENT: BOOKINGS */}
              {crmTab === "bookings" && (
                <CustomerBookingsTab
                  metrics={metrics}
                  bookingsList={selectedCustomer.bookingsList}
                />
              )}

              {/* TAB CONTENT: BILLING */}
              {crmTab === "billing" && <CustomerBillingTab payments={payments} />}

              {/* TAB CONTENT: DOCUMENTS */}
              {crmTab === "documents" && (
                <CustomerDocumentsTab
                  uploadKind={uploadKind}
                  setUploadKind={setUploadKind}
                  uploadFileName={uploadFileName}
                  handleDocumentFileSelect={handleDocumentFileSelect}
                  handleUploadDocSubmit={handleUploadDocSubmit}
                  documents={documents}
                />
              )}

              {/* TAB CONTENT: SUPPORT DESK */}
              {crmTab === "support" && (
                <CustomerSupportTab
                  tickets={tickets}
                  selectedTicketId={selectedTicketId}
                  setSelectedTicketId={setSelectedTicketId}
                  ticketMessages={ticketMessages}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  isInternalNote={isInternalNote}
                  setIsInternalNote={setIsInternalNote}
                  handleSendTicketMessage={handleSendTicketMessage}
                  handleResolveTicket={handleResolveTicket}
                />
              )}

              {/* TAB CONTENT: CUSTOMER NOTES */}
              {crmTab === "notes" && (
                <CustomerNotesTab
                  newNoteType={newNoteType}
                  setNewNoteType={setNewNoteType}
                  newNoteContent={newNoteContent}
                  setNewNoteContent={setNewNoteContent}
                  handleCreateNoteSubmit={handleCreateNoteSubmit}
                  notes={notes}
                />
              )}

              {/* TAB CONTENT: LOYALTY LEVEL STATUS */}
              {crmTab === "loyalty" && (
                <CustomerLoyaltyTab
                  customer360={customer360}
                  tierSelect={tierSelect}
                  onTierChange={async (updatedTier) => {
                    setTierSelect(updatedTier);
                    try {
                      await runUpdateCustomer360({
                        data: {
                          customerId: selectedCustomer!.id,
                          loyalty_tier: updatedTier,
                        },
                      });
                      toast.success(`Loyalty tier upgraded to ${updatedTier}`);
                      refetch360();
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update loyalty status");
                    }
                  }}
                />
              )}

              {/* TAB CONTENT: OUTBOX COMMS HISTORY */}
              {crmTab === "comms" && (
                <CustomerCommsTab comms={comms} handleRetryCommLog={handleRetryCommLog} />
              )}
            </Panel>
          ) : (
            <div className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-lg">
              Select a customer to view their complete profile dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
