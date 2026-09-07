import type { AppointmentType, AppointmentTypeId, Patient, PatientContext } from "./models";

/** Each fixture appointment type maps 1:1 to a patient context — no independent type filter needed. */
export function appointmentTypeForContext(
  context: PatientContext,
  appointmentTypes: AppointmentType[],
): AppointmentTypeId | undefined {
  return appointmentTypes.find((t) => t.allowedPatientContext === context)?.id;
}

/**
 * Established relationship to the practice, not merely "has a patient record" — callers must
 * pass the ORIGINAL seed/fixture patients here, never a session's growing registered-patient
 * list, or a brand-new demo signup would wrongly count as an existing practice relationship.
 */
export function resolvePatientContext(
  patientId: string | undefined,
  seedPatients: Patient[],
): PatientContext {
  if (patientId && seedPatients.some((p) => p.id === patientId)) return "established";
  return "new";
}
