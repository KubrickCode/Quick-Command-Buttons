import { expect, test } from "@playwright/test";

const TERMINAL_COMMAND = {
  name: "$(terminal) Terminal",
  editButtonName: "Edit command $(terminal) Terminal",
  command: "workbench.action.terminal.new",
};

test.describe("Test 13: Toggle VS Code API Mode", () => {
  test("should toggle VS Code API checkbox and persist state", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Terminal command
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Command Name" })).toHaveValue(
      TERMINAL_COMMAND.name
    );

    // Verify checkbox is initially checked (Terminal command uses VS Code API by default)
    const vsCodeApiCheckbox = page.getByRole("checkbox", {
      name: "Use VS Code API (instead of terminal)",
    });
    await expect(vsCodeApiCheckbox).toBeChecked();

    // Uncheck the checkbox
    await vsCodeApiCheckbox.uncheck();
    await expect(vsCodeApiCheckbox).not.toBeChecked();

    // Save changes
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closed
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Re-open edit dialog to verify unchecked state persists
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(vsCodeApiCheckbox).not.toBeChecked();

    // Close dialog
    await page.getByRole("button", { name: "Close" }).click();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Restore original state
    await page.goto("/");
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();
    const vsCodeApiCheckbox = page.getByRole("checkbox", {
      name: "Use VS Code API (instead of terminal)",
    });
    await vsCodeApiCheckbox.check();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();
  });
});
