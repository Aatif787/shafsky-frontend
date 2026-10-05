import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth-system/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { getCustomerPaymentHistory } from "@/lib/payments.functions";
import { LayoutDashboard, Plane, Calendar, Users, FileText, CreditCard, Headphones, Settings, LogOut, Loader2, Home, Bell } from "lucide-react";
import { toast } from "sonner";
import { mono } from "@/components/dashboard/theme";
import type { Booking, SavedPassenger, SupportTicket, DocumentLocker, DashboardTab, NotesData } from "@/components/dashboard/types";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";

const HomeTab = React.lazy(() => import("@/components/dashboard/tabs/HomeTab"));
const BookingsTab = React.lazy(() => import("@/components/dashboard/tabs/BookingsTab"));
const NewBookingTab = React.lazy(() => import("@/components/dashboard/tabs/NewBookingTab"));
const PassengersTab = React.lazy(() => import("@/components/dashboard/tabs/PassengersTab"));
const DocumentsTab = React.lazy(() => import("@/components/dashboard/tabs/DocumentsTab"));
const BillingTab = React.lazy(() => import("@/components/dashboard/tabs/BillingTab"));
const SupportTab = React.lazy(() => import("@/components/dashboard/tabs/SupportTab"));
const SettingsTab = React.lazy(() => import("@/components/dashboard/tabs/SettingsTab"));
const NotificationsTab = React.lazy(() => import("@/components/dashboard/tabs/NotificationsTab"));


function formatAccountRole(role: string): string {
  return role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function DashboardView({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const submitBookingFn = useServerFn(createBooking);
  const { user, updatePassword, profile: authProfile, signOut } = useAuth();
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
  const [bkName] = useState("");
  const [bkEmail] = useState("");
  const [bkPhone] = useState("");
  const [bkOrigin, setBkOrigin] = useState("");
  const [bkDest, setBkDest] = useState("");
  const [bkDate, setBkDate] = useState("");
  const [bkService, setBkService] = useState("Meet & Greet Concierge");
  const [bkAdults, setBkAdults] = useState(1);
  const [bkChildren] = useState(0);
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

  // Saved passengers CRUD
  const handleAddPassenger = (e: React.SubmitEvent<HTMLFormElement>) => {
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
  const handleCreateTicket = (e: React.SubmitEvent<HTMLFormElement>) => {
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
  const handleUploadDocument = (e: React.SubmitEvent<HTMLFormElement>) => {
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

  const handleReschedule = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

  const handleChangePassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

  const loadedProfile = profile as {
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
  } | null;
  const accountEmail = loadedProfile?.email || user?.email || "";
  const accountPhone = phone || loadedProfile?.phone || "";
  const accountCompany = company || loadedProfile?.company || "";
  const accountRole = formatAccountRole(authProfile?.role || loadedProfile?.role || "customer");
  const accountFields = [
    { label: "Full Name", value: fullName || "—" },
    { label: "Email", value: accountEmail || "—" },
    { label: "Phone", value: accountPhone || "—" },
    { label: "Company", value: accountCompany || "—" },
    { label: "Role", value: accountRole },
  ];

  // Shared state/handlers handed to the lazy-loaded tab components.
  const ctx = { userId, user, updatePassword, authProfile, signOut, queryClient, submitBookingFn, activeTab, setActiveTab, notesData, setNotesData, selectedBooking, setSelectedBooking, fullName, setFullName, phone, setPhone, company, setCompany, savingProfile, setSavingProfile, bkName, bkEmail, bkPhone, bkOrigin, setBkOrigin, bkDest, setBkDest, bkDate, setBkDate, bkService, setBkService, bkAdults, setBkAdults, bkChildren, bkNotes, setBkNotes, bookingSubmitting, setBookingSubmitting, bookingSuccess, setBookingSuccess, reschedulingId, setReschedulingId, rescheduleDate, setRescheduleDate, rescheduleSubmitting, setRescheduleSubmitting, psName, setPsName, psNat, setPsNat, psPass, setPsPass, psExp, setPsExp, psType, setPsType, editingPassengerId, setEditingPassengerId, tkSub, setTkSub, tkPriority, setTkPriority, tkMsg, setTkMsg, ticketSubmitting, setTicketSubmitting, docType, setDocType, docName, setDocName, docSubmitting, setDocSubmitting, selectedFileBase64, setSelectedFileBase64, fileNameDisplay, setFileNameDisplay, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword, updatingPassword, setUpdatingPassword, profile, bookings, loadingBookings, bookingDocs, notifications, unreadCount, fetchCustomerPayments, customerPayments, loadingCustomerPayments, markAllNotificationsRead, convertQuote, saveNotesToDB, handleSaveProfile, handleCreateBooking, handleAddPassenger, handleEditPassenger, handleDeletePassenger, handleCreateTicket, handleFileSelect, handleUploadDocument, handleDeleteDocument, handleCancelBooking, handleReschedule, handleRepeatBooking, handleChangePassword, handleLogout, totalBookings, pendingBookings, completedBookings, confirmedBookings, profileCompletion, loadedProfile, accountEmail, accountPhone, accountCompany, accountRole, accountFields };

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
                <div className="text-[10px] text-[#5b6b75] truncate mt-0.5">
                  {accountEmail || "—"}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#5b6b75] font-mono mt-0.5">
                  {accountRole}
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
                { id: "settings", label: "Account", icon: Settings },
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
            <Suspense fallback={<DashboardSkeleton />}>
              {activeTab === "home" && <HomeTab ctx={ctx} />}
              {activeTab === "bookings" && <BookingsTab ctx={ctx} />}
              {activeTab === "new-booking" && <NewBookingTab ctx={ctx} />}
              {activeTab === "passengers" && <PassengersTab ctx={ctx} />}
              {activeTab === "documents" && <DocumentsTab ctx={ctx} />}
              {activeTab === "billing" && <BillingTab ctx={ctx} />}
              {activeTab === "support" && <SupportTab ctx={ctx} />}
              {activeTab === "settings" && <SettingsTab ctx={ctx} />}
              {activeTab === "notifications" && <NotificationsTab ctx={ctx} />}
            </Suspense>

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
