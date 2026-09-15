import { test, expect } from "@playwright/test";
import { slotTimeButtons } from "./utils";

test.describe("Guest new-patient booking (Behavior 1)", () => {
  test("browses publicly, confirms a guest booking, and appointments stay session-scoped", async ({
    page,
    browser,
  }) => {
    await page.goto("/book");

    await expect(page.getByRole("heading", { name: "Book care" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Select" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Select" }).first().click();
    await slotTimeButtons(page).first().click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("textbox", { name: "Full name" }).fill("Casey Guest");
    await page.getByRole("textbox", { name: "Date of birth" }).fill("1993-03-03");
    await page.getByRole("textbox", { name: "Email address" }).fill("casey.guest@example.com");
    await page.getByRole("button", { name: "Continue to review" }).click();

    await expect(page.getByText("Casey Guest (1993-03-03)")).toBeVisible();
    await page.getByRole("button", { name: "Confirm booking" }).click();

    await expect(page.getByRole("heading", { name: "Booking confirmed" })).toBeVisible();
    const referenceText = await page.getByText(/Confirmation reference/).textContent();
    const reference = referenceText?.match(/CB-[A-Z0-9]+/)?.[0];
    expect(reference).toBeTruthy();

    await page.getByRole("link", { name: "Appointments" }).click();
    await expect(page.getByText(reference!)).toBeVisible();

    // A different browsing session (fresh sessionStorage) must not see this guest's booking.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await otherPage.goto("/appointments");
    await expect(otherPage.getByText("No upcoming appointments yet.")).toBeVisible();
    await expect(otherPage.getByText(reference!)).toHaveCount(0);
    await otherContext.close();
  });
});
