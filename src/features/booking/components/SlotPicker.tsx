import { useMemo, useState } from "react";
import { locations } from "@/data/fixtures";
import { RadioGroup, StatusMessage } from "@/design-system/react";
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
  const [activeDay, setActiveDay] = useState<string | undefined>(dayKeys[0]);
  const effectiveActiveDay = activeDay && dayGroups.has(activeDay) ? activeDay : dayKeys[0];

  if (status === "pending") {
    return <p className="text-sm text-text-muted">Loading times…</p>;
  }
  if (status === "error") {
    return <StatusMessage intent="error">Something went wrong loading times. Please try again.</StatusMessage>;
  }
  if (slots.length === 0) {
    return <StatusMessage intent="info">No eligible times for this provider with the current filters.</StatusMessage>;
  }

  const daySlots = (effectiveActiveDay ? dayGroups.get(effectiveActiveDay) : undefined) ?? [];

  return (
    <div>
      <div role="tablist" aria-label="Choose a day" className="flex flex-wrap gap-2">
        {dayKeys.map((dayKey) => {
          const first = dayGroups.get(dayKey)?.[0];
          const isActive = dayKey === effectiveActiveDay;
          return (
            <button
              key={dayKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                isActive
                  ? "border-action-primary-bg bg-action-primary-bg text-action-primary-fg"
                  : "border-border bg-surface-raised text-text-primary"
              }`}
              onClick={() => setActiveDay(dayKey)}
            >
              {first ? formatDayHeading(first.startInstant, zoneForSlot(first)) : dayKey}
            </button>
          );
        })}
      </div>
      <div className="mt-2">
        <RadioGroup
          name="slot"
          label="Available times"
          value={selectedSlotId}
          onValueChange={onSelect}
          options={daySlots.map((slot) => {
            const zone = zoneForSlot(slot);
            const location = locations.find((l) => l.id === slot.locationId);
            const modeLabel = slot.mode === "in-person" ? "In-person" : "Virtual";
            const zoneLabel = formatZoneAbbreviation(slot.startInstant, zone);
            const isAvailable = slot.available !== false;
            return {
              value: slot.id,
              disabled: !isAvailable,
              label: `${formatTime(slot.startInstant, zone)} ${zoneLabel} · ${modeLabel} · ${location?.name ?? slot.locationId}${isAvailable ? "" : " · Booked"}`,
            };
          })}
        />
      </div>
    </div>
  );
}
