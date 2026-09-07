import { useReducer } from "react";
import { bookingReducer, createInitialDraft } from "./bookingReducer";
import type { BookingDraft } from "@/domain/models";

export function useBookingDraft(discoveryMode: BookingDraft["discoveryMode"]) {
  return useReducer(bookingReducer, discoveryMode, createInitialDraft);
}
