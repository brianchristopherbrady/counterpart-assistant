import { describe, it, expect } from "vitest";
import { formatZoneAbbreviation, toDateKey } from "@/lib/datetime";
import { zonedWallTimeToIso } from "@/lib/zonedTime";

const CHICAGO = "America/Chicago";

describe("DST and cross-midnight fixture", () => {
  it("resolves the correct UTC offset either side of the US spring-forward transition", () => {
    // 2027-03-14: America/Chicago springs forward from CST (UTC-6) to CDT (UTC-5) at 2am local.
    const beforeIso = zonedWallTimeToIso("2027-03-13", 9, 0, CHICAGO);
    const afterIso = zonedWallTimeToIso("2027-03-15", 9, 0, CHICAGO);
    expect(beforeIso).toBe("2027-03-13T15:00:00.000Z"); // 9am CST = 15:00 UTC
    expect(afterIso).toBe("2027-03-15T14:00:00.000Z"); // 9am CDT = 14:00 UTC
  });

  it("labels the zone abbreviation correctly on each side of the transition", () => {
    expect(formatZoneAbbreviation("2027-03-13T15:00:00.000Z", CHICAGO)).toBe("CST");
    expect(formatZoneAbbreviation("2027-03-15T14:00:00.000Z", CHICAGO)).toBe("CDT");
  });

  it("resolves the correct UTC offset either side of the US fall-back transition", () => {
    // 2027-11-07: America/Chicago falls back from CDT (UTC-5) to CST (UTC-6) at 2am local.
    const beforeIso = zonedWallTimeToIso("2027-11-06", 9, 0, CHICAGO);
    const afterIso = zonedWallTimeToIso("2027-11-08", 9, 0, CHICAGO);
    expect(beforeIso).toBe("2027-11-06T14:00:00.000Z"); // 9am CDT = 14:00 UTC
    expect(afterIso).toBe("2027-11-08T15:00:00.000Z"); // 9am CST = 15:00 UTC
  });

  it("groups an instant by its LOCAL calendar date, not the UTC date, across midnight", () => {
    // 2026-09-08T02:00:00Z is 2026-09-07 21:00 local in America/Chicago (CDT, UTC-5) —
    // a naive UTC-date grouping would wrongly bucket this under the 8th.
    const crossMidnightInstant = new Date("2026-09-08T02:00:00.000Z");
    expect(toDateKey(crossMidnightInstant, CHICAGO)).toBe("2026-09-07");
    expect(toDateKey(crossMidnightInstant, "UTC")).toBe("2026-09-08");
  });
});
