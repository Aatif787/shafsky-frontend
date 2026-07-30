import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useBookingDraft(initialServiceId: string) {
  const [draftLoaded, setDraftLoaded] = useState(false);

  const saveDraft = (data: Record<string, any>) => {
    try {
      const draft = {
        initialServiceId,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("shafsky_booking_draft", JSON.stringify(draft));
      toast.success("Request draft saved locally.");
    } catch {
      // ignore draft save error
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("shafsky_booking_draft");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore parse error
    }
    return null;
  };

  return { saveDraft, loadDraft, draftLoaded, setDraftLoaded };
}
