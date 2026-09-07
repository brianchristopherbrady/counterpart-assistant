import { useNavigate } from "react-router-dom";
import { Button } from "@/design-system/react";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import { useBookingDraftStore } from "@/features/booking/state/bookingDraftStore";
import { generateId } from "@/lib/id";
import { buildScenarioConfig, DEFAULT_OVERRIDES_BY_PRESET } from "@/features/scenarios/presets";
import type { ScenarioConfig } from "@/domain/scenario";
import type { ScenarioOverridesInput } from "@/features/scenarios/presets";

export interface WalkthroughStep {
  action: string;
  expected: string;
  component?: string;
}

export interface WalkthroughCardProps {
  number: number;
  goal: string;
  presetId: ScenarioConfig["presetId"];
  overrides?: Partial<ScenarioOverridesInput>;
  route: string;
  steps: WalkthroughStep[];
  sayThisAloud: string;
  followUp: string;
  tradeoff: string;
}

/** "Load scenario" applies the real preset via the same store the Scenarios drawer uses, then navigates. */
export function WalkthroughCard({
  number,
  goal,
  presetId,
  overrides,
  route,
  steps,
  sayThisAloud,
  followUp,
  tradeoff,
}: WalkthroughCardProps) {
  const navigate = useNavigate();
  const applyScenario = useScenarioStore((s) => s.applyScenario);
  const setActor = useSessionStore((s) => s.setActor);
  const resetDraft = useBookingDraftStore((s) => s.resetDraft);

  function loadScenario() {
    const config = buildScenarioConfig(presetId, { ...DEFAULT_OVERRIDES_BY_PRESET[presetId], ...overrides });
    applyScenario(config);
    resetDraft(config.discoveryMode);
    if (config.actor === "staff") {
      setActor({ kind: "staff", staffId: "staff-demo", practiceId: "practice-downtown" });
    } else if (config.initialSignedIn) {
      setActor({ kind: "patient", patientId: config.seedPatientId });
    } else {
      setActor({ kind: "guest", sessionId: generateId("session") });
    }
    navigate(route);
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-text-primary">
          Walkthrough {number}: {goal}
        </h3>
        <Button size="sm" onClick={loadScenario}>
          Load scenario
        </Button>
      </div>
      <ol className="list-decimal pl-6">
        {steps.map((step) => (
          <li key={step.action} className="mb-1">
            <span className="text-text-primary">{step.action}</span>
            <span className="text-text-muted"> — expect: {step.expected}</span>
            {step.component ? <span className="text-text-muted"> ({step.component})</span> : null}
          </li>
        ))}
      </ol>
      <p className="text-sm text-text-primary">
        <span className="font-semibold">Say aloud: </span>
        {sayThisAloud}
      </p>
      <p className="text-sm text-text-muted">
        <span className="font-semibold">Likely follow-up: </span>
        {followUp}
      </p>
      <p className="text-sm text-text-muted">
        <span className="font-semibold">Trade-off: </span>
        {tradeoff}
      </p>
    </div>
  );
}
