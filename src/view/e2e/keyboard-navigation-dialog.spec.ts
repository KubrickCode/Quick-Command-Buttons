import { expect, test } from "@playwright/test";

test.describe("Test H3: Keyboard Navigation - Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate through dialog fields using Tab", async ({ page }) => {
    // Open add command dialog
    await page.getByRole("button", { name: "Add new command" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // First focusable element should be Command Name input
    const nameInput = page.getByRole("textbox", { name: "Command Name" });
    await expect(nameInput).toBeFocused();

    // Tab to Command Type radio
    await page.keyboard.press("Tab");
    const singleCommandRadio = page.getByRole("radio", {
      name: "Single Command",
    });
    await expect(singleCommandRadio).toBeFocused();

    // Tab to Command input
    await page.keyboard.press("Tab");
    const commandInput = page.getByRole("textbox", {
      name: "Command",
      exact: true,
    });
    await expect(commandInput).toBeFocused();
  });

  test("should close dialog with Escape key", async ({ page }) => {
    // Open add command dialog
    await page.getByRole("button", { name: "Add new command" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");

    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });

  test("should submit form with Enter key", async ({ page }) => {
    // Open add command dialog
    await page.getByRole("button", { name: "Add new command" }).click();
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // Fill command name and command (required field)
    const nameInput = page.getByRole("textbox", { name: "Command Name" });
    await nameInput.fill("EnterKeyTest");
    const commandInput = page.getByRole("textbox", { name: "Command", exact: true });
    await commandInput.fill("echo test");
    await page.keyboard.press("Enter");

    // Dialog should close and command should be added
    await expect(dialog).not.toBeVisible();

    // Verify command was added
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "EnterKeyTest",
    });
    await expect(commandCard).toBeVisible();
  });
});
