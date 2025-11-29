import { expect, test, type Page } from "@playwright/test";
import {
  clearAllCommands,
  fillCommandForm,
  openAddCommandDialog,
  saveCommandDialog,
} from "./helpers/test-helpers";

const TEST_COMMAND = {
  name: "$(paintcan) Color Picker Test",
  displayName: "Color Picker Test",
  command: "echo 'color picker test'",
};

const openColorPicker = async (page: Page) => {
  await page.getByRole("button", { name: "Open color picker" }).click();
};

const getColorPickerPopover = (page: Page) => {
  return page.locator('[data-radix-popper-content-wrapper]');
};

const getColorInput = (page: Page) => {
  return page.getByPlaceholder("e.g., #FF5722, red, blue");
};

const getColorPreviewButton = (page: Page) => {
  return page.getByRole("button", { name: "Open color picker" });
};

test.describe("Color Picker Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllCommands(page);
  });

  test("should open color picker popover when clicking the color button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Click the color picker button
    await openColorPicker(page);

    // Then: Color picker popover should be visible
    const popover = getColorPickerPopover(page);
    await expect(popover).toBeVisible();
  });

  test("should close color picker popover when clicking outside", async ({ page }) => {
    // Given: Open add command dialog and color picker
    await openAddCommandDialog(page);
    await openColorPicker(page);
    await expect(getColorPickerPopover(page)).toBeVisible();

    // When: Click outside the popover
    await page.getByLabel(/command name/i).click();

    // Then: Popover should be hidden
    await expect(getColorPickerPopover(page)).toBeHidden();
  });

  test("should select preset color and update input", async ({ page }) => {
    // Given: Open add command dialog and color picker
    await openAddCommandDialog(page);
    await openColorPicker(page);

    // When: Click a preset color (red - #F44336)
    await page.getByRole("button", { name: "Select color #F44336" }).click();

    // Then: Input should have the selected color
    await expect(getColorInput(page)).toHaveValue("#F44336");

    // And: Popover should close after selection
    await expect(getColorPickerPopover(page)).toBeHidden();
  });

  test("should update color via text input", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Type color in the input
    await getColorInput(page).fill("#00BCD4");

    // Then: Input should have the typed color
    await expect(getColorInput(page)).toHaveValue("#00BCD4");
  });

  test("should show preset colors in the popover", async ({ page }) => {
    // Given: Open add command dialog and color picker
    await openAddCommandDialog(page);
    await openColorPicker(page);

    // Then: Should have 20 preset color buttons
    const presetButtons = page.getByRole("button", { name: /Select color #/ });
    await expect(presetButtons).toHaveCount(20);
  });

  test("should save command with color from picker", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Fill form and select color from picker
    await fillCommandForm(page, {
      name: TEST_COMMAND.name,
      command: TEST_COMMAND.command,
    });
    await openColorPicker(page);
    await page.getByRole("button", { name: "Select color #4CAF50" }).click();
    await saveCommandDialog(page);

    // Then: Command should be saved
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: TEST_COMMAND.displayName,
    });
    await expect(commandCard).toBeVisible();
  });

  test("should preserve color when editing command", async ({ page }) => {
    // Given: Create a command with color
    await openAddCommandDialog(page);
    await fillCommandForm(page, {
      name: TEST_COMMAND.name,
      command: TEST_COMMAND.command,
    });
    await openColorPicker(page);
    await page.getByRole("button", { name: "Select color #9C27B0" }).click();
    await saveCommandDialog(page);

    // When: Open edit dialog
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: TEST_COMMAND.displayName,
    });
    await commandCard.getByRole("button", { name: /edit/i }).click();

    // Then: Color input should have the saved color
    await expect(getColorInput(page)).toHaveValue("#9C27B0");
  });

  test("should interact with hex color picker gradient", async ({ page }) => {
    // Given: Open add command dialog and color picker
    await openAddCommandDialog(page);
    await openColorPicker(page);

    // When: Drag on the color picker saturation area to select a color
    const colorPicker = page.locator(".react-colorful__saturation");
    const box = await colorPicker.boundingBox();
    if (!box) throw new Error("Color picker not found");

    // Perform drag action to trigger onChange
    await page.mouse.move(box.x + 50, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 80);
    await page.mouse.up();

    // Then: Color input should have a hex value
    const inputValue = await getColorInput(page).inputValue();
    expect(inputValue).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test("should show color preview in the button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Type a valid color
    await getColorInput(page).fill("#FF5722");

    // Then: Preview button should show the color
    const previewDiv = getColorPreviewButton(page).locator("div");
    await expect(previewDiv).toHaveCSS("background-color", "rgb(255, 87, 34)");
  });

  test("should show checkerboard pattern when no color is set", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // Then: Preview should show checkerboard (transparent background with pattern)
    const previewDiv = getColorPreviewButton(page).locator("div");
    const bgImage = await previewDiv.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bgImage).toContain("linear-gradient");
  });

  test("should close popover with Escape key", async ({ page }) => {
    // Given: Open add command dialog and color picker
    await openAddCommandDialog(page);
    await openColorPicker(page);
    await expect(getColorPickerPopover(page)).toBeVisible();

    // When: Press Escape key
    await page.keyboard.press("Escape");

    // Then: Popover should be hidden
    await expect(getColorPickerPopover(page)).toBeHidden();
  });

  test("should open popover with Enter key on focused button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Focus color picker button and press Enter
    await getColorPreviewButton(page).focus();
    await page.keyboard.press("Enter");

    // Then: Popover should be visible
    await expect(getColorPickerPopover(page)).toBeVisible();
  });

  test("should open popover with Space key on focused button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Focus color picker button and press Space
    await getColorPreviewButton(page).focus();
    await page.keyboard.press("Space");

    // Then: Popover should be visible
    await expect(getColorPickerPopover(page)).toBeVisible();
  });
});
