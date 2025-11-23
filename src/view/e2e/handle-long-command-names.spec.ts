import { expect, test } from "@playwright/test";

const LONG_COMMAND = {
  name: "$(rocket) This is an extremely long command name that should test the UI rendering capabilities and ensure that the card layout does not break when displaying very long text content exceeding normal limits",
  displayName:
    "This is an extremely long command name that should test the UI rendering capabilities and ensure that the card layout does not break when displaying very long text content exceeding normal limits",
  command: "echo 'test long command name'",
  shortcut: "x",
};

const CARD_LAYOUT_CONSTRAINTS = {
  MAX_WIDTH: 900,
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 300,
};

test.describe("Test 16: Handle Long Command Names", () => {
  test("should handle very long command names without breaking UI layout", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Add a command with a very long name (100+ characters)
    await page.getByRole("button", { name: "Add new command" }).click();

    await page.getByRole("textbox", { name: "Command Name" }).fill(LONG_COMMAND.name);
    await page.getByRole("textbox", { name: "Command", exact: true }).fill(LONG_COMMAND.command);
    await page.getByRole("textbox", { name: "Shortcut (optional)" }).fill(LONG_COMMAND.shortcut);

    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify the command was added
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: LONG_COMMAND.displayName,
    });

    await expect(commandCard).toBeVisible();

    // Verify the card displays all content
    await expect(commandCard.getByText(LONG_COMMAND.displayName, { exact: false })).toBeVisible();
    await expect(commandCard.getByText(LONG_COMMAND.command)).toBeVisible();
    await expect(commandCard.getByText(LONG_COMMAND.shortcut, { exact: true })).toBeVisible();

    // Verify the command card layout is not broken
    const cardElement = await commandCard.boundingBox();
    expect(cardElement).not.toBeNull();
    if (cardElement) {
      // Card should have reasonable width (not stretched beyond viewport)
      expect(cardElement.width).toBeLessThan(CARD_LAYOUT_CONSTRAINTS.MAX_WIDTH);

      // Card should have reasonable height (text wrapped properly)
      expect(cardElement.height).toBeGreaterThan(CARD_LAYOUT_CONSTRAINTS.MIN_HEIGHT);
      expect(cardElement.height).toBeLessThan(CARD_LAYOUT_CONSTRAINTS.MAX_HEIGHT);
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: LONG_COMMAND.displayName,
    });
    if ((await commandCard.count()) > 0) {
      await commandCard
        .getByRole("button", { name: `Delete command ${LONG_COMMAND.name}` })
        .click();
      await page.getByRole("button", { name: "Delete" }).click();
    }
  });
});
