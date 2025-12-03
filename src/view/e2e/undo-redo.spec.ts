import { expect, test } from "@playwright/test";

import { clearAllCommands, createTestCommands } from "./helpers/test-helpers";

const TOAST_TIMEOUT = 5000;

const TEST_COMMAND = {
  command: "npm test",
  name: "Test",
};

test.describe("Undo/Redo Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllCommands(page);
  });

  test("should undo with Ctrl+Z keyboard shortcut", async ({ page }) => {
    // Given: Add a command
    const commandCards = page.locator('[data-testid="command-card"]');
    await createTestCommands(page, [TEST_COMMAND]);
    expect(await commandCards.count()).toBe(1);

    // When: Press Ctrl+Z
    await page.keyboard.press("Control+z");

    // Then: Command should be removed
    expect(await commandCards.count()).toBe(0);
  });

  test("should redo with Ctrl+Shift+Z keyboard shortcut", async ({ page }) => {
    // Given: Add and undo a command
    const commandCards = page.locator('[data-testid="command-card"]');
    await createTestCommands(page, [TEST_COMMAND]);
    await page.keyboard.press("Control+z");
    expect(await commandCards.count()).toBe(0);

    // When: Press Ctrl+Shift+Z
    await page.keyboard.press("Control+Shift+z");

    // Then: Command should be restored
    expect(await commandCards.count()).toBe(1);
  });

  test("should redo with Ctrl+Y keyboard shortcut", async ({ page }) => {
    // Given: Add and undo a command
    const commandCards = page.locator('[data-testid="command-card"]');
    await createTestCommands(page, [TEST_COMMAND]);
    await page.keyboard.press("Control+z");
    expect(await commandCards.count()).toBe(0);

    // When: Press Ctrl+Y
    await page.keyboard.press("Control+y");

    // Then: Command should be restored
    expect(await commandCards.count()).toBe(1);
  });

  test("should undo command deletion", async ({ page }) => {
    // Given: Add a command
    const commandCards = page.locator('[data-testid="command-card"]');
    await createTestCommands(page, [TEST_COMMAND]);
    expect(await commandCards.count()).toBe(1);

    // When: Delete the command
    const deleteButton = commandCards.first().getByRole("button", { name: /delete/i });
    await deleteButton.click();
    await page.getByRole("button", { name: /delete/i }).click();

    // Wait for deletion to complete
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "hidden", timeout: TOAST_TIMEOUT });
    expect(await commandCards.count()).toBe(0);

    // And: Undo with keyboard shortcut
    await page.keyboard.press("Control+z");

    // Then: Command should be restored
    expect(await commandCards.count()).toBe(1);
  });

  test("should undo command modification", async ({ page }) => {
    // Given: Add a command
    const commandCards = page.locator('[data-testid="command-card"]');
    await createTestCommands(page, [TEST_COMMAND]);

    // When: Edit the command
    const editButton = commandCards.first().getByRole("button", { name: /edit/i });
    await editButton.click();

    const newName = "Modified Test";
    await page.getByLabel(/command name/i).fill(newName);
    await page.getByRole("button", { name: /save/i }).click();

    // Verify modification
    await expect(
      commandCards.first().getByTestId("command-name").getByText(newName)
    ).toBeVisible();

    // And: Undo with keyboard shortcut
    await page.keyboard.press("Control+z");

    // Then: Original name should be restored
    await expect(
      commandCards.first().getByTestId("command-name").getByText(TEST_COMMAND.name)
    ).toBeVisible();
  });
});
