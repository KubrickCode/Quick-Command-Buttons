import { expect, test } from "@playwright/test";

const SELECTORS = {
  ADD_BUTTON: "Add new command",
  CLOSE_BUTTON: "Close",
  COMMAND_CARD: '[data-testid="command-card"]',
  COMMAND_NAME_INPUT: "Command Name",
  COMMAND_NAME_PLACEHOLDER: "Command name",
  COMMAND_PLACEHOLDER: "Command (e.g., npm start)",
  COMMANDS_SUFFIX: " commands",
  EDIT_BUTTON_REGEX: /Edit command/,
  GROUP_COMMAND_ITEM: '[data-testid="group-command-item"]',
  GROUP_COMMANDS_RADIO: "Group Commands",
  GROUP_SHORTCUT_PLACEHOLDER: "e.g., t",
  SAVE_BUTTON: "Save",
  SHORTCUT_PLACEHOLDER: "Shortcut (optional)",
} as const;

const NEW_GROUP = {
  children: [
    {
      command: "npm start",
      displayName: "Start",
      name: "$(play) Start",
      shortcut: "a",
    },
    {
      command: "npm run build",
      displayName: "Build",
      name: "$(tools) Build",
      shortcut: "b",
    },
  ],
  displayName: "NPM Scripts",
  name: "$(package) NPM Scripts",
  shortcut: "m",
};

test.describe("Add Group Command", () => {
  test("should add a new group command with multiple child commands", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Get initial count
    const commandCards = page.locator(SELECTORS.COMMAND_CARD);
    const initialCount = await commandCards.count();

    // When: Click Add button
    await page.getByRole("button", { name: SELECTORS.ADD_BUTTON }).click();

    // Fill group name
    await page.getByRole("textbox", { name: SELECTORS.COMMAND_NAME_INPUT }).fill(NEW_GROUP.name);

    // Change to Group Commands
    await page.getByRole("radio", { name: SELECTORS.GROUP_COMMANDS_RADIO }).click();

    // Add child commands using dialog scoping
    const dialog = page.getByRole("dialog");

    for (const child of NEW_GROUP.children) {
      await dialog.getByRole("button", { name: SELECTORS.ADD_BUTTON }).click();

      // Get all command items in dialog and target the last one (newly added)
      const commandItems = dialog.locator(SELECTORS.GROUP_COMMAND_ITEM);
      const newCommandItem = commandItems.last();

      await newCommandItem.getByPlaceholder(SELECTORS.COMMAND_NAME_PLACEHOLDER).fill(child.name);
      await newCommandItem.getByPlaceholder(SELECTORS.COMMAND_PLACEHOLDER).fill(child.command);
      await newCommandItem.getByPlaceholder(SELECTORS.SHORTCUT_PLACEHOLDER).fill(child.shortcut);
    }

    // Fill group shortcut
    await page.getByPlaceholder(SELECTORS.GROUP_SHORTCUT_PLACEHOLDER).fill(NEW_GROUP.shortcut);

    // Save the group
    await dialog.getByRole("button", { name: SELECTORS.SAVE_BUTTON }).click();

    // Then: Verify the group was added to the list
    const newGroupCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: NEW_GROUP.displayName,
    });
    await expect(newGroupCard.getByText(NEW_GROUP.displayName, { exact: true })).toBeVisible();

    // Verify group displays command count
    await expect(
      newGroupCard.getByText(`${NEW_GROUP.children.length}${SELECTORS.COMMANDS_SUFFIX}`)
    ).toBeVisible();

    // Verify shortcut badge
    await expect(newGroupCard.getByText(NEW_GROUP.shortcut, { exact: true })).toBeVisible();

    // Verify the command card count increased by 1
    const finalCount = await commandCards.count();
    expect(finalCount).toBe(initialCount + 1);

    // Verify child commands by opening edit dialog
    await newGroupCard.getByRole("button", { name: SELECTORS.EDIT_BUTTON_REGEX }).click();

    const editDialog = page.getByRole("dialog");
    const editCommandItems = editDialog.locator(SELECTORS.GROUP_COMMAND_ITEM);

    // Verify child commands
    for (const [index, child] of NEW_GROUP.children.entries()) {
      const commandItem = editCommandItems.nth(index);
      await expect(commandItem.getByPlaceholder(SELECTORS.COMMAND_NAME_PLACEHOLDER)).toHaveValue(
        child.name
      );
      await expect(commandItem.getByPlaceholder(SELECTORS.COMMAND_PLACEHOLDER)).toHaveValue(
        child.command
      );
    }

    // Close dialog
    await editDialog.getByRole("button", { name: SELECTORS.CLOSE_BUTTON }).click();
  });
});
