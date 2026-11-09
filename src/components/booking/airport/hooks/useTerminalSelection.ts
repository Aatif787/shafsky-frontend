import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AirportServiceType } from "@/lib/api/multiServiceApi";
import { TerminalMismatchInfo } from "../types";
import { normalizeTerminalName } from "../utils";

export interface UseTerminalSelectionOptions {
  rawAirportCode: string;
  initialTravelType: "domestic" | "international";
  searchParams?: Record<string, any>;
  airportCode: string;
  cleanOrigin: string;
  originCode: string;
  cleanDest: string;
  destCode: string;
  direction: "arrival" | "departure" | "transit";
  travelType: "domestic" | "international";
  flightVerification: {
    flightNumber: string;
    isFlightVerified: boolean;
    verifiedFlight: any;
    setManualDepTerminal: (term: string) => void;
    setManualArrTerminal: (term: string) => void;
  };
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  setSelectedPackageName: (name: string) => void;
  setSelectedPackagePrice: (price: string) => void;
  setPackageByService: React.Dispatch<React.SetStateAction<Record<AirportServiceType, string>>>;
}

export interface UseTerminalSelectionReturn {
  selectedTerminal: string;
  setSelectedTerminal: React.Dispatch<React.SetStateAction<string>>;
  terminalNoticeDismissed: boolean;
  setTerminalNoticeDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  terminalMismatch: TerminalMismatchInfo | null;
  handleApplyTerminalSwitch: (upgradeToGold?: boolean) => void;
}

export function useTerminalSelection({
  rawAirportCode,
  initialTravelType,
  searchParams,
  airportCode,
  cleanOrigin,
  originCode,
  cleanDest,
  destCode,
  direction,
  travelType,
  flightVerification,
  selectedPackageId,
  setSelectedPackageId,
  setSelectedPackageName,
  setSelectedPackagePrice,
  setPackageByService,
}: UseTerminalSelectionOptions): UseTerminalSelectionReturn {
  const [selectedTerminal, setSelectedTerminal] = useState<string>(() => {
    if ((rawAirportCode || "").toUpperCase() === "DEL" && initialTravelType === "international") {
      return "Terminal 3";
    }
    if (searchParams?.terminal) {
      return searchParams.terminal;
    }
    if ((rawAirportCode || "").toUpperCase() === "DEL") {
      const pkg = (searchParams?.package_id || searchParams?.service_id || "").toLowerCase();
      return pkg.includes("gold") ? "Terminal 3" : "Terminal 1 & 2";
    }
    return "";
  });

  const [terminalNoticeDismissed, setTerminalNoticeDismissed] = useState<boolean>(false);

  useEffect(() => {
    setTerminalNoticeDismissed(false);
  }, [flightVerification.flightNumber]);

  const terminalMismatch = useMemo<TerminalMismatchInfo | null>(() => {
    if (!flightVerification.isFlightVerified || !flightVerification.verifiedFlight) return null;
    const fl = flightVerification.verifiedFlight;

    const effOrigin = (cleanOrigin || originCode || "").trim().toUpperCase();
    const effDest = (cleanDest || destCode || "").trim().toUpperCase();
    const effApt = (airportCode || "").trim().toUpperCase();

    const isDel = effApt === "DEL" || effOrigin === "DEL" || effDest === "DEL";
    if (!isDel) return null;
    if (travelType === "international") return null;

    let rawFlightTerminal: string | null = null;
    if (effApt === "DEL") {
      if (direction === "arrival") {
        rawFlightTerminal = fl.arrival?.terminal || null;
      } else {
        rawFlightTerminal = fl.departure?.terminal || null;
      }
    } else if (effDest === "DEL") {
      rawFlightTerminal = fl.arrival?.terminal || null;
    } else if (effOrigin === "DEL") {
      rawFlightTerminal = fl.departure?.terminal || null;
    }

    if (!rawFlightTerminal) return null;

    const normFlightTerm = normalizeTerminalName(rawFlightTerminal);
    const normSelectedTerm = normalizeTerminalName(selectedTerminal || "Terminal 1 & 2");

    if (!normFlightTerm || !normSelectedTerm || normFlightTerm === normSelectedTerm) {
      return null;
    }

    const isSwitchingToT3 = normFlightTerm === "Terminal 3";
    const currentPkgId = (selectedPackageId || "").toLowerCase();
    const isCurrentSilver = currentPkgId.includes("silver") || currentPkgId === "basic";
    const isCurrentGold = currentPkgId.includes("gold") || currentPkgId === "meet";

    let actionLabel = "";
    let priceDiff = 0;
    let canUpgrade = false;

    if (isSwitchingToT3) {
      if (isCurrentSilver) {
        actionLabel = "Switch to Terminal 3 (No Extra Charge)";
        canUpgrade = true;
      } else {
        actionLabel = "Switch to Terminal 3 (No Extra Charge)";
      }
    } else {
      if (isCurrentGold) {
        actionLabel = "Switch to Terminal 1 & 2 (Save ₹500 / guest)";
        priceDiff = -500;
      } else {
        actionLabel = "Switch to Terminal 1 & 2 (No Extra Charge)";
      }
    }

    return {
      flightNum: fl.flightNum,
      airportCode: "DEL",
      airportName: "Delhi Airport (DEL)",
      selectedTerminal: normSelectedTerm,
      detectedTerminal: normFlightTerm,
      rawDetectedTerminal: rawFlightTerminal,
      canUpgradeToGold: canUpgrade,
      priceDifferenceInr: priceDiff,
      actionLabel,
    };
  }, [
    flightVerification.isFlightVerified,
    flightVerification.verifiedFlight,
    airportCode,
    cleanOrigin,
    originCode,
    cleanDest,
    destCode,
    direction,
    travelType,
    selectedTerminal,
    selectedPackageId,
  ]);

  const handleApplyTerminalSwitch = (upgradeToGold = false) => {
    if (!terminalMismatch) return;
    const targetTerm = terminalMismatch.detectedTerminal;
    setSelectedTerminal(targetTerm);
    setTerminalNoticeDismissed(true);

    const termCode = targetTerm === "Terminal 3" ? "3" : "1";
    if (direction === "departure") {
      flightVerification.setManualDepTerminal(termCode);
    } else {
      flightVerification.setManualArrTerminal(termCode);
    }

    const currentSt = (direction || "departure").toUpperCase() as AirportServiceType;

    if (targetTerm === "Terminal 3") {
      if (upgradeToGold) {
        setSelectedPackageId("gold");
        setSelectedPackageName("Gold Service");
        setSelectedPackagePrice("3500");
        setPackageByService((prev) => ({ ...prev, [currentSt]: "gold" }));
        toast.success("Switched to Terminal 3 and upgraded to Gold Lounge package (+₹500).");
      } else {
        toast.success("Switched booking to Terminal 3. Packages and pricing updated.");
      }
    } else {
      if ((selectedPackageId || "").toLowerCase().includes("gold")) {
        setSelectedPackageId("silver");
        setSelectedPackageName("Silver Service");
        setSelectedPackagePrice("3000");
        setPackageByService((prev) => ({ ...prev, [currentSt]: "silver" }));
        toast.success("Switched booking to Terminal 1 & 2 (Silver Service, saved ₹500/guest).");
      } else {
        toast.success("Switched booking to Terminal 1 & 2. Packages and pricing updated.");
      }
    }
  };

  return {
    selectedTerminal,
    setSelectedTerminal,
    terminalNoticeDismissed,
    setTerminalNoticeDismissed,
    terminalMismatch,
    handleApplyTerminalSwitch,
  };
}

