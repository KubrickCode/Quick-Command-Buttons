import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fillCommandForm, openAddCommandDialog, saveCommandDialog } from "./helpers/test-helpers";

const BUTTON_NAMES = {
  SWITCH_TO_GLOBAL: /Global scope/,
  SWITCH_TO_LOCAL: /Local scope/,
  SWITCH_TO_WORKSPACE: /Workspace scope/,
} as const;

const switchToGlobal = async (page: Page) => {
  await page.getByRole("radio", { name: BUTTON_NAMES.SWITCH_TO_GLOBAL }).click();
};

const switchToWorkspace = async (page: Page) => {
  await page.getByRole("radio", { name: BUTTON_NAMES.SWITCH_TO_WORKSPACE }).click();
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

test.describe("Unsaved Changes Dialog - All Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Cancel action maintains original scope and preserves changes", async ({ page }) => {
    // Add a command (creates unsaved changes)
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Unsaved Test", command: "echo test" });
    await saveCommandDialog(page);

    // Verify command was added
    await expect(page.getByText("Unsaved Test")).toBeVisible();

    // Attempt scope switch
    await switchToGlobal(page);

    // Unsaved changes dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unsaved Changes" })).toBeVisible();

    // Click Cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // Should remain in Workspace mode
    await verifyWorkspaceMode(page);

    // Unsaved command should still be visible
    await expect(page.getByText("Unsaved Test")).toBeVisible();
  });

  test("Don't Save action discards changes and switches scope", async ({ page }) => {
    // Add a command (creates unsaved changes)
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Discard Test", command: "echo discard" });
    await saveCommandDialog(page);

    // Verify command was added
    await expect(page.getByText("Discard Test")).toBeVisible();

    // Attempt scope switch
    await switchToGlobal(page);

    // Unsaved changes dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click Don't Save
    await page.getByRole("button", { name: "Don't Save" }).click();

    // Should switch to Global mode
    await verifyGlobalMode(page);

    // Discarded command should not be visible in Global scope
    await expect(page.getByText("Discard Test")).not.toBeVisible();

    // Switch back to Workspace
    await switchToWorkspace(page);

    // Command should be gone (was discarded, never saved)
    await expect(page.getByText("Discard Test")).not.toBeVisible();
  });

  test("Save & Switch action saves changes and switches scope", async ({ page }) => {
    // Add a command (creates unsaved changes)
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Save Switch Test", command: "echo save-switch" });
    await saveCommandDialog(page);

    // Verify command was added
    await expect(page.getByText("Save Switch Test")).toBeVisible();

    // Attempt scope switch
    await switchToGlobal(page);

    // Unsaved changes dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click Save & Switch
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Should switch to Global mode
    await verifyGlobalMode(page);

    // Command should not be visible in Global (it was saved to Workspace)
    await expect(page.getByText("Save Switch Test")).not.toBeVisible();

    // Switch back to Workspace
    await switchToWorkspace(page);

    // Command should be visible (was saved before switching)
    await expect(page.getByText("Save Switch Test")).toBeVisible();
  });

  test("dialog displays correct message content", async ({ page }) => {
    // Add a command (creates unsaved changes)
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Message Test", command: "echo message" });
    await saveCommandDialog(page);

    // Attempt scope switch
    await switchToGlobal(page);

    // Verify dialog content
    await expect(page.getByRole("heading", { name: "Unsaved Changes" })).toBeVisible();
    await expect(
      page.getByText("You have unsaved changes. What would you like to do?")
    ).toBeVisible();

    // Verify all three buttons are present
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Don't Save" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save & Switch" })).toBeVisible();

    // Close dialog
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  test("no dialog appears when switching without changes", async ({ page }) => {
    // Don't make any changes, just switch scope
    await switchToGlobal(page);

    // Dialog should not appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toBeVisible();

    // Should directly switch to Global mode
    await verifyGlobalMode(page);
  });
});
