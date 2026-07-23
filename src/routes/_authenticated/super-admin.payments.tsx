import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPaymentLedger } from "@/lib/payments.functions";
import {
  SAPageHeader,
  SASearchBar,
  SADataTable,
  SAStatusBadge,
  SAKpiCard,
  saMono,
} from "@/components/super-admin/SAComponents";
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Download, ShieldCheck, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/super-admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const fetchLedger = useServerFn(listPaymentLedger);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ["payment-ledger", search, providerFilter, statusFilter],
    queryFn: () =>
      fetchLedger({
        data: {
          search,
          provider: providerFilter,
          status: statusFilter,
        },
      }),
    staleTime: 10000,
  });

  const totalRevenue = (ledger as any[])
    .filter((t) => ["completed", "confirmed"].includes(String(t.status)))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const pendingRevenue = (ledger as any[])
    .filter((t) => String(t.status) === "pending")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const refundedAmount = (ledger as any[])
    .filter((t) => String(t.status) === "refunded")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const handleDownloadReceipt = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from("booking-docs").createSignedUrl(path, 300);
      if (error || !data?.signedUrl) throw new Error(error?.message || "Signed URL failed");
      window.open(data.signedUrl, "_blank");
    } catch (e) {
      alert("Failed to download receipt PDF");
    }
  };

  return (
    <div className="space-y-6">
      <SAPageHeader
        title="Enterprise Payment Ledger"
        subtitle="Transactional settlements, provider gateways, and receipt audit log"
        breadcrumbs={[{ label: "Super Admin", href: "/super-admin" }, { label: "Payment Ledger" }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SAKpiCard
          label="Confirmed Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="Settled payments"
          trendUp={true}
        />
        <SAKpiCard
          label="Pending Revenue"
          value={`₹${pendingRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend="Pending clearance"
        />
        <SAKpiCard
          label="Refunded Total"
          value={`₹${refundedAmount.toLocaleString()}`}
          icon={AlertCircle}
          trend="Reversed settlements"
          trendUp={false}
        />
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SASearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by booking ref, customer, transaction ID..."
          className="max-w-md"
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/50" style={saMono}>
            <Filter className="w-3.5 h-3.5" /> Provider:
          </div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#0c121b] border border-white/10 text-white font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#a78bfa]"
          >
            <option value="all">All Gateways</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-white/50 ml-2" style={saMono}>
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0c121b] border border-white/10 text-white font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#a78bfa]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <SADataTable
        columns={[
          {
            key: "payment_id",
            label: "Payment ID / Ref",
            render: (row: any) => (
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#a78bfa] block truncate max-w-[140px]" style={saMono}>
                  {row.payment_id}
                </span>
                <Link
                  to="/admin/bookings/$id"
                  params={{ id: row.booking_id }}
                  className="text-[10px] text-white/40 hover:text-white font-mono block underline"
                >
                  Ref: {row.booking_ref}
                </Link>
              </div>
            ),
          },
          {
            key: "contact_name",
            label: "Customer",
            render: (row: any) => (
              <div>
                <span className="text-white/90 font-medium block text-xs">{row.contact_name}</span>
                <span className="text-white/40 text-[10px] block" style={saMono}>
                  {row.contact_email}
                </span>
              </div>
            ),
          },
          {
            key: "provider",
            label: "Provider / Txn ID",
            render: (row: any) => (
              <div className="space-y-0.5 font-mono text-xs">
                <span
                  className={`inline-block px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded ${
                    row.provider === "stripe"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {row.provider}
                </span>
                <span className="text-white/40 text-[10px] block truncate max-w-[120px]">
                  {row.provider_payment_id}
                </span>
              </div>
            ),
          },
          {
            key: "amount",
            label: "Amount",
            render: (row: any) => (
              <span className="text-emerald-400 font-semibold text-xs" style={saMono}>
                {row.currency || "INR"} {Number(row.amount).toLocaleString()}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row: any) => <SAStatusBadge status={String(row.status)} />,
          },
          {
            key: "transaction_time",
            label: "Date",
            render: (row: any) => (
              <span className="text-white/40 text-xs" style={saMono}>
                {new Date(String(row.transaction_time || row.created_at)).toLocaleString()}
              </span>
            ),
          },
          {
            key: "receipt",
            label: "Receipt",
            render: (row: any) =>
              row.receipt_path ? (
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(row.receipt_path)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded text-[10px] font-mono transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3 text-[#5ed3ff]" /> PDF
                </button>
              ) : (
                <span className="text-white/20 text-[10px] font-mono">None</span>
              ),
          },
        ]}
        data={ledger}
        isLoading={isLoading}
        emptyIcon={CreditCard}
        emptyMessage="No payment ledger records found"
      />
    </div>
  );
}
