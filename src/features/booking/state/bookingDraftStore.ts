import { create } from "zustand";
import { bookingReducer, createInitialDraft } from "./bookingReducer";
import type { BookingAction } from "./bookingReducer";
import type { BookingDraft } from "@/domain/models";

interface BookingDraftState {
  draft: BookingDraft;
  dispatch: (action: BookingAction) => void;
  resetDraft: (discoveryMode: BookingDraft["discoveryMode"]) => void;
}

/** Lifted out of the component tree so the Scenarios drawer can inspect/discard it on "Apply scenario". */
export const useBookingDraftStore = create<BookingDraftState>()((set) => ({
  draft: createInitialDraft("provider-first"),
  dispatch: (action) => set((state) => ({ draft: bookingReducer(state.draft, action) })),
  resetDraft: (discoveryMode) => set({ draft: createInitialDraft(discoveryMode) }),
}));

/** True once the user has made any real progress worth confirming before discarding. */
export function draftHasProgress(draft: BookingDraft): boolean {
  return Boolean(draft.providerId || draft.slotId || draft.subject || draft.stage !== "discovery");
}
