import { create } from "zustand";
import { generateId } from "@/lib/id";
import { bookingReducer, createInitialDraft } from "./bookingReducer";
import type { BookingAction } from "./bookingReducer";
import type { Appointment, BookingDraft } from "@/domain/models";

interface BookingDraftState {
  draft: BookingDraft;
  dispatch: (action: BookingAction) => void;
  resetDraft: (discoveryMode: BookingDraft["discoveryMode"]) => void;
  startReschedule: (appointment: Appointment, discoveryMode: BookingDraft["discoveryMode"]) => void;
}

/** Lifted out of the component tree so the Scenarios drawer can inspect/discard it on "Apply scenario". */
export const useBookingDraftStore = create<BookingDraftState>()((set) => ({
  draft: createInitialDraft("provider-first"),
  dispatch: (action) => set((state) => ({ draft: bookingReducer(state.draft, action) })),
  resetDraft: (discoveryMode) => set({ draft: createInitialDraft(discoveryMode) }),
  startReschedule: (appointment, discoveryMode) =>
    set({
      draft: {
        stage: "discovery",
        discoveryMode,
        // Locks the visit type to the original appointment's — provider/time are free to change.
        filters: { appointmentTypeId: appointment.appointmentTypeId },
        subject: {
          patientId: appointment.patientId,
          fullName: appointment.subjectName,
          dateOfBirth: appointment.subjectDateOfBirth,
          contact: appointment.subjectContact,
        },
        reschedulingAppointmentId: appointment.id,
        idempotencyKey: generateId("idem"),
      },
    }),
}));

/** True once the user has made any real progress worth confirming before discarding. */
export function draftHasProgress(draft: BookingDraft): boolean {
  return Boolean(draft.providerId || draft.slotId || draft.subject || draft.stage !== "discovery");
}
