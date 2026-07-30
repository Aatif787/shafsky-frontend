    if (initialServices.length > 0) {
      setSelectedServiceIds(initialServices);
    }

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