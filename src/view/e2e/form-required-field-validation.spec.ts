import { expect, test } from "@playwright/test";

import { clearAllCommands } from "./helpers/test-helpers";

test.describe("Test C5: Form Required Field Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show validation error when command name is empty", async ({
    page,
  }) => {
    // When: Open add command dialog and click save without filling name
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // Ensure name field is empty
    const nameField = page.getByRole("textbox", { name: "Command Name" });
    await expect(nameField).toHaveValue("");

    // Click save without filling required field
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Validation error should be displayed
    await expect(page.getByText("Command name is required")).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show validation error when command field is empty for single command", async ({
    page,
  }) => {
    // Given: Open add command dialog
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // When: Fill name but leave command empty, then save
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Command validation error should be displayed
    await expect(page.getByText("Command is required")).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should clear validation error after valid input and re-submit", async ({
    page,
  }) => {
    // Given: Open dialog and trigger validation error
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("button", { name: "Save" }).click();

    const errorMessage = page.getByText("Command name is required");
    await expect(errorMessage).toBeVisible();

    // When: Fill all required fields and attempt save again
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test");
    await page.getByPlaceholder("e.g., npm start").fill("npm test");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Dialog should close (validation passed)
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).not.toBeVisible();
  });

  test("should allow save after filling all required fields", async ({
    page,
  }) => {
    // Given: Open dialog
    await page.getByRole("button", { name: "Add new command" }).click();

    // Trigger validation error first
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Command name is required")).toBeVisible();

    // When: Fill all required fields and save
    await page
      .getByRole("textbox", { name: "Command Name" })
      .fill("ValidCommand");
    await page.getByPlaceholder("e.g., npm start").fill("npm run build");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Dialog should close (form submitted successfully)
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).not.toBeVisible();
  });

  test("should show validation error when group mode selected but no commands added", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Given: Open add command dialog
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Empty Group");

    // When: Switch to group mode but don't add any commands
    await page.getByRole("radio", { name: "Group Commands" }).click();

    // Try to save without adding any child commands
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Save" }).click();

    // Then: Validation error should be displayed
    await expect(page.getByText("Group must have at least one command")).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show validation error for empty group child command fields", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Given: Open add command dialog and switch to group mode
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    // When: Add a child command but leave fields empty
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add new command" }).click();

    // Try to save without filling child command fields
    await dialog.getByRole("button", { name: "Save" }).click();

    // Then: Validation errors should be displayed for empty fields
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Command is required")).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show validation error in GroupEditDialog when commands are empty", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Create a group first
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add new command" }).click();

    const commandItem = dialog.locator('[data-testid="group-command-item"]').last();
    await commandItem.getByPlaceholder("Command name").fill("Child");
    await commandItem.getByPlaceholder("Command (e.g., npm start)").fill("npm test");

    await dialog.getByRole("button", { name: "Save" }).click();

    // Edit and add nested group
    const groupCard = page.locator('[data-testid="command-card"]', { hasText: "Test Group" });
    await groupCard.getByRole("button", { name: /Edit command/i }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Command" });
    await editDialog.getByRole("button", { name: "Add new group" }).click();

    // Fill nested group name and click Edit
    const nestedGroupItem = editDialog.locator('[data-testid="group-command-item"]').last();
    await nestedGroupItem.getByPlaceholder("Group name").fill("Nested Group");
    await nestedGroupItem.getByRole("button", { name: /Edit group/i }).click();

    // In nested dialog, try to save without adding commands
    const nestedDialog = page.getByRole("dialog", { name: /Edit Group/i });
    await expect(nestedDialog).toBeVisible();
    await nestedDialog.getByRole("button", { name: "Save" }).click();

    // Should show error about empty group
    await expect(
      nestedDialog.getByText("Group must have at least one command")
    ).toBeVisible();
    await expect(nestedDialog).toBeVisible();
  });

  test("should show validation error in GroupEditDialog when child has empty name", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Create a group first
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add new command" }).click();

    const commandItem = dialog.locator('[data-testid="group-command-item"]').last();
    await commandItem.getByPlaceholder("Command name").fill("Child");
    await commandItem.getByPlaceholder("Command (e.g., npm start)").fill("npm test");

    await dialog.getByRole("button", { name: "Save" }).click();

    // Edit and add nested group
    const groupCard = page.locator('[data-testid="command-card"]', { hasText: "Test Group" });
    await groupCard.getByRole("button", { name: /Edit command/i }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Command" });
    await editDialog.getByRole("button", { name: "Add new group" }).click();

    // Fill nested group name and click Edit
    const nestedGroupItem = editDialog.locator('[data-testid="group-command-item"]').last();
    await nestedGroupItem.getByPlaceholder("Group name").fill("Nested Group");
    await nestedGroupItem.getByRole("button", { name: /Edit group/i }).click();

    // In nested dialog, add a command but leave name empty
    const nestedDialog = page.getByRole("dialog", { name: /Edit Group/i });
    await nestedDialog.getByRole("button", { name: "Add new command" }).click();
    await nestedDialog.getByRole("button", { name: "Save" }).click();

    // Should show error about empty name
    await expect(
      nestedDialog.getByText("All items in group must have a name")
    ).toBeVisible();
  });

  test("should show validation error when GroupEditDialog group name is empty", async ({
    page,
  }) => {
    // Given: Create a group command first
    await clearAllCommands(page);
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add new command" }).click();

    const commandItem = dialog.locator('[data-testid="group-command-item"]').last();
    await commandItem.getByPlaceholder("Command name").fill("Child Command");
    await commandItem.getByPlaceholder("Command (e.g., npm start)").fill("npm test");

    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog).not.toBeVisible();

    // When: Edit the group and open nested group edit dialog
    const groupCard = page.locator('[data-testid="command-card"]', { hasText: "Test Group" });
    await groupCard.getByRole("button", { name: /Edit command/i }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Command" });

    // Add a nested group
    await editDialog.getByRole("button", { name: "Add new group" }).click();

    // Edit the newly added group (which has empty name)
    const nestedGroupItem = editDialog.locator('[data-testid="group-command-item"]').last();
    await nestedGroupItem.getByRole("button", { name: /Edit group/i }).click();

    // Then: GroupEditDialog should be visible
    const nestedDialog = page.getByRole("dialog", { name: /Edit Group/i });
    await expect(nestedDialog).toBeVisible();

    // When: Try to save with empty group name
    await nestedDialog.locator("#group-name").clear();
    await nestedDialog.getByRole("button", { name: "Save" }).click();

    // Then: Validation error should be displayed
    await expect(page.getByText("Group name is required")).toBeVisible();

    // Dialog should remain open
    await expect(nestedDialog).toBeVisible();
  });

  test("should show validation error when nested group has empty name", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Given: Create a group with a nested group that has empty name
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Parent Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");

    // Add a nested group (with empty name)
    await dialog.getByRole("button", { name: "Add new group" }).click();

    // Try to save - should fail because nested group has empty name
    await dialog.getByRole("button", { name: "Save" }).click();

    // Then: Should show error about name
    await expect(page.getByText("All items in group must have a name")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("should show validation error when nested group is empty", async ({
    page,
  }) => {
    await clearAllCommands(page);

    // Given: Create a group with a nested group that has no commands
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Parent Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");

    // Add a nested group with name but no commands
    await dialog.getByRole("button", { name: "Add new group" }).click();
    const nestedGroupItem = dialog.locator('[data-testid="group-command-item"]').last();
    await nestedGroupItem.getByPlaceholder("Group name").fill("Empty Nested Group");

    // Try to save - should fail because nested group has no commands
    await dialog.getByRole("button", { name: "Save" }).click();

    // Then: Should show error about nested group being empty
    await expect(page.getByText("Nested groups must have at least one command")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("should clear validation error when valid group name is entered", async ({
    page,
  }) => {
    // Given: Create a group command first
    await clearAllCommands(page);
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add new command" }).click();

    const commandItem = dialog.locator('[data-testid="group-command-item"]').last();
    await commandItem.getByPlaceholder("Command name").fill("Child");
    await commandItem.getByPlaceholder("Command (e.g., npm start)").fill("npm test");

    await dialog.getByRole("button", { name: "Save" }).click();

    // Edit and add nested group
    const groupCard = page.locator('[data-testid="command-card"]', { hasText: "Test Group" });
    await groupCard.getByRole("button", { name: /Edit command/i }).click();

    const editDialog = page.getByRole("dialog", { name: "Edit Command" });
    await editDialog.getByRole("button", { name: "Add new group" }).click();

    const nestedGroupItem = editDialog.locator('[data-testid="group-command-item"]').last();
    await nestedGroupItem.getByRole("button", { name: /Edit group/i }).click();

    const nestedDialog = page.getByRole("dialog", { name: /Edit Group/i });

    // Add a command to nested group first (so we can test name validation only)
    await nestedDialog.getByRole("button", { name: "Add new command" }).click();
    const nestedCommandItem = nestedDialog.locator('[data-testid="group-command-item"]').last();
    await nestedCommandItem.getByPlaceholder("Command name").fill("Nested Child");
    await nestedCommandItem.getByPlaceholder("Command (e.g., npm start)").fill("echo test");

    // Trigger validation error by clearing group name
    await nestedDialog.locator("#group-name").clear();
    await nestedDialog.getByRole("button", { name: "Save" }).click();
    await expect(nestedDialog.getByText("Group name is required")).toBeVisible();

    // When: Enter valid group name
    await nestedDialog.locator("#group-name").fill("Valid Group Name");

    // Then: Error should be cleared
    await expect(nestedDialog.getByText("Group name is required")).not.toBeVisible();

    // And: Save should succeed
    await nestedDialog.getByRole("button", { name: "Save" }).click();
    await expect(nestedDialog).not.toBeVisible();
  });
});
