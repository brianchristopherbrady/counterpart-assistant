import type { AppointmentType } from "@/domain/models";

export const appointmentTypes: AppointmentType[] = [
  {
    id: "type-new-patient",
    label: "New Patient Visit",
    durationMinutes: 30,
    allowedPatientContext: "new",
  },
  {
    id: "type-follow-up",
    label: "Follow-up Visit",
    durationMinutes: 15,
    allowedPatientContext: "established",
  },
];
