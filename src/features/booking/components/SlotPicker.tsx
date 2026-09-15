import { useMemo } from "react";
import { locations } from "@/data/fixtures";
import { StatusMessage } from "@/design-system/react";
import { formatDayHeading, formatTime, formatZoneAbbreviation, toDateKey } from "@/lib/datetime";
import type { Slot } from "@/domain/models";

export interface SlotPickerProps {
  slots: Slot[];
  selectedSlotId?: string;
  /** Per-slot, since in-person defaults to the clinic zone and virtual defaults to the viewer zone. */
  zoneForSlot: (slot: Slot) => string;
  status: "pending" | "error" | "success";
  onSelect: (slotId: string) => void;
}

function slotLabel(slot: Slot, zoneForSlot: (slot: Slot) => string): string {
  const zone = zoneForSlot(slot);
  const location = locations.find((l) => l.id === slot.locationId);
  const modeLabel = slot.mode === "in-person" ? "In-person" : "Virtual";
  const zoneLabel = formatZoneAbbreviation(slot.startInstant, zone);
  return `${formatTime(slot.startInstant, zone)} ${zoneLabel} · ${modeLabel} · ${location?.name ?? slot.locationId}`;
}

/** Controlled and presentation-only: no fetching, no scenario awareness, no booking logic. */
export function SlotPicker({ slots, selectedSlotId, zoneForSlot, status, onSelect }: SlotPickerProps) {
  const dayGroups = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const slot of slots) {
      const dayKey = toDateKey(new Date(slot.startInstant), zoneForSlot(slot));
      const existing = groups.get(dayKey);
      if (existing) existing.push(slot);
      else groups.set(dayKey, [slot]);
    }
    return groups;
  }, [slots, zoneForSlot]);
  const dayKeys = useMemo(() => [...dayGroups.keys()].sort(), [dayGroups]);

  if (status === "pending") {
    return <p className="text-sm text-text-muted">Loading times…</p>;
  }
  if (status === "error") {
    return <StatusMessage intent="error">Something went wrong loading times. Please try again.</StatusMessage>;
  }
  if (slots.length === 0) {
    return <StatusMessage intent="info">No eligible times for this provider with the current filters.</StatusMessage>;
  }

  return (
    <div className="flex flex-col gap-5">
      {dayKeys.map((dayKey) => {
        const daySlots = dayGroups.get(dayKey) ?? [];
        const first = daySlots[0];
        return (
          <div key={dayKey}>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              {first ? formatDayHeading(first.startInstant, zoneForSlot(first)) : dayKey}
            </h3>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => {
                const isAvailable = slot.available !== false;
                const isSelected = slot.id === selectedSlotId;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(slot.id)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      !isAvailable
                        ? "cursor-not-allowed border-border bg-surface-sunken text-text-muted line-through"
                        : isSelected
                          ? "border-action-primary-bg bg-action-primary-bg text-action-primary-fg"
                          : "border-border bg-surface-raised text-text-primary hover:bg-surface-sunken"
                    }`}
                  >
                    {slotLabel(slot, zoneForSlot)}
                    {isAvailable ? "" : " · Booked"}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

