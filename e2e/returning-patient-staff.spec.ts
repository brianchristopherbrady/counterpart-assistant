import { test, expect } from "@playwright/test";
import { applyScenario } from "./utils";

test.describe("Returning-patient prefill and staff actor/subject (Behavior 3)", () => {
  test("returning patient starts signed in with prefilled details and a suggested provider", async ({ page }) => {
    await page.goto("/book");
    await applyScenario(page, { preset: "Returning patient" });

    // No guest identity form — the usual-provider suggestion implies the subject is already known.
    await expect(page.getByText(/usual provider/)).toBeVisible();
    await page.getByRole("button", { name: "Book with them" }).click();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Straight to review — Jordan Blake's fixture identity, no GuestDetailsForm in between.
    await expect(page.getByText("Jordan Blake (1988-04-12)")).toBeVisible();
    await expect(page.getByText("jordan.blake@example.com")).toBeVisible();
  });

  test("staff booking records the acting staff member distinct from the patient subject", async ({ page }) => {
    await page.goto("/book");
    await applyScenario(page, { preset: "Staff booking" });

    await page.getByRole("textbox", { name: /Search by name or reference/ }).fill("Jordan");
    await page.getByText("Jordan Blake").click();

    await expect(page.getByText("Booking for Jordan Blake (1988-04-12)")).toBeVisible();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Review shows the patient subject, not the staff actor, and skipped guest identity entirely.
    await expect(page.getByText("Jordan Blake (1988-04-12)")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();

    const referenceText = await page.getByText(/Confirmation reference/).textContent();
    const reference = referenceText?.match(/CB-[A-Z0-9]+/)?.[0];
    expect(reference).toBeTruthy();

    // Staff see the practice-wide list (by reference/provider/time), scoped to the acting staff
    // session rather than a single patient — the just-confirmed booking must appear in it.
    await page.getByRole("link", { name: "Appointments", exact: true }).click();
    await expect(page.getByText(reference!)).toBeVisible();
  });
});
