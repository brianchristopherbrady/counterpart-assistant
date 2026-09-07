import type {
  Appointment,
  AppointmentId,
  AppointmentTypeId,
  ActorContext,
  BookingSubject,
  LocationId,
  Patient,
  PatientContext,
  Provider,
  ProviderId,
  Slot,
  VisitMode,
} from "./models";

export interface ProviderQuery {
  appointmentTypeId?: AppointmentTypeId;
  locationId?: LocationId;
  mode?: VisitMode;
  patientContext: PatientContext;
  nameQuery?: string;
}

export interface SlotQuery {
  discoveryMode: "provider-first" | "earliest-available";
  providerId?: ProviderId;
  appointmentTypeId: AppointmentTypeId;
  locationId?: LocationId;
  mode?: VisitMode;
  patientContext: PatientContext;
  date?: string;
}

export interface BookingInput {
  slotId: string;
  subject: BookingSubject;
}

export interface RescheduleInput {
  appointmentId: AppointmentId;
  appointmentVersion: number;
  newSlotId: string;
}

export interface CancelInput {
  appointmentId: AppointmentId;
  appointmentVersion: number;
}

export interface StaffActorContext {
  kind: "staff";
  staffId: string;
  practiceId: string;
}

/**
 * Illustrative service boundary for this prototype — see Study for a proposed HTTP mapping.
 * Availability checks and writes happen together, inside the mock adapter, after its delay.
 */
export interface BookingRepository {
  searchProviders(query: ProviderQuery, signal?: AbortSignal): Promise<Provider[]>;
  getSlots(query: SlotQuery, signal?: AbortSignal): Promise<Slot[]>;
  searchPatients(query: string, actor: StaffActorContext): Promise<Patient[]>;
  getPatient(patientId: string): Promise<Patient | null>;
  registerPatient(subject: BookingSubject): Promise<Patient>;
  findPatientByEmail(email: string): Promise<Patient | null>;
  listAppointments(actor: ActorContext): Promise<Appointment[]>;
  book(input: BookingInput, actor: ActorContext, key: string): Promise<Appointment>;
  reschedule(input: RescheduleInput, actor: ActorContext, key: string): Promise<Appointment>;
  cancel(input: CancelInput, actor: ActorContext, key: string): Promise<Appointment>;
}
