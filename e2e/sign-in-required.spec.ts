import { test, expect } from "@playwright/test";
import { applyScenario } from "./utils";

test.describe("Sign-in-required late gate (Behavior 2)", () => {
  test("gates only the final submission, resumes the draft, and still validates on submit", async ({ page }) => {
    await page.goto("/book");
    await applyScenario(page, { preset: "Sign-in required" });

    // Browsing and discovery never require sign-in.
    await expect(page.getByRole("button", { name: "Select" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Select" }).first().click();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("textbox", { name: "Full name" }).fill("Morgan Late");
    await page.getByRole("textbox", { name: "Date of birth" }).fill("1991-11-11");
    await page.getByRole("textbox", { name: "Email address" }).fill("morgan.late@example.com");
    await page.getByRole("button", { name: "Continue to review" }).click();

    // The sign-in gate appears now, right before review — not before discovery.
    await expect(page.getByText(/Demo sign-in/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm booking" })).toHaveCount(0);

    await page.getByRole("button", { name: "Sign in and continue" }).click();

    // Draft resumed straight into review with the same details, final validation still required.
    await expect(page.getByText("Morgan Late (1991-11-11)")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();
  });
});
