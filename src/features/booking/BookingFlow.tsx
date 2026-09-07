import { useEffect, useState } from "react";
import { useBookingDraftStore } from "./state/bookingDraftStore";
import { useBookAppointment } from "./hooks/useBookAppointment";
import { useSlots } from "./hooks/useSlots";
import { usePatient } from "./hooks/usePatient";
import { DiscoveryStep } from "./components/DiscoveryStep";
import { GuestDetailsForm } from "./components/GuestDetailsForm";
import { PatientSignInForm } from "./components/PatientSignInForm";
import { StaffPatientLookup } from "./components/StaffPatientLookup";
import { BookingReview } from "./components/BookingReview";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { StatusMessage } from "@/design-system/react";
import { appointmentTypeForContext, resolvePatientContext } from "@/domain/eligibility";
import { appointmentTypes, locations, patients, providers } from "@/data/fixtures";
import { SlotConflictError } from "@/domain/errors";
import { VIEWER_TIME_ZONE } from "@/lib/datetime";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import type { Appointment } from "@/domain/models";

/** Orchestrates all four scenario presets: guest, returning patient, staff, and sign-in-required. */
export function BookingFlow() {
  const scenario = useScenarioStore((s) => s.config);
  const scenarioVersion = useScenarioStore((s) => s.version);
  const actor = useSessionStore((s) => s.actor);
  const setActor = useSessionStore((s) => s.setActor);
  const draft = useBookingDraftStore((s) => s.draft);
  const dispatch = useBookingDraftStore((s) => s.dispatch);
  const bookMutation = useBookAppointment();
  const [discoveryNotice, setDiscoveryNotice] = useState<string | undefined>();
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Applying a scenario resets the shared draft store directly, but this screen's own local
  // "just confirmed" state and notice also need to clear, or a stale confirmation/notice from
  // before the switch would incorrectly reappear under the new scenario.
  useEffect(() => {
    setConfirmedAppointment(null);
    setDiscoveryNotice(undefined);
  }, [scenarioVersion]);

  // Staff derive eligibility from whichever patient they identified; patients get a fixed context.
  const patientContext =
    actor.kind === "staff"
      ? resolvePatientContext(draft.subject?.patientId, patients)
      : scenario.actor === "patient"
        ? scenario.patientContext
        : "new";
  const appointmentTypeId = appointmentTypeForContext(patientContext, appointmentTypes);
  const appointmentType = appointmentTypes.find((t) => t.id === appointmentTypeId);
  const provider = providers.find((p) => p.id === draft.providerId);

  // Re-derive the actual Slot record for the chosen provider — hooks must run unconditionally.
  const slotsForProviderQuery = useSlots(
    appointmentTypeId && draft.providerId
      ? {
          discoveryMode: "provider-first",
          providerId: draft.providerId,
          appointmentTypeId,
          locationId: draft.filters.locationId,
          mode: draft.filters.mode,
          patientContext,
        }
      : null,
  );
  const selectedSlot = (slotsForProviderQuery.data ?? []).find((s) => s.id === draft.slotId);

  // Returning patient: prefill subject from their fixture record and skip guest identity entry.
  const shouldPrefillReturningPatient =
    scenario.presetId === "returning-patient" && actor.kind === "patient" && !draft.subject;
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

  if (!appointmentTypeId || !appointmentType) {
    return <StatusMessage intent="error">No appointment type is configured for this patient context.</StatusMessage>;
  }

  if (confirmedAppointment && provider) {
    const location = locations.find((l) => l.id === confirmedAppointment.locationId);
    return (
      <BookingConfirmation
        appointment={confirmedAppointment}
        providerName={provider.name}
        locationName={location?.name ?? confirmedAppointment.locationId}
        displayZone={location?.timeZone ?? VIEWER_TIME_ZONE}
        canViewAppointments={actor.kind !== "guest"}
      />
    );
  }

  // Staff must identify (or create) the patient before anything else.
  if (actor.kind === "staff" && !draft.subject) {
    return (
      <StaffPatientLookup actor={actor} onIdentified={(subject) => dispatch({ type: "SET_SUBJECT", subject })} />
    );
  }

  const bookingForBanner =
    actor.kind === "staff" && draft.subject ? (
      <StatusMessage intent="info">
        Booking for {draft.subject.fullName} ({draft.subject.dateOfBirth})
      </StatusMessage>
    ) : null;

  if (draft.stage === "signin" && draft.subject) {
    return (
      <div className="flex flex-col gap-4">
        {bookingForBanner}
        <PatientSignInForm
          subjectForNewAccount={draft.subject}
          onSignedIn={(patient) => {
            setActor({ kind: "patient", patientId: patient.id });
            dispatch({
              type: "SET_SUBJECT",
              subject: {
                patientId: patient.id,
                fullName: patient.fullName,
                dateOfBirth: patient.dateOfBirth,
                contact: patient.contact,
              },
            });
            dispatch({ type: "GO_TO_STAGE", stage: "review" });
          }}
        />
      </div>
    );
  }

  if (draft.stage === "identity" && provider && selectedSlot) {
    return (
      <div className="flex flex-col gap-4">
        {bookingForBanner}
        <GuestDetailsForm
          defaultValues={draft.subject}
          onBack={() => dispatch({ type: "GO_TO_STAGE", stage: "discovery" })}
          onSubmit={(subject) => {
            dispatch({ type: "SET_SUBJECT", subject });
            const needsSignIn =
              scenario.actor === "patient" && scenario.requireSignInToBook && actor.kind === "guest";
            dispatch({ type: "GO_TO_STAGE", stage: needsSignIn ? "signin" : "review" });
          }}
        />
      </div>
    );
  }

  if ((draft.stage === "review" || draft.stage === "submitting") && draft.subject && provider && selectedSlot) {
    const location = locations.find((l) => l.id === selectedSlot.locationId);
    const displayZone = selectedSlot.mode === "virtual" ? VIEWER_TIME_ZONE : (location?.timeZone ?? VIEWER_TIME_ZONE);
    return (
      <div className="flex flex-col gap-4">
        {bookingForBanner}
        <BookingReview
          subject={draft.subject}
          provider={provider}
          slot={selectedSlot}
          appointmentType={appointmentType}
          location={
            location ?? { id: selectedSlot.locationId, name: selectedSlot.locationId, addressSummary: "", timeZone: VIEWER_TIME_ZONE }
          }
          displayZone={displayZone}
          onEditProvider={() => dispatch({ type: "GO_TO_STAGE", stage: "discovery" })}
          onEditDetails={() =>
            dispatch({ type: "GO_TO_STAGE", stage: actor.kind === "staff" ? "discovery" : "identity" })
          }
          pending={bookMutation.isPending}
          errorMessage={
            bookMutation.isError && !(bookMutation.error instanceof SlotConflictError)
              ? "Something went wrong confirming this booking. Please try again."
              : undefined
          }
          onConfirm={() => {
            bookMutation.mutate(
              { input: { slotId: selectedSlot.id, subject: draft.subject! }, actor, key: draft.idempotencyKey },
              {
                onSuccess: (appointment) => setConfirmedAppointment(appointment),
                onError: (error) => {
                  if (error instanceof SlotConflictError) {
                    setDiscoveryNotice("That time was just taken. Please choose another.");
                    dispatch({ type: "CLEAR_SLOT" });
                    dispatch({ type: "GO_TO_STAGE", stage: "discovery" });
                  }
                },
              },
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookingForBanner}
      {discoveryNotice ? <StatusMessage intent="warning">{discoveryNotice}</StatusMessage> : null}
      <DiscoveryStep
        draft={draft}
        dispatch={dispatch}
        appointmentTypeId={appointmentTypeId}
        patientContext={patientContext}
        allowDiscoveryModeToggle={actor.kind === "staff"}
        suggestedProviderId={scenario.presetId === "returning-patient" ? scenario.usualProviderId : undefined}
        onContinue={() =>
          dispatch({ type: "GO_TO_STAGE", stage: draft.subject ? "review" : "identity" })
        }
      />
    </div>
  );
}

