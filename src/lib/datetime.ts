/** Single date/time formatting surface — every screen formats through these helpers. */

export function formatInstant(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDayHeading(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatDateOfBirth(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Short zone label, e.g. "CDT" — used so a displayed zone is always explicit. */
export function formatZoneAbbreviation(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(new Date(iso));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

/** Groups instants by their calendar date IN the given display zone (DST/cross-midnight safe). */
export function groupByDayInZone<T>(
  items: T[],
  getIso: (item: T) => string,
  timeZone: string,
): Map<string, T[]> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const dayKey = formatter.format(new Date(getIso(item))); // en-CA => YYYY-MM-DD
    const group = groups.get(dayKey);
    if (group) {
      group.push(item);
    } else {
      groups.set(dayKey, [item]);
    }
  }
  return groups;
}

export function toDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const VIEWER_TIME_ZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Chicago";
