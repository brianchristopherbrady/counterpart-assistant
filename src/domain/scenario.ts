import type { PatientId } from "./models";

export type DiscoveryMode = "provider-first" | "earliest-available";

export type DataScenario =
  | "normal"
  | "no-availability"
  | "slot-taken-on-submit"
  | "network-failure-once"
  | "slow-response"
  | "concurrent-booking-race";

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
        /** Suggested, not mandatory — the patient can still browse/pick any provider. */
        usualProviderId: string;
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

export const SCENARIO_PRESET_DESCRIPTIONS: Record<ScenarioConfig["presetId"], string> = {
  "new-patient": "A patient new to the practice browses as a guest, then books without an account.",
  "returning-patient":
    "An established patient starts already signed in, with their details and usual provider suggested.",
  "staff-booking": "Staff booking asks for the patient first and keeps their identity visible throughout.",
  "sign-in-required":
    "Browsing stays open to everyone; a simulated sign-in is only required right before the booking is confirmed.",
};
