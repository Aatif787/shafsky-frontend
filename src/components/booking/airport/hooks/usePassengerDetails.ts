import { useState } from "react";
import { toast } from "sonner";
import { PassengerDetail } from "../types";

export interface UsePassengerDetailsOptions {
  searchParams?: Record<string, any>;
}

export interface UsePassengerDetailsReturn {
  passengers: PassengerDetail[];
  setPassengers: React.Dispatch<React.SetStateAction<PassengerDetail[]>>;
  paxAdults: number;
  setPaxAdults: React.Dispatch<React.SetStateAction<number>>;
  paxChildren: number;
  paxInfants: number;
  totalPax: number;
  handlePaxChange: (newCount: number) => void;
  updatePassenger: (index: number, field: keyof PassengerDetail, value: string) => void;
  copyFromPassenger1: (index: number) => void;
  primaryPassenger: PassengerDetail;
  fullName: string;
  age: string;
  phone: string;
  email: string;
}

export function usePassengerDetails({ searchParams }: UsePassengerDetailsOptions): UsePassengerDetailsReturn {
  const [paxAdults, setPaxAdults] = useState<number>(() =>
    Math.min(10, Math.max(1, Number(searchParams?.pax_adults) || 1))
  );
  const paxChildren = Math.max(0, Number(searchParams?.pax_children) || 0);
  const paxInfants = Math.max(0, Number(searchParams?.pax_infants) || 0);
  const totalPax = paxAdults + paxChildren + paxInfants;

  const [passengers, setPassengers] = useState<PassengerDetail[]>(() => {
    const count = Math.min(10, Math.max(1, Number(searchParams?.pax_adults) || 1));
    return Array.from({ length: count }, () => ({
      fullName: "",
      age: "",
      phone: "",
      email: "",
    }));
  });

  const handlePaxChange = (newCount: number) => {
    if (newCount > 10) {
      toast.info("Maximum 10 passengers allowed per booking. For larger groups, please contact our VIP desk.");
      return;
    }
    const count = Math.min(10, Math.max(1, newCount));
    setPaxAdults(count);
    setPassengers((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, () => ({
          fullName: "",
          age: "",
          phone: "",
          email: "",
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
  };

  const updatePassenger = (index: number, field: keyof PassengerDetail, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { fullName: "", age: "", phone: "", email: "" };
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const copyFromPassenger1 = (index: number) => {
    setPassengers((prev) => {
      const p1 = prev[0] || { phone: "", email: "" };
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          phone: p1.phone || "",
          email: p1.email || "",
        };
      }
      return updated;
    });
  };

  const primaryPassenger = passengers[0] || { fullName: "", age: "", phone: "", email: "" };
  const fullName = primaryPassenger.fullName;
  const age = primaryPassenger.age;
  const phone = primaryPassenger.phone;
  const email = primaryPassenger.email;

  return {
    passengers,
    setPassengers,
    paxAdults,
    setPaxAdults,
    paxChildren,
    paxInfants,
    totalPax,
    handlePaxChange,
    updatePassenger,
    copyFromPassenger1,
    primaryPassenger,
    fullName,
    age,
    phone,
    email,
  };
}

