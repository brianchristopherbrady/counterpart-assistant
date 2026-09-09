import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookingFilters } from "./BookingFilters";
import { ProviderResults } from "./ProviderResults";
import { EarliestAvailableList } from "./EarliestAvailableList";
import { Button, StatusMessage } from "@/design-system/react";
import { useProviders } from "../hooks/useProviders";
import { useSlots } from "../hooks/useSlots";
import { zoneForSlot } from "../utils/zone";
import { providers as allProviders } from "@/data/fixtures";
import type { BookingAction } from "../state/bookingReducer";
import type { BookingDraft, PatientContext } from "@/domain/models";

export interface DiscoveryStepProps {
  draft: BookingDraft;
  dispatch: (action: BookingAction) => void;
  appointmentTypeId: string;
  patientContext: PatientContext;
  /** Staff can switch discovery mode inline; patients get whatever the active scenario configured. */
  allowDiscoveryModeToggle?: boolean;
  /** Suggested, not mandatory (returning-patient scenario). */
  suggestedProviderId?: string;
  onContinue: () => void;
}

/** Provider-first: browse/filter providers, then pick one to see their full availability on its own page. */
export function DiscoveryStep({
  draft,
  dispatch,
  appointmentTypeId,
  patientContext,
  allowDiscoveryModeToggle,
  suggestedProviderId,
  onContinue,
}: DiscoveryStepProps) {
  const navigate = useNavigate();
  const providersQuery = useProviders({
    appointmentTypeId,
    locationId: draft.filters.locationId,
    mode: draft.filters.mode,
    patientContext,
    nameQuery: draft.filters.providerNameQuery,
  });

  // One earliest-available fetch across matching providers, reused for: the "next available"
  // annotations in provider-first mode, and the earliest-available list itself.
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

  const slotsStatus = slotsQuery.isPending ? "pending" : slotsQuery.isError ? "error" : "success";

  function selectProvider(providerId: string) {
    dispatch({ type: "SELECT_PROVIDER", providerId });
    navigate(`/book/provider/${providerId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {allowDiscoveryModeToggle ? (
        <div className="flex gap-2">
          <Button
            intent={draft.discoveryMode === "earliest-available" ? "primary" : "secondary"}
            size="sm"
            onClick={() => dispatch({ type: "SET_DISCOVERY_MODE", discoveryMode: "earliest-available" })}
          >
            Earliest available
          </Button>
          <Button
            intent={draft.discoveryMode === "provider-first" ? "primary" : "secondary"}
            size="sm"
            onClick={() => dispatch({ type: "SET_DISCOVERY_MODE", discoveryMode: "provider-first" })}
          >
            Choose a provider
          </Button>
        </div>
      ) : null}

      <BookingFilters filters={draft.filters} onChange={(filters) => dispatch({ type: "SET_FILTERS", filters })} />

      {suggestedProviderId && !draft.providerId ? (
        <StatusMessage intent="info">
          Continue with your usual provider, {allProviders.find((p) => p.id === suggestedProviderId)?.name}, or choose
          someone else below.{" "}
          <button type="button" className="font-medium underline" onClick={() => selectProvider(suggestedProviderId)}>
            Book with them
          </button>
        </StatusMessage>
      ) : null}

      {draft.discoveryMode === "earliest-available" ? (
        <EarliestAvailableList
          slots={slotsQuery.data ?? []}
          selectedSlotId={draft.slotId}
          status={slotsStatus}
          onSelect={(providerId, slotId) => dispatch({ type: "SELECT_PROVIDER_AND_SLOT", providerId, slotId })}
        />
      ) : (
        <ProviderResults
          providers={providersQuery.data ?? []}
          nextAvailableByProvider={nextAvailableByProvider}
          zoneForSlot={zoneForSlot}
          selectedProviderId={draft.providerId}
          status={providersQuery.isPending ? "pending" : providersQuery.isError ? "error" : "success"}
          onSelect={selectProvider}
        />
      )}

      {draft.discoveryMode === "earliest-available" ? (
        <div>
          <Button disabled={!draft.providerId || !draft.slotId} onClick={onContinue}>
            Continue
          </Button>
        </div>
      ) : null}
    </div>
  );
}
