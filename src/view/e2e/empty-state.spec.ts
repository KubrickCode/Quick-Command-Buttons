import { expect, test } from "@playwright/test";

type DefaultCommand = { name: string; command: string } | { name: string; isGroup: true };

const DEFAULT_COMMANDS: DefaultCommand[] = [
  { name: "$(pass) Test", command: "npm test" },
  { name: "$(terminal) Terminal", command: "echo 'Hello World'" },
  { name: "$(git-branch) Git", isGroup: true },
];

test.describe("Test 15: Empty State UI", () => {
  test("should display empty state when no commands exist", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Delete all commands
    for (const cmd of DEFAULT_COMMANDS) {
      await page.getByRole("button", { name: `Delete command ${cmd.name}` }).click();
      await page.getByRole("button", { name: "Delete" }).click();
    }

    // Then: Verify empty state UI is displayed
    await expect(page.getByRole("heading", { name: "No commands configured" })).toBeVisible();
    await expect(
      page.getByText(
        "Create your first command. It will appear as a button in VS Code's status bar, ready to execute with one click."
      )
    ).toBeVisible();

    // Verify "Add your first command" button exists
    const addFirstCommandButton = page.getByRole("button", { name: "Add your first command" });
    await expect(addFirstCommandButton).toBeVisible();

    // When: Click "Add your first command" button
    await addFirstCommandButton.click();

    // Then: Verify Add Command dialog opens
    await expect(page.getByRole("dialog", { name: "Add New Command" })).toBeVisible();

    // Close dialog
    await page.getByRole("button", { name: "Close" }).click();

    // Verify empty state is still visible
    await expect(page.getByRole("heading", { name: "No commands configured" })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Restore default commands if they were deleted
    const commandCount = await page.locator('[data-testid="command-card"]').count();
    if (commandCount > 0) return;

    for (const cmd of DEFAULT_COMMANDS) {
      await page.getByRole("button", { name: "Add new command" }).click();
      await page.getByRole("textbox", { name: "Command Name" }).fill(cmd.name);
      if ("command" in cmd) {
        await page.getByRole("textbox", { name: "Command", exact: true }).fill(cmd.command);
      } else {
        await page.getByLabel("Group Commands").click();
      }
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
  });
});
