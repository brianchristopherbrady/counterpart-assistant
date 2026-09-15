import { test, expect } from "@playwright/test";
import { applyScenario, slotTimeButtons } from "./utils";

test.describe("Reschedule and cancel occupancy (Behavior 7)", () => {
  test("failed reschedule keeps the original; successful reschedule moves occupancy; cancel releases it", async ({
    page,
  }) => {
    await page.goto("/book");
    // Use the Returning-patient preset so re-applying a scenario mid-test (to inject a fault)
    // keeps the same persistent seeded identity — a guest preset would mint a fresh session
    // and the previously-booked appointment would fall out of view.
    await applyScenario(page, { preset: "Returning patient" });
    await page.getByRole("button", { name: "Book with them" }).click();
    await slotTimeButtons(page).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();

    await page.getByRole("link", { name: "Appointments", exact: true }).click();
    await applyScenario(page, { preset: "Returning patient", dataScenario: "Network failure once" });

    await page.getByRole("button", { name: "Reschedule" }).click();
    await page.getByRole("button", { name: "Select" }).first().click();
    await slotTimeButtons(page).nth(1).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Confirm reschedule" }).click();

    // The injected failure keeps the original appointment intact — still exactly one, unchanged.
    await expect(page.getByText(/Something went wrong confirming this reschedule/)).toBeVisible();
    await page.getByRole("button", { name: "Cancel reschedule" }).click();
    await expect(page.locator("li", { hasText: "Confirmed" })).toHaveCount(1);

    await page.getByRole("button", { name: "Reschedule" }).click();
    await page.getByRole("button", { name: "Select" }).first().click();
    await slotTimeButtons(page).nth(1).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Capture the new time being confirmed so we can wait for the appointments list to actually
    // reflect it below — the mock repository simulates real read latency, so the list can briefly
    // keep showing the pre-reschedule cached data while the background refetch is in flight.
    const reviewDateTimeText = (await page
      .locator("div", { hasText: "Date and time" })
      .last()
      .locator("dd")
      .textContent())!;
    const newSlotTime = reviewDateTimeText.replace(/\s*\([^)]+\)\s*$/, "").trim();

    await page.getByRole("button", { name: "Confirm reschedule" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();

    await page.getByRole("link", { name: "Appointments", exact: true }).click();
    const rows = page.locator("li", { hasText: "Confirmed" });
    await expect(rows).toHaveCount(1); // same appointment moved, not a duplicate
    await expect(rows.first()).toContainText(newSlotTime);

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Cancel this appointment?" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel appointment" }).click();
    await expect(page.getByText("No upcoming appointments yet.")).toBeVisible();
  });
});
