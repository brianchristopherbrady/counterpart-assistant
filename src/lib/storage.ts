const NAMESPACE = "care-booking";
const VERSION = 1;

interface Envelope<T> {
  version: number;
  data: T;
}

/**
 * Namespaced, versioned localStorage adapter for synthetic demo data only.
 * Recovers from missing/corrupt/mismatched-version storage instead of throwing.
 */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${NAMESPACE}:${VERSION}:${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (parsed.version !== VERSION) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, data: T): void {
  try {
    const envelope: Envelope<T> = { version: VERSION, data };
    window.localStorage.setItem(`${NAMESPACE}:${VERSION}:${key}`, JSON.stringify(envelope));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — demo continues in-memory only.
  }
}

export function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(`${NAMESPACE}:${VERSION}:${key}`);
  } catch {
    // ignore
  }
}
