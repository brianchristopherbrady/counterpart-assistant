import { locations } from "@/data/fixtures";
import { Button, StatusMessage } from "@/design-system/react";
import { formatInstant } from "@/lib/datetime";
import type { Provider, Slot } from "@/domain/models";

function locationNames(locationIds: string[]): string {
  return locationIds
    .map((id) => locations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

export interface ProviderResultProps {
  provider: Provider;
  nextAvailable?: Slot;
  zoneForSlot: (slot: Slot) => string;
  selected: boolean;
  onSelect: (providerId: string) => void;
}

export function ProviderResult({ provider, nextAvailable, zoneForSlot, selected, onSelect }: ProviderResultProps) {
  return (
    <li
      className={`rounded-md border p-4 ${selected ? "border-action-primary-bg" : "border-border"} bg-surface-raised`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-text-primary">{provider.name}</p>
          <p className="text-sm text-text-muted">{provider.role}</p>
          <p className="mt-1 text-sm text-text-muted">{locationNames(provider.locationIds)}</p>
          <p className="text-sm text-text-muted">
            {provider.supportedModes.map((m) => (m === "in-person" ? "In-person" : "Virtual")).join(" · ")}
            {provider.acceptsNewPatients ? " · Accepting new patients" : ""}
          </p>
          <p className="mt-2 text-sm font-medium text-text-primary">
            {nextAvailable
              ? `Next available: ${formatInstant(nextAvailable.startInstant, zoneForSlot(nextAvailable))}`
              : "No eligible availability in the next few days"}
          </p>
        </div>
        <Button
          intent={selected ? "primary" : "secondary"}
          size="sm"
          disabled={!nextAvailable}
          onClick={() => onSelect(provider.id)}
        >
          {selected ? "Selected" : "Select"}
        </Button>
      </div>
    </li>
  );
}

export interface ProviderResultsProps {
  providers: Provider[];
  nextAvailableByProvider: Map<string, Slot>;
  zoneForSlot: (slot: Slot) => string;
  selectedProviderId?: string;
  status: "pending" | "error" | "success";
  onSelect: (providerId: string) => void;
}

export function ProviderResults({
  providers,
  nextAvailableByProvider,
  zoneForSlot,
  selectedProviderId,
  status,
  onSelect,
}: ProviderResultsProps) {
  if (status === "pending") {
    return <p className="text-sm text-text-muted">Loading providers…</p>;
  }
  if (status === "error") {
    return <StatusMessage intent="error">Something went wrong loading providers. Please try again.</StatusMessage>;
  }
  if (providers.length === 0) {
    return <StatusMessage intent="info">No providers match these filters. Try adjusting them.</StatusMessage>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {providers.map((provider) => (
        <ProviderResult
          key={provider.id}
          provider={provider}
          nextAvailable={nextAvailableByProvider.get(provider.id)}
          zoneForSlot={zoneForSlot}
          selected={provider.id === selectedProviderId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
