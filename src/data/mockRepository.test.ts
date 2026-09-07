import { describe, it, expect, beforeEach } from "vitest";
import { fixedClock } from "@/lib/clock";
import { MockBookingRepository } from "@/data/mockRepository";
import { SlotConflictError, NetworkFailureError } from "@/domain/errors";
import type { DataScenario } from "@/domain/scenario";
import type { ActorContext, BookingSubject } from "@/domain/models";

beforeEach(() => {
  window.localStorage.clear();
});


const GUEST: ActorContext = { kind: "guest", sessionId: "session-1" };
const SUBJECT: BookingSubject = {
  fullName: "Alex Guest",
  dateOfBirth: "1995-01-01",
  contact: { method: "email", value: "alex.guest@example.com" },
};

function makeRepo(initialScenario: DataScenario = "normal") {
  let dataScenario = initialScenario;
  let version = 0;
  const repo = new MockBookingRepository(fixedClock("2026-09-07T12:00:00Z"), () => ({
    dataScenario,
    version,
  }));
  return {
    repo,
    setScenario(next: DataScenario) {
      dataScenario = next;
      version += 1;
    },
  };
}

async function firstAvailableSlotId(repo: MockBookingRepository) {
  const slots = await repo.getSlots({
    discoveryMode: "earliest-available",
    appointmentTypeId: "type-new-patient",
    patientContext: "new",
  });
  const slot = slots[0];
  if (!slot) throw new Error("Expected at least one fixture slot.");
  return slot;
}

describe("MockBookingRepository", () => {
  it("books a slot and persists it as confirmed", async () => {
    const { repo } = makeRepo();
    const slot = await firstAvailableSlotId(repo);
    const appointment = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-1");
    expect(appointment.status).toBe("confirmed");
    expect(appointment.providerId).toBe(slot.providerId);
  });

  it("replays the same result for a repeated idempotency key", async () => {
    const { repo } = makeRepo();
    const slot = await firstAvailableSlotId(repo);
    const first = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-2");
    const second = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-2");
    expect(second.id).toBe(first.id);
    const listed = await repo.listAppointments(GUEST);
    expect(listed.filter((a) => a.id === first.id)).toHaveLength(1);
  });

  it("rejects a reused idempotency key with a different request", async () => {
    const { repo } = makeRepo();
    const slots = await repo.getSlots({
      discoveryMode: "earliest-available",
      appointmentTypeId: "type-new-patient",
      patientContext: "new",
    });
    const [slotA, slotB] = slots;
    if (!slotA || !slotB) throw new Error("Expected at least two fixture slots.");
    await repo.book({ slotId: slotA.id, subject: SUBJECT }, GUEST, "key-3");
    await expect(
      repo.book({ slotId: slotB.id, subject: SUBJECT }, GUEST, "key-3"),
    ).rejects.toThrow();
  });

  it("rejects a second overlapping booking for the same provider", async () => {
    const { repo } = makeRepo();
    const slot = await firstAvailableSlotId(repo);
    await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-4");
    await expect(
      repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-5"),
    ).rejects.toThrow(SlotConflictError);
  });

  it("consumes a slot-taken-on-submit fault once, then lets a retry succeed", async () => {
    const { repo, setScenario } = makeRepo();
    setScenario("slot-taken-on-submit");
    const slot = await firstAvailableSlotId(repo);
    await expect(
      repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-6"),
    ).rejects.toThrow(SlotConflictError);
    const appointment = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-7");
    expect(appointment.status).toBe("confirmed");
  });

  it("consumes a network-failure-once fault once, then lets a retry with the same key succeed", async () => {
    const { repo, setScenario } = makeRepo();
    setScenario("network-failure-once");
    const slot = await firstAvailableSlotId(repo);
    await expect(
      repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-8"),
    ).rejects.toThrow(NetworkFailureError);
    const appointment = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-8");
    expect(appointment.status).toBe("confirmed");
  });

  it("scopes guest appointment visibility to the booking session", async () => {
    const { repo } = makeRepo();
    const slot = await firstAvailableSlotId(repo);
    await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-9");
    const otherGuest: ActorContext = { kind: "guest", sessionId: "session-2" };
    expect(await repo.listAppointments(otherGuest)).toHaveLength(0);
    expect(await repo.listAppointments(GUEST)).toHaveLength(1);
  });
});
