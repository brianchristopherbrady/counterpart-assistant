import type { AppointmentType, AppointmentTypeId, PatientContext } from "./models";

/** Each fixture appointment type maps 1:1 to a patient context — no independent type filter needed. */
export function appointmentTypeForContext(
  context: PatientContext,
  appointmentTypes: AppointmentType[],
): AppointmentTypeId | undefined {
  return appointmentTypes.find((t) => t.allowedPatientContext === context)?.id;
}
