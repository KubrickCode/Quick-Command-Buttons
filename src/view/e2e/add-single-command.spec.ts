import { expect, test } from "@playwright/test";

const NEW_COMMAND = {
  name: "$(rocket) Build",
  displayName: "Build",
  command: "npm run build",
  color: "#FF5722",
  shortcut: "b",
};

test.describe("Test 1: Add Single Command", () => {
  test("should add a new single command with all properties", async ({
    page,
  }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Get initial count
    const commandCards = page.locator('[data-testid="command-card"]');
    const initialCount = await commandCards.count();

    // When: Click Add button and fill the form
    await page.getByRole("button", { name: "Add new command" }).click();

    await page
      .getByRole("textbox", { name: "Command Name" })
      .fill(NEW_COMMAND.name);
    await page
      .getByRole("textbox", { name: "Command", exact: true })
      .fill(NEW_COMMAND.command);
    await page
      .getByRole("textbox", { name: "Color (optional)" })
      .fill(NEW_COMMAND.color);
    await page.getByRole("textbox", { name: "Shortcut (optional)" }).fill(NEW_COMMAND.shortcut);

    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify the command was added to the list
    const newCommandCard = page.locator('[data-testid="command-card"]', {
      hasText: NEW_COMMAND.displayName
    });
    await expect(newCommandCard.getByText(NEW_COMMAND.displayName, { exact: true })).toBeVisible();
    await expect(newCommandCard.getByText(NEW_COMMAND.command)).toBeVisible();

    // Verify shortcut badge within the new command card
    await expect(newCommandCard.getByText(NEW_COMMAND.shortcut, { exact: true })).toBeVisible();

    // Verify the command card count increased by 1
    const finalCount = await commandCards.count();
    expect(finalCount).toBe(initialCount + 1);
  });
});
