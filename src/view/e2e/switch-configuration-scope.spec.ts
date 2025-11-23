import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const UI_TEXT = {
  WORKSPACE_DESCRIPTION: "Workspace: Project-specific commands shared with team",
  WORKSPACE_SAVED_TO: "Saved to .vscode/settings.json",
  GLOBAL_DESCRIPTION: "Global: Personal commands across all projects",
  GLOBAL_SAVED_TO: "Saved to user settings",
} as const;

const BUTTON_NAMES = {
  SWITCH_TO_GLOBAL: /Switch to Global settings/,
  SWITCH_TO_WORKSPACE: /Switch to Workspace settings/,
} as const;

const BORDER_CLASSES = {
  WORKSPACE: /border-l-amber-500/,
  GLOBAL: /border-l-blue-500/,
} as const;

const switchToGlobal = async (page: Page) => {
  const workspaceButton = page.getByRole("button", {
    name: BUTTON_NAMES.SWITCH_TO_GLOBAL,
  });
  await workspaceButton.click();
};

const switchToWorkspace = async (page: Page) => {
  const globalButton = page.getByRole("button", {
    name: BUTTON_NAMES.SWITCH_TO_WORKSPACE,
  });
  await globalButton.click();
};

const verifyWorkspaceMode = async (page: Page) => {
  const workspaceButton = page.getByRole("button", {
    name: BUTTON_NAMES.SWITCH_TO_GLOBAL,
  });
  await expect(workspaceButton).toBeVisible();
  await expect(workspaceButton).toContainText("Workspace");
  await expect(page.getByText(UI_TEXT.WORKSPACE_DESCRIPTION)).toBeVisible();
  await expect(page.getByText(UI_TEXT.WORKSPACE_SAVED_TO)).toBeVisible();

  const configScopeSection = page.locator('[data-testid="config-scope-section"]');
  await expect(configScopeSection).toHaveClass(BORDER_CLASSES.WORKSPACE);
};

const verifyGlobalMode = async (page: Page) => {
  const globalButton = page.getByRole("button", {
    name: BUTTON_NAMES.SWITCH_TO_WORKSPACE,
  });
  await expect(globalButton).toBeVisible();
  await expect(globalButton).toContainText("Global");
  await expect(page.getByText(UI_TEXT.GLOBAL_DESCRIPTION)).toBeVisible();
  await expect(page.getByText(UI_TEXT.GLOBAL_SAVED_TO)).toBeVisible();

  const configScopeSection = page.locator('[data-testid="config-scope-section"]');
  await expect(configScopeSection).toHaveClass(BORDER_CLASSES.GLOBAL);
};

test.describe("Switch Workspace/Global Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should switch between Workspace and Global configuration modes", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // Then: Verify initial state is Workspace mode
    await verifyWorkspaceMode(page);

    // When: Click Workspace button to switch to Global mode
    await switchToGlobal(page);

    // Then: Verify switched to Global mode
    await verifyGlobalMode(page);

    // When: Click Global button to switch back to Workspace mode
    await switchToWorkspace(page);

    // Then: Verify returned to Workspace mode
    await verifyWorkspaceMode(page);
  });

  test("should display correct icons for each configuration mode", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // Then: Verify Workspace mode has folder icon and amber border
    await verifyWorkspaceMode(page);

    // When: Switch to Global mode
    await switchToGlobal(page);

    // Then: Verify Global mode has globe icon and blue border
    await verifyGlobalMode(page);

    // When: Switch back to Workspace
    await switchToWorkspace(page);

    // Then: Verify Workspace amber border is back
    await verifyWorkspaceMode(page);
  });

  test("should persist configuration scope state across interactions", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Global mode
    await switchToGlobal(page);

    // Then: Verify Global mode is active
    await verifyGlobalMode(page);

    // When: Perform other actions (e.g., open and close add dialog)
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();

    // Then: Verify Global mode is still active (state persisted)
    await verifyGlobalMode(page);
  });

  test("should show unsaved changes warning when switching scope with edits", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Test Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo test");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch to Global without saving
    await switchToGlobal(page);

    // Then: Unsaved changes dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unsaved Changes" })).toBeVisible();
    await expect(
      page.getByText("You have unsaved changes. What would you like to do?")
    ).toBeVisible();
  });

  test("should cancel scope switch when clicking Cancel in unsaved changes dialog", async ({
    page,
  }) => {
    // Given: Configuration page is loaded with unsaved changes

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Test Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo test");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch and cancel
    await switchToGlobal(page);
    await page.getByRole("button", { name: "Cancel" }).click();

    // Then: Should remain in Workspace mode
    await verifyWorkspaceMode(page);

    // Then: Dialog should be closed
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toBeVisible();
  });

  test("should discard changes and switch when clicking Don't Save", async ({ page }) => {
    // Given: Configuration page is loaded with unsaved changes

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Test Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo test");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch and discard changes
    await switchToGlobal(page);
    await page.getByRole("button", { name: "Don't Save" }).click();

    // Then: Should switch to Global mode
    await verifyGlobalMode(page);

    // Then: Added command should not be visible (changes discarded)
    await expect(page.getByText("Test Command")).not.toBeVisible();
  });

  test("should save and switch when clicking Save & Switch", async ({ page }) => {
    // Given: Configuration page is loaded with unsaved changes

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Test Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo test");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch and save changes
    await switchToGlobal(page);
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Then: Should switch to Global mode
    await verifyGlobalMode(page);

    // When: Switch back to Workspace
    await switchToWorkspace(page);

    // Then: Saved command should be visible
    await expect(page.getByText("Test Command")).toBeVisible();
  });

  test("should not show warning dialog when switching without changes", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Global without making any changes
    await switchToGlobal(page);

    // Then: Dialog should not appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toBeVisible();

    // Then: Should directly switch to Global mode
    await verifyGlobalMode(page);
  });
});
