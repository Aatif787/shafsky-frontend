  const [activeServiceForPackage, setActiveServiceForPackage] = useState<AirportService | null>(null);

  const selectMode = useCallback((newTripType: "one_way" | "round_trip" | "multi_city") => {
    let newServiceType = "Airport Services";
    if (newTripType === "one_way") {
      newServiceType = "Departure Service";
      setDepSectionOpen(true);
      setArrSectionOpen(false);
    } else if (newTripType === "round_trip") {
      newServiceType = "Arrival Service";
      setDepSectionOpen(false);
      setArrSectionOpen(true);
    } else if (newTripType === "multi_city") {
      newServiceType = "Connection Service";
      setDepSectionOpen(true);
      setArrSectionOpen(true);
    }

    setForm((prev) => ({
      ...prev,
      trip_type: newTripType,
      service_type: newServiceType,
      return_date: newTripType === "multi_city" ? prev.return_date : "",
    }));

    setWizardStep(2);
  }, []);