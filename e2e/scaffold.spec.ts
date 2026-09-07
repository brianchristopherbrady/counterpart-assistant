import { test, expect } from "@playwright/test";

test("scaffold home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to Care Booking" })).toBeVisible();
});
