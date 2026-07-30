import { toast } from "sonner";
import { validateContactDetails, validateRouteCities } from "../validation/bookingValidation";

export function useWorkflowValidation() {
  const validateContact = (name: string, phone: string, email: string): boolean => {
    const error = validateContactDetails(name, phone, email);
    if (error) {
      toast.error(error);
      return false;
    }
    return true;
  };

  const validateRoute = (origin: string, destination: string): boolean => {
    const error = validateRouteCities(origin, destination);
    if (error) {
      toast.error(error);
      return false;
    }
    return true;
  };

  return { validateContact, validateRoute };
}
