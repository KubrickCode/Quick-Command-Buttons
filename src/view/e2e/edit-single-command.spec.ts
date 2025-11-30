import { expect, test } from "@playwright/test";

const COMMAND_TO_EDIT = {
  // Note: Icon is now separate from displayText in the form
  initialDisplayText: "Test",
  initialCommand: "npm test",
  editButtonName: "Edit command $(pass) Test",
  updatedCommand: "npm run test:ci",
  updatedShortcut: "e",
};

test.describe("Test 2: Edit Single Command", () => {
  test("should edit existing command and reflect changes", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Test command
    await page.getByRole("button", { name: COMMAND_TO_EDIT.editButtonName }).click();

    // Verify edit dialog opened with existing values
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Command Name" })).toHaveValue(
      COMMAND_TO_EDIT.initialDisplayText
    );
    await expect(page.getByRole("textbox", { name: "Command", exact: true })).toHaveValue(
      COMMAND_TO_EDIT.initialCommand
    );

    // Modify command and shortcut
    await page
      .getByRole("textbox", { name: "Command", exact: true })
      .fill(COMMAND_TO_EDIT.updatedCommand);
    await page
      .getByRole("textbox", { name: "Shortcut (optional)" })
      .fill(COMMAND_TO_EDIT.updatedShortcut);

    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify changes are reflected
    await expect(page.getByText(COMMAND_TO_EDIT.updatedCommand)).toBeVisible();
    await expect(page.getByText(COMMAND_TO_EDIT.updatedShortcut, { exact: true })).toBeVisible();

    // Verify old values are no longer present
    const npmTestCommands = await page.getByText(COMMAND_TO_EDIT.initialCommand).count();
    expect(npmTestCommands).toBe(0);
  });
});
