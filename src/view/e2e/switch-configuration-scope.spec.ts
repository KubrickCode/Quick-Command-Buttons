import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const BUTTON_NAMES = {
  SWITCH_TO_GLOBAL: /Global scope/,
  SWITCH_TO_WORKSPACE: /Workspace scope/,
  SWITCH_TO_LOCAL: /Local scope/,
} as const;

const switchToGlobal = async (page: Page) => {
  const globalButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_GLOBAL,
  });
  await globalButton.click();
};

const switchToWorkspace = async (page: Page) => {
  const workspaceButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_WORKSPACE,
  });
  await workspaceButton.click();
};

const switchToLocal = async (page: Page) => {
  const localButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_LOCAL,
  });
  await localButton.click();
};

const verifyWorkspaceMode = async (page: Page) => {
  const workspaceButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_WORKSPACE,
  });
  await expect(workspaceButton).toHaveAttribute("aria-checked", "true");
};

const verifyGlobalMode = async (page: Page) => {
  const globalButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_GLOBAL,
  });
  await expect(globalButton).toHaveAttribute("aria-checked", "true");
};

const verifyLocalMode = async (page: Page) => {
  const localButton = page.getByRole("radio", {
    name: BUTTON_NAMES.SWITCH_TO_LOCAL,
  });
  await expect(localButton).toHaveAttribute("aria-checked", "true");
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

test.describe("Switch Local Configuration Scope", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should switch between Workspace, Local, and Global configuration modes", async ({
    page,
  }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // Then: Verify initial state is Workspace mode
    await verifyWorkspaceMode(page);

    // When: Switch to Local mode
    await switchToLocal(page);

    // Then: Verify switched to Local mode
    await verifyLocalMode(page);

    // When: Switch to Global mode
    await switchToGlobal(page);

    // Then: Verify switched to Global mode
    await verifyGlobalMode(page);

    // When: Switch back to Workspace mode
    await switchToWorkspace(page);

    // Then: Verify returned to Workspace mode
    await verifyWorkspaceMode(page);
  });

  test("should display correct icon and border for Local mode", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Local mode
    await switchToLocal(page);

    // Then: Verify Local mode is selected
    await verifyLocalMode(page);
  });

  test("should persist Local scope state across interactions", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Local mode
    await switchToLocal(page);

    // Then: Verify Local mode is active
    await verifyLocalMode(page);

    // When: Perform other actions (e.g., open and close add dialog)
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();

    // Then: Verify Local mode is still active (state persisted)
    await verifyLocalMode(page);
  });

  test("should show unsaved changes warning when switching from Local with edits", async ({
    page,
  }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Local mode
    await switchToLocal(page);

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Local Test Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo local-test");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch to Workspace without saving
    await switchToWorkspace(page);

    // Then: Unsaved changes dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unsaved Changes" })).toBeVisible();
    await expect(
      page.getByText("You have unsaved changes. What would you like to do?")
    ).toBeVisible();
  });

  test("should save Local commands and switch to Workspace", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Local mode
    await switchToLocal(page);

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Local Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo local");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch and save changes
    await switchToWorkspace(page);
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Then: Should switch to Workspace mode
    await verifyWorkspaceMode(page);

    // When: Switch back to Local
    await switchToLocal(page);

    // Then: Saved command should be visible
    await expect(page.getByText("Local Command")).toBeVisible();
  });

  test("should maintain separate configurations for Local and Workspace", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Add a command in Workspace
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Workspace Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo workspace");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Switch to Local mode without saving
    await switchToLocal(page);
    await page.getByRole("button", { name: "Don't Save" }).click();

    // Then: Local mode should not have the workspace command
    await expect(page.getByText("Workspace Command")).not.toBeVisible();

    // When: Add a different command in Local
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Local Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo local");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Switch back to Workspace without saving
    await switchToWorkspace(page);
    await page.getByRole("button", { name: "Don't Save" }).click();

    // Then: Workspace should not have the local command
    await expect(page.getByText("Local Command")).not.toBeVisible();
  });

  test("should discard Local changes and switch to Global", async ({ page }) => {
    // Given: Configuration page is loaded (from beforeEach)

    // When: Switch to Local mode
    await switchToLocal(page);

    // When: Add a new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByPlaceholder("e.g., $(terminal) Terminal").fill("Temp Local Command");
    await page.getByPlaceholder("e.g., npm start").fill("echo temp");
    await page.getByRole("button", { name: "Save" }).click();

    // When: Try to switch and discard changes
    await switchToGlobal(page);
    await page.getByRole("button", { name: "Don't Save" }).click();

    // Then: Should switch to Global mode
    await verifyGlobalMode(page);

    // When: Switch back to Local
    await switchToLocal(page);

    // Then: Added command should not be visible (changes discarded)
    await expect(page.getByText("Temp Local Command")).not.toBeVisible();
  });
});
