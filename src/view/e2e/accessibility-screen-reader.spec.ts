import { expect, test } from "@playwright/test";

test.describe("Test N5: Accessibility - Screen Reader Announcements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have aria-live region for scope announcements", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify aria-live region exists with correct attributes
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');
    await expect(ariaLiveRegion).toBeVisible();

    // Verify initial scope announcement
    await expect(ariaLiveRegion).toContainText("workspace");
  });

  test("should announce scope change to Global", async ({ page }) => {
    // Given: Page is loaded with Workspace scope (default)

    // When: Switch to Global scope
    await page.getByRole("radio", { name: /Global scope/ }).click();

    // Then: Verify aria-live region announces the change
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');
    await expect(ariaLiveRegion).toContainText("global");
  });

  test("should announce scope change to Local", async ({ page }) => {
    // Given: Page is loaded with Workspace scope (default)

    // When: Switch to Local scope
    await page.getByRole("radio", { name: /Local scope/ }).click();

    // Then: Verify aria-live region announces the change
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');
    await expect(ariaLiveRegion).toContainText("local");
  });

  test("should announce scope change back to Workspace", async ({ page }) => {
    // Given: Page is loaded with Workspace scope (default)

    // When: Switch to Global then back to Workspace
    await page.getByRole("radio", { name: /Global scope/ }).click();
    await page.getByRole("radio", { name: /Workspace scope/ }).click();

    // Then: Verify aria-live region announces the change
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');
    await expect(ariaLiveRegion).toContainText("workspace");
  });

  test("should have visually hidden class for screen reader only", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify aria-live region has sr-only class (visually hidden)
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');
    await expect(ariaLiveRegion).toHaveClass(/sr-only/);
  });

  test("should update announcement when cycling through all scopes", async ({ page }) => {
    // Given: Page is loaded with Workspace scope (default)
    const ariaLiveRegion = page.locator('[aria-live="polite"][aria-atomic="true"]');

    // Then: Verify initial state
    await expect(ariaLiveRegion).toContainText("workspace");

    // When: Switch to Global
    await page.getByRole("radio", { name: /Global scope/ }).click();
    await expect(ariaLiveRegion).toContainText("global");

    // When: Switch to Local
    await page.getByRole("radio", { name: /Local scope/ }).click();
    await expect(ariaLiveRegion).toContainText("local");

    // When: Switch back to Workspace
    await page.getByRole("radio", { name: /Workspace scope/ }).click();
    await expect(ariaLiveRegion).toContainText("workspace");
  });

  test("should have proper ARIA labels on scope radio buttons", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify radio buttons have accessible names
    const globalRadio = page.getByRole("radio", { name: /Global scope/ });
    const workspaceRadio = page.getByRole("radio", { name: /Workspace scope/ });
    const localRadio = page.getByRole("radio", { name: /Local scope/ });

    await expect(globalRadio).toBeVisible();
    await expect(workspaceRadio).toBeVisible();
    await expect(localRadio).toBeVisible();

    // Verify radiogroup has accessible label
    const radioGroup = page.getByRole("radiogroup", { name: /Configuration scope/ });
    await expect(radioGroup).toBeVisible();
  });

  test("should have proper ARIA label on header banner", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify header has banner role and aria-label
    const header = page.getByRole("banner", { name: /Quick Command Buttons/ });
    await expect(header).toBeVisible();
  });
});
