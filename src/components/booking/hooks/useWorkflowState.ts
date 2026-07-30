import { useState } from "react";

export function useWorkflowState() {
  // Medical
  const [patientName, setPatientName] = useState<string>("");
  const [patientCondition, setPatientCondition] = useState<string>("Critical Care ICU / Ventilator");
  const [patientCount, setPatientCount] = useState<number>(1);
  const [humAssistanceType, setHumAssistanceType] = useState<string>("International Air Repatriation & Embalming");

  // Cargo
  const [cargoType, setCargoType] = useState<string>("General Commercial Freight");
  const [cargoWeight, setCargoWeight] = useState<string>("");
  const [cargoPackages, setCargoPackages] = useState<string>("");
  const [cargoDescription, setCargoDescription] = useState<string>("");
  const [cargoCompany, setCargoCompany] = useState<string>("");

  // AVI
  const [animalType, setAnimalType] = useState<string>("Dog");
  const [petBreed, setPetBreed] = useState<string>("");
  const [petWeight, setPetWeight] = useState<string>("");
  const [animalCount, setAnimalCount] = useState<number>(1);

  // Hotel
  const [hotelDestination, setHotelDestination] = useState<string>("New Delhi, India");
  const [checkInDate, setCheckInDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState<string>(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
  const [roomPreference, setRoomPreference] = useState<string>("Executive Presidential Suite");

  // Visa
  const [visaCountry, setVisaCountry] = useState<string>("India");
  const [visaType, setVisaType] = useState<string>("Diplomatic / Express e-Visa");
  const [passportNationality, setPassportNationality] = useState<string>("United Kingdom");

  // Charter
  const [aircraftCategory, setAircraftCategory] = useState<string>("Ultra Long Range (Gulfstream G650ER)");

  return {
    medical: { patientName, setPatientName, patientCondition, setPatientCondition, patientCount, setPatientCount, humAssistanceType, setHumAssistanceType },
    cargo: { cargoType, setCargoType, cargoWeight, setCargoWeight, cargoPackages, setCargoPackages, cargoDescription, setCargoDescription, cargoCompany, setCargoCompany },
    avi: { animalType, setAnimalType, petBreed, setPetBreed, petWeight, setPetWeight, animalCount, setAnimalCount },
    hotel: { hotelDestination, setHotelDestination, checkInDate, setCheckInDate, checkOutDate, setCheckOutDate, roomPreference, setRoomPreference },
    visa: { visaCountry, setVisaCountry, visaType, setVisaType, passportNationality, setPassportNationality },
    charter: { aircraftCategory, setAircraftCategory },
  };
}
