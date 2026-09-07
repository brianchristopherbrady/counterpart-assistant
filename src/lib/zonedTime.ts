import { fromZonedTime } from "date-fns-tz";

/** Builds a UTC ISO instant from a clinic-local wall-clock time (DST-safe). */
export function zonedWallTimeToIso(
  dateKey: string,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  const localWallTime = `${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return fromZonedTime(localWallTime, timeZone).toISOString();
}
