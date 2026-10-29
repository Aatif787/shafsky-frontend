import React, { useState } from "react";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { enquiryApi } from "@/lib/api/enquiryApi";
import { EnquirySuccessCard } from "./EnquirySuccessCard";
import { mono } from "../../theme";
import {
  type OtherServiceType,
  type CustomerErrors,
  SERVICE_OPTIONS,
  OtherServicesCustomerSection,
  OtherServicesTicketingSection,
  OtherServicesTransportSection,
  OtherServicesHotelSection,
} from "./OtherServicesEnquiryParts";

export type { OtherServiceType };

interface OtherServicesEnquiryFlowProps {
  initialService?: OtherServiceType;
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
  initialPax?: number;
  onBackToAirport: () => void;
}

export const OtherServicesEnquiryFlow: React.FC<OtherServicesEnquiryFlowProps> = ({
  initialService = "ticketing",
  initialOrigin = "",
  initialDestination = "",
  initialDate = "",
  initialPax = 1,
  onBackToAirport,
}) => {
  // Service Selection State (Defaults to initialService: ticketing, transport, or hotel)
  const [selectedService, setSelectedService] = useState<OtherServiceType>(
    initialService === ("round-trip" as any) ? "ticketing" : initialService
  );

  // Customer Details State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerErrors, setCustomerErrors] = useState<CustomerErrors>({});

  // Ticketing State
  const [tktOrigin, setTktOrigin] = useState(initialOrigin);
  const [tktDestination, setTktDestination] = useState(initialDestination);
  const [tktDate, setTktDate] = useState(initialDate);
  const [tktPax, setTktPax] = useState(Math.max(1, initialPax));
  const [tktCalendarOpen, setTktCalendarOpen] = useState(false);

  // Transport State
  const [trnPickup, setTrnPickup] = useState(initialOrigin ? `${initialOrigin} Airport` : "");
  const [trnDropoff, setTrnDropoff] = useState(initialDestination || "");
  const [trnDate, setTrnDate] = useState(initialDate);
  const [trnTime, setTrnTime] = useState("10:00");
  const [trnPax, setTrnPax] = useState(Math.max(1, initialPax));
  const [trnVehicle, setTrnVehicle] = useState("Executive Sedan");
  const [trnCalendarOpen, setTrnCalendarOpen] = useState(false);

  // Hotel State
  const [hotelCityOrName, setHotelCityOrName] = useState(initialDestination || initialOrigin || "");
  const [hotelCheckIn, setHotelCheckIn] = useState(initialDate);
  const [hotelCheckOut, setHotelCheckOut] = useState("");
  const [hotelGuests, setHotelGuests] = useState(Math.max(1, initialPax));
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelCheckInCalendarOpen, setHotelCheckInCalendarOpen] = useState(false);
  const [hotelCheckOutCalendarOpen, setHotelCheckOutCalendarOpen] = useState(false);

  // Common Additional Requirements
  const [notes, setNotes] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Customer Validation
  const validateCustomerDetails = (): boolean => {
    const errs: CustomerErrors = {};
    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName || !/^[A-Za-z\s]+$/.test(trimmedFirstName)) {
      errs.firstName = "Please enter a valid passenger name using letters only.";
    }
    const trimmedLastName = lastName.trim();
    if (!trimmedLastName || !/^[A-Za-z\s]+$/.test(trimmedLastName)) {
      errs.lastName = "Please enter a valid passenger name using letters only.";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "A valid email is required.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!phone.trim() || cleanPhone.length < 7) {
      errs.phone = "Valid phone required (7+ digits).";
    } else if (/[a-zA-Z]/.test(phone)) {
      errs.phone = "Phone number cannot contain letters.";
    }

    setCustomerErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all customer contact details.");
      return false;
    }
    return true;
  };

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCustomerDetails()) {
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Service-specific validation
    if (selectedService === "ticketing") {
      if (!tktOrigin.trim()) {
        toast.error("Please select departure airport.");
        return;
      }
      if (!tktDestination.trim()) {
        toast.error("Please select destination airport.");
        return;
      }
      if (tktOrigin.trim().toUpperCase() === tktDestination.trim().toUpperCase()) {
        toast.error("Departure and destination airports cannot be identical.");
        return;
      }
      if (!tktDate) {
        toast.error("Please select departure date.");
        return;
      }
    } else if (selectedService === "transport") {
      if (!trnPickup.trim()) {
        toast.error("Please enter pickup location.");
        return;
      }
      if (!trnDropoff.trim()) {
        toast.error("Please enter drop-off destination.");
        return;
      }
      if (!trnDate) {
        toast.error("Please select travel date.");
        return;
      }
    } else if (selectedService === "hotel") {
      if (!hotelCityOrName.trim()) {
        toast.error("Please enter city, destination, or hotel name.");
        return;
      }
      if (!hotelCheckIn) {
        toast.error("Please select check-in date.");
        return;
      }
      if (!hotelCheckOut) {
        toast.error("Please select check-out date.");
        return;
      }
      if (new Date(hotelCheckOut) < new Date(hotelCheckIn)) {
        toast.error("Check-out date cannot be earlier than check-in date.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (selectedService === "ticketing") {
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Ticketing",
          serviceType: "Air Ticketing Enquiry",
          origin: tktOrigin.trim(),
          destination: tktDestination.trim(),
          serviceDate: tktDate,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Ticketing",
            origin: tktOrigin.trim(),
            destination: tktDestination.trim(),
            travel_date: tktDate,
            service_date: tktDate,
            passenger_count: tktPax,
            pax_count: tktPax,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Ticketing enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      } else if (selectedService === "transport") {
        const fullServiceDate = `${trnDate} ${trnTime || "10:00"}`;
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Transport",
          serviceType: "Ground Transport Enquiry",
          origin: trnPickup.trim(),
          destination: trnDropoff.trim(),
          serviceDate: fullServiceDate,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Transport",
            pickup_location: trnPickup.trim(),
            dropoff_location: trnDropoff.trim(),
            travel_date: trnDate,
            travel_time: trnTime,
            service_date: fullServiceDate,
            passenger_count: trnPax,
            pax_count: trnPax,
            vehicle_preference: trnVehicle,
            vehicle_name: trnVehicle,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Transport enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      } else if (selectedService === "hotel") {
        const res = await enquiryApi.submit({
          passengerName: fullName,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          passengerEmail: email.trim().toLowerCase(),
          passengerPhone: phone.trim(),
          serviceCategory: "Hotel",
          serviceType: "Hotel Booking Enquiry",
          origin: hotelCityOrName.trim(),
          destination: hotelCityOrName.trim(),
          serviceDate: hotelCheckIn,
          notes: notes.trim() || undefined,
          details: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            service: "Hotel",
            city: hotelCityOrName.trim(),
            hotel_name: hotelCityOrName.trim(),
            destination: hotelCityOrName.trim(),
            check_in: hotelCheckIn,
            check_out: hotelCheckOut,
            service_date: hotelCheckIn,
            guests_count: hotelGuests,
            rooms_count: hotelRooms,
            passenger_count: hotelGuests,
            pax_count: hotelGuests,
            notes: notes.trim() || undefined,
          },
        });

        if (res.success && res.data) {
          setSubmittedRef(res.data.bookingRef);
          toast.success(`Hotel enquiry registered! Reference: ${res.data.bookingRef}`);
        } else {
          toast.error(!res.success && res.error ? res.error : "Failed to submit enquiry. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("[OtherServicesEnquiryFlow] Submit error:", err);
      toast.error(err?.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFlow = () => {
    setSubmittedRef(null);
    setHotelCityOrName("");
    setHotelCheckIn("");
    setHotelCheckOut("");
    setNotes("");
  };

  if (submittedRef) {
    const serviceTitles: Record<OtherServiceType, string> = {
      ticketing: "Air Ticketing",
      transport: "Ground Transport",
      hotel: "Hotel Booking",
    };
    return (
      <EnquirySuccessCard
        bookingRef={submittedRef}
        serviceTitle={serviceTitles[selectedService]}
        passengerName={`${firstName} ${lastName}`.trim()}
        onReset={handleResetFlow}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-5 animate-in fade-in duration-200"
    >
      {/* 1. SERVICE SELECTION (FIRST) */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5" style={mono}>
          <Sparkles className="w-3.5 h-3.5 text-lime-600" />
          <span>Select Service</span>
        </label>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {SERVICE_OPTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedService === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedService(id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 h-11 px-2 sm:px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-950"
                }`}
                style={mono}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-lime-400" : "text-slate-500"}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CUSTOMER DETAILS */}
      <div className="pt-1 border-t border-slate-200/80">
        <OtherServicesCustomerSection
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          customerErrors={customerErrors}
          setCustomerErrors={setCustomerErrors}
        />
      </div>

      {/* 3. DYNAMIC SERVICE-SPECIFIC FIELDS */}
      <div className="pt-1 border-t border-slate-200/80">
        {/* OPTION 1: TICKETING */}
        {selectedService === "ticketing" && (
          <OtherServicesTicketingSection
            tktOrigin={tktOrigin}
            setTktOrigin={setTktOrigin}
            tktDestination={tktDestination}
            setTktDestination={setTktDestination}
            tktDate={tktDate}
            setTktDate={setTktDate}
            tktCalendarOpen={tktCalendarOpen}
            setTktCalendarOpen={setTktCalendarOpen}
            tktPax={tktPax}
            setTktPax={setTktPax}
            notes={notes}
            setNotes={setNotes}
          />
        )}

        {/* OPTION 2: TRANSPORT */}
        {selectedService === "transport" && (
          <OtherServicesTransportSection
            trnPickup={trnPickup}
            setTrnPickup={setTrnPickup}
            trnDropoff={trnDropoff}
            setTrnDropoff={setTrnDropoff}
            trnDate={trnDate}
            setTrnDate={setTrnDate}
            trnCalendarOpen={trnCalendarOpen}
            setTrnCalendarOpen={setTrnCalendarOpen}
            trnTime={trnTime}
            setTrnTime={setTrnTime}
            trnPax={trnPax}
            setTrnPax={setTrnPax}
            trnVehicle={trnVehicle}
            setTrnVehicle={setTrnVehicle}
            notes={notes}
            setNotes={setNotes}
          />
        )}

        {/* OPTION 3: HOTEL */}
        {selectedService === "hotel" && (
          <OtherServicesHotelSection
            hotelCityOrName={hotelCityOrName}
            setHotelCityOrName={setHotelCityOrName}
            hotelCheckIn={hotelCheckIn}
            setHotelCheckIn={setHotelCheckIn}
            hotelCheckOut={hotelCheckOut}
            setHotelCheckOut={setHotelCheckOut}
            hotelCheckInCalendarOpen={hotelCheckInCalendarOpen}
            setHotelCheckInCalendarOpen={setHotelCheckInCalendarOpen}
            hotelCheckOutCalendarOpen={hotelCheckOutCalendarOpen}
            setHotelCheckOutCalendarOpen={setHotelCheckOutCalendarOpen}
            hotelGuests={hotelGuests}
            setHotelGuests={setHotelGuests}
            hotelRooms={hotelRooms}
            setHotelRooms={setHotelRooms}
            notes={notes}
            setNotes={setNotes}
          />
        )}
      </div>

      {/* 4. ACTIONS: BACK & SUBMIT */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToAirport}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          style={mono}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Flight Booking</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          style={mono}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
              <span>Submitting Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-lime-400" />
              <span>Submit Enquiry</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
