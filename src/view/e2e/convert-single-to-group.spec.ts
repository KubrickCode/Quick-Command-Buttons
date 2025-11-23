import { expect, test } from "@playwright/test";

const TEST_COMMAND = {
  name: "$(pass) Test",
  editButtonName: "Edit command $(pass) Test",
  childCommandName: "$(play) Run Tests",
  childCommand: "npm test",
  childShortcut: "r",
};

test.describe("Test 10: Convert Single to Group Command (No Warning)", () => {
  test("should convert single command to group without warning dialog", async ({ page }) => {
    // Given: Navigate to the configuration page with Test fixture
    await page.goto("/");

    // When: Click Edit button for Test command
    await page.getByRole("button", { name: TEST_COMMAND.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

    // Verify Single Command is initially selected
    await expect(page.getByRole("radio", { name: "Single Command" })).toBeChecked();

    // Change Command Type to Group Commands
    await page.getByRole("radio", { name: "Group Commands" }).click();

    // Then: Verify no warning dialog appears
    const dialogs = await page.getByRole("dialog").count();
    expect(dialogs).toBe(1); // Only the edit dialog should be present

    // Verify switched to group command editing UI
    await expect(page.getByRole("radio", { name: "Group Commands" })).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "Execute all commands simultaneously" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add new command" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add new group" })).toBeVisible();

    // Add a child command
    await page.getByRole("button", { name: "Add new command" }).click();

    // Fill child command details
    await page
      .getByTestId("group-command-item")
      .getByRole("textbox", { name: "Command name" })
      .fill(TEST_COMMAND.childCommandName);
    await page
      .getByRole("textbox", { name: "Command (e.g., npm start)" })
      .fill(TEST_COMMAND.childCommand);
    await page
      .getByTestId("group-command-item")
      .getByRole("textbox", { name: "Shortcut (optional)" })
      .fill(TEST_COMMAND.childShortcut);

    // Save the changes
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closes
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Verify converted to group card
    await expect(page.getByText("1 commands")).toBeVisible();

    // Open edit dialog again to verify child command was saved
    await page.getByRole("button", { name: TEST_COMMAND.editButtonName }).click();

    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Group Commands" })).toBeChecked();

    // Verify child command exists
    await expect(
      page.getByTestId("group-command-item").getByRole("textbox", { name: "Command name" })
    ).toHaveValue(TEST_COMMAND.childCommandName);
    await expect(page.getByRole("textbox", { name: "Command (e.g., npm start)" })).toHaveValue(
      TEST_COMMAND.childCommand
    );
    await expect(
      page.getByTestId("group-command-item").getByRole("textbox", { name: "Shortcut (optional)" })
    ).toHaveValue(TEST_COMMAND.childShortcut);
  });
});
