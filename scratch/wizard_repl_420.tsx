    setForm({
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      company: "",
      trip_type: detectedTripType,
      origin: searchParams.origin || "",
      destination: searchParams.destination || "",
      depart_date: initialDate,
      return_date: "",
      pax_adults: searchParams.pax_adults ?? 1,
      pax_children: searchParams.pax_children ?? 0,
      pax_infants: searchParams.pax_infants ?? 0,
      aircraft_preference: "",
      service_type: defaultServiceType,
      notes: searchParams.notes || "",
    });

    if (searchParams.origin || searchParams.destination || searchParams.notes) {
      if (searchParams.service_id || searchParams.package_id) {
        setWizardStep(5);
      } else {
        setWizardStep(4);
      }
    } else {
      setWizardStep(1);
    }
  }, [searchParams]);