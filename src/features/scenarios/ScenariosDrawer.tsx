import { useState } from "react";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { Button, Dialog, RadioGroup, Select, StatusMessage } from "@/design-system/react";
import { useScenarioStore } from "@/state/scenarioStore";
import { useSessionStore } from "@/state/sessionStore";
import { usePreparationStore } from "@/state/preparationStore";
import { useBookingDraftStore, draftHasProgress } from "@/features/booking/state/bookingDraftStore";
import { repository } from "@/data/repository";
import { generateId } from "@/lib/id";
import { SCENARIO_PRESET_LABELS, SCENARIO_PRESET_DESCRIPTIONS } from "@/domain/scenario";
import type { ScenarioConfig } from "@/domain/scenario";
import {
  buildScenarioConfig,
  overridesFromConfig,
  DEFAULT_OVERRIDES_BY_PRESET,
  DATA_SCENARIO_LABELS,
} from "./presets";
import type { ScenarioOverridesInput } from "./presets";

const PRESET_OPTIONS = (Object.keys(SCENARIO_PRESET_LABELS) as ScenarioConfig["presetId"][]).map((id) => ({
  value: id,
  label: SCENARIO_PRESET_LABELS[id],
}));

const DISCOVERY_OPTIONS = [
  { value: "provider-first", label: "Choose a provider" },
  { value: "earliest-available", label: "Earliest available" },
];

const GUEST_POLICY_OPTIONS = [
  { value: "allow", label: "Allow guest booking" },
  { value: "require", label: "Require demo sign-in to book" },
];

const DATA_SCENARIO_OPTIONS = (Object.keys(DATA_SCENARIO_LABELS) as (keyof typeof DATA_SCENARIO_LABELS)[]).map(
  (id) => ({ value: id, label: DATA_SCENARIO_LABELS[id] }),
);

export function ScenariosDrawer() {
  const activeConfig = useScenarioStore((s) => s.config);
  const applyScenario = useScenarioStore((s) => s.applyScenario);
  const setActor = useSessionStore((s) => s.setActor);
  const draft = useBookingDraftStore((s) => s.draft);
  const resetDraft = useBookingDraftStore((s) => s.resetDraft);
  const hidePreparation = usePreparationStore((s) => s.toggle);
  const queryClient = useQueryClient();
  const isMutating = useIsMutating() > 0;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"edit" | "confirm-discard" | "confirm-reset">("edit");
  const [presetId, setPresetId] = useState<ScenarioConfig["presetId"]>(activeConfig.presetId);
  const [overrides, setOverrides] = useState<ScenarioOverridesInput>(overridesFromConfig(activeConfig));

  function openDrawer() {
    setPresetId(activeConfig.presetId);
    setOverrides(overridesFromConfig(activeConfig));
    setStep("edit");
    setOpen(true);
  }

  function applyNow() {
    const nextConfig = buildScenarioConfig(presetId, overrides);
    applyScenario(nextConfig);
    resetDraft(nextConfig.discoveryMode);
    void queryClient.cancelQueries();
    void queryClient.invalidateQueries();

    if (nextConfig.actor === "staff") {
      setActor({ kind: "staff", staffId: "staff-demo", practiceId: "practice-downtown" });
    } else if (nextConfig.initialSignedIn) {
      setActor({ kind: "patient", patientId: nextConfig.seedPatientId });
    } else {
      setActor({ kind: "guest", sessionId: generateId("session") });
    }
    setOpen(false);
  }

  function handleApplyClick() {
    if (draftHasProgress(draft)) {
      setStep("confirm-discard");
    } else {
      applyNow();
    }
  }

  function handleResetDemoData() {
    repository.resetDemoData();
    void queryClient.invalidateQueries();
    setStep("edit");
    setOpen(false);
  }

  const isStaffPreset = presetId === "staff-booking";

  return (
    <>
      <Button intent="secondary" size="sm" onClick={openDrawer}>
        Scenarios
      </Button>

      <Dialog open={open} onDismiss={() => setOpen(false)} aria-label="Scenarios">
        {step === "confirm-discard" ? (
          <div className="flex max-w-sm flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Start a fresh draft?</h2>
            <p className="text-text-primary">
              Applying this scenario will start a fresh booking draft. Your current in-progress booking will be
              discarded — already-confirmed appointments are not affected.
            </p>
            <div className="flex justify-end gap-2">
              <Button intent="secondary" onClick={() => setStep("edit")}>
                Keep editing current draft
              </Button>
              <Button intent="destructive" onClick={applyNow}>
                Discard draft and apply
              </Button>
            </div>
          </div>
        ) : step === "confirm-reset" ? (
          <div className="flex max-w-sm flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Reset demo data?</h2>
            <p className="text-text-primary">
              This clears every committed appointment made in this browser. It cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button intent="secondary" onClick={() => setStep("edit")}>
                Cancel
              </Button>
              <Button intent="destructive" onClick={handleResetDemoData}>
                Reset demo data
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex max-w-md flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Scenarios</h2>
            {isMutating ? (
              <StatusMessage intent="warning">
                A booking action is in progress — structural switching is disabled until it finishes.
              </StatusMessage>
            ) : null}

            <fieldset className="flex flex-col gap-2" disabled={isMutating}>
              <legend className="text-sm font-medium text-text-primary">Preset</legend>
              <RadioGroup
                name="scenario-preset"
                value={presetId}
                options={PRESET_OPTIONS}
                onValueChange={(value) => {
                  const next = value as ScenarioConfig["presetId"];
                  setPresetId(next);
                  setOverrides(DEFAULT_OVERRIDES_BY_PRESET[next]);
                }}
              />
              <p className="text-sm text-text-muted">{SCENARIO_PRESET_DESCRIPTIONS[presetId]}</p>
            </fieldset>

            <div className={isMutating ? "pointer-events-none opacity-50" : ""}>
              <Select
                aria-label="Discovery"
                value={overrides.discoveryMode}
                options={DISCOVERY_OPTIONS}
                onValueChange={(value) =>
                  setOverrides((prev) => ({ ...prev, discoveryMode: value as ScenarioOverridesInput["discoveryMode"] }))
                }
              />
            </div>

            {!isStaffPreset ? (
              <div className={isMutating ? "pointer-events-none opacity-50" : ""}>
                <Select
                  aria-label="Patient booking access"
                  value={overrides.requireSignInToBook ? "require" : "allow"}
                  options={GUEST_POLICY_OPTIONS}
                  onValueChange={(value) =>
                    setOverrides((prev) => ({ ...prev, requireSignInToBook: value === "require" }))
                  }
                />
              </div>
            ) : null}

            <div className={isMutating ? "pointer-events-none opacity-50" : ""}>
              <Select
                aria-label="Data scenario"
                value={overrides.dataScenario}
                options={DATA_SCENARIO_OPTIONS}
                onValueChange={(value) =>
                  setOverrides((prev) => ({ ...prev, dataScenario: value as ScenarioOverridesInput["dataScenario"] }))
                }
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <Button intent="secondary" size="sm" onClick={() => setStep("confirm-reset")} disabled={isMutating}>
                Reset demo data
              </Button>
              <div className="flex gap-2">
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => {
                    hidePreparation();
                    setOpen(false);
                  }}
                >
                  Hide preparation controls
                </Button>
                <Button size="sm" onClick={handleApplyClick} disabled={isMutating}>
                  Apply scenario
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
