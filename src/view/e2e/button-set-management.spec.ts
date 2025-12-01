import { expect, test } from "@playwright/test";

const BUTTON_SET_NAME = "Test Button Set";
const RENAMED_SET_NAME = "Renamed Button Set";

test.describe("Test H7: Button Set Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should create a new button set", async ({ page }) => {
    // Given: Default button set is selected
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await expect(buttonSetSelector).toContainText("Default");

    // When: Open dropdown and click "Create new set"
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();

    // Then: Create dialog should appear
    const dialog = page.getByRole("dialog", { name: "Create New Button Set" });
    await expect(dialog).toBeVisible();

    // When: Enter name and create
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Toast should show success message
    const toast = page.locator("[data-sonner-toast]", {
      hasText: `Button set "${BUTTON_SET_NAME}" created`,
    });
    await expect(toast).toBeVisible();

    // And: Button set selector should show new set name
    await expect(buttonSetSelector).toContainText(BUTTON_SET_NAME);
  });

  test("should switch between button sets", async ({ page }) => {
    // Given: Create a button set first
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for creation toast to appear and disappear
    const createToast = page.locator("[data-sonner-toast]");
    await createToast.waitFor({ state: "visible" });
    await createToast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Switch to Default
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Default" }).click();

    // Then: Should show switch success toast
    const switchToast = page.locator("[data-sonner-toast]", {
      hasText: "Switched to default buttons",
    });
    await expect(switchToast).toBeVisible();

    // And: Button set selector should show "Default"
    await expect(buttonSetSelector).toContainText("Default");
  });

  test("should rename a button set", async ({ page }) => {
    // Given: Create a button set first
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for creation toast to disappear
    const createToast = page.locator("[data-sonner-toast]");
    await createToast.waitFor({ state: "visible" });
    await createToast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Open dropdown and click rename button
    await buttonSetSelector.click();
    await page.getByRole("button", { name: "Rename set" }).click();

    // Then: Rename dialog should appear
    const dialog = page.getByRole("dialog", { name: "Rename Button Set" });
    await expect(dialog).toBeVisible();

    // And: Input should have current name
    const input = page.getByRole("textbox", { name: "New Name" });
    await expect(input).toHaveValue(BUTTON_SET_NAME);

    // When: Enter new name and rename
    await input.fill(RENAMED_SET_NAME);
    await page.getByRole("button", { name: "Rename" }).click();

    // Then: Toast should show success message
    const toast = page.locator("[data-sonner-toast]", {
      hasText: `Button set renamed to "${RENAMED_SET_NAME}"`,
    });
    await expect(toast).toBeVisible();

    // And: Button set selector should show renamed name
    await expect(buttonSetSelector).toContainText(RENAMED_SET_NAME);
  });

  test("should delete a button set", async ({ page }) => {
    // Given: Create a button set first
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for creation toast to disappear
    const createToast = page.locator("[data-sonner-toast]");
    await createToast.waitFor({ state: "visible" });
    await createToast.waitFor({ state: "hidden", timeout: 5000 });

    // Switch to Default first (to delete non-active set)
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Default" }).click();
    const switchToast = page.locator("[data-sonner-toast]");
    await switchToast.waitFor({ state: "visible" });
    await switchToast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Open dropdown and click "Delete set"
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Delete set" }).click();

    // Then: Delete dialog should appear
    const dialog = page.getByRole("dialog", { name: "Delete Button Set" });
    await expect(dialog).toBeVisible();

    // When: Select the set and delete
    await page.getByRole("button", { name: `${BUTTON_SET_NAME} 0 buttons` }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Then: Toast should show success message
    const deleteToast = page.locator("[data-sonner-toast]", {
      hasText: `Button set "${BUTTON_SET_NAME}" deleted`,
    });
    await expect(deleteToast).toBeVisible();

    // And: Delete set option should not be visible (no sets to delete)
    await buttonSetSelector.click();
    await expect(page.getByRole("menuitem", { name: "Delete set" })).not.toBeVisible();
  });

  test("should show button count in dropdown", async ({ page }) => {
    // Given: Create a button set
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for toast to disappear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible" });
    await toast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Open dropdown
    await buttonSetSelector.click();

    // Then: Should show "0" count for new empty set
    const setItem = page.getByRole("menuitem", { name: new RegExp(BUTTON_SET_NAME) });
    await expect(setItem).toContainText("0");
  });

  test("should validate duplicate set name", async ({ page }) => {
    // Given: Create a button set
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for toast to disappear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible" });
    await toast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Try to create another set with same name
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Should show error message (en.json: "A set with this name already exists")
    const errorMessage = page.locator("text=A set with this name already exists");
    await expect(errorMessage).toBeVisible();
  });

  test("should validate empty set name", async ({ page }) => {
    // When: Open create dialog
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();

    // Then: Create button should be disabled when name is empty
    const createButton = page.getByRole("button", { name: "Create" });
    await expect(createButton).toBeDisabled();
  });

  test("should disable rename button when name unchanged", async ({ page }) => {
    // Given: Create a button set
    const buttonSetSelector = page.getByRole("button", { name: "Button Set" });
    await buttonSetSelector.click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill(BUTTON_SET_NAME);
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for toast to disappear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible" });
    await toast.waitFor({ state: "hidden", timeout: 5000 });

    // When: Open rename dialog
    await buttonSetSelector.click();
    await page.getByRole("button", { name: "Rename set" }).click();

    // Then: Rename button should be disabled (name unchanged)
    const renameButton = page.getByRole("button", { name: "Rename" });
    await expect(renameButton).toBeDisabled();
  });
});
