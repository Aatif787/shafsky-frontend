import React from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type CustomerProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CustomerBookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export type CrmTabId =
  | "dossier"
  | "timeline"
  | "bookings"
  | "billing"
  | "documents"
  | "support"
  | "notes"
  | "loyalty"
  | "comms";

export function buildAllCustomersList(
  profiles: CustomerProfileRow[],
  bookings: CustomerBookingRow[],
) {
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

  return [...registeredCustomers, ...guestCustomers];
}

export function CustomerTimelineTab({ timeline }: { timeline: any[] | undefined }) {
  return (
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
  );
}

export function CustomerBookingsTab({
  metrics,
  bookingsList,
}: {
  metrics: any;
  bookingsList: CustomerBookingRow[];
}) {
  return (
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
        {bookingsList.map((b) => (
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
                {(b.depart_date || "").slice(0, 10)}
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
  );
}

export function CustomerBillingTab({ payments }: { payments: any }) {
  return (
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
  );
}

export function CustomerDocumentsTab({
  uploadKind,
  setUploadKind,
  uploadFileName,
  handleDocumentFileSelect,
  handleUploadDocSubmit,
  documents,
}: {
  uploadKind: string;
  setUploadKind: (v: string) => void;
  uploadFileName: string;
  handleDocumentFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadDocSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  documents: any[] | undefined;
}) {
  return (
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
  );
}

export function CustomerSupportTab({
  tickets,
  selectedTicketId,
  setSelectedTicketId,
  ticketMessages,
  replyText,
  setReplyText,
  isInternalNote,
  setIsInternalNote,
  handleSendTicketMessage,
  handleResolveTicket,
}: {
  tickets: any[] | undefined;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  ticketMessages: any[] | undefined;
  replyText: string;
  setReplyText: (v: string) => void;
  isInternalNote: boolean;
  setIsInternalNote: (v: boolean) => void;
  handleSendTicketMessage: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  handleResolveTicket: (ticketId: string) => Promise<void>;
}) {
  return (
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
  );
}

export function CustomerNotesTab({
  newNoteType,
  setNewNoteType,
  newNoteContent,
  setNewNoteContent,
  handleCreateNoteSubmit,
  notes,
}: {
  newNoteType: "private" | "important" | "vip" | "preference";
  setNewNoteType: (v: "private" | "important" | "vip" | "preference") => void;
  newNoteContent: string;
  setNewNoteContent: (v: string) => void;
  handleCreateNoteSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
  notes: any[] | undefined;
}) {
  return (
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
  );
}

export function CustomerLoyaltyTab({
  customer360,
  tierSelect,
  onTierChange,
}: {
  customer360: any;
  tierSelect: string;
  onTierChange: (updatedTier: string) => Promise<void>;
}) {
  return (
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
            onChange={(e) => onTierChange(e.target.value)}
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
  );
}

export function CustomerCommsTab({
  comms,
  handleRetryCommLog,
}: {
  comms: any[] | undefined;
  handleRetryCommLog: (logId: string) => Promise<void>;
}) {
  return (
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
  );
}
