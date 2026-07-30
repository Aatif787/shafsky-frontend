import { BookingService } from "./service.types";

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  sub: string;
  estTime: string;
  progress: number;
}

export interface WorkflowMetadata {
  serviceId: BookingService;
  totalSteps: number;
  steps: WorkflowStep[];
  successTitle: string;
  confirmationSubtitle: string;
  badgeLabel: string;
}
