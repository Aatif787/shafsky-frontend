  const [userNotes, setUserNotes] = useState("");

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const [customMeetGreetPrice, setCustomMeetGreetPrice] = useState<number | null>(null);
  const [customMeetGreetTitle, setCustomMeetGreetTitle] = useState<string | null>(null);
  const [customMeetGreetDesc, setCustomMeetGreetDesc] = useState<string | null>(null);

  const [customLoungePrice, setCustomLoungePrice] = useState<number | null>(null);
  const [customVisaPrice, setCustomVisaPrice] = useState<number | null>(null);
  const [customHotelPrice, setCustomHotelPrice] = useState<number | null>(null);
  const [customTransferPrice, setCustomTransferPrice] = useState<number | null>(null);

  const [activeServiceForPackage, setActiveServiceForPackage] = useState<AirportService | null>(null);

  const selectMode = useCallback((newTripType: "one_way" | "round_trip" | "multi_city") => {
    let newServiceType = "Airport Services";
    if (newTripType === "one_way") {
      newServiceType = "Departure Service";
    } else if (newTripType === "round_trip") {
      newServiceType = "Arrival Service";
    } else if (newTripType === "multi_city") {
      newServiceType = "Connection Service";
    }

    setForm((prev) => ({
      ...prev,
      trip_type: newTripType,
      service_type: newServiceType,
      return_date: newTripType === "multi_city" ? prev.return_date : "",
    }));

    setWizardStep(2);
  }, []);

  const getLocalServiceId = useCallback((serviceId: string) => {
    const isArrival = form.trip_type === "round_trip";
    const prefix = isArrival ? "arr_" : "dep_";
    if (serviceId === "transfer") {
      return `${prefix}chauffeur`;
    }
    return `${prefix}${serviceId}`;
  }, [form.trip_type]);

  const resolvedAirportCode = useMemo(() => {
    const isArrival = form.trip_type === "round_trip";
    if (isManualMode) {
      return isArrival ? manualDest : manualOrigin;
    }
    if (flightDetails) {
      return isArrival ? flightDetails.destCode : flightDetails.originCode;
    }
    const parsedDest = form.destination?.match(/\(([A-Z0-9]{3,4})\)/i)?.[1];
    const parsedOrigin = form.origin?.match(/\(([A-Z0-9]{3,4})\)/i)?.[1];
    return isArrival ? (parsedDest || "DEL") : (parsedOrigin || "DEL");
  }, [form.trip_type, isManualMode, manualDest, manualOrigin, flightDetails, form.origin, form.destination]);

  const getAirportName = useCallback((code: string) => {
    const ap = AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase());
    return ap ? `${ap.city} (${code})` : code;
  }, []);

  useEffect(() => {
    if (!resolvedAirportCode) return;
    const svcs = getAirportServices(resolvedAirportCode);
    svcs.forEach((s) => {
      if (s.type === "direct" && s.price) {
        if (s.id === "lounge") setCustomLoungePrice(s.price);
        if (s.id === "visa") setCustomVisaPrice(s.price);
        if (s.id === "hotel") setCustomHotelPrice(s.price);
        if (s.id === "transfer") setCustomTransferPrice(s.price);
      }
    });
  }, [resolvedAirportCode]);

  const departureServices = useMemo(() => {
    let list = DEPARTURE_SERVICES.map(svc => {
      if (svc.id === "dep_meet_greet") {
        return {
          ...svc,
          title: customMeetGreetTitle || svc.title,
          desc: customMeetGreetDesc || svc.desc,
          price: customMeetGreetPrice !== null ? customMeetGreetPrice : svc.price,
        };
      }
      if (svc.id === "dep_lounge") {
        return { ...svc, price: customLoungePrice !== null ? customLoungePrice : svc.price };
      }
      if (svc.id === "dep_hotel") {
        return { ...svc, price: customHotelPrice !== null ? customHotelPrice : svc.price };
      }
      if (svc.id === "dep_chauffeur") {
        return { ...svc, price: customTransferPrice !== null ? customTransferPrice : svc.price };
      }
      return svc;
    });

    if (selectedServiceIds.includes("dep_visa") || searchParams.service_id === "visa") {
      if (!list.some(s => s.id === "dep_visa")) {
        list.push({
          id: "dep_visa",
          title: "Visa Assistance",
          desc: "Priority visa-on-arrival or e-visa clearance desk processing.",
          price: customVisaPrice !== null ? customVisaPrice : 2500,
          img: fastTrackImg,
        });
      }
    }
    return list;
  }, [customMeetGreetTitle, customMeetGreetDesc, customMeetGreetPrice, customLoungePrice, customHotelPrice, customTransferPrice, customVisaPrice, selectedServiceIds, searchParams.service_id]);

  const arrivalServices = useMemo(() => {
    let list = ARRIVAL_SERVICES.map(svc => {
      if (svc.id === "arr_meet_greet") {
        return {
          ...svc,
          title: customMeetGreetTitle || svc.title,
          desc: customMeetGreetDesc || svc.desc,
          price: customMeetGreetPrice !== null ? customMeetGreetPrice : svc.price,
        };
      }
      if (svc.id === "arr_lounge") {
        return { ...svc, price: customLoungePrice !== null ? customLoungePrice : svc.price };
      }
      if (svc.id === "arr_hotel") {
        return { ...svc, price: customHotelPrice !== null ? customHotelPrice : svc.price };
      }
      if (svc.id === "arr_chauffeur") {
        return { ...svc, price: customTransferPrice !== null ? customTransferPrice : svc.price };
      }
      return svc;
    });

    if (selectedServiceIds.includes("arr_visa") || searchParams.service_id === "visa") {
      if (!list.some(s => s.id === "arr_visa")) {
        list.push({
          id: "arr_visa",
          title: "Visa Assistance",
          desc: "Priority visa-on-arrival or e-visa clearance desk processing.",
          price: customVisaPrice !== null ? customVisaPrice : 2500,
          img: fastTrackImg,
        });
      }
    }
    return list;
  }, [customMeetGreetTitle, customMeetGreetDesc, customMeetGreetPrice, customLoungePrice, customHotelPrice, customTransferPrice, customVisaPrice, selectedServiceIds, searchParams.service_id]);

  const allServices = useMemo(() => [...departureServices, ...arrivalServices], [departureServices, arrivalServices]);

  const resolvedServices = useMemo(() => {
    const rawServices = getAirportServices(resolvedAirportCode);
    return rawServices.map((svc) => {
      const localId = getLocalServiceId(svc.id);
      const match = allServices.find((s) => s.id === localId);
      return {
        ...svc,
        title: match?.title || svc.title,
        desc: match?.desc || svc.desc,
        price: match?.price || svc.price,
      };
    });
  }, [resolvedAirportCode, allServices, getLocalServiceId]);