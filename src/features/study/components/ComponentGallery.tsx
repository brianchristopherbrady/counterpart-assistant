import { useState } from "react";
import { Button, Field, RadioGroup, Select, StatusMessage } from "@/design-system/react";

const ACCENTS: Record<string, string> = {
  Teal: "#0f766e",
  Blue: "#2563eb",
  Plum: "#7e22ce",
};

/** Kept out of the product flow — a live demonstration of token/density changes reaching real components. */
export function ComponentGallery() {
  const [accent, setAccent] = useState("Teal");
  const [compact, setCompact] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          Accent:
          <select
            className="rounded-md border border-border bg-surface-raised px-2 py-1"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          >
            {Object.keys(ACCENTS).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
          Compact density
        </label>
      </div>

      <div
        className={compact ? "cb-density-compact" : ""}
        style={{ ["--cb-action-primary-bg" as string]: ACCENTS[accent] }}
      >
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-page p-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button intent="secondary">Secondary</Button>
            <Button intent="destructive">Destructive</Button>
          </div>
          <Field label="Sample field" placeholder="Type here" />
          <RadioGroup
            name="gallery-demo"
            label="Sample choice"
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ]}
          />
          <Select aria-label="Sample select" options={[{ value: "x", label: "Choice X" }, { value: "y", label: "Choice Y" }]} />
          <StatusMessage intent="info">Sample status message.</StatusMessage>
        </div>
      </div>
      <p className="text-sm text-text-muted">
        Both controls only affect the demo above (via <code>--cb-action-primary-bg</code> and the{" "}
        <code>cb-density-compact</code> class from <code>tokens.css</code>) — they never touch the product flow.
      </p>
    </div>
  );
}
