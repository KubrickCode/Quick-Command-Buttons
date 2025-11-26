import { expect, test } from "@playwright/test";

const TERMINAL_COMMAND = {
  name: "$(terminal) Terminal",
  editButtonName: "Edit command $(terminal) Terminal",
  command: "workbench.action.terminal.new",
};

test.describe("Test 13: Toggle VS Code API Mode", () => {
  test("should toggle VS Code API mode via dropdown and persist state", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Terminal command
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Command Name" })).toHaveValue(
      TERMINAL_COMMAND.name
    );

    // Verify VS Code API mode is initially selected (Terminal command uses VS Code API by default)
    const executionModeButton = page.getByRole("button", { name: /VS Code API/i });
    await expect(executionModeButton).toBeVisible();

    // Open dropdown and switch to Terminal mode
    await executionModeButton.click();
    await page.getByRole("menuitemradio", { name: /Terminal \(default\)/i }).click();

    // Verify the button now shows Terminal mode
    await expect(page.getByRole("button", { name: /Terminal/i })).toBeVisible();

    // Save changes
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closed
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Re-open edit dialog to verify Terminal mode persists
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Terminal/i })).toBeVisible();

    // Close dialog
    await page.getByRole("button", { name: "Close" }).click();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Restore original state (VS Code API mode)
    await page.goto("/");
    await page.getByRole("button", { name: TERMINAL_COMMAND.editButtonName }).click();

    // Check current mode and switch back to VS Code API if needed
    const vsCodeApiButton = page.getByRole("button", { name: /VS Code API/i });
    const isVsCodeApiMode = await vsCodeApiButton.isVisible().catch(() => false);

    if (!isVsCodeApiMode) {
      // Current mode is Terminal or Insert Only, switch to VS Code API
      const currentModeButton = page.getByRole("button", { name: /Terminal|Insert Only/i }).first();
      await currentModeButton.click();
      await page.getByRole("menuitemradio", { name: "VS Code API" }).click();
    }

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();
  });
});
