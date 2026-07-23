import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  listAllBookings,
  executeBookingWorkflowAction,
  getBookingInternalStatus,
} from "@/lib/bookings.functions";
import { pageMono, pageDisplay, Panel } from "@/components/site/PageShell";
import {
  Plane,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  User,
  FileText,
  CreditCard,
  Send,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/operations")({
  component: AdminOperationsPage,
});

function AdminOperationsPage() {
  const queryClient = useQueryClient();
  const fetchBookings = useServerFn(listAllBookings);
  const triggerWorkflow = useServerFn(executeBookingWorkflowAction);

  const [search, setSearch] = useState("");
  const [filterPill, setFilterPill] = useState<"all" | "today" | "tomorrow" | "pending" | "confirmed" | "completed">("all");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rawBookings = [], isLoading } = useQuery({
    queryKey: ["admin-operations-bookings"],
    queryFn: () => fetchBookings(),
    staleTime: 10000,
  });

  const bookings = useMemo(() => {
    return (rawBookings || []).map((b: any) => {
      const internalStatus = getBookingInternalStatus(b);
      let depDate: Date | null = null;
      try {
        if (b.depart_date) depDate = new Date(b.depart_date);
      } catch {}

      return {
        ...b,
        internalStatus,
        depDate,
      };
    });
  }, [rawBookings]);

  // 5 KPI Header Counters
  const kpis = useMemo(() => {
    let todaysFlights = 0;
    let pendingQuotes = 0;
    let pendingPayments = 0;
    let confirmed = 0;
    let completed = 0;

    bookings.forEach((b: any) => {
      if (b.depDate && isToday(b.depDate)) todaysFlights++;

      if (["NEW_BOOKING", "UNDER_REVIEW", "submitted", "draft"].includes(b.internalStatus)) {
        pendingQuotes++;
      } else if (["WAITING_FOR_CUSTOMER", "PAYMENT_PENDING", "quoted", "approved"].includes(b.internalStatus)) {
        pendingPayments++;
      } else if (["CONFIRMED", "PAYMENT_VERIFIED", "confirmed"].includes(b.internalStatus)) {
        confirmed++;
      } else if (["COMPLETED", "CHECKED_IN", "completed"].includes(b.internalStatus)) {
        completed++;
      }
    });

    return { todaysFlights, pendingQuotes, pendingPayments, confirmed, completed };
  }, [bookings]);

  // Filtered Operations List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(b.booking_ref || "").toLowerCase().includes(q) ||
        String(b.contact_name || "").toLowerCase().includes(q) ||
        String(b.contact_email || "").toLowerCase().includes(q) ||
        String(b.contact_phone || "").toLowerCase().includes(q) ||
        String(b.origin || "").toLowerCase().includes(q) ||
        String(b.destination || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterPill === "today") return b.depDate ? isToday(b.depDate) : false;
      if (filterPill === "tomorrow") return b.depDate ? isTomorrow(b.depDate) : false;
      if (filterPill === "pending")
        return ["NEW_BOOKING", "UNDER_REVIEW", "WAITING_FOR_CUSTOMER", "PAYMENT_PENDING", "draft", "submitted", "quoted"].includes(b.internalStatus);
      if (filterPill === "confirmed")
        return ["CONFIRMED", "PAYMENT_VERIFIED", "confirmed"].includes(b.internalStatus);
      if (filterPill === "completed")
        return ["COMPLETED", "CHECKED_IN", "completed"].includes(b.internalStatus);

      return true;
    });
  }, [bookings, search, filterPill]);

  // 1-Click Operations Workflow Execution
  const handleWorkflowAction = async (bookingId: string, action: string) => {
    setIsSubmitting(true);
    try {
      await triggerWorkflow({
        data: {
          id: bookingId,
          action,
        },
      });
      toast.success(`Workflow action executed: ${action.replace(/_/g, " ").toUpperCase()}`);
      queryClient.invalidateQueries({ queryKey: ["admin-operations-bookings"] });
      setSelectedBooking(null);
    } catch (e: any) {
      toast.error(e.message || "Action execution failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#5ed3ff]" style={pageMono}>
          Speed Operations Center
        </span>
        <h1 className="text-2xl font-bold text-white mt-1" style={pageDisplay}>
          Operations Center — 60s Booking Execution
        </h1>
      </div>

      {/* 5 KPI Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
            Today's Flights
          </div>
          <div className="text-xl font-bold text-[#5ed3ff]" style={pageMono}>
            {kpis.todaysFlights}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
            Pending Quotes
          </div>
          <div className="text-xl font-bold text-amber-400" style={pageMono}>
            {kpis.pendingQuotes}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
            Pending Payments
          </div>
          <div className="text-xl font-bold text-yellow-400" style={pageMono}>
            {kpis.pendingPayments}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
            Confirmed
          </div>
          <div className="text-xl font-bold text-emerald-400" style={pageMono}>
            {kpis.confirmed}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
            Completed
          </div>
          <div className="text-xl font-bold text-purple-400" style={pageMono}>
            {kpis.completed}
          </div>
        </div>
      </div>

      {/* Fast Search & Pill Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID, Customer, Phone..."
            className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 outline-none focus:border-[#5ed3ff] transition"
            style={pageMono}
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "completed", label: "Completed" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterPill(pill.id as any)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                filterPill === pill.id
                  ? "bg-[#5ed3ff] text-black font-semibold"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      <Panel tone="dark" className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#5ed3ff]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-xs font-mono text-white/40">
            No active operations bookings match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredBookings.map((b: any) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="p-4 hover:bg-white/[0.02] transition duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5ed3ff]" style={pageMono}>
                      {b.booking_ref}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[8px] font-mono uppercase font-bold rounded ${
                        ["CONFIRMED", "PAYMENT_VERIFIED", "confirmed"].includes(b.internalStatus)
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : ["COMPLETED", "completed"].includes(b.internalStatus)
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {b.internalStatus}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white/90">
                    {b.contact_name} <span className="text-xs text-white/40 font-mono">({b.contact_phone || b.contact_email})</span>
                  </div>

                  <div className="text-xs font-mono text-white/50">
                    Route: <span className="text-white/80">{b.origin} → {b.destination}</span> · Date: {b.depart_date}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      {b.quote_currency || "INR"} {Number(b.quote_amount || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/40">
                      Pax: {(b.pax_adults || 1) + (b.pax_children || 0)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(b);
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded transition cursor-pointer"
                  >
                    Quick Process ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* 5-CARD OPERATIONS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090d16] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#5ed3ff]">
                  Operations Action Console
                </span>
                <h2 className="text-xl font-bold text-white" style={pageDisplay}>
                  Booking Ref: {selectedBooking.booking_ref}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-white/40 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 CARDS ONLY */}
            <div className="space-y-4">
              {/* CARD 1: CUSTOMER */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5ed3ff] font-bold">
                  <User className="w-3.5 h-3.5" /> Card 1 — Customer
                </div>
                <div className="text-sm font-bold text-white">{selectedBooking.contact_name}</div>
                <div className="text-white/60">Email: {selectedBooking.contact_email}</div>
                <div className="text-white/60">Phone: {selectedBooking.contact_phone}</div>
                {selectedBooking.company && (
                  <div className="text-white/40 text-[10px]">Company: {selectedBooking.company}</div>
                )}
              </div>

              {/* CARD 2: FLIGHT */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5ed3ff] font-bold">
                  <Plane className="w-3.5 h-3.5" /> Card 2 — Flight Details
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedBooking.origin} → {selectedBooking.destination}
                </div>
                <div className="text-white/60">Departure Date: {selectedBooking.depart_date}</div>
                <div className="text-white/60">
                  Passengers: {selectedBooking.pax_adults || 1} Adults, {selectedBooking.pax_children || 0} Children, {selectedBooking.pax_infants || 0} Infants
                </div>
              </div>

              {/* CARD 3: SERVICES */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5ed3ff] font-bold">
                  <FileText className="w-3.5 h-3.5" /> Card 3 — Services
                </div>
                {selectedBooking.booking_services && selectedBooking.booking_services.length > 0 ? (
                  <div className="space-y-1">
                    {selectedBooking.booking_services.map((s: any) => (
                      <div key={s.id} className="flex justify-between text-white/80">
                        <span>{s.service_name}</span>
                        <span>Qty: {s.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/40 italic">Standard VIP Concierge Service Package</div>
                )}
              </div>

              {/* CARD 4: PAYMENT */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5ed3ff] font-bold">
                  <CreditCard className="w-3.5 h-3.5" /> Card 4 — Payment
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  Total: {selectedBooking.quote_currency || "INR"} {Number(selectedBooking.quote_amount || 0).toLocaleString()}
                </div>
                <div className="text-white/60">Status: {selectedBooking.internalStatus}</div>
              </div>

              {/* CARD 5: ACTIONS (1-CLICK WORKFLOW EXECUTION) */}
              <div className="p-4 bg-[#5ed3ff]/10 border border-[#5ed3ff]/30 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5ed3ff] font-bold">
                  <Send className="w-3.5 h-3.5" /> Card 5 — 1-Click Operations Actions
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleWorkflowAction(selectedBooking.id, "review_booking")}
                    className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    1. Review
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleWorkflowAction(selectedBooking.id, "request_payment")}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    2. Send Quote
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleWorkflowAction(selectedBooking.id, "confirm_booking")}
                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    3. Confirm
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleWorkflowAction(selectedBooking.id, "complete_booking")}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    4. Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
