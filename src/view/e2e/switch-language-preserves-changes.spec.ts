import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  clearAllCommands,
  fillCommandForm,
  openAddCommandDialog,
  saveCommandDialog,
  COMMAND_CARD_SELECTOR,
} from "./helpers/test-helpers";

/**
 * Open language dropdown menu
 * Handles both English ("Change language") and Korean ("언어 변경") labels
 */
const openLanguageMenu = async (page: Page) => {
  const languageButton = page.getByRole("button", { name: /change language|언어 변경/i });
  await languageButton.click();
};

/**
 * Select language from dropdown
 */
const selectLanguage = async (page: Page, language: "English" | "한국어") => {
  await openLanguageMenu(page);
  await page.getByRole("menuitem", { name: language }).click();
};

/**
 * Get current language by checking the header title
 */
const isEnglish = async (page: Page): Promise<boolean> => {
  const title = page.getByRole("heading", { level: 1 });
  const text = await title.textContent();
  return text === "Commands Configuration";
};

test.describe("Language Switch Preserves Unsaved Changes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Clear localStorage to reset language state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Clear existing commands for clean test state
    await clearAllCommands(page);
  });

  test("should preserve unsaved command after language switch", async ({ page }) => {
    // Given: Add a new command but don't apply changes
    await openAddCommandDialog(page);
    await fillCommandForm(page, {
      name: "Test Command",
      command: "echo test",
    });
    await saveCommandDialog(page);

    // Verify command is added to the list
    const commandCard = page.locator(COMMAND_CARD_SELECTOR, { hasText: "Test Command" });
    await expect(commandCard).toBeVisible();

    // When: Switch language
    const wasEnglish = await isEnglish(page);
    if (wasEnglish) {
      await selectLanguage(page, "한국어");
    } else {
      await selectLanguage(page, "English");
    }

    // Wait for language change to take effect
    await page.waitForTimeout(500);

    // Then: Command should still be visible (unsaved changes preserved)
    await expect(commandCard).toBeVisible();
    await expect(commandCard).toContainText("Test Command");
    await expect(commandCard).toContainText("echo test");
  });

  test("should preserve multiple unsaved commands after language switch", async ({ page }) => {
    // Given: Add multiple commands without applying changes
    const testCommands = [
      { name: "Command One", command: "echo one" },
      { name: "Command Two", command: "echo two" },
      { name: "Command Three", command: "echo three" },
    ];

    for (const cmd of testCommands) {
      await openAddCommandDialog(page);
      await fillCommandForm(page, cmd);
      await saveCommandDialog(page);
    }

    // Verify all commands are visible
    for (const cmd of testCommands) {
      const card = page.locator(COMMAND_CARD_SELECTOR, { hasText: cmd.name });
      await expect(card).toBeVisible();
    }

    // When: Switch language multiple times
    await selectLanguage(page, "한국어");
    await page.waitForTimeout(300);
    await selectLanguage(page, "English");
    await page.waitForTimeout(300);

    // Then: All commands should still be visible
    for (const cmd of testCommands) {
      const card = page.locator(COMMAND_CARD_SELECTOR, { hasText: cmd.name });
      await expect(card).toBeVisible();
    }
  });

  test("should preserve edited command after language switch", async ({ page }) => {
    // Given: Add a command
    await openAddCommandDialog(page);
    await fillCommandForm(page, {
      name: "Original Name",
      command: "echo original",
    });
    await saveCommandDialog(page);

    // Edit the command (creates unsaved state)
    const editButton = page.getByRole("button", { name: /edit command|명령 편집/i }).first();
    await editButton.click();

    await page.getByLabel(/command name/i).fill("Modified Name");
    await page.getByRole("button", { name: /save|저장/i }).click();

    // Verify edit is reflected
    const modifiedCard = page.locator(COMMAND_CARD_SELECTOR, { hasText: "Modified Name" });
    await expect(modifiedCard).toBeVisible();

    // When: Switch language
    await selectLanguage(page, "한국어");
    await page.waitForTimeout(300);

    // Then: Modified command should still be visible (unsaved edit preserved)
    await expect(modifiedCard).toBeVisible();
    await expect(modifiedCard).toContainText("Modified Name");
  });

  test("should preserve command order after language switch", async ({ page }) => {
    // Given: Add commands in specific order
    const commands = ["First", "Second", "Third"];

    for (const name of commands) {
      await openAddCommandDialog(page);
      await fillCommandForm(page, {
        name,
        command: `echo ${name.toLowerCase()}`,
      });
      await saveCommandDialog(page);
    }

    // Verify initial order
    const cards = page.locator(COMMAND_CARD_SELECTOR);
    const initialCount = await cards.count();
    expect(initialCount).toBe(3);

    // When: Switch language
    await selectLanguage(page, "한국어");
    await page.waitForTimeout(300);

    // Then: Order should be preserved
    const finalCount = await cards.count();
    expect(finalCount).toBe(3);

    const firstCard = cards.nth(0);
    const secondCard = cards.nth(1);
    const thirdCard = cards.nth(2);

    await expect(firstCard).toContainText("First");
    await expect(secondCard).toContainText("Second");
    await expect(thirdCard).toContainText("Third");
  });

  test("should preserve unsaved changes through multiple rapid language switches", async ({
    page,
  }) => {
    // Given: Add a command
    await openAddCommandDialog(page);
    await fillCommandForm(page, {
      name: "Persistent Command",
      command: "echo persistent",
    });
    await saveCommandDialog(page);

    const commandCard = page.locator(COMMAND_CARD_SELECTOR, { hasText: "Persistent Command" });
    await expect(commandCard).toBeVisible();

    // When: Rapidly switch languages multiple times
    for (let i = 0; i < 5; i++) {
      await selectLanguage(page, "한국어");
      await page.waitForTimeout(100);
      await selectLanguage(page, "English");
      await page.waitForTimeout(100);
    }

    // Then: Command should still be visible
    await expect(commandCard).toBeVisible();
    await expect(commandCard).toContainText("Persistent Command");
  });
});
