import { createFileRoute, Link } from "@tanstack/react-router";
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
import type { Database } from "@/integrations/supabase/types";
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
  Phone,
  Building,
  History,
  Lock,
  FileText,
  CreditCard,
  Headphones,
  Settings,
  MessageSquare,
  Bookmark,
  ShieldCheck,
  Send,
  Upload,
  RefreshCw,
  Gift,
  Plus,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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

type CustomerProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CustomerBookingRow = Database["public"]["Tables"]["bookings"]["Row"];

function CustomersManagerView() {
  const { search, selectedId } = Route.useSearch();
  const fetchCustomers = useServerFn(listAllCustomers);
  const triggerCustomerAudits = useServerFn(listCustomerAuditLogs);

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
  const [crmTab, setCrmTab] = useState<
    | "dossier"
    | "timeline"
    | "bookings"
    | "billing"
    | "documents"
    | "support"
    | "notes"
    | "loyalty"
    | "comms"
  >("dossier");

  // Support thread state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [ticketAssigneeId, setTicketAssigneeId] = useState("");

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

  const registeredCustomers = profiles
    .filter((p) => !p.id.startsWith("guest_"))
    .map((p: CustomerProfileRow) => {
      const userBookings = bookings.filter((b) => b.user_id === p.id);
      const lastBooking = userBookings.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

      const memberEmails = new Set<string>();
      if (p.id && p.id.includes("@")) {
        memberEmails.add(p.id.toLowerCase());
      }
      userBookings.forEach((b: CustomerBookingRow) => {
        if (b.contact_email) memberEmails.add(b.contact_email.toLowerCase());
      });

      const memberPhone = p.phone ? p.phone.trim() : "";
      const linkedGuestBookings = bookings.filter((b) => {
        if (b.user_id) return false;
        const emailMatch = b.contact_email && memberEmails.has(b.contact_email.toLowerCase());
        const phoneMatch = memberPhone && b.contact_phone && b.contact_phone.trim() === memberPhone;
        return emailMatch || phoneMatch;
      }) as CustomerBookingRow[];

      return {
        id: p.id,
        name: p.full_name || "Registered Member",
        email: p.id,
        phone: p.phone || "—",
        company: p.company || "—",
        type: "MEMBER" as const,
        bookingCount: userBookings.length + linkedGuestBookings.length,
        lastBookingDate: lastBooking
          ? lastBooking.created_at
          : linkedGuestBookings.length > 0
            ? linkedGuestBookings[0].created_at
            : null,
        bookingsList: userBookings,
        linkedGuestBookings: linkedGuestBookings,
        notes: (p as any).notes || "",
      };
    });

  const guestBookings = bookings.filter((b) => !b.user_id) as CustomerBookingRow[];
  const guestEmails = Array.from(new Set(guestBookings.map((b) => b.contact_email.toLowerCase())));
  const guestCustomers = guestEmails.map((email) => {
    const userBookings = guestBookings.filter(
      (b) => b.contact_email.toLowerCase() === email,
    ) as CustomerBookingRow[];
    const lastBooking = userBookings.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const guestProfile = profiles.find((p) => p.id === `guest_${email}` || p.id === email);
    return {
      id: `guest_${email}`,
      name: lastBooking ? lastBooking.contact_name : "Guest",
      email: email,
      phone: lastBooking ? lastBooking.contact_phone : "—",
      company: (lastBooking && lastBooking.company) || "—",
      type: "GUEST" as const,
      bookingCount: userBookings.length,
      lastBookingDate: lastBooking ? lastBooking.created_at : null,
      bookingsList: userBookings,
      linkedGuestBookings: [],
      notes: guestProfile?.notes || "",
    };
  });

  const allCustomers = [...registeredCustomers, ...guestCustomers];

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
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

  const handleCreateNoteSubmit = async (e: React.FormEvent) => {
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

  const handleSendTicketMessage = async (e: React.FormEvent) => {
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

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
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
                      onClick={() => setCrmTab(t.id as any)}
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
              {crmTab === "timeline" && (
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-[#5ed3ff] font-mono">
                    Chronological Activity Log
                  </h3>
                  <div className="relative border-l border-white/10 pl-6 space-y-6 text-xs text-white/80">
                    {timeline?.map((event) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-[#0c121b] border border-[#5ed3ff] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#5ed3ff]" />
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white block">{event.action}</span>
                          <span className="text-[9px] text-white/40 font-mono">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white/60 mt-1">{event.description}</p>
                      </div>
                    ))}
                    {(!timeline || timeline.length === 0) && (
                      <div className="text-center py-8 text-white/30">No activities recorded.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: BOOKINGS */}
              {crmTab === "bookings" && (
                <div className="space-y-6">
                  {/* Spend metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Total Spend</span>
                      <strong className="text-[#5ed3ff] font-mono text-base font-semibold">
                        INR {(metrics?.totalSpend || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">
                        Average Value
                      </span>
                      <strong className="text-white font-mono text-base font-semibold">
                        INR {(metrics?.avgBookingValue || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Fav Airport</span>
                      <strong className="text-white text-xs block truncate">
                        {metrics?.favoriteAirport}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Fav Lounge</span>
                      <strong className="text-white text-xs block truncate">
                        {metrics?.favoriteLounge}
                      </strong>
                    </div>
                  </div>

                  {/* List bookings */}
                  <div className="border border-white/10 divide-y divide-white/5 bg-white/[0.01]">
                    {selectedCustomer.bookingsList.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                      >
                        <div>
                          <div className="font-mono text-[#5ed3ff] font-semibold">
                            {b.booking_ref}
                          </div>
                          <div className="font-bold text-white mt-0.5">
                            {b.origin} → {b.destination}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <span className="text-[10px] text-white/40 font-mono">
                            {b.depart_date.slice(0, 10)}
                          </span>
                          <Link
                            to="/admin/bookings/$id"
                            params={{ id: b.id }}
                            className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-0.5 text-white/80 border border-white/10 uppercase font-mono"
                          >
                            Dossier →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: BILLING */}
              {crmTab === "billing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Paid amount</span>
                      <strong className="text-emerald-400 font-mono text-sm font-semibold">
                        INR {(payments?.totalPaid || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Outstanding</span>
                      <strong className="text-amber-500 font-mono text-sm font-semibold">
                        INR {(payments?.outstanding || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase">Refunded</span>
                      <strong className="text-white/40 font-mono text-sm font-semibold">
                        INR {(payments?.refunds || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left text-white/80">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-wider">
                        <th className="py-2">Invoice Ref</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Base</th>
                        <th className="py-2">Total</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments?.invoices?.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 font-mono text-[#5ed3ff]">{inv.booking_ref}</td>
                          <td className="py-2.5 text-white/40">
                            {new Date(inv.date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 font-mono">INR {inv.amount.toLocaleString()}</td>
                          <td className="py-2.5 font-mono font-semibold">
                            INR {inv.total.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                toast.info("Downloading Invoice PDF...");
                                window.print();
                              }}
                              className="text-[#5ed3ff] hover:underline"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB CONTENT: DOCUMENTS */}
              {crmTab === "documents" && (
                <div className="space-y-6">
                  {/* Upload file form */}
                  <form
                    onSubmit={handleUploadDocSubmit}
                    className="grid md:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl items-end text-xs text-white/80"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-mono block">
                        Document Kind
                      </label>
                      <select
                        value={uploadKind}
                        onChange={(e) => setUploadKind(e.target.value)}
                        className="w-full bg-[#0c121b] border border-white/10 px-2 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="passport">Passport</option>
                        <option value="visa">Visa</option>
                        <option value="boarding_pass">Boarding Pass</option>
                        <option value="invoice">Invoice</option>
                        <option value="receipt">Receipt</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] text-white/40 uppercase font-mono block">
                        Select Document
                      </label>
                      <input
                        type="file"
                        onChange={handleDocumentFileSelect}
                        className="w-full bg-[#0c121b] border border-white/10 px-2 py-1 text-xs text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!uploadFileName}
                      className="py-1.5 bg-[#5ed3ff] hover:bg-[#5ed3ff]/90 text-black font-mono font-semibold uppercase tracking-wider text-[10px] cursor-pointer disabled:opacity-40"
                    >
                      <Upload size={12} className="inline mr-1" /> Save File
                    </button>
                  </form>

                  {/* List documents */}
                  <div className="border border-white/10 divide-y divide-white/5 bg-white/[0.01]">
                    {documents?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-4 flex justify-between items-center text-xs text-white/80"
                      >
                        <div>
                          <span className="text-[#5ed3ff] font-semibold block">
                            {doc.file_name}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest block font-mono">
                            Category: {doc.kind} · Version: v{doc.version}
                          </span>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5ed3ff] border border-[#5ed3ff]/20 bg-[#5ed3ff]/5 px-3 py-1 font-mono uppercase text-[9px]"
                        >
                          Preview / Get
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SUPPORT DESK */}
              {crmTab === "support" && (
                <div className="grid md:grid-cols-3 gap-6 text-xs text-white/80">
                  {/* Left Ticket List */}
                  <div className="md:col-span-1 border border-white/10 divide-y divide-white/5 max-h-[400px] overflow-y-auto bg-[#090d16]/20">
                    {tickets?.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`w-full text-left p-3 block transition-colors ${
                          selectedTicketId === t.id
                            ? "bg-white/5 border-l-2 border-[#5ed3ff]"
                            : "hover:bg-white/[0.01]"
                        }`}
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span className="truncate max-w-[100px] text-white">{t.subject}</span>
                          <span
                            className={`px-1 py-0.5 rounded text-[8px] font-mono uppercase ${
                              t.status === "open"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[9px] text-white/40 mt-1 flex justify-between">
                          <span>Priority: {t.priority}</span>
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                    {(!tickets || tickets.length === 0) && (
                      <div className="text-center py-8 text-white/30">No support tickets.</div>
                    )}
                  </div>

                  {/* Right Conversation Thread */}
                  <div className="md:col-span-2 space-y-4">
                    {selectedTicketId ? (
                      <div className="space-y-4">
                        {/* Messages Area */}
                        <div className="border border-white/10 p-4 rounded-xl space-y-3 max-h-[300px] overflow-y-auto bg-[#0c121b]/40">
                          {ticketMessages?.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-xl max-w-[85%] ${
                                msg.is_internal_note
                                  ? "bg-amber-500/10 border border-amber-500/20 ml-auto"
                                  : msg.sender_role === "admin"
                                    ? "bg-blue-500/10 border border-blue-500/20 ml-auto"
                                    : "bg-white/5 border border-white/10"
                              }`}
                            >
                              <div className="flex justify-between text-[8px] text-white/40 font-mono mb-1">
                                <span>
                                  {msg.sender_role.toUpperCase()}
                                  {msg.is_internal_note && " (INTERNAL STAFF NOTE)"}
                                </span>
                                <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-white/95 leading-relaxed">{msg.message}</p>
                            </div>
                          ))}
                        </div>

                        {/* Send Reply box */}
                        <form onSubmit={handleSendTicketMessage} className="space-y-2">
                          <textarea
                            placeholder="Write message reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="w-full bg-[#0c121b] border border-white/10 p-2.5 outline-none text-white text-xs"
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <input
                                type="checkbox"
                                id="chk-internal"
                                checked={isInternalNote}
                                onChange={(e) => setIsInternalNote(e.target.checked)}
                                className="h-4 w-4"
                              />
                              <label
                                htmlFor="chk-internal"
                                className="text-[10px] font-semibold uppercase tracking-wider font-mono"
                              >
                                Staff Internal Note
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleResolveTicket(selectedTicketId)}
                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 uppercase font-mono text-[9px]"
                              >
                                Resolve Ticket
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 bg-[#5ed3ff] hover:bg-[#5ed3ff]/90 text-black font-semibold uppercase font-mono text-[9px] flex items-center gap-1"
                              >
                                <Send size={10} /> Send
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-xl">
                        Select a support ticket from the registry to view message thread.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: CUSTOMER NOTES */}
              {crmTab === "notes" && (
                <div className="space-y-6 text-xs text-white/80">
                  {/* Create private note */}
                  <form
                    onSubmit={handleCreateNoteSubmit}
                    className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-white/40 tracking-wider font-mono">
                        Create Administrative Note
                      </span>
                      <select
                        value={newNoteType}
                        onChange={(e) => setNewNoteType(e.target.value as any)}
                        className="bg-[#0c121b] border border-white/10 px-2 py-1 text-[10px] text-white font-mono uppercase"
                      >
                        <option value="private">Private Note</option>
                        <option value="important">Important Note</option>
                        <option value="vip">VIP Note</option>
                        <option value="preference">Preference Note</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Write important administrative notes, custom concierge arrangements, security detail..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0c121b] border border-white/10 p-2.5 outline-none text-white text-xs"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#5ed3ff] hover:bg-[#5ed3ff]/90 text-black font-semibold uppercase font-mono text-[10px]"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>

                  {/* List notes */}
                  <div className="space-y-3">
                    {notes?.map((n: any) => (
                      <div
                        key={n.id}
                        className={`p-4 border rounded-xl space-y-1.5 ${
                          n.note_type === "vip"
                            ? "bg-red-500/5 border-red-500/20"
                            : n.note_type === "important"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex justify-between text-[9px] text-white/40 font-mono">
                          <span>
                            TYPE: {n.note_type.toUpperCase()} · AUTHOR:{" "}
                            {n.author?.full_name || "Staff"}
                          </span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white/90 font-medium leading-relaxed">{n.content}</p>
                      </div>
                    ))}
                    {(!notes || notes.length === 0) && (
                      <div className="text-center py-8 text-white/30 italic">
                        No admin notes saved.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: LOYALTY LEVEL STATUS */}
              {crmTab === "loyalty" && (
                <div className="grid md:grid-cols-2 gap-6 text-xs text-white/80">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-[#5ed3ff] font-mono">
                      Loyalty Tier Privileges
                    </h3>
                    <div className="bg-[#0c121b] border border-white/10 p-5 rounded-2xl space-y-3">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase block font-mono">
                          Current Status Tier
                        </span>
                        <strong className="text-lg text-[#5ed3ff] font-bold block">
                          {customer360?.loyalty_tier || "Standard"} Member
                        </strong>
                      </div>
                      <div className="text-white/60 space-y-2 leading-relaxed">
                        {customer360?.loyalty_tier === "Platinum" && (
                          <>
                            <p>
                              💎 <strong>VVIP Lounge Access</strong>: Free access to all airport
                              lounge suites globally.
                            </p>
                            <p>
                              💎 <strong>Priority Transfers</strong>: Private Mercedes tarmac
                              transfer step-by-step.
                            </p>
                            <p>
                              💎 <strong>Bespoke Catering</strong>: Complementary fine dining
                              pre-flight requests.
                            </p>
                          </>
                        )}
                        {customer360?.loyalty_tier === "Gold" && (
                          <>
                            <p>
                              ⭐ <strong>First Class Lounge</strong>: Unlimited lounge access for
                              member.
                            </p>
                            <p>
                              ⭐ <strong>Fast-Track</strong>: Security queue bypass certifications.
                            </p>
                          </>
                        )}
                        {customer360?.loyalty_tier === "Silver" && (
                          <p>
                            ✨ <strong>Business Lounge Access</strong>: Complementary entry and
                            refreshments.
                          </p>
                        )}
                        {customer360?.loyalty_tier === "Corporate" && (
                          <>
                            <p>
                              🏢 <strong>GST Invoicing</strong>: Automatic corporate taxation
                              receipts generation.
                            </p>
                            <p>
                              🏢 <strong>Fixed pricing discounts</strong>: 10% off on private tarmac
                              services.
                            </p>
                          </>
                        )}
                        {(!customer360?.loyalty_tier ||
                          customer360.loyalty_tier === "Standard") && (
                          <p>
                            🛫 Standard concierge flight clearances and premium lounge entry
                            requests.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl text-white/60 space-y-3">
                    <h4 className="text-xs uppercase font-bold text-white font-mono">
                      Operational Settings
                    </h4>
                    <p className="leading-relaxed">
                      Change status tier manually below. Status upgrades sync in real-time and
                      unlock appropriate airfield concierge benefits.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-white/40 font-mono block">
                        Status Tier Select
                      </label>
                      <select
                        value={tierSelect}
                        onChange={async (e) => {
                          const updatedTier = e.target.value;
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
                        className="w-full bg-[#0c121b] border border-white/10 px-2 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: OUTBOX COMMS HISTORY */}
              {crmTab === "comms" && (
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-[#5ed3ff] font-mono">
                    Outbound Communication Registry
                  </h3>
                  <div className="border border-white/10 divide-y divide-white/5 bg-white/[0.01] text-xs text-white/80">
                    {comms?.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{log.subject}</span>
                            <span
                              className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-semibold font-mono ${
                                log.channel === "whatsapp"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}
                            >
                              {log.channel}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed font-mono max-w-[400px] truncate">
                            {log.body}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/40 font-mono">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded ${
                                log.status === "failed"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>
                          {log.status === "failed" && (
                            <button
                              onClick={() => handleRetryCommLog(log.id)}
                              className="text-[9px] bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 text-red-400 border border-red-500/20 font-mono uppercase tracking-wider cursor-pointer"
                            >
                              Retry Outbound
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!comms || comms.length === 0) && (
                      <div className="text-center py-8 text-white/30 italic">
                        No communication logs recorded.
                      </div>
                    )}
                  </div>
                </div>
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
