import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

const SELECTORS = {
  ADD_BUTTON: "Add new command",
  COMMAND_CARD: '[data-testid="command-card"]',
  COMMAND_NAME_PLACEHOLDER: "Command name",
  COMMAND_PLACEHOLDER: "Command (e.g., npm start)",
  EDIT_BUTTON_REGEX: /Edit command/,
  EDIT_CHECK_GROUP_BUTTON: "Edit group $(search) Check",
  EDIT_CHECK_GROUP_DIALOG: "Edit Group: $(search) Check Status",
  EDIT_COMMAND_DIALOG: "Edit Command",
  GIT_CARD_TEXT: "Git",
  GROUP_COMMAND_ITEM: '[data-testid="group-command-item"]',
  SAVE_BUTTON: "Save",
  SHORTCUT_PLACEHOLDER: "Shortcut (optional)",
} as const;

const NEW_NESTED_COMMAND = {
  command: "git branch -a",
  displayName: "Branches",
  name: "$(git-branch) Branches",
  shortcut: "b",
};

const verifyCommandItem = async (
  commandItem: Locator,
  expected: { command: string; name: string }
) => {
  await expect(commandItem.getByPlaceholder(SELECTORS.COMMAND_NAME_PLACEHOLDER)).toHaveValue(
    expected.name
  );
  await expect(commandItem.getByPlaceholder(SELECTORS.COMMAND_PLACEHOLDER)).toHaveValue(
    expected.command
  );
};

test.describe("Edit Nested Group Command", () => {
  test("should edit nested group and add a new command to it", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Edit Git group
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: SELECTORS.EDIT_BUTTON_REGEX }).click();

    // Click Edit button for Check Status nested group
    await page.getByRole("button", { name: SELECTORS.EDIT_CHECK_GROUP_BUTTON }).click();

    // Get nested dialog and add new command
    const nestedDialog = page.getByRole("dialog", {
      name: SELECTORS.EDIT_CHECK_GROUP_DIALOG,
    });
    await nestedDialog.getByRole("button", { name: SELECTORS.ADD_BUTTON }).click();

    // Get all command items in nested dialog and target the last one (newly added)
    const commandItems = nestedDialog.locator(SELECTORS.GROUP_COMMAND_ITEM);
    const newCommandItem = commandItems.last();

    // Fill new command data
    await newCommandItem
      .getByPlaceholder(SELECTORS.COMMAND_NAME_PLACEHOLDER)
      .fill(NEW_NESTED_COMMAND.name);
    await newCommandItem
      .getByPlaceholder(SELECTORS.COMMAND_PLACEHOLDER)
      .fill(NEW_NESTED_COMMAND.command);
    await newCommandItem
      .getByPlaceholder(SELECTORS.SHORTCUT_PLACEHOLDER)
      .fill(NEW_NESTED_COMMAND.shortcut);

    // Then: Verify the command was added in the nested dialog before saving
    await verifyCommandItem(newCommandItem, NEW_NESTED_COMMAND);

    // Save nested dialog
    await nestedDialog.getByRole("button", { name: SELECTORS.SAVE_BUTTON }).click();

    // Wait for nested dialog to close
    await expect(nestedDialog).not.toBeVisible();

    // Save parent dialog
    const parentDialog = page.getByRole("dialog", { name: SELECTORS.EDIT_COMMAND_DIALOG });
    await parentDialog.getByRole("button", { name: SELECTORS.SAVE_BUTTON }).click();

    // Wait for parent dialog to close
    await expect(parentDialog).not.toBeVisible();

    // Then: Verify the change was persisted by reopening the dialogs
    await gitCard.getByRole("button", { name: SELECTORS.EDIT_BUTTON_REGEX }).click();
    await page.getByRole("button", { name: SELECTORS.EDIT_CHECK_GROUP_BUTTON }).click();

    const reopenedDialog = page.getByRole("dialog", {
      name: SELECTORS.EDIT_CHECK_GROUP_DIALOG,
    });
    const reopenedCommandItems = reopenedDialog.locator(SELECTORS.GROUP_COMMAND_ITEM);
    const addedCommand = reopenedCommandItems.last();

    // Verify the new command exists and has correct values
    await verifyCommandItem(addedCommand, NEW_NESTED_COMMAND);
  });
});
