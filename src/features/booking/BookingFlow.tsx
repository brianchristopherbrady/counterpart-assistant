import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingDraftStore } from "./state/bookingDraftStore";
import { useBookAppointment } from "./hooks/useBookAppointment";
import { useSlots } from "./hooks/useSlots";
import { useBookingContext } from "./hooks/useBookingContext";
import { DiscoveryStep } from "./components/DiscoveryStep";
import { GuestDetailsForm } from "./components/GuestDetailsForm";
import { PatientSignInForm } from "./components/PatientSignInForm";
import { StaffPatientLookup } from "./components/StaffPatientLookup";
import { BookingReview } from "./components/BookingReview";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { Button, StatusMessage } from "@/design-system/react";
import { locations, providers } from "@/data/fixtures";
import { SlotConflictError, StaleAppointmentError } from "@/domain/errors";
import { VIEWER_TIME_ZONE } from "@/lib/datetime";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import { useRescheduleAppointment } from "@/features/appointments/hooks/useRescheduleAppointment";
import type { Appointment } from "@/domain/models";

/** Orchestrates all four scenario presets: guest, returning patient, staff, and sign-in-required. */
export function BookingFlow() {
  const navigate = useNavigate();
  const scenarioVersion = useScenarioStore((s) => s.version);
  const setActor = useSessionStore((s) => s.setActor);
  const dispatch = useBookingDraftStore((s) => s.dispatch);
  const resetDraft = useBookingDraftStore((s) => s.resetDraft);
  const bookMutation = useBookAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const [discoveryNotice, setDiscoveryNotice] = useState<string | undefined>();
  const [confirmation, setConfirmation] = useState<{
    appointment: Appointment;
    providerName: string;
    locationName: string;
    displayZone: string;
  } | null>(null);

  // Applying a scenario resets the shared draft store directly, but this screen's own local
  // "just confirmed" state and notice also need to clear, or a stale confirmation/notice from
  // before the switch would incorrectly reappear under the new scenario.
  useEffect(() => {
    setConfirmation(null);
    setDiscoveryNotice(undefined);
  }, [scenarioVersion]);

  const {
    scenario,
    actor,
    draft,
    isRescheduling,
    originalAppointment,
    patientContext,
    appointmentTypeId,
    appointmentType,
  } = useBookingContext();
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


  if (!appointmentTypeId || !appointmentType) {
    return <StatusMessage intent="error">No appointment type is configured for this patient context.</StatusMessage>;
  }

  if (confirmation) {
    return (
      <BookingConfirmation
        appointment={confirmation.appointment}
        providerName={confirmation.providerName}
        locationName={confirmation.locationName}
        displayZone={confirmation.displayZone}
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

  const cancelRescheduleAction = isRescheduling ? (
    <Button
      intent="secondary"
      size="sm"
      onClick={() => {
        resetDraft(scenario.discoveryMode);
        navigate("/appointments");
      }}
    >
      Cancel reschedule
    </Button>
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
    const activeMutation = isRescheduling ? rescheduleMutation : bookMutation;
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
          reschedulingFrom={originalAppointment}
          onEditProvider={() => dispatch({ type: "GO_TO_STAGE", stage: "discovery" })}
          onEditDetails={
            isRescheduling
              ? undefined
              : () => dispatch({ type: "GO_TO_STAGE", stage: actor.kind === "staff" ? "discovery" : "identity" })
          }
          pending={activeMutation.isPending}
          errorMessage={
            activeMutation.isError && !(activeMutation.error instanceof SlotConflictError)
              ? activeMutation.error instanceof StaleAppointmentError
                ? activeMutation.error.message
                : `Something went wrong confirming this ${isRescheduling ? "reschedule" : "booking"}. Please try again.`
              : undefined
          }
          onConfirm={() => {
            const confirmationPayload = (appointment: Appointment) => ({
              appointment,
              providerName: provider.name,
              locationName: location?.name ?? selectedSlot.locationId,
              displayZone,
            });
            if (isRescheduling && originalAppointment) {
              rescheduleMutation.mutate(
                {
                  input: {
                    appointmentId: originalAppointment.id,
                    appointmentVersion: originalAppointment.version,
                    newSlotId: selectedSlot.id,
                  },
                  actor,
                  key: draft.idempotencyKey,
                },
                {
                  onSuccess: (appointment) => {
                    setConfirmation(confirmationPayload(appointment));
                    resetDraft(scenario.discoveryMode);
                  },
                  onError: (error) => {
                    if (error instanceof SlotConflictError) {
                      setDiscoveryNotice("That time was just taken. Please choose another.");
                      dispatch({ type: "CLEAR_SLOT" });
                      dispatch({ type: "GO_TO_STAGE", stage: "discovery" });
                    }
                  },
                },
              );
            } else {
              bookMutation.mutate(
                { input: { slotId: selectedSlot.id, subject: draft.subject! }, actor, key: draft.idempotencyKey },
                {
                  onSuccess: (appointment) => {
                    setConfirmation(confirmationPayload(appointment));
                    resetDraft(scenario.discoveryMode);
                  },
                  onError: (error) => {
                    if (error instanceof SlotConflictError) {
                      setDiscoveryNotice("That time was just taken. Please choose another.");
                      dispatch({ type: "CLEAR_SLOT" });
                      dispatch({ type: "GO_TO_STAGE", stage: "discovery" });
                    }
                  },
                },
              );
            }
          }}
        />
        {cancelRescheduleAction}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookingForBanner}
      {cancelRescheduleAction}
      {discoveryNotice ? <StatusMessage intent="warning">{discoveryNotice}</StatusMessage> : null}
      <DiscoveryStep
        draft={draft}
        dispatch={dispatch}
        appointmentTypeId={appointmentTypeId}
        patientContext={patientContext}
        allowDiscoveryModeToggle={actor.kind === "staff" && !isRescheduling}
        suggestedProviderId={
          !isRescheduling && scenario.presetId === "returning-patient" ? scenario.usualProviderId : undefined
        }
        onContinue={() => dispatch({ type: "GO_TO_STAGE", stage: draft.subject ? "review" : "identity" })}
      />
    </div>
  );
}


