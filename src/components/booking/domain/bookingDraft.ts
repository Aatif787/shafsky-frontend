const DRAFT_KEY = "shafsky_booking_draft";

export function saveBookingDraft(serviceId: string, data: Record<string, any>): void {
  try {
    const draft = {
      initialServiceId: serviceId,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore save error
  }
}

export function loadBookingDraft(): Record<string, any> | null {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore load error
  }
  return null;
}

export function clearBookingDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore clear error
  }
}
