import { expect, test } from "@playwright/test";

import { getDuplicateShortcutErrorMessage } from "../src/schemas/command-form-schema";

const EXISTING_COMMAND = {
  name: "$(pass) Test",
  shortcut: "t",
};

const NEW_COMMAND = {
  name: "New Command",
  command: "npm run build",
  duplicateShortcut: "t",
  validShortcut: "b",
};

test.describe("Test 12: Validate Duplicate Shortcuts", () => {
  test("should show validation error when entering duplicate shortcut and block save", async ({
    page,
  }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Capture initial command count
    const initialCommandCount = await page.getByTestId("command-card").count();

    // When: Click Add button
    await page.getByRole("button", { name: "Add new command" }).click();

    // Verify add dialog opened
    await expect(page.getByRole("dialog", { name: "Add New Command" })).toBeVisible();

    // Fill in command name
    await page.getByRole("textbox", { name: "Command Name" }).fill(NEW_COMMAND.name);

    // Fill in command
    await page.getByRole("textbox", { name: "Command", exact: true }).fill(NEW_COMMAND.command);

    // Enter duplicate shortcut
    await page
      .getByRole("textbox", { name: "Shortcut (optional)" })
      .fill(NEW_COMMAND.duplicateShortcut);

    // Click Save button
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify validation error message appears
    await expect(
      page.getByText(getDuplicateShortcutErrorMessage(NEW_COMMAND.duplicateShortcut))
    ).toBeVisible();

    // Verify dialog is still open (save was blocked)
    await expect(page.getByRole("dialog", { name: "Add New Command" })).toBeVisible();

    // Verify command was NOT added to the list
    const commandCards = await page.getByTestId("command-card").count();
    expect(commandCards).toBe(initialCommandCount);

    // When: Change to valid shortcut
    await page
      .getByRole("textbox", { name: "Shortcut (optional)" })
      .fill(NEW_COMMAND.validShortcut);

    // Click Save button again
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closes (save succeeded)
    await expect(page.getByRole("dialog", { name: "Add New Command" })).not.toBeVisible();

    // Verify new command was added to the list
    const newCommandCard = page.getByTestId("command-card").filter({ hasText: NEW_COMMAND.name }).nth(0);
    await expect(newCommandCard).toBeVisible();

    // Verify shortcut badge is displayed correctly
    await expect(newCommandCard.getByText(NEW_COMMAND.validShortcut, { exact: true })).toBeVisible();

    // Verify command code is displayed
    await expect(newCommandCard.locator("code")).toContainText(NEW_COMMAND.command);
  });

  test("should allow same shortcut when editing the same command", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Test command
    await page.getByRole("button", { name: `Edit command ${EXISTING_COMMAND.name}` }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

    // Verify shortcut field has existing value
    const shortcutInput = page.getByRole("textbox", { name: "Shortcut (optional)" });
    await expect(shortcutInput).toHaveValue(EXISTING_COMMAND.shortcut);

    // Change name but keep same shortcut
    await page.getByRole("textbox", { name: "Command Name" }).fill("Updated Test");

    // Click Save button
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify no validation error appears (same shortcut allowed for same command)
    await expect(
      page.getByText(getDuplicateShortcutErrorMessage(EXISTING_COMMAND.shortcut))
    ).not.toBeVisible();

    // Verify dialog closes (save succeeded)
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Verify command name was updated
    const updatedCommandCard = page.getByTestId("command-card").filter({ hasText: "Updated Test" }).nth(0);
    await expect(updatedCommandCard).toBeVisible();

    // Verify shortcut is still the same
    await expect(updatedCommandCard.getByText(EXISTING_COMMAND.shortcut, { exact: true })).toBeVisible();
  });
});
