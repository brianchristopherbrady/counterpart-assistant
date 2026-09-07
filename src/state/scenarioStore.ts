import { create } from "zustand";
import type { ScenarioConfig } from "@/domain/scenario";

const DEFAULT_SCENARIO: ScenarioConfig = {
  presetId: "new-patient",
  actor: "patient",
  patientContext: "new",
  initialSignedIn: false,
  requireSignInToBook: false,
  discoveryMode: "provider-first",
  dataScenario: "normal",
};

interface ScenarioState {
  config: ScenarioConfig;
  /** Bumps on every activation so the mock repository re-arms one-shot faults (see MockBookingRepository). */
  version: number;
  applyScenario: (config: ScenarioConfig) => void;
}

/** Preparation-shell state — not product/demo data, never persisted. */
export const useScenarioStore = create<ScenarioState>()((set) => ({
  config: DEFAULT_SCENARIO,
  version: 0,
  applyScenario: (config) => set((state) => ({ config, version: state.version + 1 })),
}));
