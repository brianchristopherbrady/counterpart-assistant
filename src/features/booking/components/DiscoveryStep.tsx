import { useMemo } from "react";
import { BookingFilters } from "./BookingFilters";
import { ProviderResults } from "./ProviderResults";
import { SlotPicker } from "./SlotPicker";
import { Button } from "@/design-system/react";
import { useProviders } from "../hooks/useProviders";
import { useSlots } from "../hooks/useSlots";
import { locations } from "@/data/fixtures";
import { VIEWER_TIME_ZONE } from "@/lib/datetime";
import type { BookingAction } from "../state/bookingReducer";
import type { BookingDraft, PatientContext, Slot } from "@/domain/models";

export interface DiscoveryStepProps {
  draft: BookingDraft;
  dispatch: (action: BookingAction) => void;
  appointmentTypeId: string;
  patientContext: PatientContext;
  onContinue: () => void;
}

/** In-person defaults to the clinic's own zone; virtual defaults to the viewer's browser zone. */
function zoneForSlot(slot: Slot): string {
  if (slot.mode === "virtual") return VIEWER_TIME_ZONE;
  return locations.find((l) => l.id === slot.locationId)?.timeZone ?? VIEWER_TIME_ZONE;
}

/** Provider-first discovery: browse/filter providers, pick one, then pick from that provider's eligible times. */
export function DiscoveryStep({
  draft,
  dispatch,
  appointmentTypeId,
  patientContext,
  onContinue,
}: DiscoveryStepProps) {
  const providersQuery = useProviders({
    appointmentTypeId,
    locationId: draft.filters.locationId,
    mode: draft.filters.mode,
    patientContext,
    nameQuery: draft.filters.providerNameQuery,
  });

  // One earliest-available fetch across matching providers, reused for both the "next available"
  // annotations in the provider list and (filtered client-side) the chosen provider's slot list.
  const slotsQuery = useSlots({
    discoveryMode: "earliest-available",
    appointmentTypeId,
    locationId: draft.filters.locationId,
    mode: draft.filters.mode,
    patientContext,
  });

  const nextAvailableByProvider = useMemo(() => {
    const slots = slotsQuery.data ?? [];
    const map = new Map<string, (typeof slots)[number]>();
    for (const slot of [...slots].sort((a, b) => a.startInstant.localeCompare(b.startInstant))) {
      if (!map.has(slot.providerId)) map.set(slot.providerId, slot);
    }
    return map;
  }, [slotsQuery.data]);

  const providerSlots = useMemo(
    () => (slotsQuery.data ?? []).filter((slot) => slot.providerId === draft.providerId),
    [slotsQuery.data, draft.providerId],
  );

  const selectedProvider = (providersQuery.data ?? []).find((p) => p.id === draft.providerId);

  return (
    <div className="flex flex-col gap-6">
      <BookingFilters filters={draft.filters} onChange={(filters) => dispatch({ type: "SET_FILTERS", filters })} />

      <ProviderResults
        providers={providersQuery.data ?? []}
        nextAvailableByProvider={nextAvailableByProvider}
        zoneForSlot={zoneForSlot}
        selectedProviderId={draft.providerId}
        status={providersQuery.isPending ? "pending" : providersQuery.isError ? "error" : "success"}
        onSelect={(providerId) => dispatch({ type: "SELECT_PROVIDER", providerId })}
      />

      {selectedProvider ? (
        <div>
          <h3 className="mb-2 font-semibold text-text-primary">Choose a time with {selectedProvider.name}</h3>
          <SlotPicker
            slots={providerSlots}
            selectedSlotId={draft.slotId}
            zoneForSlot={zoneForSlot}
            status={slotsQuery.isPending ? "pending" : slotsQuery.isError ? "error" : "success"}
            onSelect={(slotId) => dispatch({ type: "SELECT_SLOT", slotId })}
          />
        </div>
      ) : null}

      <div>
        <Button disabled={!draft.providerId || !draft.slotId} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
