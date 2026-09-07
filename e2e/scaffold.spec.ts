import { test, expect } from "@playwright/test";

test("scaffold home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Care Booking/i)).toBeVisible();
});
