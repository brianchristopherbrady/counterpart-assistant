import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { providers, locations } from "@/data/fixtures";
import { Button, StatusMessage } from "@/design-system/react";
import { useBookingDraftStore } from "./state/bookingDraftStore";
import { useBookingContext } from "./hooks/useBookingContext";
import { useSlots } from "./hooks/useSlots";
import { SlotPicker } from "./components/SlotPicker";
import { zoneForSlot } from "./utils/zone";

/**
 * Dedicated full-page availability view for one provider (all times, including disabled/booked
 * ones) — reached by selecting a provider from discovery, instead of expanding a picker inline.
 */
export function ProviderAvailabilityPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const draft = useBookingDraftStore((s) => s.draft);
  const dispatch = useBookingDraftStore((s) => s.dispatch);
  const { actor, patientContext, appointmentTypeId } = useBookingContext();
  // Included in the slots query key so an explicit "Refresh availability" click always refetches
  // AND is distinguishable, server-side, from an automatic/background refetch (see mockRepository).
  const [refreshCount, setRefreshCount] = useState(0);

  const provider = providers.find((p) => p.id === providerId);

  useEffect(() => {
    if (providerId && draft.providerId !== providerId) {
      dispatch({ type: "SELECT_PROVIDER", providerId });
      setRefreshCount(0);
    }
  }, [providerId, draft.providerId, dispatch]);

  // Staff must identify a patient before browsing availability; this page is only ever linked to
  // after that happens, but guard against a stale/direct navigation anyway.
  useEffect(() => {
    if (actor.kind === "staff" && !draft.subject) {
      navigate("/book", { replace: true });
    }
  }, [actor, draft.subject, navigate]);

  const slotsQuery = useSlots(
    provider && appointmentTypeId
      ? {
          discoveryMode: "provider-first",
          providerId: provider.id,
          appointmentTypeId,
          locationId: draft.filters.locationId,
          mode: draft.filters.mode,
          patientContext,
          includeUnavailable: true,
          preferSnipeSlotId: draft.slotId,
          manualRefreshCount: refreshCount,
        }
      : null,
  );

  const slots = slotsQuery.data ?? [];
  const selectedSlot = slots.find((s) => s.id === draft.slotId);
  const selectedSlotJustTaken =
    Boolean(draft.slotId) && slots.length > 0 && (!selectedSlot || selectedSlot.available === false);

  useEffect(() => {
    if (selectedSlotJustTaken) {
      dispatch({ type: "CLEAR_SLOT" });
    }
  }, [selectedSlotJustTaken, dispatch]);

  if (!provider) {
    return (
      <div className="mx-auto flex max-w-content flex-col gap-4 p-6">
        <StatusMessage intent="error">That provider couldn't be found.</StatusMessage>
        <div>
          <Button intent="secondary" onClick={() => navigate("/book")}>
            Back to providers
          </Button>
        </div>
      </div>
    );
  }

  const status = slotsQuery.isPending ? "pending" : slotsQuery.isError ? "error" : "success";

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 p-6">
      <div>
        <Button intent="secondary" size="sm" onClick={() => navigate("/book")}>
          Back to providers
        </Button>
      </div>

      <div className="rounded-md border border-border bg-surface-raised p-4">
        <p className="text-xl font-semibold text-text-primary">{provider.name}</p>
        <p className="text-sm text-text-muted">{provider.role}</p>
        <p className="mt-1 text-sm text-text-muted">
          {provider.locationIds
            .map((id) => locations.find((l) => l.id === id)?.name)
            .filter(Boolean)
            .join(", ")}
        </p>
        <p className="text-sm text-text-muted">
          {provider.supportedModes.map((m) => (m === "in-person" ? "In-person" : "Virtual")).join(" · ")}
          {provider.acceptsNewPatients ? " · Accepting new patients" : ""}
        </p>
      </div>

      {selectedSlotJustTaken ? (
        <StatusMessage intent="warning">Someone else just booked that time. Please choose another below.</StatusMessage>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-text-primary">Available times</h2>
        <Button
          intent="secondary"
          size="sm"
          pending={slotsQuery.isFetching}
          onClick={() => setRefreshCount((c) => c + 1)}
        >
          Refresh availability
        </Button>
      </div>

      <SlotPicker
        slots={slots}
        selectedSlotId={draft.slotId}
        zoneForSlot={zoneForSlot}
        status={status}
        onSelect={(slotId) => dispatch({ type: "SELECT_SLOT", slotId })}
      />

      <div>
        <Button
          disabled={!draft.slotId}
          onClick={() => {
            dispatch({ type: "GO_TO_STAGE", stage: draft.subject ? "review" : "identity" });
            navigate("/book");
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
