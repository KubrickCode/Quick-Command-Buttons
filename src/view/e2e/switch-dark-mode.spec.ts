import { expect, test } from "@playwright/test";

test.describe("Test 14: Switch Dark Mode", () => {
  test("should toggle between dark and light mode", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Verify initial state (light mode)
    const darkModeButton = page.getByRole("button", { name: "Switch to dark mode" });
    await expect(darkModeButton).toBeVisible();

    // When: Click to switch to dark mode
    await darkModeButton.click();

    // Then: Verify button changes to "Switch to light mode"
    const lightModeButton = page.getByRole("button", { name: "Switch to light mode" });
    await expect(lightModeButton).toBeVisible();
    await expect(darkModeButton).not.toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: "test-results/dark-mode.png" });

    // When: Click to switch back to light mode
    await lightModeButton.click();

    // Then: Verify button changes back to "Switch to dark mode"
    await expect(darkModeButton).toBeVisible();
    await expect(lightModeButton).not.toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: "test-results/light-mode.png" });
  });
});
