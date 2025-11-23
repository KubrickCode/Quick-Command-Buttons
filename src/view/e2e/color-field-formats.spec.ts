import { expect, test, type Page } from "@playwright/test";
import { openAddCommandDialog, fillCommandForm, saveCommandDialog } from "./helpers/test-helpers";

const TEST_COMMAND = {
  name: "$(rocket) Color Test",
  displayName: "Color Test",
  command: "echo 'color test'",
  shortcut: "x",
};

const COLOR_FORMATS = [
  { format: "HEX", value: "#FF5722" },
  { format: "color name", value: "red" },
  { format: "RGB", value: "rgb(255, 87, 34)" },
] as const;

const addCommandWithColor = async (page: Page, colorValue: string) => {
  await openAddCommandDialog(page);
  await fillCommandForm(page, {
    name: TEST_COMMAND.name,
    command: TEST_COMMAND.command,
    color: colorValue,
    shortcut: TEST_COMMAND.shortcut,
  });
  await saveCommandDialog(page);
};

const verifyCommandExists = async (page: Page) => {
  const commandCard = page.locator('[data-testid="command-card"]', {
    hasText: TEST_COMMAND.displayName,
  });
  await expect(commandCard.getByText(TEST_COMMAND.displayName, { exact: true })).toBeVisible();
  await expect(commandCard.getByText(TEST_COMMAND.command)).toBeVisible();
  return commandCard;
};

const deleteCommand = async (page: Page) => {
  const commandCard = page.locator('[data-testid="command-card"]', {
    hasText: TEST_COMMAND.displayName,
  });
  await commandCard.getByRole("button", { name: `Delete command ${TEST_COMMAND.name}` }).click();
  await page.getByRole("button", { name: "Delete" }).click();
};

test.describe("Test 17: Color Field Various Formats", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.afterEach(async ({ page }) => {
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: TEST_COMMAND.displayName,
    });
    const exists = await commandCard.count();
    if (exists > 0) {
      await deleteCommand(page);
    }
  });

  COLOR_FORMATS.forEach(({ format, value }) => {
    test(`should accept ${format} color format`, async ({ page }) => {
      // When: Add a command with ${format} color
      await addCommandWithColor(page, value);

      // Then: Verify the command was added
      await verifyCommandExists(page);
    });
  });

  test("should switch between different color formats", async ({ page }) => {
    // When: Add a command with HEX color
    await addCommandWithColor(page, COLOR_FORMATS[0].value);

    const commandCard = await verifyCommandExists(page);

    const editAndVerifyColor = async (colorValue: string) => {
      await commandCard.getByRole("button", { name: `Edit command ${TEST_COMMAND.name}` }).click();
      await page.getByRole("textbox", { name: "Color (optional)" }).fill(colorValue);
      await page.getByRole("button", { name: "Save" }).click();
      await expect(commandCard.getByText(TEST_COMMAND.displayName, { exact: true })).toBeVisible();
    };

    // Then: Edit and change to color name
    await editAndVerifyColor(COLOR_FORMATS[1].value);

    // Edit and change to RGB
    await editAndVerifyColor(COLOR_FORMATS[2].value);
  });
});
