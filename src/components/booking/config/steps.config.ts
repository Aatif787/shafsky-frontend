import { WorkflowStep } from "../types/workflow.types";

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  { stepNumber: 1, title: "Service Selection & Details", sub: "Specify origin/destination, schedule, and options.", estTime: "Est. 30 sec", progress: 33 },
  { stepNumber: 2, title: "Contact Info & Review", sub: "Enter lead guest details and review request.", estTime: "Est. 30 sec", progress: 66 },
  { stepNumber: 3, title: "Booking Confirmed", sub: "Your booking request is submitted to our VIP desk.", estTime: "Completed", progress: 100 },
];
