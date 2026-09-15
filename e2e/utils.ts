import type { Page } from "@playwright/test";

export type PresetName = "New patient" | "Returning patient" | "Staff booking" | "Sign-in required";
export type DataScenarioName =
  | "Normal"
  | "No matching availability"
  | "Slot taken on submit"
  | "Network failure once"
  | "Slow response";

/** Drives the real Scenarios drawer UI — the same path a person would use, not a store shortcut. */
export async function applyScenario(
  page: Page,
  options: { preset: PresetName; dataScenario?: DataScenarioName; discoveryMode?: "Choose a provider" | "Earliest available" },
) {
  await page.getByRole("button", { name: "Scenarios" }).click();
  await page.getByRole("radio", { name: options.preset }).click();
  if (options.discoveryMode) {
    await selectCustomOption(page, "Discovery", options.discoveryMode);
  }
  if (options.dataScenario) {
    await selectCustomOption(page, "Data scenario", options.dataScenario);
  }
  const applyButton = page.getByRole("button", { name: "Apply scenario" });
  await applyButton.click();
  // A pre-existing draft triggers a discard confirmation; apply through it if shown.
  const discardButton = page.getByRole("button", { name: "Discard draft and apply" });
  if (await discardButton.isVisible().catch(() => false)) {
    await discardButton.click();
  }
}

/** ds-select is a custom combobox/listbox, not a native <select> — open it, then click the option. */
async function selectCustomOption(page: Page, comboboxName: string, optionLabel: string) {
  await page.getByRole("combobox", { name: comboboxName }).click();
  await page.getByRole("option", { name: optionLabel, exact: true }).click();
}

/** Time-slot picks are plain buttons labeled with a clock time — distinguishes them from the
 *  page's other buttons ("Back to providers", "Refresh availability", "Continue", etc.). */
export function slotTimeButtons(page: Page) {
  return page.getByRole("button", { name: /\d{1,2}:\d{2}\s*(AM|PM)/ });
}
