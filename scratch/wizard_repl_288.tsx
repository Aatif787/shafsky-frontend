  // Selected Services state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState("");
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);