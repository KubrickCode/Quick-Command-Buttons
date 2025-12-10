import { expect, test } from "@playwright/test";

test.describe("Test H6: Duplicate Shortcut - Within Group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should show validation error when entering duplicate shortcut within group", async ({
    page,
  }) => {
    // Open Git group edit dialog
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Get shortcut inputs within group
    // Pull has shortcut "l", Push has "p"
    const shortcutInputs = dialog.getByRole("textbox", {
      name: "Shortcut (optional)",
    });

    // Change Push shortcut to "l" (same as Pull)
    // First shortcut is for Pull, second is for Push
    await shortcutInputs.nth(1).clear();
    await shortcutInputs.nth(1).fill("l");

    // Click Save
    await page.getByRole("button", { name: "Save" }).click();

    // Verify validation error is shown for duplicate shortcut
    await expect(page.getByText(/duplicate shortcuts found in group/i)).toBeVisible();

    // Dialog should remain open (validation blocks save)
    await expect(dialog).toBeVisible();
  });

  test("should show validation error for case-insensitive duplicate shortcuts", async ({
    page,
  }) => {
    // Open Git group edit dialog
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Get shortcut inputs within group
    const shortcutInputs = dialog.getByRole("textbox", {
      name: "Shortcut (optional)",
    });

    // Change Push shortcut to "L" (uppercase, same as Pull's "l")
    await shortcutInputs.nth(1).clear();
    await shortcutInputs.nth(1).fill("L");

    // Click Save
    await page.getByRole("button", { name: "Save" }).click();

    // Verify validation error is shown (case-insensitive check)
    await expect(page.getByText(/duplicate shortcuts found in group/i)).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should have different shortcuts for child commands in Git group", async ({
    page,
  }) => {
    // Open Git group edit dialog
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Verify initial shortcuts are different
    const pullShortcut = dialog.locator('input[value="l"]').first();
    const pushShortcut = dialog.locator('input[value="p"]');
    const checkStatusShortcut = dialog.locator('input[value="c"]');

    await expect(pullShortcut).toBeVisible();
    await expect(pushShortcut).toBeVisible();
    await expect(checkStatusShortcut).toBeVisible();
  });

  test("should allow saving when duplicate shortcut is fixed", async ({ page }) => {
    // Open Git group edit dialog
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Get shortcut inputs within group
    const shortcutInputs = dialog.getByRole("textbox", {
      name: "Shortcut (optional)",
    });

    // Create duplicate shortcut
    await shortcutInputs.nth(1).clear();
    await shortcutInputs.nth(1).fill("l");

    // Try to save - should fail
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/duplicate shortcuts found in group/i)).toBeVisible();

    // Fix the duplicate by using a unique shortcut
    await shortcutInputs.nth(1).clear();
    await shortcutInputs.nth(1).fill("x");

    // Now save should succeed
    await page.getByRole("button", { name: "Save" }).click();

    // Dialog should close (save succeeded)
    await expect(dialog).not.toBeVisible();
  });
});
