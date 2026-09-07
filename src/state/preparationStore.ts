import { create } from "zustand";

interface PreparationState {
  visible: boolean;
  toggle: () => void;
}

/** Lets the demo hide all prep/scenario chrome for a clean product walkthrough. */
export const usePreparationStore = create<PreparationState>()((set) => ({
  visible: true,
  toggle: () => set((state) => ({ visible: !state.visible })),
}));
