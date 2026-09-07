import { useState } from "react";
import { useBookingDraft } from "./state/useBookingDraft";
import { useBookAppointment } from "./hooks/useBookAppointment";
import { useSlots } from "./hooks/useSlots";
import { DiscoveryStep } from "./components/DiscoveryStep";
import { GuestDetailsForm } from "./components/GuestDetailsForm";
import { BookingReview } from "./components/BookingReview";
import { BookingConfirmation } from "./components/BookingConfirmation";
import { StatusMessage } from "@/design-system/react";
import { appointmentTypeForContext } from "@/domain/eligibility";
import { appointmentTypes, locations, providers } from "@/data/fixtures";
import { SlotConflictError } from "@/domain/errors";
import { VIEWER_TIME_ZONE } from "@/lib/datetime";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import type { Appointment } from "@/domain/models";

/** Default guest new-patient happy path (Phase 3). Returning-patient/staff composition arrives in a later phase. */
export function BookingFlow() {
  const scenario = useScenarioStore((s) => s.config);
  const actor = useSessionStore((s) => s.actor);
  const [draft, dispatch] = useBookingDraft(scenario.discoveryMode);
  const bookMutation = useBookAppointment();
  const [discoveryNotice, setDiscoveryNotice] = useState<string | undefined>();
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const patientContext = scenario.actor === "patient" ? scenario.patientContext : "new";
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

  if (draft.stage === "identity" && provider && selectedSlot) {
    return (
      <GuestDetailsForm
        defaultValues={draft.subject}
        onBack={() => dispatch({ type: "GO_TO_STAGE", stage: "discovery" })}
        onSubmit={(subject) => {
          dispatch({ type: "SET_SUBJECT", subject });
          dispatch({ type: "GO_TO_STAGE", stage: "review" });
        }}
      />
    );
  }

  if ((draft.stage === "review" || draft.stage === "submitting") && draft.subject && provider && selectedSlot) {
    const location = locations.find((l) => l.id === selectedSlot.locationId);
    const displayZone = selectedSlot.mode === "virtual" ? VIEWER_TIME_ZONE : (location?.timeZone ?? VIEWER_TIME_ZONE);
    return (
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
        onEditDetails={() => dispatch({ type: "GO_TO_STAGE", stage: "identity" })}
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {discoveryNotice ? <StatusMessage intent="warning">{discoveryNotice}</StatusMessage> : null}
      <DiscoveryStep
        draft={draft}
        dispatch={dispatch}
        appointmentTypeId={appointmentTypeId}
        patientContext={patientContext}
        onContinue={() => dispatch({ type: "GO_TO_STAGE", stage: "identity" })}
      />
    </div>
  );
}
