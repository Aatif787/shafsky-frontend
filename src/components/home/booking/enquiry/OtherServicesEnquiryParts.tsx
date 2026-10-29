import React from "react";
import { format, isValid } from "date-fns";
import {
  Ticket,
  Car,
  Hotel,
  BedDouble,
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Users,
  User,
  Mail,
  Phone,
  Clock,
  Building2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import { formatAirportOption } from "@/lib/api/airportApi";
import { mono } from "../../theme";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
} from "@/lib/inputValidation";

export const FIELD_CONTAINER = "flex flex-col gap-1";
export const LABEL =
  "text-[10px] sm:text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5";
export const INPUT =
  "h-11 w-full rounded-xl border border-slate-300 bg-white/70 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none";
export const DATE_BTN =
  "relative flex h-11 w-full items-center rounded-xl border border-slate-300 bg-white/70 pl-9 pr-3 text-left text-xs font-semibold text-slate-900 outline-none transition-all duration-200 hover:border-lime-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 shadow-none cursor-pointer";

export type OtherServiceType = "ticketing" | "transport" | "hotel";

export interface CustomerErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const SERVICE_OPTIONS: {
  id: OtherServiceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "ticketing", label: "Ticketing", icon: Ticket },
  { id: "transport", label: "Transport", icon: Car },
  { id: "hotel", label: "Hotel", icon: Hotel },
];

interface OtherServicesCustomerSectionProps {
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  customerErrors: CustomerErrors;
  setCustomerErrors: React.Dispatch<React.SetStateAction<CustomerErrors>>;
}

export const OtherServicesCustomerSection: React.FC<OtherServicesCustomerSectionProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  customerErrors,
  setCustomerErrors,
}) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <label
        className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5"
        style={mono}
      >
        <User className="w-3.5 h-3.5 text-lime-600" />
        <span>Customer Details</span>
      </label>
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        Enquiry Request • ₹0
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* First Name */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <span>First Name</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={firstName}
          onKeyDown={preventDigitsKeyDown}
          onChange={(e) => {
            const val = sanitizeName(e.target.value);
            setFirstName(val);
            if (customerErrors.firstName)
              setCustomerErrors((p) => ({ ...p, firstName: undefined }));
          }}
          placeholder="First name"
          className={`${INPUT} ${customerErrors.firstName ? "border-red-400 focus:border-red-500" : ""}`}
        />
        {customerErrors.firstName && (
          <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.firstName}</span>
        )}
      </div>

      {/* Last Name */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <span>Last Name</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={lastName}
          onKeyDown={preventDigitsKeyDown}
          onChange={(e) => {
            const val = sanitizeName(e.target.value);
            setLastName(val);
            if (customerErrors.lastName) setCustomerErrors((p) => ({ ...p, lastName: undefined }));
          }}
          placeholder="Last name"
          className={`${INPUT} ${customerErrors.lastName ? "border-red-400 focus:border-red-500" : ""}`}
        />
        {customerErrors.lastName && (
          <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.lastName}</span>
        )}
      </div>

      {/* Email Address */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Mail className="w-3 h-3 text-slate-400" />
          <span>Email Address</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (customerErrors.email) setCustomerErrors((p) => ({ ...p, email: undefined }));
          }}
          placeholder="Email address"
          className={`${INPUT} ${customerErrors.email ? "border-red-400 focus:border-red-500" : ""}`}
        />
        {customerErrors.email && (
          <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.email}</span>
        )}
      </div>

      {/* Phone Number */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Phone className="w-3 h-3 text-slate-400" />
          <span>Phone Number</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <PhoneInput
          required
          value={phone}
          onChange={(val) => {
            setPhone(val);
            if (customerErrors.phone) setCustomerErrors((p) => ({ ...p, phone: undefined }));
          }}
          placeholder="Phone number"
          className={`h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 text-xs font-semibold ${customerErrors.phone ? "border-red-400 focus:border-red-500" : ""}`}
        />
        {customerErrors.phone && (
          <span className="text-[10.5px] text-red-500 font-medium">{customerErrors.phone}</span>
        )}
      </div>
    </div>
  </div>
);

interface OtherServicesTicketingSectionProps {
  tktOrigin: string;
  setTktOrigin: React.Dispatch<React.SetStateAction<string>>;
  tktDestination: string;
  setTktDestination: React.Dispatch<React.SetStateAction<string>>;
  tktDate: string;
  setTktDate: React.Dispatch<React.SetStateAction<string>>;
  tktCalendarOpen: boolean;
  setTktCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tktPax: number;
  setTktPax: React.Dispatch<React.SetStateAction<number>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const OtherServicesTicketingSection: React.FC<OtherServicesTicketingSectionProps> = ({
  tktOrigin,
  setTktOrigin,
  tktDestination,
  setTktDestination,
  tktDate,
  setTktDate,
  tktCalendarOpen,
  setTktCalendarOpen,
  tktPax,
  setTktPax,
  notes,
  setNotes,
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <PlaneTakeoff className="w-3 h-3 text-slate-500" />
          <span>From Airport</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <IntelligentAirportAutocomplete
          mode="global"
          value={tktOrigin}
          inputClassName={INPUT}
          placeholder="Search airport (e.g. DEL, BOM, DXB)"
          showIcon={false}
          onSelect={(ap) => setTktOrigin(formatAirportOption(ap))}
          onChangeText={(txt) => setTktOrigin(txt)}
        />
      </div>

      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <PlaneLanding className="w-3 h-3 text-slate-500" />
          <span>To Airport</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <IntelligentAirportAutocomplete
          mode="global"
          value={tktDestination}
          inputClassName={INPUT}
          placeholder="Search airport (e.g. DEL, BOM, DXB)"
          showIcon={false}
          onSelect={(ap) => setTktDestination(formatAirportOption(ap))}
          onChangeText={(txt) => setTktDestination(txt)}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {/* Travel Date */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <CalendarDays className="w-3 h-3 text-slate-500" />
          <span>Travel Date</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <Popover open={tktCalendarOpen} onOpenChange={setTktCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={DATE_BTN}>
              <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <span className={tktDate ? "text-slate-900" : "text-slate-400"}>
                {tktDate && isValid(new Date(tktDate))
                  ? format(new Date(tktDate), "EEE, dd MMM yyyy")
                  : "Select date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl"
            align="start"
          >
            <CalendarPicker
              mode="single"
              selected={tktDate && isValid(new Date(tktDate)) ? new Date(tktDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setTktDate(format(date, "yyyy-MM-dd"));
                  setTktCalendarOpen(false);
                }
              }}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Passengers */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Users className="w-3 h-3 text-slate-500" />
          <span>Passengers</span>
        </label>
        <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
          <span className="text-xs font-semibold text-slate-900">
            {tktPax} Guest{tktPax > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTktPax((p) => Math.max(1, p - 1))}
              disabled={tktPax <= 1}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setTktPax((p) => Math.min(20, p + 1))}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <span>Additional Requirements</span>
          <span className="text-slate-400 font-normal">(Opt)</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional requirements"
          className={INPUT}
        />
      </div>
    </div>
  </div>
);

interface OtherServicesTransportSectionProps {
  trnPickup: string;
  setTrnPickup: React.Dispatch<React.SetStateAction<string>>;
  trnDropoff: string;
  setTrnDropoff: React.Dispatch<React.SetStateAction<string>>;
  trnDate: string;
  setTrnDate: React.Dispatch<React.SetStateAction<string>>;
  trnCalendarOpen: boolean;
  setTrnCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trnTime: string;
  setTrnTime: React.Dispatch<React.SetStateAction<string>>;
  trnPax: number;
  setTrnPax: React.Dispatch<React.SetStateAction<number>>;
  trnVehicle: string;
  setTrnVehicle: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const OtherServicesTransportSection: React.FC<OtherServicesTransportSectionProps> = ({
  trnPickup,
  setTrnPickup,
  trnDropoff,
  setTrnDropoff,
  trnDate,
  setTrnDate,
  trnCalendarOpen,
  setTrnCalendarOpen,
  trnTime,
  setTrnTime,
  trnPax,
  setTrnPax,
  trnVehicle,
  setTrnVehicle,
  notes,
  setNotes,
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Car className="w-3 h-3 text-slate-500" />
          <span>Pickup Location</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={trnPickup}
          onChange={(e) => setTrnPickup(e.target.value)}
          placeholder="Enter pickup location"
          className={INPUT}
        />
      </div>

      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Car className="w-3 h-3 text-slate-500" />
          <span>Drop-off Destination</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={trnDropoff}
          onChange={(e) => setTrnDropoff(e.target.value)}
          placeholder="Enter drop-off destination"
          className={INPUT}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Date */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <CalendarDays className="w-3 h-3 text-slate-500" />
          <span>Date</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <Popover open={trnCalendarOpen} onOpenChange={setTrnCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={DATE_BTN}>
              <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <span className={trnDate ? "text-slate-900" : "text-slate-400"}>
                {trnDate && isValid(new Date(trnDate))
                  ? format(new Date(trnDate), "EEE, dd MMM yyyy")
                  : "Select date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl"
            align="start"
          >
            <CalendarPicker
              mode="single"
              selected={trnDate && isValid(new Date(trnDate)) ? new Date(trnDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  setTrnDate(format(date, "yyyy-MM-dd"));
                  setTrnCalendarOpen(false);
                }
              }}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Time</span>
        </label>
        <input
          type="time"
          value={trnTime}
          onChange={(e) => setTrnTime(e.target.value)}
          className={INPUT}
        />
      </div>

      {/* Passengers */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Users className="w-3 h-3 text-slate-500" />
          <span>Passengers</span>
        </label>
        <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
          <span className="text-xs font-semibold text-slate-900">
            {trnPax} Guest{trnPax > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTrnPax((p) => Math.max(1, p - 1))}
              disabled={trnPax <= 1}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setTrnPax((p) => Math.min(10, p + 1))}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Preference */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <span>Vehicle Preference</span>
          <span className="text-slate-400 font-normal">(Opt)</span>
        </label>
        <select
          value={trnVehicle}
          onChange={(e) => setTrnVehicle(e.target.value)}
          className={`${INPUT} cursor-pointer`}
        >
          <option value="Executive Sedan">Executive Sedan</option>
          <option value="Luxury SUV">Luxury SUV</option>
          <option value="Executive MPV / Van">Executive MPV / Van</option>
          <option value="No Preference">No Preference</option>
        </select>
      </div>
    </div>

    {/* Additional Requirements */}
    <div className={FIELD_CONTAINER}>
      <label className={LABEL}>
        <span>Additional Requirements</span>
        <span className="text-slate-400 font-normal">(Opt)</span>
      </label>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter any additional requirements"
        className={INPUT}
      />
    </div>
  </div>
);

export interface OtherServicesHotelSectionProps {
  hotelCityOrName: string;
  setHotelCityOrName: React.Dispatch<React.SetStateAction<string>>;
  hotelCheckIn: string;
  setHotelCheckIn: React.Dispatch<React.SetStateAction<string>>;
  hotelCheckOut: string;
  setHotelCheckOut: React.Dispatch<React.SetStateAction<string>>;
  hotelCheckInCalendarOpen: boolean;
  setHotelCheckInCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hotelCheckOutCalendarOpen: boolean;
  setHotelCheckOutCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hotelGuests: number;
  setHotelGuests: React.Dispatch<React.SetStateAction<number>>;
  hotelRooms: number;
  setHotelRooms: React.Dispatch<React.SetStateAction<number>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export const OtherServicesHotelSection: React.FC<OtherServicesHotelSectionProps> = ({
  hotelCityOrName,
  setHotelCityOrName,
  hotelCheckIn,
  setHotelCheckIn,
  hotelCheckOut,
  setHotelCheckOut,
  hotelCheckInCalendarOpen,
  setHotelCheckInCalendarOpen,
  hotelCheckOutCalendarOpen,
  setHotelCheckOutCalendarOpen,
  hotelGuests,
  setHotelGuests,
  hotelRooms,
  setHotelRooms,
  notes,
  setNotes,
}) => (
  <div className="space-y-3">
    {/* Destination / City / Hotel */}
    <div className={FIELD_CONTAINER}>
      <label className={LABEL}>
        <Hotel className="w-3 h-3 text-slate-500" />
        <span>City / Destination / Hotel</span>
        <span className="text-lime-600 font-bold">*</span>
      </label>
      <input
        type="text"
        value={hotelCityOrName}
        onChange={(e) => setHotelCityOrName(e.target.value)}
        placeholder="Enter city, destination, or hotel name (e.g. New Delhi, Aerocity, Taj Palace)"
        className={INPUT}
      />
    </div>

    {/* Dates & Capacity */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Check-In Date */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <CalendarDays className="w-3 h-3 text-slate-500" />
          <span>Check-in Date</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <Popover open={hotelCheckInCalendarOpen} onOpenChange={setHotelCheckInCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={DATE_BTN}>
              <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <span className={hotelCheckIn ? "text-slate-900" : "text-slate-400"}>
                {hotelCheckIn && isValid(new Date(hotelCheckIn))
                  ? format(new Date(hotelCheckIn), "EEE, dd MMM yyyy")
                  : "Select check-in"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl"
            align="start"
          >
            <CalendarPicker
              mode="single"
              selected={hotelCheckIn && isValid(new Date(hotelCheckIn)) ? new Date(hotelCheckIn) : undefined}
              onSelect={(date) => {
                if (date) {
                  const formatted = format(date, "yyyy-MM-dd");
                  setHotelCheckIn(formatted);
                  setHotelCheckInCalendarOpen(false);
                  if (hotelCheckOut && new Date(hotelCheckOut) < date) {
                    setHotelCheckOut("");
                  }
                }
              }}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-Out Date */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <CalendarDays className="w-3 h-3 text-slate-500" />
          <span>Check-out Date</span>
          <span className="text-lime-600 font-bold">*</span>
        </label>
        <Popover open={hotelCheckOutCalendarOpen} onOpenChange={setHotelCheckOutCalendarOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={DATE_BTN}>
              <CalendarDays className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <span className={hotelCheckOut ? "text-slate-900" : "text-slate-400"}>
                {hotelCheckOut && isValid(new Date(hotelCheckOut))
                  ? format(new Date(hotelCheckOut), "EEE, dd MMM yyyy")
                  : "Select check-out"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl"
            align="start"
          >
            <CalendarPicker
              mode="single"
              selected={hotelCheckOut && isValid(new Date(hotelCheckOut)) ? new Date(hotelCheckOut) : undefined}
              onSelect={(date) => {
                if (date) {
                  setHotelCheckOut(format(date, "yyyy-MM-dd"));
                  setHotelCheckOutCalendarOpen(false);
                }
              }}
              disabled={{
                before:
                  hotelCheckIn && isValid(new Date(hotelCheckIn))
                    ? new Date(hotelCheckIn)
                    : new Date(),
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <Users className="w-3 h-3 text-slate-500" />
          <span>Guests</span>
        </label>
        <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
          <span className="text-xs font-semibold text-slate-900">
            {hotelGuests} Guest{hotelGuests > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHotelGuests((g) => Math.max(1, g - 1))}
              disabled={hotelGuests <= 1}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setHotelGuests((g) => Math.min(20, g + 1))}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className={FIELD_CONTAINER}>
        <label className={LABEL}>
          <BedDouble className="w-3 h-3 text-slate-500" />
          <span>Rooms</span>
        </label>
        <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white/70 px-3 justify-between">
          <span className="text-xs font-semibold text-slate-900">
            {hotelRooms} Room{hotelRooms > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHotelRooms((r) => Math.max(1, r - 1))}
              disabled={hotelRooms <= 1}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setHotelRooms((r) => Math.min(10, r + 1))}
              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Requirements */}
    <div className={FIELD_CONTAINER}>
      <label className={LABEL}>
        <span>Additional Requirements</span>
        <span className="text-slate-400 font-normal">(Opt)</span>
      </label>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Room preference, star rating, or special requests"
        className={INPUT}
      />
    </div>
  </div>
);
