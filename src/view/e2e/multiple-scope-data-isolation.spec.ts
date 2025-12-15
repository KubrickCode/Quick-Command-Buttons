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

const switchToLocal = async (page: Page) => {
  await page.getByRole("radio", { name: BUTTON_NAMES.SWITCH_TO_LOCAL }).click();
};

test.describe("Multiple Scope Data Isolation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("each scope maintains isolated command data across all three scopes", async ({ page }) => {
    // Step 1: Add "Workspace Cmd" in Workspace scope
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Workspace Cmd", command: "echo workspace" });
    await saveCommandDialog(page);

    // Save and switch to Global
    await switchToGlobal(page);
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Step 2: Add "Global Cmd" in Global scope
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Global Cmd", command: "echo global" });
    await saveCommandDialog(page);

    // Verify only Global Cmd is visible (not Workspace Cmd)
    await expect(page.getByText("Global Cmd")).toBeVisible();
    await expect(page.getByText("Workspace Cmd")).not.toBeVisible();

    // Save and switch to Local
    await switchToLocal(page);
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Step 3: Add "Local Cmd" in Local scope
    await openAddCommandDialog(page);
    await fillCommandForm(page, { name: "Local Cmd", command: "echo local" });
    await saveCommandDialog(page);

    // Verify only Local Cmd is visible
    await expect(page.getByText("Local Cmd")).toBeVisible();
    await expect(page.getByText("Global Cmd")).not.toBeVisible();
    await expect(page.getByText("Workspace Cmd")).not.toBeVisible();

    // Save and switch to Workspace to verify isolation
    await switchToWorkspace(page);
    await page.getByRole("button", { name: "Save & Switch" }).click();

    // Verify only Workspace Cmd is visible
    await expect(page.getByText("Workspace Cmd")).toBeVisible();
    await expect(page.getByText("Global Cmd")).not.toBeVisible();
    await expect(page.getByText("Local Cmd")).not.toBeVisible();

    // Switch to Global to verify
    await switchToGlobal(page);
    await expect(page.getByText("Global Cmd")).toBeVisible();
    await expect(page.getByText("Workspace Cmd")).not.toBeVisible();
    await expect(page.getByText("Local Cmd")).not.toBeVisible();

    // Switch to Local to verify
    await switchToLocal(page);
    await expect(page.getByText("Local Cmd")).toBeVisible();
    await expect(page.getByText("Global Cmd")).not.toBeVisible();
    await expect(page.getByText("Workspace Cmd")).not.toBeVisible();
  });
});
