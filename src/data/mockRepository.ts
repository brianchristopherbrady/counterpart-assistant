import type { Clock } from "@/lib/clock";
import { readStorage, writeStorage } from "@/lib/storage";
import { generateId, generateReference } from "@/lib/id";
import { locations, providers, appointmentTypes, patients as seedPatients, generateSlots } from "@/data/fixtures";
import type {
  Appointment,
  AppointmentId,
  ActorContext,
  Patient,
  Provider,
  Slot,
} from "@/domain/models";
import type {
  BookingRepository,
  ProviderQuery,
  SlotQuery,
  BookingInput,
  RescheduleInput,
  CancelInput,
  StaffActorContext,
} from "@/domain/repository";
import type { BookingSubject } from "@/domain/models";
import { resolvePatientContext } from "@/domain/eligibility";
import type { DataScenario } from "@/domain/scenario";
import {
  ValidationError,
  SlotConflictError,
  StaleAppointmentError,
  AccessDeniedError,
  NetworkFailureError,
} from "@/domain/errors";

const APPOINTMENTS_STORAGE_KEY = "appointments";
const IDEMPOTENCY_STORAGE_KEY = "idempotency-results";

/** Simulated network latency for every mocked operation, before any scenario-specific delay. */
const BASE_DELAY_MS = 300;
const SLOW_SCENARIO_EXTRA_DELAY_MS = 1800;

interface IdempotencyRecord {
  fingerprint: string;
  appointment: Appointment;
}

/** Reads the currently-active data scenario; `version` bumps on every explicit "Apply scenario". */
export interface ScenarioReader {
  (): { dataScenario: DataScenario; version: number };
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return new Date(aStart).getTime() < new Date(bEnd).getTime() &&
    new Date(bStart).getTime() < new Date(aEnd).getTime();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Mock implementation of BookingRepository — the illustrative service boundary for this
 * prototype (see Study for a proposed HTTP mapping). Availability checks and writes happen
 * together, inside this adapter, after its simulated delay.
 */
export class MockBookingRepository implements BookingRepository {
  private readonly clock: Clock;
  private readonly getScenario: ScenarioReader;
  private readonly patientRecords: Patient[];
  private appointmentsById = new Map<AppointmentId, Appointment>();
  private idempotencyResults = new Map<string, IdempotencyRecord>();
  private lastScenarioVersion = -1;
  private slotConflictConsumed = false;
  private networkFailureConsumed = false;

  constructor(clock: Clock, getScenario: ScenarioReader) {
    this.clock = clock;
    this.getScenario = getScenario;
    this.patientRecords = [...seedPatients];

    const persistedAppointments = readStorage<Appointment[]>(APPOINTMENTS_STORAGE_KEY, []);
    for (const appointment of persistedAppointments) {
      this.appointmentsById.set(appointment.id, appointment);
    }
    const persistedIdempotency = readStorage<[string, IdempotencyRecord][]>(
      IDEMPOTENCY_STORAGE_KEY,
      [],
    );
    this.idempotencyResults = new Map(persistedIdempotency);
  }

  /** Clears committed appointments and idempotency results — the "Reset demo data" action. */
  resetDemoData(): void {
    this.appointmentsById.clear();
    this.idempotencyResults.clear();
    this.persistAppointments();
    this.persistIdempotency();
  }

  private persistAppointments(): void {
    writeStorage(APPOINTMENTS_STORAGE_KEY, [...this.appointmentsById.values()]);
  }

  private persistIdempotency(): void {
    writeStorage(IDEMPOTENCY_STORAGE_KEY, [...this.idempotencyResults.entries()]);
  }

  /** Re-arms scoped faults whenever a new "Apply scenario" activation is observed. */
  private syncScenario(): { dataScenario: DataScenario } {
    const { dataScenario, version } = this.getScenario();
    if (version !== this.lastScenarioVersion) {
      this.lastScenarioVersion = version;
      this.slotConflictConsumed = false;
      this.networkFailureConsumed = false;
    }
    return { dataScenario };
  }

  private allSlots(): Slot[] {
    return generateSlots(this.clock, locations, providers, appointmentTypes);
  }

  private confirmedAppointmentsForProvider(providerId: string, excludeId?: AppointmentId): Appointment[] {
    return [...this.appointmentsById.values()].filter(
      (a) => a.providerId === providerId && a.status === "confirmed" && a.id !== excludeId,
    );
  }

  async searchProviders(query: ProviderQuery, signal?: AbortSignal): Promise<Provider[]> {
    const { dataScenario } = this.syncScenario();
    await delay(BASE_DELAY_MS + this.slowExtra(dataScenario), signal);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    return providers.filter((provider) => {
      if (query.locationId && !provider.locationIds.includes(query.locationId)) return false;
      if (query.mode && !provider.supportedModes.includes(query.mode)) return false;
      if (query.patientContext === "new" && !provider.acceptsNewPatients) return false;
      if (query.appointmentTypeId) {
        const type = appointmentTypes.find((t) => t.id === query.appointmentTypeId);
        if (type && type.allowedPatientContext === "new" && !provider.acceptsNewPatients) return false;
      }
      if (query.nameQuery && !provider.name.toLowerCase().includes(query.nameQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  async getSlots(query: SlotQuery, signal?: AbortSignal): Promise<Slot[]> {
    const { dataScenario } = this.syncScenario();
    await delay(BASE_DELAY_MS + this.slowExtra(dataScenario), signal);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (dataScenario === "no-availability") return [];

    const bookedIntervalsByProvider = new Map<string, Array<{ start: string; end: string }>>();
    for (const appointment of this.appointmentsById.values()) {
      if (appointment.status !== "confirmed") continue;
      const list = bookedIntervalsByProvider.get(appointment.providerId) ?? [];
      list.push({ start: appointment.startInstant, end: appointment.endInstant });
      bookedIntervalsByProvider.set(appointment.providerId, list);
    }

    return this.allSlots().filter((slot) => {
      if (slot.appointmentTypeId !== query.appointmentTypeId) return false;
      if (query.providerId && slot.providerId !== query.providerId) return false;
      if (query.locationId && slot.locationId !== query.locationId) return false;
      if (query.mode && slot.mode !== query.mode) return false;
      if (query.date && !slot.startInstant.startsWith(query.date)) return false;

      const type = appointmentTypes.find((t) => t.id === slot.appointmentTypeId);
      if (type && type.allowedPatientContext !== query.patientContext) return false;

      const booked = bookedIntervalsByProvider.get(slot.providerId) ?? [];
      const overlapsBooked = booked.some((b) =>
        intervalsOverlap(slot.startInstant, slot.endInstant, b.start, b.end),
      );
      return !overlapsBooked;
    });
  }

  private slowExtra(dataScenario: DataScenario): number {
    return dataScenario === "slow-response" ? SLOW_SCENARIO_EXTRA_DELAY_MS : 0;
  }

  async searchPatients(query: string, _actor: StaffActorContext): Promise<Patient[]> {
    await delay(BASE_DELAY_MS);
    const q = query.trim().toLowerCase();
    const qDigits = digitsOnly(query);
    if (!q) return [];
    return this.patientRecords.filter((p) => {
      if (p.fullName.toLowerCase().includes(q)) return true;
      if (p.contact.method === "email" && p.contact.value.toLowerCase().includes(q)) return true;
      if (qDigits.length >= 4) {
        const dob = p.dateOfBirth.replace(/-/g, ""); // YYYYMMDD
        const dobAlt = dob.slice(4, 8) + dob.slice(0, 4); // MMDDYYYY-ish reorder
        if (dob.includes(qDigits) || dobAlt.includes(qDigits)) return true;
      }
      return false;
    });
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    await delay(BASE_DELAY_MS);
    return this.patientRecords.find((p) => p.id === patientId) ?? null;
  }

  async registerPatient(subject: BookingSubject): Promise<Patient> {
    await delay(BASE_DELAY_MS);
    const patient: Patient = {
      id: generateId("pat"),
      fullName: subject.fullName,
      dateOfBirth: subject.dateOfBirth,
      contact: subject.contact,
    };
    this.patientRecords.push(patient);
    return patient;
  }

  async findPatientByEmail(email: string): Promise<Patient | null> {
    await delay(BASE_DELAY_MS);
    const target = email.trim().toLowerCase();
    return (
      this.patientRecords.find(
        (p) => p.contact.method === "email" && p.contact.value.toLowerCase() === target,
      ) ?? null
    );
  }

  async listAppointments(actor: ActorContext): Promise<Appointment[]> {
    await delay(BASE_DELAY_MS);
    const all = [...this.appointmentsById.values()];
    if (actor.kind === "staff") return all;
    if (actor.kind === "patient") return all.filter((a) => a.patientId === actor.patientId);
    return all.filter(
      (a) => a.bookedByActor.kind === "guest" && a.bookedByActor.sessionId === actor.sessionId,
    );
  }

  async book(input: BookingInput, actor: ActorContext, key: string): Promise<Appointment> {
    const fingerprint = JSON.stringify({ op: "book", input, actor });
    const cached = this.idempotencyResults.get(key);
    if (cached) {
      if (cached.fingerprint !== fingerprint) {
        throw new ValidationError("Idempotency key reused for a different request.");
      }
      return cached.appointment;
    }

    const { dataScenario } = this.syncScenario();
    await delay(BASE_DELAY_MS + this.slowExtra(dataScenario));

    const slot = this.allSlots().find((s) => s.id === input.slotId);
    if (!slot) throw new SlotConflictError();

    const type = appointmentTypes.find((t) => t.id === slot.appointmentTypeId);
    // Eligibility uses the ORIGINAL seed patients, not the session's growing patientRecords —
    // a patientId created moments ago via a simulated new-account signup must still count as
    // "new to the practice," not "established," even though it's now a real patient record.
    const patientContext = resolvePatientContext(input.subject.patientId, seedPatients);
    if (!type || type.allowedPatientContext !== patientContext) {
      throw new ValidationError("This appointment type isn't available for this patient.");
    }

    const overlap = this.confirmedAppointmentsForProvider(slot.providerId).some((a) =>
      intervalsOverlap(slot.startInstant, slot.endInstant, a.startInstant, a.endInstant),
    );
    if (overlap) throw new SlotConflictError();

    if (dataScenario === "slot-taken-on-submit" && !this.slotConflictConsumed) {
      this.slotConflictConsumed = true;
      throw new SlotConflictError();
    }
    if (dataScenario === "network-failure-once" && !this.networkFailureConsumed) {
      this.networkFailureConsumed = true;
      throw new NetworkFailureError();
    }

    const now = this.clock.now().toISOString();
    const appointment: Appointment = {
      id: generateId("appt"),
      reference: generateReference(),
      patientId: input.subject.patientId,
      subjectName: input.subject.fullName,
      subjectDateOfBirth: input.subject.dateOfBirth,
      subjectContact: input.subject.contact,
      bookedByActor: actor,
      providerId: slot.providerId,
      appointmentTypeId: slot.appointmentTypeId,
      mode: slot.mode,
      locationId: slot.locationId,
      startInstant: slot.startInstant,
      endInstant: slot.endInstant,
      status: "confirmed",
      version: 1,
      createdAt: now,
    };
    this.appointmentsById.set(appointment.id, appointment);
    this.persistAppointments();
    this.idempotencyResults.set(key, { fingerprint, appointment });
    this.persistIdempotency();
    return appointment;
  }

  async reschedule(input: RescheduleInput, actor: ActorContext, key: string): Promise<Appointment> {
    const fingerprint = JSON.stringify({ op: "reschedule", input, actor });
    const cached = this.idempotencyResults.get(key);
    if (cached) {
      if (cached.fingerprint !== fingerprint) {
        throw new ValidationError("Idempotency key reused for a different request.");
      }
      return cached.appointment;
    }

    const { dataScenario } = this.syncScenario();
    await delay(BASE_DELAY_MS + this.slowExtra(dataScenario));

    const original = this.appointmentsById.get(input.appointmentId);
    if (!original) throw new AccessDeniedError("Appointment not found.");
    if (original.version !== input.appointmentVersion) throw new StaleAppointmentError();

    const newSlot = this.allSlots().find((s) => s.id === input.newSlotId);
    if (!newSlot) throw new SlotConflictError();

    const overlap = this.confirmedAppointmentsForProvider(newSlot.providerId, original.id).some(
      (a) => intervalsOverlap(newSlot.startInstant, newSlot.endInstant, a.startInstant, a.endInstant),
    );
    if (overlap) throw new SlotConflictError();

    if (dataScenario === "slot-taken-on-submit" && !this.slotConflictConsumed) {
      this.slotConflictConsumed = true;
      throw new SlotConflictError();
    }
    if (dataScenario === "network-failure-once" && !this.networkFailureConsumed) {
      this.networkFailureConsumed = true;
      throw new NetworkFailureError();
    }

    const updated: Appointment = {
      ...original,
      providerId: newSlot.providerId,
      locationId: newSlot.locationId,
      mode: newSlot.mode,
      appointmentTypeId: newSlot.appointmentTypeId,
      startInstant: newSlot.startInstant,
      endInstant: newSlot.endInstant,
      version: original.version + 1,
    };
    this.appointmentsById.set(updated.id, updated);
    this.persistAppointments();
    this.idempotencyResults.set(key, { fingerprint, appointment: updated });
    this.persistIdempotency();
    return updated;
  }

  async cancel(input: CancelInput, actor: ActorContext, key: string): Promise<Appointment> {
    const fingerprint = JSON.stringify({ op: "cancel", input, actor });
    const cached = this.idempotencyResults.get(key);
    if (cached) {
      if (cached.fingerprint !== fingerprint) {
        throw new ValidationError("Idempotency key reused for a different request.");
      }
      return cached.appointment;
    }

    const { dataScenario } = this.syncScenario();
    await delay(BASE_DELAY_MS + this.slowExtra(dataScenario));

    const original = this.appointmentsById.get(input.appointmentId);
    if (!original) throw new AccessDeniedError("Appointment not found.");
    if (original.version !== input.appointmentVersion) throw new StaleAppointmentError();

    if (dataScenario === "network-failure-once" && !this.networkFailureConsumed) {
      this.networkFailureConsumed = true;
      throw new NetworkFailureError();
    }

    const updated: Appointment = { ...original, status: "canceled", version: original.version + 1 };
    this.appointmentsById.set(updated.id, updated);
    this.persistAppointments();
    this.idempotencyResults.set(key, { fingerprint, appointment: updated });
    this.persistIdempotency();
    return updated;
  }
}
