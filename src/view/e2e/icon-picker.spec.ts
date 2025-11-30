import { expect, test, type Page } from "@playwright/test";
import {
  clearAllCommands,
  fillCommandForm,
  openAddCommandDialog,
  saveCommandDialog,
} from "./helpers/test-helpers";

const TEST_COMMAND = {
  name: "Icon Picker Test",
  command: "echo 'icon picker test'",
};

const openIconPicker = async (page: Page) => {
  await page.getByRole("button", { name: /open icon picker/i }).click();
};

const getIconPickerPopover = (page: Page) => {
  return page.getByTestId("icon-picker-popover");
};

const getIconSearchInput = (page: Page) => {
  return page.getByPlaceholder(/search icons/i);
};

const getIconPickerButton = (page: Page) => {
  return page.getByRole("button", { name: /open icon picker/i });
};

const getDisplayTextInput = (page: Page) => {
  return page.getByPlaceholder(/terminal.*build.*deploy/i);
};

const getIconGridButtons = (page: Page) => {
  return page.getByTestId("icon-grid-button");
};

const getIconByName = (page: Page, iconName: string) => {
  return page.locator(`button[title='${iconName}']`);
};

const getIconsContaining = (page: Page, text: string) => {
  return page.locator(`button[title*='${text}']`);
};

test.describe("Icon Picker Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllCommands(page);
  });

  test("should open icon picker popover when clicking the icon button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Click the icon picker button
    await openIconPicker(page);

    // Then: Icon picker popover should be visible
    const popover = getIconPickerPopover(page);
    await expect(popover).toBeVisible();
  });

  test("should close icon picker popover when clicking outside", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await expect(getIconPickerPopover(page)).toBeVisible();

    // When: Click outside the popover
    await page.getByLabel(/command name/i).click();

    // Then: Popover should be hidden
    await expect(getIconPickerPopover(page)).toBeHidden();
  });

  test("should display icons in a grid", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // Then: Should have icon buttons visible
    const iconButtons = getIconGridButtons(page);
    await expect(iconButtons.first()).toBeVisible();

    // And: Should have multiple icons (at least 50 initially shown)
    const count = await iconButtons.count();
    expect(count).toBeGreaterThan(50);
  });

  test("should filter icons when searching", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);
    const initialIconCount = await getIconGridButtons(page).count();

    // When: Type search query
    await getIconSearchInput(page).fill("terminal");

    // Then: Should show filtered icons containing "terminal"
    const iconButtons = getIconsContaining(page, "terminal");
    await expect(iconButtons.first()).toBeVisible();

    // And: Count should be reduced compared to initial
    const count = await iconButtons.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(initialIconCount);
  });

  test("should show 'No icons found' when search has no results", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // When: Type search query with no matches
    await getIconSearchInput(page).fill("xyznonexistent");

    // Then: Should show no icons found message
    await expect(page.getByText(/no icons found/i)).toBeVisible();
  });

  test("should select icon and show in picker button", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // When: Search for terminal and click the terminal icon
    await getIconSearchInput(page).fill("terminal");
    await getIconByName(page, "terminal").click();

    // Then: Popover should close
    await expect(getIconPickerPopover(page)).toBeHidden();

    // And: Icon picker button should show the selected icon
    const iconButton = getIconPickerButton(page);
    await expect(iconButton.locator(".codicon-terminal")).toBeVisible();
  });

  test("should replace existing icon when selecting new icon", async ({ page }) => {
    // Given: Open add command dialog and select an icon first
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await getIconSearchInput(page).fill("folder");
    await getIconByName(page, "folder").click();

    // Add display text
    await getDisplayTextInput(page).fill("My Command");

    // When: Open icon picker and select a different icon
    await openIconPicker(page);
    await getIconSearchInput(page).fill("terminal");
    await getIconByName(page, "terminal").click();

    // Then: Icon picker button should show the new icon
    const iconButton = getIconPickerButton(page);
    await expect(iconButton.locator(".codicon-terminal")).toBeVisible();

    // And: Display text should remain unchanged
    await expect(getDisplayTextInput(page)).toHaveValue("My Command");
  });

  test("should show selected icon in the picker button", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Select an icon via picker
    await openIconPicker(page);
    await getIconSearchInput(page).fill("terminal");
    await getIconByName(page, "terminal").click();

    // Then: Icon picker button should show the terminal icon
    const iconButton = getIconPickerButton(page);
    await expect(iconButton.locator(".codicon-terminal")).toBeVisible();
  });

  test("should show 'Icon' label when no icon is selected", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // Then: Icon picker button should show "Icon" label (making purpose clear)
    const iconButton = getIconPickerButton(page);
    await expect(iconButton).toContainText(/icon/i);
  });

  test("should save command with selected icon", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Select an icon and fill form
    await openIconPicker(page);
    await getIconSearchInput(page).fill("rocket");
    await getIconByName(page, "rocket").click();

    // Fill in display text (separate from icon)
    await getDisplayTextInput(page).fill("Launch");

    await fillCommandForm(page, {
      command: TEST_COMMAND.command,
    });
    await saveCommandDialog(page);

    // Then: Command should be saved with icon
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "Launch",
    });
    await expect(commandCard).toBeVisible();

    // And: Icon should be visible in the card
    await expect(commandCard.locator(".codicon-rocket")).toBeVisible();
  });

  test("should preserve icon when editing command", async ({ page }) => {
    // Given: Create a command with icon
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await getIconSearchInput(page).fill("debug");
    await getIconByName(page, "debug").click();

    // Fill display text (separate input)
    await getDisplayTextInput(page).fill("Debug Test");
    await fillCommandForm(page, {
      command: "echo 'debug'",
    });
    await saveCommandDialog(page);

    // When: Open edit dialog
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "Debug Test",
    });
    await commandCard.getByRole("button", { name: /edit/i }).click();

    // Then: Display text input should have the text
    await expect(getDisplayTextInput(page)).toHaveValue("Debug Test");

    // And: Icon picker button should show the debug icon
    await expect(getIconPickerButton(page).locator(".codicon-debug")).toBeVisible();
  });

  test("should close popover with Escape key", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await expect(getIconPickerPopover(page)).toBeVisible();

    // When: Press Escape key
    await page.keyboard.press("Escape");

    // Then: Popover should be hidden
    await expect(getIconPickerPopover(page)).toBeHidden();
  });

  test("should show 'Show all' button when more than 100 icons available", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // Then: Should show 'Show all' button
    const showAllButton = page.getByRole("button", { name: /show all.*icons/i });
    await expect(showAllButton).toBeVisible();
  });

  test("should show all icons when clicking 'Show all' button", async ({ page }) => {
    // Given: Open add command dialog and icon picker
    await openAddCommandDialog(page);
    await openIconPicker(page);

    // Get initial icon count
    const initialCount = await getIconGridButtons(page).count();

    // When: Click 'Show all' button
    await page.getByRole("button", { name: /show all.*icons/i }).click();

    // Then: Should show more icons
    const finalCount = await getIconGridButtons(page).count();
    expect(finalCount).toBeGreaterThan(initialCount);

    // And: 'Show all' button should be hidden
    await expect(page.getByRole("button", { name: /show all.*icons/i })).toBeHidden();
  });

  test("should highlight currently selected icon in the grid", async ({ page }) => {
    // Given: Open add command dialog and select an icon
    await openAddCommandDialog(page);
    await openIconPicker(page);
    await getIconSearchInput(page).fill("terminal");
    await getIconByName(page, "terminal").click();

    // When: Open icon picker again
    await openIconPicker(page);
    await getIconSearchInput(page).fill("terminal");

    // Then: Terminal icon button should have selected styling (bg-accent class)
    const terminalButton = getIconByName(page, "terminal");
    await expect(terminalButton).toHaveClass(/bg-accent/);
  });

  test("should allow creating command with only display text (no icon)", async ({ page }) => {
    // Given: Open add command dialog
    await openAddCommandDialog(page);

    // When: Only fill display text without selecting an icon
    await getDisplayTextInput(page).fill("No Icon Button");
    await fillCommandForm(page, {
      command: "echo 'test'",
    });
    await saveCommandDialog(page);

    // Then: Command should be saved without icon
    const commandCard = page.locator('[data-testid="command-card"]', {
      hasText: "No Icon Button",
    });
    await expect(commandCard).toBeVisible();

    // And: No codicon should be visible in the card
    await expect(commandCard.locator(".codicon")).toBeHidden();
  });
});
