// Core domain model shared by the booking and appointments features.

export type LocationId = string;
export type ProviderId = string;
export type AppointmentTypeId = string;
export type SlotId = string;
export type PatientId = string;
export type AppointmentId = string;

export type VisitMode = "in-person" | "virtual";

/** Relationship of the person being booked to this practice — not an account/auth concept. */
export type PatientContext = "new" | "established";

export interface Location {
  id: LocationId;
  name: string;
  addressSummary: string;
  /** IANA zone, e.g. "America/Chicago" — clinic's zone of record for in-person visits. */
  timeZone: string;
}

export interface Provider {
  id: ProviderId;
  name: string;
  role: string;
  locationIds: LocationId[];
  supportedModes: VisitMode[];
  acceptsNewPatients: boolean;
}

export interface AppointmentType {
  id: AppointmentTypeId;
  label: string;
  durationMinutes: number;
  /** Which patient context this type is bookable under. */
  allowedPatientContext: PatientContext;
}

export interface Slot {
  id: SlotId;
  providerId: ProviderId;
  locationId: LocationId;
  mode: VisitMode;
  appointmentTypeId: AppointmentTypeId;
  /** ISO UTC instant. */
  startInstant: string;
  /** ISO UTC instant. */
  endInstant: string;
  /** Absent/undefined means available — only set to false when the repository was asked to
   *  include unavailable slots (e.g. the provider availability page's "show all times" view). */
  available?: boolean;
  version: number;
}

export interface ContactMethod {
  method: "email" | "phone";
  value: string;
}

export interface Patient {
  id: PatientId;
  fullName: string;
  dateOfBirth: string;
  contact: ContactMethod;
}

/** Practice-scoped actor performing an operation — distinct from the appointment subject. */
export type ActorContext =
  | { kind: "guest"; sessionId: string }
  | { kind: "patient"; patientId: PatientId }
  | { kind: "staff"; staffId: string; practiceId: string };

export type BookingStage =
  | "discovery"
  | "identity"
  | "signin"
  | "review"
  | "submitting"
  | "confirmed"
  | "conflict"
  | "error";

export interface BookingFilters {
  appointmentTypeId?: AppointmentTypeId;
  locationId?: LocationId;
  mode?: VisitMode;
  date?: string;
  providerNameQuery?: string;
}

export interface BookingSubject {
  patientId?: PatientId;
  fullName: string;
  dateOfBirth: string;
  contact: ContactMethod;
}

export interface BookingDraft {
  stage: BookingStage;
  discoveryMode: "provider-first" | "earliest-available";
  filters: BookingFilters;
  providerId?: ProviderId;
  slotId?: SlotId;
  subject?: BookingSubject;
  /** Present when this draft is replacing an existing appointment. */
  reschedulingAppointmentId?: AppointmentId;
  idempotencyKey: string;
}

export type AppointmentStatus = "confirmed" | "canceled";

export interface Appointment {
  id: AppointmentId;
  reference: string;
  patientId?: PatientId;
  subjectName: string;
  subjectDateOfBirth: string;
  subjectContact: ContactMethod;
  bookedByActor: ActorContext;
  providerId: ProviderId;
  appointmentTypeId: AppointmentTypeId;
  mode: VisitMode;
  locationId: LocationId;
  startInstant: string;
  endInstant: string;
  status: AppointmentStatus;
  version: number;
  createdAt: string;
}
