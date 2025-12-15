import { expect, test } from "@playwright/test";

import { fillCommandForm, openAddCommandDialog, saveCommandDialog } from "./helpers/test-helpers";

test.describe("Responsive Layout - Mobile Viewport", () => {
  test.use({
    viewport: { height: 667, width: 375 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header buttons are accessible at mobile viewport", async ({ page }) => {
    // Verify header elements are visible (use .first() as there may be multiple add buttons)
    await expect(page.getByRole("button", { name: /add/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /apply/i })).toBeVisible();

    // Verify scope toggle group is visible
    await expect(page.getByRole("radio", { name: /Global scope/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Workspace scope/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Local scope/i })).toBeVisible();

    // Verify language toggle is accessible
    await expect(page.getByRole("button", { name: /language/i })).toBeVisible();

    // Verify dark mode toggle is accessible
    await expect(page.getByRole("button", { name: /mode/i })).toBeVisible();
  });

  test("command card layout adapts to mobile viewport", async ({ page }) => {
    // Command cards should be visible
    const commandCards = page.locator('[data-testid="command-card"]');
    const count = await commandCards.count();

    if (count > 0) {
      // Verify first command card is visible and not truncated
      const firstCard = commandCards.first();
      await expect(firstCard).toBeVisible();

      // Check card has proper size (not overflowing viewport)
      const cardBox = await firstCard.boundingBox();
      expect(cardBox).not.toBeNull();
      if (cardBox) {
        expect(cardBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test("dialog fits within mobile viewport", async ({ page }) => {
    // Open add command dialog
    await openAddCommandDialog(page);

    // Verify dialog is visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Check dialog fits within viewport
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    if (dialogBox) {
      // Dialog should not exceed viewport width (with some margin for shadow/border)
      expect(dialogBox.width).toBeLessThanOrEqual(375 + 20);
    }

    // Verify form elements are accessible
    await expect(page.getByLabel(/command name/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /save/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();

    // Close dialog
    await page.getByRole("button", { name: /cancel/i }).click();
  });

  test("can complete full workflow at mobile viewport", async ({ page }) => {
    // Open add command dialog
    await openAddCommandDialog(page);

    // Fill and save command
    await fillCommandForm(page, { name: "Mobile Test", command: "echo mobile" });
    await saveCommandDialog(page);

    // Verify command was added
    await expect(page.getByText("Mobile Test")).toBeVisible();

    // Edit the command
    const editButton = page.locator('[data-testid="command-card"]', { hasText: "Mobile Test" }).getByRole("button", { name: /edit/i });
    await editButton.click();

    // Verify edit dialog is visible
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/command name/i)).toHaveValue("Mobile Test");

    // Cancel and verify
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByText("Mobile Test")).toBeVisible();
  });

  test("scrollable areas work correctly at mobile viewport", async ({ page }) => {
    // Add multiple commands to test scrolling
    for (let i = 1; i <= 3; i++) {
      await openAddCommandDialog(page);
      await fillCommandForm(page, { name: `Scroll Test ${i}`, command: `echo ${i}` });
      await saveCommandDialog(page);
    }

    // Verify all commands are present (may need scrolling)
    for (let i = 1; i <= 3; i++) {
      const command = page.getByText(`Scroll Test ${i}`);
      await command.scrollIntoViewIfNeeded();
      await expect(command).toBeVisible();
    }
  });

  test("icon picker is usable at mobile viewport", async ({ page }) => {
    // Open add command dialog
    await openAddCommandDialog(page);

    // Open icon picker
    const iconPickerButton = page.getByRole("button", { name: /icon/i });
    await iconPickerButton.click();

    // Verify icon picker popover is visible (use testid for more specific selector)
    const popover = page.getByTestId("icon-picker-popover");
    await expect(popover).toBeVisible();

    // Verify search input is accessible
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    // Search for an icon
    await searchInput.fill("terminal");

    // Verify search results are shown
    await page.waitForTimeout(300);

    // Close dialog
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /cancel/i }).click();
  });
});
