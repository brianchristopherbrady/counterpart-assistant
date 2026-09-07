import { locations } from "@/data/fixtures";
import { VIEWER_TIME_ZONE } from "@/lib/datetime";
import type { Slot } from "@/domain/models";

/** In-person defaults to the clinic's own zone; virtual defaults to the viewer's browser zone. */
export function zoneForSlot(slot: Slot): string {
  if (slot.mode === "virtual") return VIEWER_TIME_ZONE;
  return locations.find((l) => l.id === slot.locationId)?.timeZone ?? VIEWER_TIME_ZONE;
}
