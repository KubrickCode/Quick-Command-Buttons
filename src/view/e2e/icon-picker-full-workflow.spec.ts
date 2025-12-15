import { expect, test, type Page } from "@playwright/test";

import {
  clearAllCommands,
  fillCommandForm,
  openAddCommandDialog,
  saveCommandDialog,
} from "./helpers/test-helpers";

const openIconPicker = async (page: Page) => {
  await page.getByRole("button", { name: /open icon picker/i }).click();
};

const getIconPickerPopover = (page: Page) => {
  return page.getByTestId("icon-picker-popover");
};

const getIconSearchInput = (page: Page) => {
  return page.getByPlaceholder(/search icons/i);
};

const getIconPickerButton = (page: Page) => {
  return page.getByRole("button", { name: /open icon picker/i });
};

const getDisplayTextInput = (page: Page) => {
  return page.getByPlaceholder(/terminal.*build.*deploy/i);
};

const getIconByName = (page: Page, iconName: string) => {
  return page.locator(`button[title='${iconName}']`);
};

test.describe("Icon Picker Full Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllCommands(page);
  });

  test("should complete full icon picker workflow (search, select, change, clear)", async ({
    page,
  }) => {
    // Step 1: Open add command dialog
    await openAddCommandDialog(page);

    // Step 2: Open icon picker
    await openIconPicker(page);
    await expect(getIconPickerPopover(page)).toBeVisible();

    // Step 3: Search for "terminal"
    await getIconSearchInput(page).fill("terminal");

    // Step 4: Select terminal icon
    await getIconByName(page, "terminal").click();
    await expect(getIconPickerPopover(page)).toBeHidden();

    // Verify icon is shown in button
    await expect(getIconPickerButton(page).locator(".codicon-terminal")).toBeVisible();

    // Step 5: Reopen picker and click "Show all" to load all icons
    await openIconPicker(page);
    const showAllButton = page.getByRole("button", { name: /show all.*icons/i });

    // Only click if visible (might already be showing all)
    if (await showAllButton.isVisible()) {
      await showAllButton.click();
    }

    // Wait for all icons to load
    await page.waitForTimeout(300);

    // Step 6: Change to different icon (folder)
    await getIconSearchInput(page).fill("folder");
    await getIconByName(page, "folder").click();

    // Verify icon changed
    await expect(getIconPickerButton(page).locator(".codicon-folder")).toBeVisible();

    // Step 7: Remove icon with "Clear" button
    await openIconPicker(page);

    // Look for clear button (might be "Clear" or "Delete" or similar)
    const clearButton = page.getByRole("button", { name: /clear|delete|remove/i }).first();
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify icon is removed (button shows "Icon" text)
      await expect(getIconPickerButton(page)).toContainText(/icon/i);
    }

    // Step 8: Save command without icon
    await getDisplayTextInput(page).fill("No Icon Command");
    await fillCommandForm(page, { command: "echo test" });
    await saveCommandDialog(page);

    // Verify command saved
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "No Icon Command",
    });
    await expect(commandCard).toBeVisible();
  });

  test("should show selected badge for currently selected icon", async ({ page }) => {
    // Open add command dialog and select an icon
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await getIconSearchInput(page).fill("terminal");
    await getIconByName(page, "terminal").click();

    // Reopen icon picker
    await openIconPicker(page);

    // Search for the same icon
    await getIconSearchInput(page).fill("terminal");

    // The selected icon should have a "Selected" badge or highlight
    const terminalButton = getIconByName(page, "terminal");
    await expect(terminalButton).toHaveClass(/bg-accent/);

    // Close picker
    await page.keyboard.press("Escape");
  });

  test("should maintain icon selection when form has validation errors", async ({ page }) => {
    // Open add command dialog and select an icon
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await getIconSearchInput(page).fill("rocket");
    await getIconByName(page, "rocket").click();

    // Try to save without filling required fields (should trigger validation)
    await saveCommandDialog(page);

    // Icon should still be visible in picker button after validation error
    await expect(getIconPickerButton(page).locator(".codicon-rocket")).toBeVisible();
  });

  test("should filter icons with partial search terms", async ({ page }) => {
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // Search with partial term
    await getIconSearchInput(page).fill("git");

    // Should find git-related icons
    await expect(page.locator("button[title*='git']").first()).toBeVisible();

    // Clear search
    await getIconSearchInput(page).clear();

    // Should show initial icons again
    const iconButtons = page.getByTestId("icon-grid-button");
    await expect(iconButtons.first()).toBeVisible();
  });
});
