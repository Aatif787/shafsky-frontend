import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionInfo } from "@/lib/session";
import { useAuth } from "@/auth-system/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { getCustomerPaymentHistory } from "@/lib/payments.functions";
import { listUserPassengers, savePassenger, deletePassenger } from "@/lib/passengers.functions";
import {
  LayoutDashboard,
  Plane,
  Calendar,
  ShieldCheck,
  Users,
  FileText,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  Upload,

  ArrowRight,
  ArrowLeft,
  Home,
  Bell,
  HelpCircle,
  Phone,
  Mail,
  User,
  Globe2,
  Info,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { display, mono } from "@/components/dashboard/theme";
import type {
  Booking,
  SavedPassenger,
  SupportTicket,
  DocumentLocker,
  DashboardTab,
  NotesData,
} from "@/components/dashboard/types";

export default function DashboardView({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const submitBookingFn = useServerFn(createBooking);
  const { updatePassword, profile: authProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");

  // Profile data & notes fallback state
  const [notesData, setNotesData] = useState<NotesData>({});

  // Form states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // New booking form
  const [bkName, setBkName] = useState("");
  const [bkEmail, setBkEmail] = useState("");
  const [bkPhone, setBkPhone] = useState("");
  const [bkOrigin, setBkOrigin] = useState("");
  const [bkDest, setBkDest] = useState("");
  const [bkDate, setBkDate] = useState("");
  const [bkService, setBkService] = useState("Meet & Greet Concierge");
  const [bkAdults, setBkAdults] = useState(1);
  const [bkChildren, setBkChildren] = useState(0);
  const [bkNotes, setBkNotes] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Passenger form
  const [psName, setPsName] = useState("");
  const [psNat, setPsNat] = useState("");
  const [psPass, setPsPass] = useState("");
  const [psExp, setPsExp] = useState("");
  const [psType, setPsType] = useState<"adult" | "child" | "infant">("adult");
  const [editingPassengerId, setEditingPassengerId] = useState<string | null>(null);

  // Ticket form
  const [tkSub, setTkSub] = useState("");
  const [tkPriority, setTkPriority] = useState<"low" | "medium" | "high">("medium");
  const [tkMsg, setTkMsg] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Document upload state
  const [docType, setDocType] = useState<"passport" | "visa" | "id_proof">("passport");
  const [docName, setDocName] = useState("");
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [fileNameDisplay, setFileNameDisplay] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // TanStack Query: Profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["client-profile", userId],
    queryFn: async () => {
      if (!userId || userId === "guest_user") return null;
      try {
        const { getCurrentUserProfileServer } = await import("@/lib/user.functions");
        const me = await getCurrentUserProfileServer();
        return me || { id: userId, full_name: authProfile?.name || "Aviation Client" };
      } catch {
        return { id: userId, full_name: authProfile?.name || "Aviation Client" };
      }
    },
    staleTime: 30000,
  });

  // TanStack Query: Bookings
  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["client-bookings", userId],
    queryFn: async () => {
      if (!userId || userId === "guest_user") return [];
      try {
        const { listUserBookingsServer } = await import("@/lib/bookings.functions");
        const res = await listUserBookingsServer();
        return res || [];
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // TanStack Query: Booking Documents
  const { data: bookingDocs = [] } = useQuery({
    queryKey: ["booking-docs", selectedBooking?.id],
    queryFn: async () => {
      if (!selectedBooking?.id) return [];
      try {
        const { fetchDocs } = await import("@/lib/booking-documents.functions");
        const rows = await fetchDocs({ data: { id: selectedBooking.id } });
        if (!rows || rows.length === 0) return [];

        const paths = rows.map((r: any) => r.storage_path).filter(Boolean);
        let signedUrls: any[] = [];
        if (paths.length > 0) {
          const { data } = await supabase.storage.from("booking-docs").createSignedUrls(paths, 60 * 60);
          signedUrls = data || [];
        }

        const urlMap = new Map((signedUrls ?? []).map((item: any) => [item.path, item.signedUrl]));
        return rows.map((r: any) => ({
          ...r,
          document_type: r.kind,
          filename: `${r.kind}.pdf`,
          version: 1,
          checksum: "legacy",
          url: urlMap.get(r.storage_path) || "",
        }));
      } catch {
        return [];
      }
    },
    enabled: !!selectedBooking?.id,
  });

  // TanStack Query: Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["client-notifications", userId],
    queryFn: async () => {
      if (!userId || userId === "guest_user") return [];
      try {
        const { getMyNotificationsServer } = await import("@/lib/user.functions");
        const res = await getMyNotificationsServer();
        return res || [];
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n: any) => !n.read_at).length;
  }, [notifications]);

  // TanStack Query: Customer Payment History Ledger
  const fetchCustomerPayments = useServerFn(getCustomerPaymentHistory);
  const { data: customerPayments = [], isLoading: loadingCustomerPayments } = useQuery({
    queryKey: ["client-payment-history", userId],
    queryFn: () => fetchCustomerPayments(),
    enabled: !!userId && userId !== "guest_user",
    staleTime: 10000,
  });

  // Sync profile details to local form state
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.company && !company) setCompany(profile.company);
    }
  }, [profile, fullName, phone, company]);

  // Sync localStorage fallback notes data
  useEffect(() => {
    if (userId && userId !== "guest_user") {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(`shafsky_notes_${userId}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setNotesData(parsed);
          } catch (_) {
            /* ignore */
          }
        }
      }
    }
  }, [userId]);

  // Realtime updates listener using query invalidation
  useEffect(() => {
    if (!userId || userId === "guest_user") return;

    const bookingsChannel = supabase
      .channel(`user-bookings-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["client-bookings", userId] });
        },
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["client-notifications", userId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [userId, queryClient]);

  // Mark all notifications read
  const markAllNotificationsRead = async () => {
    if (!userId || userId === "guest_user") return;
    try {
      const { markMyNotificationsReadServer } = await import("@/lib/user.functions");
      await markMyNotificationsReadServer();
      queryClient.invalidateQueries({ queryKey: ["client-notifications", userId] });
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notifications.");
    }
  };

  const convertQuote = (amount: number, from: string = "INR") => {
    const target = notesData.currency || "INR";
    if (from === target)
      return `${target === "INR" ? "₹" : target === "USD" ? "$" : "£"} ${amount.toLocaleString()}`;

    const rates: Record<string, number> = {
      INR: 1,
      USD: 0.012,
      GBP: 0.0094,
    };

    const baseAmount = amount / (rates[from] || 1);
    const converted = baseAmount * (rates[target] || 1);

    const symbol: Record<string, string> = {
      INR: "₹",
      USD: "$",
      GBP: "£",
    };

    return `${symbol[target] || target} ${Math.round(converted).toLocaleString()}`;
  };

  const saveNotesToDB = async (updatedNotes: typeof notesData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`shafsky_notes_${userId}`, JSON.stringify(updatedNotes));
    }
    setNotesData(updatedNotes);

    try {
      const { updateMyProfileServer } = await import("@/lib/user.functions");
      await updateMyProfileServer({ data: { notes: JSON.stringify(updatedNotes) } });
    } catch (e) {
      console.warn("DB notes column sync skipped - fallback is active.");
    }
  };

  // Save profile basic parameters
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { updateMyProfileServer } = await import("@/lib/user.functions");
      await updateMyProfileServer({
        data: {
          full_name: fullName,
          phone,
          company,
        },
      });
      toast.success("Profile parameters updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["client-profile", userId] });
    } catch (e) {
      console.error(e);
      toast.error("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Create new booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkOrigin.trim() || !bkDest.trim() || !bkDate) {
      toast.error("Please fill in Origin, Destination, and Departure Date.");
      return;
    }
    setBookingSubmitting(true);
    try {
      const contactEmail = bkEmail.trim() || (profile as any)?.contact_email || (authProfile as any)?.email || "";
      const contactName = bkName.trim() || fullName.trim() || (authProfile as any)?.user_metadata?.full_name || "Valued Guest";
      const contactPhone = bkPhone.trim() || phone.trim() || "";

      if (!contactEmail) {
        toast.error("Please enter a valid contact email.");
        setBookingSubmitting(false);
        return;
      }
      if (contactPhone.length < 6) {
        toast.error("Please enter a valid contact phone number.");
        setBookingSubmitting(false);
        return;
      }

      const res = await submitBookingFn({
        data: {
          passenger_name: contactName,
          contact_name: contactName,
          passenger_email: contactEmail,
          contact_email: contactEmail,
          passenger_phone: contactPhone,
          contact_phone: contactPhone,
          trip_type: "one_way",
          origin_code: bkOrigin.trim().toUpperCase(),
          origin: bkOrigin,
          dest_code: bkDest.trim().toUpperCase(),
          destination: bkDest,
          departure_time: `${bkDate}T10:00:00Z`,
          depart_date: bkDate,
          arrival_time: `${bkDate}T12:30:00Z`,
          pax_adults: bkAdults,
          pax_children: bkChildren,
          pax_infants: 0,
          service_type: bkService,
          notes: bkNotes,
          services: [
            {
              service_code: bkService.toLowerCase().replace(/\s+/g, "_"),
              service_name: bkService,
              category: "concierge",
              quantity: bkAdults + bkChildren,
              currency: "INR",
            },
          ],
        },
      });

      setBookingSuccess(true);
      toast.success(`Booking requested! Ref: ${res.booking_ref}`);
      queryClient.invalidateQueries({ queryKey: ["client-bookings", userId] });

      // Clear inputs
      setBkOrigin("");
      setBkDest("");
      setBkDate("");
      setBkNotes("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to dispatch booking request.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const formatRefDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  };

  // Saved passengers CRUD
  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!psName.trim() || !psNat.trim() || !psPass.trim()) {
      toast.error("Please fill in name, nationality, and passport details.");
      return;
    }

    const currentPassengers = notesData.passengers || [];

    if (editingPassengerId) {
      const updated = currentPassengers.map((p) =>
        p.id === editingPassengerId
          ? {
            id: p.id,
            fullName: psName,
            nationality: psNat,
            passportNumber: psPass,
            passportExpiry: psExp,
            type: psType,
          }
          : p,
      );
      saveNotesToDB({ ...notesData, passengers: updated });
      toast.success("Passenger details updated.");
      setEditingPassengerId(null);
    } else {
      const newPassenger: SavedPassenger = {
        id: Math.random().toString(36).substring(7),
        fullName: psName,
        nationality: psNat,
        passportNumber: psPass,
        passportExpiry: psExp,
        type: psType,
      };
      saveNotesToDB({ ...notesData, passengers: [...currentPassengers, newPassenger] });
      toast.success("New passenger registered.");
    }

    // Reset passenger form
    setPsName("");
    setPsNat("");
    setPsPass("");
    setPsExp("");
    setPsType("adult");
  };

  const handleEditPassenger = (p: SavedPassenger) => {
    setPsName(p.fullName);
    setPsNat(p.nationality);
    setPsPass(p.passportNumber);
    setPsExp(p.passportExpiry);
    setPsType(p.type);
    setEditingPassengerId(p.id);
  };

  const handleDeletePassenger = (id: string) => {
    const filtered = (notesData.passengers || []).filter((p) => p.id !== id);
    saveNotesToDB({ ...notesData, passengers: filtered });
    toast.success("Passenger removed.");
  };

  // Support Ticket creation
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tkSub.trim() || !tkMsg.trim()) {
      toast.error("Please enter a subject and your message.");
      return;
    }
    setTicketSubmitting(true);

    const newTicket: SupportTicket = {
      id: "TK-" + Math.floor(1000 + Math.random() * 9000),
      subject: tkSub,
      priority: tkPriority,
      message: tkMsg,
      status: "open",
      created_at: new Date().toLocaleDateString(),
    };

    const currentTickets = notesData.tickets || [];
    saveNotesToDB({ ...notesData, tickets: [...currentTickets, newTicket] });
    toast.success("Support ticket opened. Our ops team will reply in 15 mins.");

    setTkSub("");
    setTkMsg("");
    setTicketSubmitting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileNameDisplay(file.name);
      if (!docName.trim()) {
        setDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Secure Document locker upload
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      toast.error("Please specify a document name/tag.");
      return;
    }
    setDocSubmitting(true);

    const newDoc: DocumentLocker & { fileData?: string } = {
      id: "DOC-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      name: docName,
      type: docType,
      uploaded_at: new Date().toLocaleDateString(),
      fileData: selectedFileBase64 || undefined,
    };

    const currentDocs = notesData.documents || [];
    saveNotesToDB({ ...notesData, documents: [...currentDocs, newDoc] });
    toast.success("Document uploaded and encrypted securely.");

    setDocName("");
    setFileNameDisplay(null);
    setSelectedFileBase64(null);
    setDocSubmitting(false);
  };

  const handleDeleteDocument = (id: string) => {
    const filtered = (notesData.documents || []).filter((d) => d.id !== id);
    saveNotesToDB({ ...notesData, documents: filtered });
    toast.success("Document removed from locker.");
  };

  const handleCancelBooking = async (bId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      const { cancelMyBookingServer } = await import("@/lib/bookings.functions");
      await cancelMyBookingServer({
        data: {
          bookingId: bId,
          reason: "Cancelled by customer from dashboard",
        },
      });
      toast.success("Booking request cancelled.");
      queryClient.invalidateQueries({ queryKey: ["client-bookings", userId] });
      if (selectedBooking?.id === bId) {
        setSelectedBooking((prev: Booking | null) =>
          prev ? { ...prev, status: "cancelled" } : null,
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel booking.");
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingId || !rescheduleDate) return;
    setRescheduleSubmitting(true);
    try {
      const { updateBookingDetailsServer } = await import("@/lib/bookings.functions");
      await updateBookingDetailsServer({
        data: {
          bookingId: reschedulingId,
          updateData: { depart_date: rescheduleDate },
        },
      });
      toast.success("Reschedule request submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["client-bookings", userId] });
      setSelectedBooking(null);
      setReschedulingId(null);
      setRescheduleDate("");
    } catch (e) {
      console.error(e);
      toast.error("Could not request reschedule.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const handleRepeatBooking = (b: Booking) => {
    setBkOrigin(b.origin);
    setBkDest(b.destination);
    setBkDate(b.depart_date);
    setBkService(b.service_type || "Meet & Greet Concierge");
    setBkAdults(b.pax_adults);
    setBkNotes(b.notes || "");
    setActiveTab("new-booking");
    setSelectedBooking(null);
    toast.info("Booking details pre-filled. Review and submit.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password changed successfully.");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "reviewing",
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "approved",
  ).length;

  // Calculate completion percentage
  let profileCompletion = 25; // default verified email/auth
  if (fullName) profileCompletion += 25;
  if (phone) profileCompletion += 25;
  if (notesData.passengers && notesData.passengers.length > 0) profileCompletion += 15;
  if (notesData.documents && notesData.documents.length > 0) profileCompletion += 10;

  if (loadingProfile || loadingBookings) {
    return (
      <div className="min-h-screen bg-[#faf5ea] flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-[#0d5a6e] animate-spin" />
        <span className="mt-4 text-xs font-mono tracking-widest text-[#5b6b75] uppercase">
          Loading Account Console...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5ea] text-[#0d2a36] flex flex-col">
      {/* Top Banner space to clear the floating header navigation */}
      <div className="h-24 bg-[#0d2a36]" />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1480px] w-full mx-auto p-4 lg:p-8 gap-6">
        {/* Navigation Sidebar Panel */}
        <aside
          className="w-full lg:w-72 bg-[#faf5ea] rounded-3xl border border-black/[0.06] p-6 shrink-0 flex flex-col justify-between"
          style={{ boxShadow: "8px 8px 24px #e8e0d0, -8px -8px 24px #ffffff" }}
        >
          <div>
            {/* User details header */}
            <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-black/[0.06]">
              <div className="h-12 w-12 rounded-full bg-[#0d5a6e]/10 border border-[#0d5a6e]/20 flex items-center justify-center text-xl font-bold text-[#0d5a6e]">
                {fullName
                  ? fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                  : "U"}
              </div>
              <div className="truncate">
                <div className="text-[13px] font-bold text-[#0d2a36] truncate">
                  {fullName || "Aviation Client"}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                  Elite Guest Gold
                </div>
              </div>
            </div>

            {/* Sidebar navigation list */}
            <nav className="space-y-1.5">
              {[
                { id: "home", label: "Dashboard Home", icon: LayoutDashboard },
                { id: "bookings", label: "My Bookings", icon: Calendar },
                { id: "new-booking", label: "Request Flight", icon: Plane },
                { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
                { id: "passengers", label: "Saved Passengers", icon: Users },
                { id: "documents", label: "Secure Locker", icon: FileText },
                { id: "billing", label: "Billing & Invoices", icon: CreditCard },
                { id: "support", label: "Support Desk", icon: Headphones },
                { id: "settings", label: "Console Settings", icon: Settings },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setBookingSuccess(false);
                      setEditingPassengerId(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive
                        ? "bg-[#0d5a6e] text-white shadow-md shadow-[#0d5a6e]/15 translate-x-1"
                        : "text-[#5b6b75] hover:text-[#0d2a36] hover:bg-black/[0.02]"
                      }`}
                    style={mono}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-[#5fb5ad] text-[#06090f] px-2 py-0.5 rounded-full text-[9px] font-extrabold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-2">
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-[#0d5a6e] hover:bg-[#0d5a6e]/5 transition cursor-pointer"
              style={mono}
            >
              <Home className="h-4.5 w-4.5 shrink-0" />
              Return to Website
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition cursor-pointer"
              style={mono}
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              Secure Logout
            </button>
          </div>
        </aside>

        {/* Dashboard Main Workspace Area */}
        <main className="flex-1 min-w-0">
          <div
            className="bg-[#faf5ea] rounded-3xl border border-white/40 p-6 lg:p-10 min-h-[600px] flex flex-col justify-between"
            style={{ boxShadow: "12px 12px 30px #e8e0d0, -12px -12px 30px #ffffff" }}
          >
            {/* TAB CONTENT: HOME */}
            {activeTab === "home" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Welcome section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[#0d2a36] to-[#0a4252] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 rounded-full bg-white/[0.03] pointer-events-none" />
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider" style={display}>
                      Welcome back, {fullName || "Guest User"}!
                    </h2>
                    <p className="text-[11px] text-white/60 tracking-wider uppercase font-mono mt-1">
                      Cleared for operations console | Member tier: Gold
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("new-booking")}
                    className="bg-[#5fb5ad] text-[#0d2a36] hover:bg-[#4ea8a0] transition-colors rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest active:scale-95 shadow-md"
                    style={mono}
                  >
                    Request Flight →
                  </button>
                </div>

                {/* Main stats block */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Bookings", val: totalBookings, color: "#0d5a6e" },
                    { label: "Confirmed Flights", val: confirmedBookings, color: "#5fb5ad" },
                    { label: "Pending Reviews", val: pendingBookings, color: "#d97706" },
                    { label: "Completed Journeys", val: completedBookings, color: "#10b981" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-5 rounded-2xl bg-[#faf5ea] border border-white/50 text-left transition duration-300"
                      style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#5b6b75] font-mono">
                        {stat.label}
                      </div>
                      <div className="text-3xl font-bold text-[#0d2a36] mt-2" style={display}>
                        {stat.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Completion */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                        Profile Completion Meter
                      </h3>
                      <span className="text-[11px] font-bold font-mono text-[#0d5a6e]">
                        {profileCompletion}%
                      </span>
                    </div>
                    <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0d5a6e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#5b6b75] leading-relaxed">
                      Complete passport information and companion listings to reach 100% and access
                      fast-track checkout capabilities.
                    </p>
                  </div>

                  {/* System Announcement */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-3 flex items-start gap-4"
                    style={{ boxShadow: "6px 6px 14px #e8e0d0, -6px -6px 14px #ffffff" }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                        Operations Update
                      </h3>
                      <p className="text-xs text-[#0d2a36] font-semibold mt-1">
                        New VIP Lounge Open at New Delhi (DEL)
                      </p>
                      <p className="text-[10px] text-[#5b6b75] leading-relaxed mt-1">
                        Shafsky clients now possess automated elite access credentials to the
                        private rest suite at DEL airport. No reservation required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications & Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#0d2a36]">
                    Recent Activity Timeline
                  </h3>
                  <div className="rounded-2xl border border-black/[0.04] p-5 space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[#5b6b75] font-mono">
                        No recent operations or activities logged.
                      </div>
                    ) : (
                      bookings.slice(0, 3).map((b, i) => (
                        <div key={b.id} className="flex gap-4 items-start text-left">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0d5a6e] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0d2a36]">
                              Flight {b.booking_ref} requested: {b.origin} → {b.destination}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                              Status: {b.status} | Date: {b.depart_date}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                    style={display}
                  >
                    My Flights & Bookings
                  </h2>
                  <button
                    onClick={() => setActiveTab("new-booking")}
                    className="flex items-center gap-1.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition"
                    style={mono}
                  >
                    <Plus size={14} /> New Request
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-black/10">
                    <Calendar className="h-10 w-10 text-[#5b6b75] mx-auto opacity-45" />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#5b6b75] font-mono">
                      No Flights Cataloged
                    </p>
                    <p className="text-[11px] text-[#5b6b75]/80 mt-1 max-w-xs mx-auto leading-relaxed">
                      You haven't requested any flight concierge services yet. Open a request today.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold font-mono text-[#0d5a6e] bg-[#0d5a6e]/5 px-2 py-0.5 rounded">
                              {b.booking_ref}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono ${b.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : b.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : b.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#0d2a36]" style={display}>
                            {b.origin} → {b.destination}
                          </div>
                          <div className="text-[10px] text-[#5b6b75] font-mono">
                            Date: {b.depart_date} | Guests: {b.pax_adults} Adult(s)
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3.5 py-2 border border-black/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/[0.02] cursor-pointer"
                            style={mono}
                          >
                            Details
                          </button>
                          {b.status === "pending" && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 cursor-pointer"
                              style={mono}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Booking details modal */}
                {selectedBooking && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#faf5ea] rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl relative">
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="absolute right-6 top-6 text-[#5b6b75] hover:text-[#0d2a36] font-bold text-xs"
                      >
                        Close [x]
                      </button>

                      <h3
                        className="text-xl font-bold uppercase tracking-wider mb-6"
                        style={display}
                      >
                        Flight Concierge Ticket
                      </h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-black/[0.06]">
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Reference ID
                            </div>
                            <div className="text-xs font-bold font-mono text-[#0d2a36]">
                              {selectedBooking.booking_ref}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Status
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-right text-[#0d5a6e]">
                              {selectedBooking.status}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Origin
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.origin}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Destination
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.destination}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Departure Date
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.depart_date}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Passengers
                            </div>
                            <div className="text-xs font-semibold text-[#0d2a36]">
                              {selectedBooking.pax_adults} Adult(s)
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                              Service Quote
                            </div>
                            <div className="text-xs font-semibold text-[#0d5a6e]">
                              {selectedBooking.quote_amount
                                ? convertQuote(
                                  selectedBooking.quote_amount,
                                  selectedBooking.quote_currency || "INR",
                                )
                                : "Reviewing"}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                            Assigned Service
                          </div>
                          <div className="text-xs font-semibold text-[#0d2a36]">
                            {selectedBooking.service_type || "Standard Assistance"}
                          </div>
                          {selectedBooking.notes && (
                            <div className="pt-2">
                              <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                                Special Requests
                              </div>
                              <div className="text-xs text-[#5b6b75] mt-0.5 italic">
                                "{selectedBooking.notes}"
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Real QR Code with booking data */}
                        <div className="flex flex-col items-center justify-center p-5 border border-dashed border-black/10 rounded-2xl bg-white/60">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <QRCodeSVG
                              value={JSON.stringify({
                                ref: selectedBooking.booking_ref,
                                name: selectedBooking.contact_name,
                                from: selectedBooking.origin,
                                to: selectedBooking.destination,
                                date: selectedBooking.depart_date,
                                pax: selectedBooking.pax_adults + selectedBooking.pax_children + selectedBooking.pax_infants,
                                service: selectedBooking.service_type || "Standard",
                                status: selectedBooking.status,
                                issued: new Date().toISOString().split("T")[0],
                                verify: `https://shafskyaviation.com/verify/${selectedBooking.booking_ref}`,
                              })}
                              size={140}
                              level="M"
                              bgColor="#ffffff"
                              fgColor="#0d2a36"
                              includeMargin={false}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-[#5b6b75] uppercase mt-3 tracking-widest">
                            Scan boarding credentials at Shafsky counter
                          </span>
                          <span className="text-[7px] font-mono text-[#5b6b75]/50 mt-0.5">
                            Ref: {selectedBooking.booking_ref}
                          </span>
                        </div>

                        {/* CUSTOMER QUOTE ACTION BAR */}
                        {Boolean(selectedBooking.quote_amount) && (
                          <div className="p-4 rounded-xl bg-[#0d5a6e]/5 border border-[#0d5a6e]/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0d5a6e]" style={mono}>
                                Official Quotation Available
                              </span>
                              <span className="text-xs font-bold text-[#0d2a36]" style={mono}>
                                {selectedBooking.quote_currency || "INR"} {Number(selectedBooking.quote_amount).toLocaleString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => {
                                  toast.info(`Viewing Quotation for Ref: ${selectedBooking.booking_ref}`);
                                }}
                                className="py-2 bg-white border border-black/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#0d2a36] hover:bg-black/5 transition cursor-pointer"
                                style={mono}
                              >
                                View Quote
                              </button>

                              <button
                                onClick={() => {
                                  toast.success(`Redirecting to Secure Payment Gateway for Ref: ${selectedBooking.booking_ref}`);
                                }}
                                className="py-2 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                style={mono}
                              >
                                Accept & Pay
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt("Enter revision instructions for our ops team:");
                                  if (reason) {
                                    toast.success("Revision request submitted to Ops Desk.");
                                  }
                                }}
                                className="py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-amber-100 transition cursor-pointer"
                                style={mono}
                              >
                                Request Revision
                              </button>
                            </div>
                          </div>
                        )}

                        {reschedulingId === selectedBooking.id ? (
                          <form
                            onSubmit={handleReschedule}
                            className="p-4 rounded-xl bg-amber-50 border border-amber-200/50 space-y-3"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800 font-mono">
                              Request New Departure Date
                            </div>
                            <input
                              type="date"
                              required
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-black/10 bg-white text-xs outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setReschedulingId(null)}
                                className="flex-1 py-1.5 border border-black/10 rounded-lg text-[9px] font-bold uppercase font-mono bg-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={rescheduleSubmitting}
                                className="flex-1 py-1.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white rounded-lg text-[9px] font-bold uppercase font-mono cursor-pointer"
                              >
                                {rescheduleSubmitting ? "Submitting..." : "Confirm"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setReschedulingId(selectedBooking.id);
                                setRescheduleDate(selectedBooking.depart_date);
                              }}
                              className="flex-1 py-2 border border-black/10 rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
                              style={mono}
                            >
                              Request Reschedule
                            </button>
                            <button
                              onClick={() => handleRepeatBooking(selectedBooking)}
                              className="flex-1 py-2 border border-[#0d5a6e]/20 text-[#0d5a6e] rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-[#0d5a6e]/5 cursor-pointer"
                              style={mono}
                            >
                              Repeat Booking
                            </button>
                          </div>
                        )}

                        {(() => {
                          const customerDocs = (bookingDocs || []).filter(
                            (d: any) =>
                              d.document_type !== "booking_summary" &&
                              d.document_type !== "internal_ops_sheet"
                          );
                          const latestCustomerDocsMap = new Map();
                          for (const d of customerDocs) {
                            const type = d.document_type || d.kind;
                            if (!latestCustomerDocsMap.has(type)) {
                              latestCustomerDocsMap.set(type, d);
                            }
                          }
                          const latestCustomerDocs = Array.from(latestCustomerDocsMap.values());

                          if (latestCustomerDocs.length === 0) return null;

                          return (
                            <div className="space-y-2.5 pt-3 border-t border-black/[0.06] text-left">
                              <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono">
                                Official Journey Documents
                              </div>
                              <div className="grid gap-2">
                                {latestCustomerDocs.map((d: any) => {
                                  const docLabel = (d.document_type || d.kind)
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c: string) => c.toUpperCase());
                                  return (
                                    <div
                                      key={d.id}
                                      className="flex justify-between items-center px-4 py-3 bg-white/80 border border-black/[0.04] rounded-xl hover:shadow-sm transition-all"
                                    >
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-[#0d2a36]">
                                          {docLabel}
                                        </div>
                                        <div className="text-[9px] text-[#5b6b75] font-mono mt-0.5">
                                          Version v{d.version || 1} · {d.filename || `${d.kind}.pdf`}
                                        </div>
                                      </div>
                                      <a
                                        href={d.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="shrink-0 px-3 py-1.5 bg-[#0d5a6e]/5 hover:bg-[#0d5a6e]/10 text-[#0d5a6e] border border-[#0d5a6e]/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                        style={mono}
                                      >
                                        <Download size={10} /> Get
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="flex-1 py-2.5 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            style={mono}
                          >
                            <Download size={13} /> Print Confirmation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: NEW BOOKING */}
            {activeTab === "new-booking" && (
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
                          {notesData.passengers.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setBkNotes(
                                  (prev) =>
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
            )}

            {/* TAB CONTENT: PASSENGERS */}
            {activeTab === "passengers" && (
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
                        {notesData.passengers.map((p) => (
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
            )}

            {/* TAB CONTENT: DOCUMENTS */}
            {activeTab === "documents" && (
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
                        {notesData.documents.map((d) => (
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
            )}

            {/* TAB CONTENT: BILLING */}
            {activeTab === "billing" && (
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
            )}

            {/* TAB CONTENT: SUPPORT */}
            {activeTab === "support" && (
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
                        {notesData.tickets.map((t) => (
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
            )}

            {/* TAB CONTENT: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-[#0d2a36]"
                  style={display}
                >
                  Account & Console Settings
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Profile */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Update Profile Information
                    </h3>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 99999 99999"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Company / Corporate Affiliation
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Shafsky Aviation Services Pvt Ltd"
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        style={mono}
                      >
                        {savingProfile ? "Syncing..." : "Sync Profile Changes"}
                      </button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Update Security Credentials
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-bold">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full h-10 px-3.5 rounded-lg border border-black/10 bg-transparent text-xs font-semibold outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full h-10 bg-[#0d5a6e] hover:bg-[#0a4252] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                        style={mono}
                      >
                        {updatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>

                  {/* Preferences settings */}
                  <div
                    className="p-6 rounded-2xl bg-[#faf5ea] border border-white/50 space-y-4"
                    style={{ boxShadow: "4px 4px 12px #e8e0d0, -4px -4px 12px #ffffff" }}
                  >
                    <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#0d2a36]">
                      Console Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-black/[0.04]">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">Preferred Currency</div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Quote conversions
                          </div>
                        </div>
                        <select
                          value={notesData.currency || "INR"}
                          onChange={(e) =>
                            saveNotesToDB({ ...notesData, currency: e.target.value })
                          }
                          className="h-9 px-2.5 rounded border border-black/10 bg-transparent text-xs outline-none font-semibold"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-black/[0.04]">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">Visual Theme</div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Light or dark presentation
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newMode = !notesData.dark_mode;
                            saveNotesToDB({ ...notesData, dark_mode: newMode });
                            toast.info(`Theme set to ${newMode ? "Dark" : "Light"} mode.`);
                          }}
                          className="px-3 py-1.5 border border-black/10 rounded text-[9px] font-bold uppercase tracking-wider font-mono hover:bg-black/5"
                        >
                          {notesData.dark_mode ? "Dark Mode" : "Light Mode"}
                        </button>
                      </div>

                      <div className="flex justify-between items-center pb-3">
                        <div>
                          <div className="text-xs font-bold text-[#0d2a36]">
                            Two-Factor Authorization
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                            Security code validation
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Simulated / Off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
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
                    notifications.map((notif) => {
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
            )}

            {/* Global Footer elements */}
            <footer className="mt-10 pt-6 border-t border-black/[0.06] text-center text-[10px] tracking-wider text-[#5b6b75] uppercase font-mono flex flex-col md:flex-row justify-between gap-4">
              <span>Shafsky Aviation Services — Client Dashboard v2.0</span>
              <span>All operations encrypted via SSL</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
