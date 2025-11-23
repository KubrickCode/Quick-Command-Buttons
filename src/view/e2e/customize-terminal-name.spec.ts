import { expect, test } from "@playwright/test";

const COMMAND_CONFIG = {
  commandName: "$(pass) Test",
  editButtonName: "Edit command $(pass) Test",
  terminalName: "Test Runner Terminal",
};

test.describe("Test 18: Customize Terminal Name", () => {
  test("should allow Terminal Name input and persist value", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Test command
    await page.getByRole("button", { name: COMMAND_CONFIG.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

    // Clear existing Terminal Name value
    await page.getByRole("textbox", { name: "Terminal Name (optional)" }).clear();

    // Enter new Terminal Name
    await page
      .getByRole("textbox", { name: "Terminal Name (optional)" })
      .fill(COMMAND_CONFIG.terminalName);

    // Verify value is entered
    await expect(page.getByRole("textbox", { name: "Terminal Name (optional)" })).toHaveValue(
      COMMAND_CONFIG.terminalName
    );

    // Save changes
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closed
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Reopen edit dialog to verify persistence
    await page.getByRole("button", { name: COMMAND_CONFIG.editButtonName }).click();

    // Verify Terminal Name value persisted
    await expect(page.getByRole("textbox", { name: "Terminal Name (optional)" })).toHaveValue(
      COMMAND_CONFIG.terminalName
    );
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Restore original state
    await page.goto("/");
    await page.getByRole("button", { name: COMMAND_CONFIG.editButtonName }).click();
    await page.getByRole("textbox", { name: "Terminal Name (optional)" }).clear();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();
  });
});
