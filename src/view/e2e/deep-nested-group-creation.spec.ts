import { expect, test } from "@playwright/test";

import { openAddCommandDialog, saveCommandDialog } from "./helpers/test-helpers";

const SELECTORS = {
  ADD_COMMAND_BUTTON: "Add new command",
  ADD_GROUP_BUTTON: "Add new group",
  COMMAND_NAME_INPUT: "Command Name",
  COMMAND_NAME_PLACEHOLDER: "Command name",
  COMMAND_PLACEHOLDER: "Command (e.g., npm start)",
  GROUP_COMMAND_ITEM: '[data-testid="group-command-item"]',
  GROUP_COMMANDS_RADIO: "Group Commands",
  GROUP_NAME_PLACEHOLDER: "Group name",
  SAVE_BUTTON: "Save",
} as const;

test.describe("Deep Nested Group Creation (3+ levels)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create and manage 3-level nested groups", async ({ page }) => {
    // Step 1: Create a root group command
    await openAddCommandDialog(page);

    // Fill group name and switch to Group Commands type
    await page.getByRole("textbox", { name: SELECTORS.COMMAND_NAME_INPUT }).fill("Level 1 Group");
    await page.getByRole("radio", { name: SELECTORS.GROUP_COMMANDS_RADIO }).click();

    // Get the main dialog
    const mainDialog = page.getByRole("dialog", { name: /Add New Command/i });

    // Add a nested group at level 2
    await mainDialog.getByRole("button", { name: SELECTORS.ADD_GROUP_BUTTON }).click();

    // Find the newly added group item and fill its name
    const level2GroupItem = mainDialog.locator(SELECTORS.GROUP_COMMAND_ITEM).last();
    await level2GroupItem.getByPlaceholder(SELECTORS.GROUP_NAME_PLACEHOLDER).fill("Level 2 Group");

    // Click edit button to open Level 2 Group dialog
    const editLevel2Button = level2GroupItem.getByRole("button", { name: /edit/i });
    await editLevel2Button.click();

    // Get Level 2 dialog
    const level2Dialog = page.getByRole("dialog", { name: /Edit Group: Level 2 Group/i });
    await expect(level2Dialog).toBeVisible();

    // Add a nested group at level 3
    await level2Dialog.getByRole("button", { name: SELECTORS.ADD_GROUP_BUTTON }).click();

    // Find the newly added group item and fill its name
    const level3GroupItem = level2Dialog.locator(SELECTORS.GROUP_COMMAND_ITEM).last();
    await level3GroupItem.getByPlaceholder(SELECTORS.GROUP_NAME_PLACEHOLDER).fill("Level 3 Group");

    // Click edit button to open Level 3 Group dialog
    const editLevel3Button = level3GroupItem.getByRole("button", { name: /edit/i });
    await editLevel3Button.click();

    // Get Level 3 dialog
    const level3Dialog = page.getByRole("dialog", { name: /Edit Group: Level 3 Group/i });
    await expect(level3Dialog).toBeVisible();

    // Add a command at level 3
    await level3Dialog.getByRole("button", { name: SELECTORS.ADD_COMMAND_BUTTON }).click();

    // Fill the command in level 3
    const level3CommandItem = level3Dialog.locator(SELECTORS.GROUP_COMMAND_ITEM).last();
    await level3CommandItem.getByPlaceholder(SELECTORS.COMMAND_NAME_PLACEHOLDER).fill("Deep Command");
    await level3CommandItem
      .getByPlaceholder(SELECTORS.COMMAND_PLACEHOLDER)
      .fill("echo deep nested");

    // Save Level 3 dialog
    await level3Dialog.getByRole("button", { name: SELECTORS.SAVE_BUTTON }).click();
    await expect(level3Dialog).not.toBeVisible();

    // Save Level 2 dialog
    await level2Dialog.getByRole("button", { name: SELECTORS.SAVE_BUTTON }).click();
    await expect(level2Dialog).not.toBeVisible();

    // Save main dialog
    await saveCommandDialog(page);

    // Verify Level 1 Group was created with proper nested structure
    const level1Card = page.locator('[data-testid="command-card"]', { hasText: "Level 1 Group" });
    await expect(level1Card).toBeVisible();

    // The card should show it has nested commands (displayed as "X commands")
    await expect(level1Card.getByText(/command/i)).toBeVisible();
  });

  test("dialog layers correctly stack at 3 levels", async ({ page }) => {
    // Create a root group command
    await openAddCommandDialog(page);

    // Fill group name and switch to Group Commands type
    await page.getByRole("textbox", { name: SELECTORS.COMMAND_NAME_INPUT }).fill("Stack Test");
    await page.getByRole("radio", { name: SELECTORS.GROUP_COMMANDS_RADIO }).click();

    const mainDialog = page.getByRole("dialog", { name: /Add New Command/i });

    // Add level 2 group
    await mainDialog.getByRole("button", { name: SELECTORS.ADD_GROUP_BUTTON }).click();
    const level2GroupItem = mainDialog.locator(SELECTORS.GROUP_COMMAND_ITEM).last();
    await level2GroupItem.getByPlaceholder(SELECTORS.GROUP_NAME_PLACEHOLDER).fill("L2");
    await level2GroupItem.getByRole("button", { name: /edit/i }).click();

    const level2Dialog = page.getByRole("dialog", { name: /Edit Group: L2/i });
    await expect(level2Dialog).toBeVisible();

    // Add level 3 group
    await level2Dialog.getByRole("button", { name: SELECTORS.ADD_GROUP_BUTTON }).click();
    const level3GroupItem = level2Dialog.locator(SELECTORS.GROUP_COMMAND_ITEM).last();
    await level3GroupItem.getByPlaceholder(SELECTORS.GROUP_NAME_PLACEHOLDER).fill("L3");
    await level3GroupItem.getByRole("button", { name: /edit/i }).click();

    const level3Dialog = page.getByRole("dialog", { name: /Edit Group: L3/i });
    await expect(level3Dialog).toBeVisible();

    // At this point we have 3 dialogs open
    // Verify all three dialogs exist (some may be overlapped but should be in DOM)
    await expect(mainDialog).toBeAttached();
    await expect(level2Dialog).toBeAttached();
    await expect(level3Dialog).toBeVisible(); // Top-most should be visible

    // Close level 3
    await level3Dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(level3Dialog).not.toBeVisible();

    // Level 2 should now be visible/interactive
    await expect(level2Dialog).toBeVisible();

    // Close level 2
    await level2Dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(level2Dialog).not.toBeVisible();

    // Main dialog should now be visible/interactive
    await expect(mainDialog).toBeVisible();

    // Close main dialog
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(mainDialog).not.toBeVisible();
  });
});
