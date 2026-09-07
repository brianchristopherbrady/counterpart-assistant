import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@/lib/id";
import type { ActorContext } from "@/domain/models";

interface SessionState {
  actor: ActorContext;
  setActor: (actor: ActorContext) => void;
}

/** Session-scoped (not "demo data") — a guest's booked-appointment visibility ends with the browser tab. */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      actor: { kind: "guest", sessionId: generateId("session") },
      setActor: (actor) => set({ actor }),
    }),
    {
      name: "care-booking:session",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
