import { test, expect } from "@playwright/test";
import { applyScenario } from "./utils";

test.describe("Conflicting booking preserves details (Behavior 5)", () => {
  test("a slot-taken-on-submit conflict keeps entered details and offers current alternatives", async ({ page }) => {
    await page.goto("/book");
    await applyScenario(page, { dataScenario: "Slot taken on submit", preset: "New patient" });

    await page.getByRole("button", { name: "Select" }).first().click();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("textbox", { name: "Full name" }).fill("Riley Conflict");
    await page.getByRole("textbox", { name: "Date of birth" }).fill("1992-02-02");
    await page.getByRole("textbox", { name: "Email address" }).fill("riley.conflict@example.com");
    await page.getByRole("button", { name: "Continue to review" }).click();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(page.getByText("That time was just taken. Please choose another.")).toBeVisible();
    // Back at discovery — the provider stays selected and filters/details are preserved.
    await expect(page.getByRole("button", { name: "Selected" })).toBeVisible();

    // Re-opening the same provider's availability page to pick a different time.
    await page.getByRole("button", { name: "Selected" }).click();
    await page.getByRole("radio").nth(1).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // The guest details from before the conflict are still there — no re-entry required.
    await expect(page.getByText("Riley Conflict (1992-02-02)")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();
  });
});
