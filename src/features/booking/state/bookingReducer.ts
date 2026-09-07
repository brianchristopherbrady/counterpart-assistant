import { generateId } from "@/lib/id";
import type { BookingDraft, BookingFilters, BookingStage, BookingSubject, ProviderId, SlotId } from "@/domain/models";

export type BookingAction =
  | { type: "SET_FILTERS"; filters: Partial<BookingFilters> }
  | { type: "SELECT_PROVIDER"; providerId: ProviderId }
  | { type: "SELECT_SLOT"; slotId: SlotId }
  | { type: "CLEAR_SLOT" }
  | { type: "SET_SUBJECT"; subject: BookingSubject }
  | { type: "GO_TO_STAGE"; stage: BookingStage }
  | { type: "RESET"; draft: BookingDraft };

export function bookingReducer(draft: BookingDraft, action: BookingAction): BookingDraft {
  switch (action.type) {
    case "SET_FILTERS":
      // A filter change invalidates the current selection — it may no longer be eligible/visible.
      return { ...draft, filters: { ...draft.filters, ...action.filters }, providerId: undefined, slotId: undefined };
    case "SELECT_PROVIDER":
      return { ...draft, providerId: action.providerId, slotId: undefined };
    case "SELECT_SLOT":
      return { ...draft, slotId: action.slotId };
    case "CLEAR_SLOT":
      return { ...draft, slotId: undefined };
    case "SET_SUBJECT":
      return { ...draft, subject: action.subject };
    case "GO_TO_STAGE":
      return { ...draft, stage: action.stage };
    case "RESET":
      return action.draft;
    default:
      return draft;
  }
}

export function createInitialDraft(discoveryMode: BookingDraft["discoveryMode"]): BookingDraft {
  return {
    stage: "discovery",
    discoveryMode,
    filters: {},
    idempotencyKey: generateId("idem"),
  };
}
