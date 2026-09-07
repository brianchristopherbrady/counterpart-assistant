import { test, expect } from "@playwright/test";
import { applyScenario } from "./utils";

test.describe("Idempotent retry after a pre-commit failure (Behavior 6)", () => {
  test("a network-failure-once fault recovers on retry and creates exactly one appointment", async ({ page }) => {
    await page.goto("/book");
    await applyScenario(page, { dataScenario: "Network failure once", preset: "New patient" });

    await page.getByRole("button", { name: "Select" }).first().click();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("textbox", { name: "Full name" }).fill("Drew Retry");
    await page.getByRole("textbox", { name: "Date of birth" }).fill("1994-04-04");
    await page.getByRole("textbox", { name: "Email address" }).fill("drew.retry@example.com");
    await page.getByRole("button", { name: "Continue to review" }).click();

    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByText(/Something went wrong confirming this booking/)).toBeVisible();

    // Same idempotency key, same request — the retry replays through to a single success.
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();

    await page.getByRole("link", { name: "Appointments" }).click();
    await expect(page.getByText("Drew Retry")).toHaveCount(0); // AppointmentItem shows provider, not subject
    const rows = page.locator("li", { hasText: "Confirmed" });
    await expect(rows).toHaveCount(1);
  });
});
