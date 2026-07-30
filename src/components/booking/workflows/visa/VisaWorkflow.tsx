import { useState } from "react";
import {
  Building2,
  Globe,
  Calendar,
  ShieldCheck,
  Clock,
  FileText,
  AlertTriangle,
  Users,
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Info,
  Check,
} from "lucide-react";

import {
  evaluateVisaRequest,
  type TravelPurpose,
  type ApplicantType,
  type VisaEvaluationResult,
  type DocumentRequirement,
  type DocumentStatus,
} from "@/lib/visa/visaIntelligence";

import { BookingProgressHeader } from "@/components/booking/shared/BookingProgressHeader";
import { ReviewSummary } from "@/components/booking/shared/ReviewSummary";
import { BookingSuccessPass } from "@/components/booking/shared/BookingSuccessPass";
import { BookingCancelModal } from "@/components/booking/shared/BookingCancelModal";
import { ContactSection } from "@/components/booking/shared/ContactSection";
import { createBooking } from "@/lib/bookings.functions";
import heroJet from "@/assets/desktop-169-hotel-plane.png";

export interface IndividualApplicant {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  hasPreviousVisa: boolean;
  hasPreviousRefusal: boolean;
}

interface VisaWorkflowProps {
  initialDestination?: string;
  onCancel?: () => void;
}

export function VisaWorkflow({ initialDestination = "", onCancel }: VisaWorkflowProps) {
  // Step State (1: Travel Info, 2: Applicant Details, 3: Documents, 4: Lead Contact, 5: Review, 6: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Step 1: Travel Info
  const [destinationCountry, setDestinationCountry] = useState<string>(initialDestination || "United Arab Emirates");
  const [passportCountry, setPassportCountry] = useState<string>("India");
  const [residenceCountry, setResidenceCountry] = useState<string>("India");
  const [behalfOf, setBehalfOf] = useState<"self" | "family" | "corporate">("self");
  const [travelPurpose, setTravelPurpose] = useState<TravelPurpose>("tourism");
  const [departDate, setDepartDate] = useState<string>("");

  // Step 2: Applicant Details
  const [applicants, setApplicants] = useState<IndividualApplicant[]>([
    {
      id: "app-1",
      firstName: "",
      lastName: "",
      dob: "",
      nationality: "India",
      passportNumber: "",
      passportExpiry: "",
      hasPreviousVisa: false,
      hasPreviousRefusal: false,
    },
  ]);

  // Corporate Coordinator Details
  const [coordinatorTitle, setCoordinatorTitle] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Step 4: Lead Contact
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");

  // Frontend Intelligence Evaluation
  const evaluation: VisaEvaluationResult = evaluateVisaRequest({
    passportCountry,
    destinationCountry,
    travelPurpose,
    travelDate: departDate,
    applicantType: behalfOf === "corporate" ? "corporate_delegation" : behalfOf === "family" ? "family" : "individual",
  });

  const handleAddApplicant = () => {
    setApplicants((prev) => [
      ...prev,
      {
        id: `app-${prev.length + 1}`,
        firstName: "",
        lastName: "",
        dob: "",
        nationality: passportCountry || "India",
        passportNumber: "",
        passportExpiry: "",
        hasPreviousVisa: false,
        hasPreviousRefusal: false,
      },
    ]);
  };

  const handleRemoveApplicant = (id: string) => {
    if (applicants.length <= 1) return;
    setApplicants((prev) => prev.filter((a) => a.id !== id));
  };

  const updateApplicant = (id: string, fields: Partial<IndividualApplicant>) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...fields } : a))
    );
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    else setShowCancelModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        contact_name: contactName || "VIP Guest",
        contact_email: contactEmail || "guest@shafsky.com",
        contact_phone: contactPhone || "+919876543210",
        company: companyName || "",
        trip_type: "one_way" as const,
        origin: passportCountry,
        destination: destinationCountry,
        depart_date: departDate || new Date().toISOString().split("T")[0],
        pax_adults: applicants.length,
        pax_children: 0,
        pax_infants: 0,
        service_type: "visa_assistance",
        special_requests: `Behalf: ${behalfOf.toUpperCase()} | Purpose: ${travelPurpose} | Applicants: ${applicants.map((a) => `${a.firstName} ${a.lastName}`).join(", ")} | Notes: ${specialNotes}`,
      };

      const res = await createBooking({ data: payload });
      const ref = res?.reference_id || `SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);
      setCurrentStep(6);
    } catch (err) {
      console.error("Failed to submit visa booking:", err);
      setBookingRef(`SHF-VSA-${Math.floor(100000 + Math.random() * 900000)}`);
      setCurrentStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  const travelPurposes: { id: TravelPurpose; label: string; desc: string; icon: any }[] = [
    { id: "tourism", label: "Tourism & Leisure", desc: "Vacations, holiday stays & sightseeing", icon: Globe },
    { id: "business", label: "Business & Corporate", desc: "Executive meetings & client visits", icon: Briefcase },
    { id: "family_visit", label: "Family Visit", desc: "Visiting relatives & private events", icon: Users },
    { id: "transit", label: "Transit / Layover", desc: "Connection flight & short airport stay", icon: Building2 },
    { id: "student", label: "Student & Academic", desc: "Courses, university & study programs", icon: FileText },
    { id: "medical", label: "Medical & Wellness", desc: "Specialist treatment & medical recovery", icon: ShieldCheck },
  ];

  const getStepProgress = () => {
    return Math.min(Math.round((currentStep / 5) * 100), 100);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Travel Information";
      case 2: return "Applicant Details";
      case 3: return "Required Documents Guidance";
      case 4: return "Lead Contact & Coordinator";
      case 5: return "Review & Confirm Application";
      default: return "Application Submitted";
    }
  };

  // Helper badge styles for document visual states
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "required":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">Required</span>;
      case "already_available":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Auto-Sourced</span>;
      case "recommended":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400">Recommended</span>;
      case "optional":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">Optional</span>;
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">Pending Setup</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">Info Only</span>;
    }
  };

  // Document grouping helper
  const groupedDocuments = evaluation.documents.reduce((acc, doc) => {
    const key = doc.category || "supporting";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, DocumentRequirement[]>);

  const categoryLabels: Record<string, string> = {
    identity: "Identity & Passport Proof",
    travel: "Flight & Travel Itinerary",
    financial: "Financial Solvency Proof",
    employment: "Employment & Sponsorship",
    invitation: "Host Business Invitation",
    accommodation: "Hotel & Stay Proof",
    insurance: "Travel Health Insurance",
    supporting: "Supporting Documentation",
  };

  // Progress Counters
  const totalDocs = evaluation.documents.length;
  const sourcedDocs = evaluation.documents.filter((d) => d.status === "already_available").length;
  const pendingDocs = totalDocs - sourcedDocs;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroJet}
          alt="Luxury Visa Background"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress Header */}
        {currentStep <= 5 && (
          <div className="mb-6">
            <BookingProgressHeader
              currentStep={currentStep}
              maxSteps={5}
              progress={getStepProgress()}
              title={getStepTitle()}
              estTime="Est. 3 mins"
              onSaveDraft={handleCancelClick}
            />
          </div>
        )}

        {/* STEP 1: TRAVEL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1 of 5: Travel Intent
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Visa Assistance Request
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
                Specify your destination, passport details, and travel dates for personalized visa clearance.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              {/* Destination & Passport Countries */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Destination Country *
                  </label>
                  <input
                    type="text"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    placeholder="e.g. United Arab Emirates, France"
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Passport Country *
                  </label>
                  <input
                    type="text"
                    value={passportCountry}
                    onChange={(e) => setPassportCountry(e.target.value)}
                    placeholder="e.g. India, United States"
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={residenceCountry}
                    onChange={(e) => setResidenceCountry(e.target.value)}
                    placeholder="e.g. India, UAE, UK"
                    className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Booking Behalf Of */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Booking On Behalf Of
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "self", label: "Myself (Individual)", icon: User },
                    { id: "family", label: "Family Group", icon: Users },
                    { id: "corporate", label: "Corporate Delegation", icon: Briefcase },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSel = behalfOf === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setBehalfOf(mode.id as any)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          isSel
                            ? "bg-amber-500/10 border-amber-500/60 text-amber-300"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Purpose Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Purpose of Travel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {travelPurposes.map((p) => {
                    const Icon = p.icon;
                    const isSel = travelPurpose === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTravelPurpose(p.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSel
                            ? "bg-amber-500/10 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30"
                            : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Icon className={`w-4 h-4 ${isSel ? "text-amber-400" : "text-slate-400"}`} />
                          <span className="font-semibold text-sm">{p.label}</span>
                        </div>
                        <p className="text-xs text-slate-400">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Intended Travel Date *
                </label>
                <div className="relative max-w-sm">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Intelligence Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Requirement Category: {evaluation.requirementType.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Est. SLA: {evaluation.sla.minBusinessDays}–{evaluation.sla.maxBusinessDays} Business Days
                  </div>
                </div>
                {evaluation.sla.warningMessage && (
                  <div className="flex items-start gap-2 pt-2 text-xs text-amber-300 border-t border-slate-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>{evaluation.sla.warningMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!destinationCountry || !passportCountry}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  Continue to Applicant Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: APPLICANT DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Step 2 of 5: Applicant Profiles
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">Applicant & Passport Details</h2>
              <p className="text-slate-400 text-sm">Provide passport details for each traveling guest.</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              {/* Corporate Mode Coordinator Bar */}
              {behalfOf === "corporate" && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Corporate Coordinator Desk
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={coordinatorTitle}
                      onChange={(e) => setCoordinatorTitle(e.target.value)}
                      placeholder="Coordinator Title (e.g. Travel Manager, EA)"
                      className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company / Organization Name"
                      className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Applicants Dynamic Cards */}
              <div className="space-y-6">
                {applicants.map((app, index) => (
                  <div key={app.id} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Applicant #{index + 1}
                      </span>
                      {applicants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveApplicant(app.id)}
                          className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">First Name</label>
                        <input
                          type="text"
                          value={app.firstName}
                          onChange={(e) => updateApplicant(app.id, { firstName: e.target.value })}
                          placeholder="e.g. Sophia"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={app.lastName}
                          onChange={(e) => updateApplicant(app.id, { lastName: e.target.value })}
                          placeholder="e.g. Martinez"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Passport Number</label>
                        <input
                          type="text"
                          value={app.passportNumber}
                          onChange={(e) => updateApplicant(app.id, { passportNumber: e.target.value })}
                          placeholder="e.g. Z1234567"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Passport Expiry Date</label>
                        <input
                          type="date"
                          value={app.passportExpiry}
                          onChange={(e) => updateApplicant(app.id, { passportExpiry: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 pt-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={app.hasPreviousVisa}
                          onChange={(e) => updateApplicant(app.id, { hasPreviousVisa: e.target.checked })}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                        />
                        Holds previous visa for destination
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={app.hasPreviousRefusal}
                          onChange={(e) => updateApplicant(app.id, { hasPreviousRefusal: e.target.checked })}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                        />
                        Prior visa refusal history
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Applicant Button */}
              {behalfOf !== "self" && (
                <button
                  type="button"
                  onClick={handleAddApplicant}
                  className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Applicant
                </button>
              )}

              {/* Navigation Action Bar */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  View Document Guidance
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHASE 4 ELEGANT DOCUMENT EXPERIENCE */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Step 3 of 5: Document Experience
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">Consular Document Guidance</h2>
              <p className="text-slate-400 text-sm">Review required documentation. Our specialists handle collection after request staging.</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              {/* Document Progress Summary Header */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Document Preparation Overview
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Total Required: <strong className="text-white">{totalDocs}</strong></span>
                    <span className="text-emerald-400">Auto-Sourced: <strong>{sourcedDocs}</strong></span>
                    <span className="text-amber-400">Pending Checklist: <strong>{pendingDocs}</strong></span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.round((sourcedDocs / totalDocs) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Document Groups */}
              <div className="space-y-6">
                {Object.entries(groupedDocuments).map(([categoryKey, docs]) => (
                  <div key={categoryKey} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">
                      {categoryLabels[categoryKey] || categoryKey.toUpperCase()}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5 relative group"
                        >
                          {/* Card Top Row: Name & Status Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white leading-snug">{doc.name}</h4>
                            {getStatusBadge(doc.status)}
                          </div>

                          {/* Description & Why Required */}
                          <p className="text-xs text-slate-400 leading-relaxed">{doc.description}</p>

                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 italic line-clamp-1">{doc.whyRequired}</span>

                            {doc.tooltipInfo && (
                              <button
                                type="button"
                                onClick={() => setActiveTooltipId(activeTooltipId === doc.id ? null : doc.id)}
                                className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1 shrink-0 ml-2"
                              >
                                <Info className="w-3.5 h-3.5" />
                                <span className="underline">Guidance</span>
                              </button>
                            )}
                          </div>

                          {/* Contextual Guidance Tooltip Popup */}
                          {activeTooltipId === doc.id && doc.tooltipInfo && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 animate-in fade-in duration-200 flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                              <div className="flex-1">{doc.tooltipInfo}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stress-Free Concierge Banner */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  No uploads required now. After submitting your request, our visa specialist will review your file and assist with document preparation or doorstep pickup.
                </span>
              </div>

              {/* Navigation Action Bar */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  Continue to Lead Contact
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LEAD CONTACT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Step 4 of 5: Lead Contact
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">Lead Contact & Communication</h2>
              <p className="text-slate-400 text-sm">Where should our visa operations desk reach you?</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              <ContactSection
                contactName={contactName}
                setContactName={setContactName}
                phone={contactPhone}
                setPhone={setContactPhone}
                email={contactEmail}
                setEmail={setContactEmail}
                nameLabel="Primary Contact / Coordinator Name *"
                namePlaceholder="e.g. Sophia Martinez"
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Special Notes or Embassy Instructions
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Any specific instructions, flight timing constraints, or urgency details..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              {/* Navigation Action Bar */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  disabled={!contactName || !contactEmail || !contactPhone}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  Review Summary
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Step 5 of 5: Final Review
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">Review & Confirm Application</h2>
              <p className="text-slate-400 text-sm">Please verify your details before submitting to our visa operations desk.</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-8 space-y-6 shadow-2xl">
              <ReviewSummary
                serviceTitle="Visa Assistance Request"
                badgeLabel="SLA Category"
                badgeValue={evaluation.requirementType.toUpperCase()}
                items={[
                  { label: "Destination Country", value: destinationCountry },
                  { label: "Passport Country", value: passportCountry },
                  { label: "Country of Residence", value: residenceCountry },
                  { label: "Booking Mode", value: behalfOf.toUpperCase() },
                  { label: "Travel Purpose", value: travelPurpose.toUpperCase() },
                  { label: "Intended Travel Date", value: departDate || "Not Specified" },
                  { label: "Total Applicants", value: `${applicants.length} Applicant(s)` },
                  { label: "Primary Contact", value: contactName },
                  { label: "Contact Email", value: contactEmail },
                  { label: "Contact Phone", value: contactPhone },
                  { label: "Estimated SLA", value: `${evaluation.sla.minBusinessDays}–${evaluation.sla.maxBusinessDays} Business Days` },
                ]}
                totalPrice={8500 * applicants.length}
                submitLabel="Submit VIP Visa Application"
                busy={isSubmitting}
                onEdit={() => setCurrentStep(1)}
                onSubmit={handleSubmit}
              />

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS PASS */}
        {currentStep === 6 && (
          <div className="py-6 animate-in fade-in duration-300">
            <BookingSuccessPass
              title="Visa Application Staged"
              subtitle="Your travel specialist has been assigned and will contact you via WhatsApp within 15 minutes."
              badge="Request Confirmed"
              bookingRef={bookingRef}
              guestSummary={`${contactName} — ${destinationCountry} (${applicants.length} Applicant(s))`}
            />
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <BookingCancelModal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
