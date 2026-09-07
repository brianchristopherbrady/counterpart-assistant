import type { PatientId } from "./models";

export type DiscoveryMode = "provider-first" | "earliest-available";

export type DataScenario =
  | "normal"
  | "no-availability"
  | "slot-taken-on-submit"
  | "network-failure-once"
  | "slow-response";

interface ScenarioOverrides {
  discoveryMode: DiscoveryMode;
  dataScenario: DataScenario;
}

/** Discriminated by presetId so actor/identity/patient-context combinations can't drift out of sync. */
export type ScenarioConfig = ScenarioOverrides &
  (
    | {
        presetId: "new-patient";
        actor: "patient";
        patientContext: "new";
        initialSignedIn: false;
        requireSignInToBook: boolean;
      }
    | {
        presetId: "returning-patient";
        actor: "patient";
        patientContext: "established";
        initialSignedIn: true;
        requireSignInToBook: boolean;
        seedPatientId: PatientId;
      }
    | {
        presetId: "staff-booking";
        actor: "staff";
        initialSignedIn: true;
      }
    | {
        presetId: "sign-in-required";
        actor: "patient";
        patientContext: "new";
        initialSignedIn: false;
        requireSignInToBook: true;
      }
  );

export const SCENARIO_PRESET_LABELS: Record<ScenarioConfig["presetId"], string> = {
  "new-patient": "New patient",
  "returning-patient": "Returning patient",
  "staff-booking": "Staff booking",
  "sign-in-required": "Sign-in required",
};
