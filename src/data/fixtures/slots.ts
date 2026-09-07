import type { Clock } from "@/lib/clock";
import { zonedWallTimeToIso } from "@/lib/zonedTime";
import { toDateKey } from "@/lib/datetime";
import type { Location, Provider, AppointmentType, Slot } from "@/domain/models";

const TIME_BLOCKS: Array<[hour: number, minute: number]> = [
  [9, 0],
  [9, 30],
  [10, 0],
  [14, 0],
  [14, 30],
];

const WEEKDAYS_AHEAD = 5;

function parseDateKey(dateKey: string): [number, number, number] {
  const [y = 0, m = 1, d = 1] = dateKey.split("-").map(Number);
  return [y, m, d];
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = parseDateKey(dateKey);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function isWeekday(dateKey: string): boolean {
  const [y, m, d] = parseDateKey(dateKey);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day !== 0 && day !== 6;
}

function nextWeekdayDateKeys(referenceZone: string, clock: Clock, count: number): string[] {
  const todayKey = toDateKey(clock.now(), referenceZone);
  const keys: string[] = [];
  let offset = 1;
  while (keys.length < count) {
    const candidate = addDaysToDateKey(todayKey, offset);
    if (isWeekday(candidate)) keys.push(candidate);
    offset += 1;
  }
  return keys;
}

/**
 * Candidate availability, regenerated fresh from the clock each load. Deliberately produces
 * overlapping same-provider slots (a 15-min and 30-min type at the same start time) so the
 * cross-type/location/mode overlap invariant has real fixture data to exercise.
 */
export function generateSlots(
  clock: Clock,
  locations: Location[],
  providers: Provider[],
  appointmentTypes: AppointmentType[],
): Slot[] {
  const locationsById = new Map(locations.map((l) => [l.id, l]));
  const followUpType = appointmentTypes.find((t) => t.allowedPatientContext === "established");
  const newPatientType = appointmentTypes.find((t) => t.allowedPatientContext === "new");
  if (!followUpType || !newPatientType) {
    throw new Error("Expected one new-patient and one established appointment type.");
  }

  const slots: Slot[] = [];

  for (const provider of providers) {
    for (const locationId of provider.locationIds) {
      const location = locationsById.get(locationId);
      if (!location) continue;
      const dateKeys = nextWeekdayDateKeys(location.timeZone, clock, WEEKDAYS_AHEAD);

      for (const mode of provider.supportedModes) {
        for (const dateKey of dateKeys) {
          for (const [hour, minute] of TIME_BLOCKS) {
            const startInstant = zonedWallTimeToIso(dateKey, hour, minute, location.timeZone);

            const typesToOffer = provider.acceptsNewPatients
              ? [followUpType, newPatientType]
              : [followUpType];

            for (const type of typesToOffer) {
              const endInstant = new Date(
                new Date(startInstant).getTime() + type.durationMinutes * 60_000,
              ).toISOString();
              slots.push({
                id: `slot-${provider.id}-${dateKey}-${hour}${minute}-${locationId}-${mode}-${type.id}`,
                providerId: provider.id,
                locationId,
                mode,
                appointmentTypeId: type.id,
                startInstant,
                endInstant,
                version: 1,
              });
            }
          }
        }
      }
    }
  }

  return slots;
}
