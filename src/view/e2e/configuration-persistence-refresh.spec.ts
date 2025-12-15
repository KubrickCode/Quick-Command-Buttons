import { expect, test, type Page } from "@playwright/test";
import { fillCommandForm, saveCommandDialog, verifySuccessToast } from "./helpers/test-helpers";

const STORAGE_KEY_PREFIX = "vscode-mock";

const clearMockStorage = async (page: Page) => {
  await page.evaluate((prefix: string) => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  }, STORAGE_KEY_PREFIX);
};

test.describe("Configuration Persistence Across Page Refresh", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearMockStorage(page);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("should persist newly added command after page refresh", async ({ page }) => {
    // Given: Add a new command
    await page.getByRole("button", { name: /add/i }).first().click();
    await fillCommandForm(page, {
      name: "Refresh Test Command",
      command: "echo refresh-test",
      shortcut: "r",
    });
    await saveCommandDialog(page);

    // When: Apply changes and refresh
    await page.getByRole("button", { name: "Apply configuration changes" }).click();
    await verifySuccessToast(page, "Configuration saved successfully");
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Then: Command should still be visible
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "Refresh Test Command",
    });
    await expect(commandCard).toBeVisible();
    await expect(commandCard.locator("code")).toContainText("echo refresh-test");
  });

  test("should persist edited command after page refresh", async ({ page }) => {
    // Given: Add and save a command
    await page.getByRole("button", { name: /add/i }).first().click();
    await fillCommandForm(page, {
      name: "Edit Persist Test",
      command: "echo original",
    });
    await saveCommandDialog(page);
    await page.getByRole("button", { name: "Apply configuration changes" }).click();
    await verifySuccessToast(page, "Configuration saved successfully");

    // When: Edit the command
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "Edit Persist Test",
    });
    await commandCard.getByRole("button", { name: /edit command/i }).click();

    const commandInput = page.getByRole("textbox", { exact: true, name: "Command" });
    await commandInput.clear();
    await commandInput.fill("echo modified");
    await saveCommandDialog(page);

    // Apply and refresh
    await page.getByRole("button", { name: "Apply configuration changes" }).click();
    await verifySuccessToast(page, "Configuration saved successfully");
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Then: Modified command should be visible
    const modifiedCard = page.locator('[data-testid="command-card"]', {
      hasText: "Edit Persist Test",
    });
    await expect(modifiedCard).toBeVisible();
    await expect(modifiedCard.locator("code")).toContainText("echo modified");
  });

  test("should persist deleted command state after page refresh", async ({ page }) => {
    // Given: Add two commands
    await page.getByRole("button", { name: /add/i }).first().click();
    await fillCommandForm(page, { name: "Keep This", command: "echo keep" });
    await saveCommandDialog(page);

    await page.getByRole("button", { name: /add/i }).first().click();
    await fillCommandForm(page, { name: "Delete This", command: "echo delete" });
    await saveCommandDialog(page);

    await page.getByRole("button", { name: "Apply configuration changes" }).click();
    await verifySuccessToast(page, "Configuration saved successfully");

    // When: Delete one command
    const deleteCard = page.locator('[data-testid="command-card"]', {
      hasText: "Delete This",
    });
    await deleteCard.getByRole("button", { name: /delete command/i }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    await page.getByRole("button", { name: "Apply configuration changes" }).click();
    await verifySuccessToast(page, "Configuration saved successfully");
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Then: Only the kept command should be visible
    const keptCard = page.locator('[data-testid="command-card"]', {
      hasText: "Keep This",
    });
    await expect(keptCard).toBeVisible();

    const deletedCard = page.locator('[data-testid="command-card"]', {
      hasText: "Delete This",
    });
    await expect(deletedCard).not.toBeVisible();
  });

  test("should persist configuration scope selection after page refresh", async ({ page }) => {
    // Given: Switch to global scope
    await page.getByRole("radio", { name: /global/i }).click();
    await page.waitForTimeout(200);

    // When: Refresh the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Then: Global scope should still be selected
    const globalRadio = page.getByRole("radio", { name: /global/i });
    await expect(globalRadio).toBeChecked();
  });
});
