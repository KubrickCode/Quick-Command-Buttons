import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { fillCommandForm, verifySuccessToast } from "./helpers/test-helpers";

const NEW_COMMAND = {
  color: "#9C27B0",
  command: "npm run lint",
  displayName: "Lint Code",
  name: "$(wand) Lint Code",
  shortcut: "i",
};

const SUCCESS_MESSAGE = "Configuration saved successfully";

const createCommand = async (
  page: Page,
  command: {
    name: string;
    command: string;
    color: string;
    shortcut: string;
  },
) => {
  await page.getByRole("button", { name: "Add new command" }).click();
  await fillCommandForm(page, command);
  await page.getByRole("button", { name: "Save" }).click();

  // Extract display name for verification
  const displayName = command.name.split(") ")[1] || command.name;
  const commandCard = page.locator('[data-testid="command-card"]', {
    hasText: displayName,
  });
  await expect(commandCard).toBeVisible();
  return commandCard;
};

test.describe("Save Configuration with Apply Changes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should save configuration and show success toast message", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Add a new command (refer to Test 1)
    await createCommand(page, NEW_COMMAND);

    // When: Click "Apply changes" button
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Verify toast notification appears with success message
    await verifySuccessToast(page, SUCCESS_MESSAGE);
  });

  test("should save configuration after editing existing command", async ({ page }) => {
    // Given: Create a new command first to ensure test independence
    const testCard = await createCommand(page, {
      name: "$(beaker) Edit Test Command",
      command: "npm test",
      color: "#FF5722",
      shortcut: "edt",
    });

    // When: Edit the command we just created
    await testCard.getByRole("button", { name: "Edit command" }).click();

    // Change the command
    const commandInput = page.getByRole("textbox", {
      exact: true,
      name: "Command",
    });
    await commandInput.clear();
    await commandInput.fill("npm run test:coverage");

    await page.getByRole("button", { name: "Save" }).click();

    // When: Apply changes
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Verify toast notification
    await verifySuccessToast(page, SUCCESS_MESSAGE);
  });

  test("should save configuration after deleting command", async ({ page }) => {
    // Given: Create a new command first to ensure test independence
    const temporaryCard = await createCommand(page, {
      name: "$(trash) Temporary",
      command: "echo temporary",
      color: "#607D8B",
      shortcut: "r",
    });

    // Get initial command count
    const commandCards = page.locator('[data-testid="command-card"]');
    const initialCount = await commandCards.count();

    // When: Delete the command we just created
    await temporaryCard.getByRole("button", { name: "Delete command" }).click();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify deletion occurred
    const newCount = await commandCards.count();
    expect(newCount).toBe(initialCount - 1);

    // When: Apply changes
    await page.getByRole("button", { name: "Apply configuration changes" }).click();

    // Then: Verify toast notification
    await verifySuccessToast(page, SUCCESS_MESSAGE);
  });
});
