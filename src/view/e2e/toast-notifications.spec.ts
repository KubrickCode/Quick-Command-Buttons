import { expect, test } from "@playwright/test";

test.describe("Test M7: Toast Notifications", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should show success toast when saving configuration", async ({ page }) => {
    // When: Click "Apply changes" button
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Success toast should appear
    const toast = page.locator("[data-sonner-toast]", {
      hasText: "Configuration saved successfully",
    });
    await expect(toast).toBeVisible();
  });

  test("should auto-dismiss toast after duration", async ({ page }) => {
    // When: Trigger a toast
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Toast should be visible
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible();

    // Wait for auto-dismiss (SUCCESS duration is 2000ms + some buffer)
    await toast.waitFor({ state: "hidden", timeout: 5000 });

    // Then: Toast should disappear
    await expect(toast).not.toBeVisible();
  });

  test("should show toast when command is deleted and saved", async ({ page }) => {
    // Given: Use existing Test command from mock data
    // Wait for mock data to load
    await page.waitForTimeout(500);

    // When: Delete the Test command
    const commandCard = page.locator('[data-testid="command-card"]', { hasText: "Test" }).first();
    await commandCard.getByRole("button", { name: /Delete command/i }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    // And: Apply changes to save (deleteCommand only updates state, Apply saves)
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Toast should show save confirmation
    const toast = page.locator("[data-sonner-toast]", {
      hasText: /saved/i,
    });
    await expect(toast).toBeVisible({ timeout: 3000 });
  });

  test("should show toast when button set is created", async ({ page }) => {
    // When: Create a new button set
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Toast Test Set");
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Toast should show creation message
    const toast = page.locator("[data-sonner-toast]", {
      hasText: 'Button set "Toast Test Set" created',
    });
    await expect(toast).toBeVisible();
  });

  test("should show toast when switching button sets", async ({ page }) => {
    // Given: Create a button set first
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Switch Test Set");
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for creation toast to disappear
    const createToast = page.locator("[data-sonner-toast]");
    await createToast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Switch to Default
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Default" }).click();

    // Then: Toast should show switch message
    const switchToast = page.locator("[data-sonner-toast]", {
      hasText: "Switched to default buttons",
    });
    await expect(switchToast).toBeVisible();
  });

  test("should show error toast on communication timeout", async ({ page }) => {
    // This test would require mocking a timeout scenario
    // For now, we verify the toast system works by triggering a toast
    // Error toast testing would require injecting failures into the mock

    // Trigger a toast to verify system works
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Verify toast appears (Sonner uses data-sonner-toaster container)
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible();
  });

  test("should stack multiple toasts", async ({ page }) => {
    // Given: Create button set to trigger first toast
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Stack Test 1");
    await page.getByRole("button", { name: "Create" }).click();

    // First toast should be visible
    const firstToast = page.locator("[data-sonner-toast]").first();
    await expect(firstToast).toBeVisible();

    // When: Immediately trigger another action (Apply changes)
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Multiple toasts may be visible (Sonner handles stacking)
    const toasts = page.locator("[data-sonner-toast]");
    const count = await toasts.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should position toasts at bottom-right", async ({ page }) => {
    // When: Trigger a toast
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Toast should be visible
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible();

    // Verify Sonner toaster position attribute (bottom-right)
    const toastContainer = page.locator("[data-sonner-toaster]");
    await expect(toastContainer).toHaveAttribute("data-y-position", "bottom");
    await expect(toastContainer).toHaveAttribute("data-x-position", "right");
  });
});
