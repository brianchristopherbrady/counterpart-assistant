export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Lets tests/fixtures pin "now" instead of depending on the real system clock. */
export function fixedClock(iso: string): Clock {
  const fixed = new Date(iso);
  return { now: () => fixed };
}
