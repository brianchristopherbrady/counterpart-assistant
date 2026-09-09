import { useEffect } from "react";
import { appointmentTypeForContext, resolvePatientContext } from "@/domain/eligibility";
import { appointmentTypes, patients } from "@/data/fixtures";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { useBookingDraftStore } from "../state/bookingDraftStore";
import { usePatient } from "./usePatient";

/**
 * Single source of truth for "what appointment type/patient context applies right now" —
 * shared by BookingFlow and the provider availability page so eligibility logic (a documented
 * source of real bugs previously) is derived exactly once, not duplicated and left to drift.
 * Also owns the returning-patient subject prefill effect, since it must run regardless of which
 * page is mounted (a prior bug: it only ran inside BookingFlow, so navigating straight from the
 * provider availability page's "Continue" button raced ahead of the prefill and wrongly asked
 * for guest details again).
 */
export function useBookingContext() {
  const scenario = useScenarioStore((s) => s.config);
  const actor = useSessionStore((s) => s.actor);
  const draft = useBookingDraftStore((s) => s.draft);
  const dispatch = useBookingDraftStore((s) => s.dispatch);

  const isRescheduling = Boolean(draft.reschedulingAppointmentId);
  const existingAppointmentsQuery = useAppointments(actor);
  const originalAppointment = isRescheduling
    ? existingAppointmentsQuery.data?.find((a) => a.id === draft.reschedulingAppointmentId)
    : undefined;

  const patientContext = isRescheduling
    ? (appointmentTypes.find((t) => t.id === draft.filters.appointmentTypeId)?.allowedPatientContext ?? "new")
    : actor.kind === "staff"
      ? resolvePatientContext(draft.subject?.patientId, patients)
      : scenario.actor === "patient"
        ? scenario.patientContext
        : "new";
  const appointmentTypeId = isRescheduling
    ? draft.filters.appointmentTypeId
    : appointmentTypeForContext(patientContext, appointmentTypes);
  const appointmentType = appointmentTypes.find((t) => t.id === appointmentTypeId);

  // Returning patient: prefill subject from their fixture record and skip guest identity entry.
  const shouldPrefillReturningPatient =
    scenario.presetId === "returning-patient" && actor.kind === "patient" && !draft.subject && !isRescheduling;
  const returningPatientQuery = usePatient(shouldPrefillReturningPatient ? actor.patientId : undefined);
  useEffect(() => {
    if (returningPatientQuery.data && shouldPrefillReturningPatient) {
      dispatch({
        type: "SET_SUBJECT",
        subject: {
          patientId: returningPatientQuery.data.id,
          fullName: returningPatientQuery.data.fullName,
          dateOfBirth: returningPatientQuery.data.dateOfBirth,
          contact: returningPatientQuery.data.contact,
        },
      });
    }
  }, [returningPatientQuery.data, shouldPrefillReturningPatient, dispatch]);

  return { scenario, actor, draft, isRescheduling, originalAppointment, patientContext, appointmentTypeId, appointmentType };
}
