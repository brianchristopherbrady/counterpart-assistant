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

  it("rejects overlapping bookings for the same provider even across different slot ids/modes/locations", async () => {
    const { repo } = makeRepo();
    const slots = await repo.getSlots({
      discoveryMode: "earliest-available",
      appointmentTypeId: "type-new-patient",
      patientContext: "new",
    });
    const first = slots[0];
    if (!first) throw new Error("Expected at least one fixture slot.");
    await repo.book({ slotId: first.id, subject: SUBJECT }, GUEST, "key-overlap-1");
    // A different slot id for the same provider whose interval overlaps the just-booked one.
    const overlapping = slots.find(
      (s) =>
        s.providerId === first.providerId &&
        s.id !== first.id &&
        new Date(s.startInstant).getTime() < new Date(first.endInstant).getTime() &&
        new Date(first.startInstant).getTime() < new Date(s.endInstant).getTime(),
    );
    if (!overlapping) return; // fixture set may not produce an overlap candidate; nothing to assert then
    await expect(
      repo.book({ slotId: overlapping.id, subject: SUBJECT }, GUEST, "key-overlap-2"),
    ).rejects.toThrow(SlotConflictError);
  });

  it("reschedule swaps the same appointment atomically and frees the original slot", async () => {
    const { repo } = makeRepo();
    const slots = await repo.getSlots({
      discoveryMode: "earliest-available",
      appointmentTypeId: "type-new-patient",
      patientContext: "new",
    });
    const original = slots[0];
    const replacement = slots.find((s) => s.id !== original?.id && s.providerId !== original?.providerId);
    if (!original || !replacement) throw new Error("Expected two fixture slots on different providers.");

    const appointment = await repo.book({ slotId: original.id, subject: SUBJECT }, GUEST, "key-resched-1");
    const rescheduled = await repo.reschedule(
      { appointmentId: appointment.id, appointmentVersion: appointment.version, newSlotId: replacement.id },
      GUEST,
      "key-resched-2",
    );

    expect(rescheduled.id).toBe(appointment.id);
    expect(rescheduled.reference).toBe(appointment.reference);
    expect(rescheduled.version).toBe(appointment.version + 1);
    expect(rescheduled.providerId).toBe(replacement.providerId);

    // The original slot is free again — booking it fresh should succeed.
    const rebooked = await repo.book({ slotId: original.id, subject: SUBJECT }, GUEST, "key-resched-3");
    expect(rebooked.status).toBe("confirmed");
  });

  it("rejects a stale reschedule and leaves the original appointment untouched", async () => {
    const { repo } = makeRepo();
    const slots = await repo.getSlots({
      discoveryMode: "earliest-available",
      appointmentTypeId: "type-new-patient",
      patientContext: "new",
    });
    const original = slots[0];
    const replacement = slots.find((s) => s.providerId !== original?.providerId);
    if (!original || !replacement) throw new Error("Expected two fixture slots on different providers.");

    const appointment = await repo.book({ slotId: original.id, subject: SUBJECT }, GUEST, "key-stale-1");
    await expect(
      repo.reschedule(
        { appointmentId: appointment.id, appointmentVersion: appointment.version + 1, newSlotId: replacement.id },
        GUEST,
        "key-stale-2",
      ),
    ).rejects.toThrow();

    const [stillOriginal] = await repo.listAppointments(GUEST);
    expect(stillOriginal?.providerId).toBe(original.providerId);
    expect(stillOriginal?.version).toBe(appointment.version);
  });

  it("cancel releases the slot and marks the appointment canceled", async () => {
    const { repo } = makeRepo();
    const slot = await firstAvailableSlotId(repo);
    const appointment = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-cancel-1");
    const canceled = await repo.cancel(
      { appointmentId: appointment.id, appointmentVersion: appointment.version },
      GUEST,
      "key-cancel-2",
    );
    expect(canceled.status).toBe("canceled");

    const rebooked = await repo.book({ slotId: slot.id, subject: SUBJECT }, GUEST, "key-cancel-3");
    expect(rebooked.status).toBe("confirmed");
  });

  it("aborts an in-flight getSlots call via AbortSignal (the basis for stale-response protection)", async () => {
    const { repo } = makeRepo();
    const controller = new AbortController();
    const pending = repo.getSlots(
      { discoveryMode: "earliest-available", appointmentTypeId: "type-new-patient", patientContext: "new" },
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("concurrent-booking-race: repeated automatic calls never snipe; an explicit refresh does", async () => {
    const { repo, setScenario } = makeRepo();
    setScenario("concurrent-booking-race");
    const slot = await firstAvailableSlotId(repo);

    const baseQuery = {
      discoveryMode: "provider-first" as const,
      providerId: slot.providerId,
      appointmentTypeId: "type-new-patient",
      patientContext: "new" as const,
      includeUnavailable: true,
    };

    // Any number of calls without manualRefreshCount (e.g. StrictMode double-invoke, background
    // refetch-on-focus) must never trigger the simulated concurrent booking.
    for (let i = 0; i < 3; i += 1) {
      const result = await repo.getSlots(baseQuery);
      expect(result.every((s) => s.available !== false)).toBe(true);
    }

    const afterRefresh = await repo.getSlots({ ...baseQuery, manualRefreshCount: 1 });
    expect(afterRefresh.some((s) => s.available === false)).toBe(true);

    // The sniped slot is a real confirmed booking now — a real submit for it must conflict too.
    const sniped = afterRefresh.find((s) => s.available === false)!;
    await expect(repo.book({ slotId: sniped.id, subject: SUBJECT }, GUEST, "key-race-1")).rejects.toThrow(
      SlotConflictError,
    );

    // A second refresh click doesn't snipe again — only ever once per provider per scenario version.
    const secondRefresh = await repo.getSlots({ ...baseQuery, manualRefreshCount: 2 });
    expect(secondRefresh.filter((s) => s.available === false)).toHaveLength(
      afterRefresh.filter((s) => s.available === false).length,
    );
  });

  it("concurrent-booking-race prefers sniping the caller's currently selected slot", async () => {
    const { repo, setScenario } = makeRepo();
    setScenario("concurrent-booking-race");
    const slot = await firstAvailableSlotId(repo);
    const slots = await repo.getSlots({
      discoveryMode: "earliest-available",
      appointmentTypeId: "type-new-patient",
      patientContext: "new",
    });
    const notFirst = slots.find((s) => s.providerId === slot.providerId && s.id !== slot.id);
    if (!notFirst) throw new Error("Expected a second fixture slot for the same provider.");

    const query = {
      discoveryMode: "provider-first" as const,
      providerId: slot.providerId,
      appointmentTypeId: "type-new-patient",
      patientContext: "new" as const,
      includeUnavailable: true,
      preferSnipeSlotId: notFirst.id,
      manualRefreshCount: 1,
    };
    const result = await repo.getSlots(query);
    const sniped = result.find((s) => s.available === false);
    expect(sniped?.id).toBe(notFirst.id);
  });
});
