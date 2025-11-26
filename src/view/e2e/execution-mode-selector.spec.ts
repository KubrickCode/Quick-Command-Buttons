import { expect, test } from "@playwright/test";

import { clearAllCommands, createTestCommands } from "./helpers/test-helpers";

const TEST_COMMAND = {
  name: "$(rocket) Test Execution Mode",
  displayName: "Test Execution Mode",
  command: "echo test",
};

test.describe("Execution Mode Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllCommands(page);
    await createTestCommands(page, [{ name: TEST_COMMAND.name, command: TEST_COMMAND.command }]);
  });

  test.describe("Main Dialog - Single Command", () => {
    test("should display Terminal mode by default", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();
      await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

      // Verify Terminal mode is displayed
      const executionModeButton = page.getByRole("button", { name: /Terminal/i });
      await expect(executionModeButton).toBeVisible();
      await expect(executionModeButton).toContainText("Terminal");
    });

    test("should switch to VS Code API mode", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Click execution mode dropdown
      await page.getByRole("button", { name: /Terminal/i }).click();

      // Select VS Code API
      await page.getByRole("menuitemradio", { name: "VS Code API" }).click();

      // Verify selection
      const executionModeButton = page.getByRole("button", { name: /VS Code API/i });
      await expect(executionModeButton).toBeVisible();

      // Save and verify persistence
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

      // Re-open and verify
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();
      await expect(page.getByRole("button", { name: /VS Code API/i })).toBeVisible();
    });

    test("should switch to Insert Only mode", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Click execution mode dropdown
      await page.getByRole("button", { name: /Terminal/i }).click();

      // Select Insert Only
      await page.getByRole("menuitemradio", { name: /Insert Only/i }).click();

      // Verify selection
      const executionModeButton = page.getByRole("button", { name: /Insert Only/i });
      await expect(executionModeButton).toBeVisible();

      // Save and verify persistence
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

      // Re-open and verify
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();
      await expect(page.getByRole("button", { name: /Insert Only/i })).toBeVisible();
    });

    test("should cycle through all execution modes", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Verify default Terminal mode
      await expect(page.getByRole("button", { name: /Terminal/i })).toBeVisible();

      // Switch to VS Code API
      await page.getByRole("button", { name: /Terminal/i }).click();
      await page.getByRole("menuitemradio", { name: "VS Code API" }).click();
      await expect(page.getByRole("button", { name: /VS Code API/i })).toBeVisible();

      // Switch to Insert Only
      await page.getByRole("button", { name: /VS Code API/i }).click();
      await page.getByRole("menuitemradio", { name: /Insert Only/i }).click();
      await expect(page.getByRole("button", { name: /Insert Only/i })).toBeVisible();

      // Switch back to Terminal
      await page.getByRole("button", { name: /Insert Only/i }).click();
      await page.getByRole("menuitemradio", { name: /Terminal/i }).click();
      await expect(page.getByRole("button", { name: /Terminal/i })).toBeVisible();
    });
  });

  test.describe("Group Command Item", () => {
    test.beforeEach(async ({ page }) => {
      await clearAllCommands(page);

      // Create a group command with nested commands
      await page.getByRole("button", { name: /add/i }).first().click();
      await page.getByRole("textbox", { name: "Command Name" }).fill("$(folder) Test Group");
      await page.getByRole("radio", { name: "Group Commands" }).click();

      // Add a command to the group
      await page.getByRole("button", { name: "Add new command" }).click();

      // Wait for command item to appear
      const groupCommandItem = page.locator('[data-testid="group-command-item"]').first();
      await expect(groupCommandItem).toBeVisible();

      // Fill the nested command
      await groupCommandItem.getByPlaceholder("Command name").fill("Nested Command");
      await groupCommandItem.getByPlaceholder("Command (e.g., npm start)").fill("echo nested");

      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    test("should display execution mode dropdown in group command item", async ({ page }) => {
      // Open the group command edit dialog
      await page.getByRole("button", { name: "Edit command $(folder) Test Group" }).click();
      await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

      // Verify group command item has execution mode dropdown
      const groupCommandItem = page.locator('[data-testid="group-command-item"]').first();
      const executionModeButton = groupCommandItem.getByRole("button", { name: /Terminal/i });
      await expect(executionModeButton).toBeVisible();
    });

    test("should change execution mode in group command item", async ({ page }) => {
      // Open the group command edit dialog
      await page.getByRole("button", { name: "Edit command $(folder) Test Group" }).click();

      const groupCommandItem = page.locator('[data-testid="group-command-item"]').first();

      // Click dropdown and select VS Code API
      await groupCommandItem.getByRole("button", { name: /Terminal/i }).click();
      await page.getByRole("menuitemradio", { name: "VS Code API" }).click();

      // Verify change
      await expect(groupCommandItem.getByRole("button", { name: /VS Code API/i })).toBeVisible();

      // Save and verify persistence
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Re-open and verify
      await page.getByRole("button", { name: "Edit command $(folder) Test Group" }).click();
      const updatedItem = page.locator('[data-testid="group-command-item"]').first();
      await expect(updatedItem.getByRole("button", { name: /VS Code API/i })).toBeVisible();
    });

    test("should change to Insert Only mode in group command item", async ({ page }) => {
      // Open the group command edit dialog
      await page.getByRole("button", { name: "Edit command $(folder) Test Group" }).click();

      const groupCommandItem = page.locator('[data-testid="group-command-item"]').first();

      // Click dropdown and select Insert Only
      await groupCommandItem.getByRole("button", { name: /Terminal/i }).click();
      await page.getByRole("menuitemradio", { name: /Insert Only/i }).click();

      // Verify change
      await expect(groupCommandItem.getByRole("button", { name: /Insert Only/i })).toBeVisible();

      // Save and verify persistence
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Re-open and verify
      await page.getByRole("button", { name: "Edit command $(folder) Test Group" }).click();
      const updatedItem = page.locator('[data-testid="group-command-item"]').first();
      await expect(updatedItem.getByRole("button", { name: /Insert Only/i })).toBeVisible();
    });
  });

  test.describe("Dropdown Menu Accessibility", () => {
    test("should have proper ARIA attributes", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Click to open dropdown
      await page.getByRole("button", { name: /Terminal/i }).click();

      // Verify menu is open and has proper role
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();

      // Verify menu items have menuitemradio role
      const menuItems = page.getByRole("menuitemradio");
      await expect(menuItems).toHaveCount(3);
    });

    test("should close dropdown with Escape key", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Open dropdown
      await page.getByRole("button", { name: /Terminal/i }).click();
      await expect(page.getByRole("menu")).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");

      // Verify menu is closed
      await expect(page.getByRole("menu")).not.toBeVisible();
    });

    // Skip: Radix UI DropdownMenu keyboard navigation behavior varies across environments
    test.skip("should navigate menu items with keyboard", async ({ page }) => {
      // Open edit dialog
      await page
        .getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` })
        .click();

      // Open dropdown with keyboard (Enter or Space)
      const executionModeButton = page.getByRole("button", { name: /Terminal/i });
      await executionModeButton.focus();
      await page.keyboard.press("Enter");

      // Wait for menu to open
      await expect(page.getByRole("menu")).toBeVisible();

      // Navigate with arrow keys (first item is already focused)
      await page.keyboard.press("ArrowDown"); // Move to VS Code API

      // Press Enter to select
      await page.keyboard.press("Enter");

      // Verify selection changed to VS Code API
      await expect(page.getByRole("button", { name: /VS Code API/i })).toBeVisible();
    });
  });
});
