// Typed, recoverable failures for the mock booking repository.

export type BookingErrorKind =
  | "validation"
  | "slot-conflict"
  | "stale-appointment"
  | "access-denied"
  | "network-failure";

export class BookingError extends Error {
  readonly kind: BookingErrorKind;

  constructor(kind: BookingErrorKind, message: string) {
    super(message);
    this.name = "BookingError";
    this.kind = kind;
  }
}

export class ValidationError extends BookingError {
  constructor(message: string) {
    super("validation", message);
  }
}

/** The selected slot is no longer available (stale availability, per NHS-style recovery). */
export class SlotConflictError extends BookingError {
  constructor(message = "That time is no longer available.") {
    super("slot-conflict", message);
  }
}

/** The appointment being mutated has a newer version than the caller has. */
export class StaleAppointmentError extends BookingError {
  constructor(message = "This appointment has changed since it was loaded.") {
    super("stale-appointment", message);
  }
}

export class AccessDeniedError extends BookingError {
  constructor(message = "You don't have access to this record.") {
    super("access-denied", message);
  }
}

/** Simulated transient pre-commit failure — a retry of the same operation can succeed. */
export class NetworkFailureError extends BookingError {
  constructor(message = "Network request failed. Please try again.") {
    super("network-failure", message);
  }
}
