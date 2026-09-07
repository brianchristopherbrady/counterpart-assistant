import { locations, providers } from "@/data/fixtures";
import { RadioGroup, StatusMessage } from "@/design-system/react";
import { formatDayHeading, formatTime, formatZoneAbbreviation } from "@/lib/datetime";
import { zoneForSlot } from "../utils/zone";
import type { Slot } from "@/domain/models";

export interface EarliestAvailableListProps {
  slots: Slot[];
  selectedSlotId?: string;
  status: "pending" | "error" | "success";
  onSelect: (providerId: string, slotId: string) => void;
  limit?: number;
}

/** Cross-provider, time-first discovery: selecting a result fills both provider and slot at once. */
export function EarliestAvailableList({
  slots,
  selectedSlotId,
  status,
  onSelect,
  limit = 20,
}: EarliestAvailableListProps) {
  if (status === "pending") {
    return <p className="text-sm text-text-muted">Loading times…</p>;
  }
  if (status === "error") {
    return <StatusMessage intent="error">Something went wrong loading times. Please try again.</StatusMessage>;
  }
  if (slots.length === 0) {
    return <StatusMessage intent="info">No eligible times match these filters right now.</StatusMessage>;
  }

  const sorted = [...slots].sort((a, b) => a.startInstant.localeCompare(b.startInstant)).slice(0, limit);

  return (
    <RadioGroup
      name="earliest-slot"
      label="Earliest available times"
      value={selectedSlotId}
      onValueChange={(value) => {
        const slot = sorted.find((s) => s.id === value);
        if (slot) onSelect(slot.providerId, slot.id);
      }}
      options={sorted.map((slot) => {
        const provider = providers.find((p) => p.id === slot.providerId);
        const location = locations.find((l) => l.id === slot.locationId);
        const zone = zoneForSlot(slot);
        const modeLabel = slot.mode === "in-person" ? "In-person" : "Virtual";
        const zoneLabel = formatZoneAbbreviation(slot.startInstant, zone);
        return {
          value: slot.id,
          label: `${provider?.name ?? slot.providerId} · ${formatDayHeading(slot.startInstant, zone)}, ${formatTime(slot.startInstant, zone)} ${zoneLabel} · ${modeLabel} · ${location?.name ?? slot.locationId}`,
        };
      })}
    />
  );
}
