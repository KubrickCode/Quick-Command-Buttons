import { expect, test } from "@playwright/test";

test.describe("Test H7: Duplicate Shortcut - Root Level", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should show validation error when creating command with existing root shortcut", async ({
    page,
  }) => {
    // Click Add button to open new command dialog
    await page.getByRole("button", { name: "Add" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // Fill command name
    await page.getByPlaceholder(/Terminal, Build, Deploy/).fill("New Command");

    // Fill command
    await page.getByPlaceholder(/npm start/).fill("echo test");

    // Enter shortcut "g" which is already used by Git group
    await page.getByPlaceholder(/e\.g\., t/).fill("g");

    // Click Save
    await page.getByRole("button", { name: "Save" }).click();

    // Verify validation error for root level duplicate
    await expect(
      page.getByText(/this shortcut is already used by another command at the root level/i)
    ).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show validation error for case-insensitive root level duplicate", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    await page.getByPlaceholder(/Terminal, Build, Deploy/).fill("New Command");
    await page.getByPlaceholder(/npm start/).fill("echo test");

    // Enter "G" (uppercase) - should conflict with "g" (Git)
    await page.getByPlaceholder(/e\.g\., t/).fill("G");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText(/this shortcut is already used by another command at the root level/i)
    ).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("should allow saving with unique root level shortcut", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    await page.getByPlaceholder(/Terminal, Build, Deploy/).fill("New Command");
    await page.getByPlaceholder(/npm start/).fill("echo test");

    // Enter "x" which is not used
    await page.getByPlaceholder(/e\.g\., t/).fill("x");

    await page.getByRole("button", { name: "Save" }).click();

    // Dialog should close (save succeeded)
    await expect(dialog).not.toBeVisible();
  });

  test("should allow editing command to keep its own shortcut", async ({ page }) => {
    // Edit existing Git command
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Shortcut should already be "g"
    const shortcutInput = dialog.getByPlaceholder(/e\.g\., t/);
    await expect(shortcutInput).toHaveValue("g");

    // Save without changing - should succeed (not a duplicate of itself)
    await page.getByRole("button", { name: "Save" }).click();

    await expect(dialog).not.toBeVisible();
  });

  test("should show error when editing command to use another root shortcut", async ({
    page,
  }) => {
    // Edit Test command (shortcut: "t")
    await page.getByRole("button", { name: /Edit command.*Test/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Change shortcut to "g" (used by Git)
    const shortcutInput = dialog.getByPlaceholder(/e\.g\., t/);
    await shortcutInput.clear();
    await shortcutInput.fill("g");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText(/this shortcut is already used by another command at the root level/i)
    ).toBeVisible();
    await expect(dialog).toBeVisible();
  });
});
