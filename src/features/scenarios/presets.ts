import type { DataScenario, DiscoveryMode, ScenarioConfig } from "@/domain/scenario";

export interface ScenarioOverridesInput {
  discoveryMode: DiscoveryMode;
  dataScenario: DataScenario;
  requireSignInToBook: boolean;
}

const SEED_PATIENT_ID = "pat-blake";
const USUAL_PROVIDER_ID = "prov-chen";

/** Builds a full, internally-consistent ScenarioConfig — the only place preset/override combinations meet. */
export function buildScenarioConfig(
  presetId: ScenarioConfig["presetId"],
  overrides: ScenarioOverridesInput,
): ScenarioConfig {
  const { discoveryMode, dataScenario, requireSignInToBook } = overrides;
  switch (presetId) {
    case "new-patient":
      return {
        presetId,
        actor: "patient",
        patientContext: "new",
        initialSignedIn: false,
        requireSignInToBook,
        discoveryMode,
        dataScenario,
      };
    case "returning-patient":
      return {
        presetId,
        actor: "patient",
        patientContext: "established",
        initialSignedIn: true,
        requireSignInToBook,
        seedPatientId: SEED_PATIENT_ID,
        usualProviderId: USUAL_PROVIDER_ID,
        discoveryMode,
        dataScenario,
      };
    case "staff-booking":
      return { presetId, actor: "staff", initialSignedIn: true, discoveryMode, dataScenario };
    case "sign-in-required":
      return {
        presetId,
        actor: "patient",
        patientContext: "new",
        initialSignedIn: false,
        requireSignInToBook: true,
        discoveryMode,
        dataScenario,
      };
  }
}

export function overridesFromConfig(config: ScenarioConfig): ScenarioOverridesInput {
  return {
    discoveryMode: config.discoveryMode,
    dataScenario: config.dataScenario,
    requireSignInToBook: "requireSignInToBook" in config ? config.requireSignInToBook : false,
  };
}

export const DEFAULT_OVERRIDES_BY_PRESET: Record<ScenarioConfig["presetId"], ScenarioOverridesInput> = {
  "new-patient": { discoveryMode: "provider-first", dataScenario: "normal", requireSignInToBook: false },
  "returning-patient": { discoveryMode: "provider-first", dataScenario: "normal", requireSignInToBook: false },
  "staff-booking": { discoveryMode: "earliest-available", dataScenario: "normal", requireSignInToBook: false },
  "sign-in-required": { discoveryMode: "provider-first", dataScenario: "normal", requireSignInToBook: true },
};

export const DATA_SCENARIO_LABELS: Record<DataScenario, string> = {
  normal: "Normal",
  "no-availability": "No matching availability",
  "slot-taken-on-submit": "Slot taken on submit",
  "network-failure-once": "Network failure once",
  "slow-response": "Slow response",
  "concurrent-booking-race": "Concurrent booking race",
};
