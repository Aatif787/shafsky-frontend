import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Eye,
  FileText,
  Send,
  Save,
  CheckCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  User,
  Plane,
  Percent,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { pageMono, pageDisplay } from "@/components/site/PageShell";

export interface LineItem {
  id: string;
  name: string;
  category: "departure" | "arrival" | "charter" | "add_on";
  quantity: number;
  unitPrice: number;
}

export interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    booking_ref: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    company?: string | null;
    trip_type: string;
    origin: string;
    destination: string;
    depart_date: string;
    return_date?: string | null;
    pax_adults: number;
    pax_children: number;
    pax_infants: number;
    quote_amount?: number | null;
    quote_currency?: string | null;
    service_type?: string | null;
    notes?: string | null;
    status: string;
  };
  existingServices?: Array<{
    id?: string;
    service_code?: string;
    service_name: string;
    category?: string;
    quantity: number;
    unit_price?: number | null;
    currency?: string;
  }>;
  onSendQuote: (quoteAmount: number, currency: string, notes?: string) => Promise<void>;
  onSaveDraft: (
    quoteAmount: number,
    currency: string,
    notes?: string,
    services?: Array<{ service_name: string; quantity: number; unit_price: number; currency: string }>,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_PRESETS: Array<{ name: string; category: "departure" | "arrival" | "charter" | "add_on"; unitPrice: number }> = [
  { name: "Meet & Greet Concierge", category: "departure", unitPrice: 12000 },
  { name: "Fast-Track Priority Security", category: "departure", unitPrice: 7500 },
  { name: "First Class Airport Lounge Suite", category: "departure", unitPrice: 9500 },
  { name: "Tarmac Transfer (Mercedes S-Class)", category: "departure", unitPrice: 14000 },
  { name: "Baggage Porter & Escort Service", category: "arrival", unitPrice: 4800 },
  { name: "Immigration Priority Clearance Lane", category: "arrival", unitPrice: 7500 },
  { name: "Private Jet Charter Operational Base", category: "charter", unitPrice: 150000 },
  { name: "Catering & In-flight Bespoke Refreshments", category: "add_on", unitPrice: 8500 },
];

export function QuoteBuilderModal({
  isOpen,
  onClose,
  booking,
  existingServices = [],
  onSendQuote,
  onSaveDraft,
  isSubmitting = false,
}: QuoteBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [currency, setCurrency] = useState<string>(booking.quote_currency || "INR");

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [enableGst, setEnableGst] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(18);
  const [quoteNotes, setQuoteNotes] = useState<string>(
    "Quotation valid for 7 days. Pricing includes airport coordination fees, dedicated host, and security credentials.",
  );

  // Default valid date: 7 days from now
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  // Custom new line item input states
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number | "">("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemCategory, setNewItemCategory] = useState<"departure" | "arrival" | "charter" | "add_on">("departure");

  // Initialize line items from booking or existingServices
  useEffect(() => {
    if (existingServices && existingServices.length > 0) {
      setLineItems(
        existingServices.map((s, idx) => ({
          id: `svc-${idx}-${Date.now()}`,
          name: s.service_name,
          category: (s.category as any) || "departure",
          quantity: s.quantity || 1,
          unitPrice: s.unit_price ? Number(s.unit_price) : 10000,
        })),
      );
    } else if (booking.quote_amount && booking.quote_amount > 0) {
      setLineItems([
        {
          id: `initial-1`,
          name: booking.service_type || "Airport Concierge Services",
          category: booking.service_type === "Private Charter" ? "charter" : "departure",
          quantity: 1,
          unitPrice: Number(booking.quote_amount),
        },
      ]);
    } else {
      // Default initial line item based on service type
      const isCharter = booking.service_type === "Private Charter";
      setLineItems([
        {
          id: "default-1",
          name: isCharter ? "Private Jet Charter Services" : "VIP Concierge & Meet & Assist Package",
          category: isCharter ? "charter" : "departure",
          quantity: 1,
          unitPrice: isCharter ? 185000 : 18000,
        },
      ]);
    }
  }, [booking, existingServices]);

  // Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    if (!discountValue || discountValue <= 0) return 0;
    if (discountType === "percentage") {
      return Math.round((subtotal * Math.min(100, discountValue)) / 100);
    }
    return Math.min(subtotal, discountValue);
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const gstAmount = useMemo(() => {
    if (!enableGst || gstRate <= 0) return 0;
    return Math.round((taxableAmount * gstRate) / 100);
  }, [taxableAmount, enableGst, gstRate]);

  const grandTotal = useMemo(() => {
    return taxableAmount + gstAmount;
  }, [taxableAmount, gstAmount]);

  if (!isOpen) return null;

  const handleAddLineItem = () => {
    if (!newItemName.trim()) return;
    const price = typeof newItemPrice === "number" ? newItemPrice : 0;
    setLineItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newItemName.trim(),
        category: newItemCategory,
        quantity: Math.max(1, newItemQty),
        unitPrice: Math.max(0, price),
      },
    ]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty(1);
  };

  const handleAddPreset = (preset: (typeof DEFAULT_PRESETS)[0]) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `preset-${Date.now()}-${Math.random()}`,
        name: preset.name,
        category: preset.category,
        quantity: 1,
        unitPrice: preset.unitPrice,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: "quantity" | "unitPrice" | "name", value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    );
  };

  const formatMoney = (amount: number) => {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  };

  const handleSaveDraftClick = async () => {
    const servicesPayload = lineItems.map((item) => ({
      service_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency,
    }));
    await onSaveDraft(grandTotal, currency, quoteNotes, servicesPayload);
  };

  const handleSendQuoteClick = async () => {
    await onSendQuote(grandTotal, currency, quoteNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0c121b] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080d14]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 text-[#5ed3ff]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide" style={pageDisplay}>
                  Enterprise Quote Builder
                </h2>
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold bg-[#5ed3ff]/10 border border-[#5ed3ff]/20 text-[#5ed3ff] rounded font-mono">
                  Ref: {booking.booking_ref}
                </span>
              </div>
              <p className="text-xs text-white/50" style={pageMono}>
                Shafsky Aviation · Luxury Quotation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex bg-white/5 p-1 rounded border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === "editor"
                    ? "bg-[#5ed3ff] text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
                style={pageMono}
              >
                <Calculator className="w-3.5 h-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === "preview"
                    ? "bg-[#5ed3ff] text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
                style={pageMono}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Booking Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-mono">
                Passenger
              </span>
              <span className="font-semibold text-white/90 truncate block">
                {booking.contact_name}
              </span>
              <span className="text-[10px] text-white/40 font-mono block">
                {booking.contact_email}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-mono">
                Flight Itinerary
              </span>
              <span className="font-semibold text-white/90 block">
                {booking.origin} → {booking.destination}
              </span>
              <span className="text-[10px] text-white/40 font-mono block">
                {booking.depart_date}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-mono">
                Passengers
              </span>
              <span className="font-semibold text-white/90 block">
                {booking.pax_adults} Adult(s) {booking.pax_children > 0 ? `, ${booking.pax_children} Child` : ""}
              </span>
              <span className="text-[10px] text-[#5ed3ff] font-mono block">
                {booking.service_type || "Standard Assistance"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider font-mono">
                Quote Currency
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-0.5 bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-2 py-1 focus:outline-none focus:border-[#5ed3ff]"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>
          </div>

          {activeTab === "editor" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Line Items & Add Form (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Itemized Services Breakdown */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.01] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-xs uppercase tracking-wider font-mono text-[#5ed3ff] font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Itemized Service Breakdown
                    </h3>
                    <span className="text-[10px] text-white/40 font-mono">
                      {lineItems.length} Item(s)
                    </span>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-white/5 border border-white/10 gap-3 text-xs"
                      >
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 focus:border-[#5ed3ff] text-white text-xs font-semibold py-0.5 focus:outline-none"
                          />
                          <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono block">
                            Category: {item.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-16">
                            <label className="text-[8px] uppercase tracking-wider text-white/40 font-mono block">
                              Qty
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "quantity",
                                  Math.max(1, parseInt(e.target.value, 10) || 1),
                                )
                              }
                              className="w-full bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-[#5ed3ff]"
                            />
                          </div>

                          <div className="w-28">
                            <label className="text-[8px] uppercase tracking-wider text-white/40 font-mono block">
                              Unit Price ({currency})
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "unitPrice",
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                )
                              }
                              className="w-full bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-2 py-1 text-right focus:outline-none focus:border-[#5ed3ff]"
                            />
                          </div>

                          <div className="text-right w-24">
                            <span className="text-[8px] uppercase tracking-wider text-white/40 font-mono block">
                              Total
                            </span>
                            <span className="font-mono font-bold text-white text-xs">
                              {(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {lineItems.length === 0 && (
                      <div className="text-center py-6 text-white/30 text-xs font-mono border border-dashed border-white/10 rounded">
                        No line items added yet. Use quick presets or custom entry below.
                      </div>
                    )}
                  </div>

                  {/* Custom Add Line Item Form */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block font-semibold">
                      Add Custom Service Line Item
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Service Description (e.g. VIP Tarmac escort)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/15 rounded text-xs px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:border-[#5ed3ff]"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={newItemPrice}
                        onChange={(e) =>
                          setNewItemPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                        }
                        className="w-24 bg-black/40 border border-white/15 rounded text-xs px-3 py-1.5 text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#5ed3ff]"
                      />
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        disabled={!newItemName.trim()}
                        className="w-full sm:w-auto px-3 py-1.5 bg-[#5ed3ff]/10 hover:bg-[#5ed3ff]/20 text-[#5ed3ff] border border-[#5ed3ff]/30 text-xs font-mono font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-40 flex items-center justify-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Presets */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.01] space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Add Service Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_PRESETS.map((preset, i) => (
                      <button
                        key={`preset-${i}`}
                        type="button"
                        onClick={() => handleAddPreset(preset)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded text-[11px] font-mono transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#5ed3ff]" />
                        {preset.name}
                        <span className="text-white/40 text-[9px] ml-1">
                          ({preset.unitPrice.toLocaleString()})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Adjustments & Totals Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Adjustments Panel */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.01] space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-mono text-white/80 font-bold border-b border-white/10 pb-2">
                    Taxes & Discounts
                  </h3>

                  {/* Discount Control */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono block">
                      Discount Adjustment
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-black/40 rounded border border-white/20 p-0.5">
                        <button
                          type="button"
                          onClick={() => setDiscountType("percentage")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                            discountType === "percentage" ? "bg-[#5ed3ff] text-black" : "text-white/60"
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType("fixed")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                            discountType === "fixed" ? "bg-[#5ed3ff] text-black" : "text-white/60"
                          }`}
                        >
                          Fixed
                        </button>
                      </div>

                      <input
                        type="number"
                        min={0}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#5ed3ff]"
                        placeholder="Discount value"
                      />
                    </div>
                  </div>

                  {/* GST Control */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={enableGst}
                          onChange={(e) => setEnableGst(e.target.checked)}
                          className="accent-[#5ed3ff] rounded"
                        />
                        Apply GST / Tax ({gstRate}%)
                      </label>

                      {enableGst && (
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={gstRate}
                          onChange={(e) => setGstRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-2 py-0.5 text-right focus:outline-none focus:border-[#5ed3ff]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Validity Date */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono block">
                      Quote Valid Until
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 text-white font-mono text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#5ed3ff]"
                    />
                  </div>

                  {/* Quote Notes */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-mono block">
                      Internal & Customer Terms / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 text-white text-xs rounded p-2 focus:outline-none focus:border-[#5ed3ff] resize-none"
                    />
                  </div>
                </div>

                {/* Financial Totals Summary Card */}
                <div className="border border-[#5ed3ff]/30 rounded-lg p-5 bg-[#5ed3ff]/5 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#5ed3ff] font-mono font-bold block">
                    Financial Summary Calculation
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal:</span>
                      <span>{formatMoney(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({discountType === "percentage" ? `${discountValue}%` : "Fixed"}):</span>
                        <span>- {formatMoney(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-white/70">
                      <span>Taxable Amount:</span>
                      <span>{formatMoney(taxableAmount)}</span>
                    </div>

                    {enableGst && (
                      <div className="flex justify-between text-white/70">
                        <span>GST / Tax ({gstRate}%):</span>
                        <span>+ {formatMoney(gstAmount)}</span>
                      </div>
                    )}

                    <div className="border-t border-[#5ed3ff]/30 pt-3 flex justify-between items-baseline text-base font-bold text-white">
                      <span className="uppercase tracking-wider font-mono text-xs text-[#5ed3ff]">
                        Grand Total:
                      </span>
                      <span className="text-xl text-[#5ed3ff]" style={pageDisplay}>
                        {formatMoney(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Live Preview Tab */
            <div className="max-w-3xl mx-auto border border-white/20 bg-white text-black p-8 rounded shadow-2xl space-y-6">
              {/* Branded Header */}
              <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-widest text-[#0d3b4c]" style={pageDisplay}>
                    SHAFSKY AVIATION
                  </h1>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Private Aviation · Airport Concierge · Meet & Greet
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold uppercase tracking-wider text-teal-800 block">
                    OFFICIAL QUOTATION
                  </span>
                  <span className="text-xs font-mono text-gray-500 block">Ref: {booking.booking_ref}</span>
                  <span className="text-[10px] font-mono text-gray-400 block mt-1">
                    Valid Until: {validUntil}
                  </span>
                </div>
              </div>

              {/* Passenger & Flight Dossier */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 border border-gray-200 rounded text-xs">
                <div>
                  <h4 className="font-mono font-bold text-gray-400 uppercase text-[9px] mb-1">Prepared For</h4>
                  <p className="font-bold text-gray-900 text-sm">{booking.contact_name}</p>
                  <p className="text-gray-600">{booking.contact_email}</p>
                  <p className="text-gray-600">{booking.contact_phone}</p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-gray-400 uppercase text-[9px] mb-1">Flight Details</h4>
                  <p className="font-bold text-gray-900">{booking.origin} → {booking.destination}</p>
                  <p className="text-gray-600">Depart Date: {booking.depart_date}</p>
                  <p className="text-gray-600">Passengers: {booking.pax_adults} Adult(s)</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 font-mono uppercase text-[9px] text-gray-500">
                    <th className="py-2">Service Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item, i) => (
                    <tr key={`prev-${i}`}>
                      <td className="py-2.5 font-medium text-gray-800">{item.name}</td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">
                        {currency} {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        {currency} {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Box */}
              <div className="flex justify-end pt-4 border-t border-gray-300">
                <div className="w-64 space-y-1.5 text-xs font-mono text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>- {formatMoney(discountAmount)}</span>
                    </div>
                  )}

                  {enableGst && (
                    <div className="flex justify-between text-gray-600">
                      <span>GST ({gstRate}%):</span>
                      <span>+ {formatMoney(gstAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-teal-900 border-t border-gray-300 pt-2">
                    <span>Grand Total:</span>
                    <span>{formatMoney(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quoteNotes && (
                <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 italic">
                  <strong>Terms & Notes:</strong> {quoteNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#080d14]">
          <div className="text-xs font-mono text-white/50">
            Final Quote Amount:{" "}
            <span className="font-bold text-[#5ed3ff] text-sm">{formatMoney(grandTotal)}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              disabled={isSubmitting || grandTotal <= 0}
              className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded border border-white/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            <button
              type="button"
              onClick={handleSendQuoteClick}
              disabled={isSubmitting || grandTotal <= 0}
              className="flex-1 sm:flex-none px-5 py-2 bg-[#5ed3ff] hover:bg-[#4bc3f0] text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-[#5ed3ff]/10 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Send Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
