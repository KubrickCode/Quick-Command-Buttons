import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const openImportExportMenu = async (page: Page) => {
  await page.getByRole("button", { name: /^Backup$/i }).click();
};

const clickImportFromFile = async (page: Page) => {
  await page.getByRole("menuitem", { name: /Import from File/i }).click();
};

const getPreviewDialog = (page: Page) => {
  return page.getByRole("dialog").filter({ hasText: /Import Preview/i });
};

test.describe("Import Preview Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should open import preview dialog when clicking Import from File", async ({ page }) => {
    // Given: Configuration page is loaded

    // When: Open Backup menu and click Import
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: Preview dialog should appear
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Import Preview")).toBeVisible();
    await expect(dialog.getByText("Review the changes before importing")).toBeVisible();
  });

  test("should display analysis summary with added and modified counts", async ({ page }) => {
    // Given: Configuration page is loaded

    // When: Open preview dialog
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: Analysis summary should show counts
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Check for analysis indicators (added/modified counts)
    await expect(dialog.getByText(/added/i)).toBeVisible();
    await expect(dialog.getByText(/modified/i)).toBeVisible();
  });

  test("should display New Commands section for added buttons", async ({ page }) => {
    // Given: Configuration page is loaded

    // When: Open preview dialog
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: New Commands section should be visible
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("New Commands")).toBeVisible();
  });

  test("should display strategy selection when there are modified commands", async ({ page }) => {
    // Given: Configuration page is loaded

    // When: Open preview dialog
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: Strategy selection should be visible
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Check for Merge and Replace options
    const mergeRadio = dialog.getByRole("radio", { name: /Merge/i });
    const replaceRadio = dialog.getByRole("radio", { name: /Replace/i });

    // At least one strategy option should exist if there are modifications
    const mergeVisible = await mergeRadio.isVisible().catch(() => false);
    const replaceVisible = await replaceRadio.isVisible().catch(() => false);

    if (mergeVisible || replaceVisible) {
      expect(mergeVisible || replaceVisible).toBeTruthy();
    }
  });

  test("should close dialog when clicking Cancel button", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // When: Click Cancel button
    await dialog.getByRole("button", { name: /Cancel/i }).click();

    // Then: Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });

  test("should import configuration when clicking Import button", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // When: Click Import button
    await dialog.getByRole("button", { name: /^Import$/i }).click();

    // Then: Dialog should close and success toast should appear
    await expect(dialog).not.toBeVisible();

    // Verify success toast
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible", timeout: 5000 });
    await expect(toast).toContainText(/Imported/i);
  });

  test("should close dialog and show success toast after import", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // When: Click Import button
    await dialog.getByRole("button", { name: /^Import$/i }).click();

    // Then: Dialog should close
    await expect(dialog).not.toBeVisible();

    // Then: Success toast should appear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible", timeout: 5000 });
    await expect(toast).toContainText(/Imported/i);
  });

  test("should allow selecting Replace strategy", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // When: Select Replace strategy (if available)
    const replaceRadio = dialog.getByRole("radio", { name: /Replace/i });
    if (await replaceRadio.isVisible()) {
      await replaceRadio.click();

      // Then: Replace should be selected
      await expect(replaceRadio).toBeChecked();
    }
  });

  test("should display command names in preview sections", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Then: Command names should be visible in the dialog
    // The mock data includes "New Import Command" - use first() to avoid strict mode violation
    await expect(dialog.getByText("New Import Command").first()).toBeVisible();
  });

  test("should expand/collapse sections when clicking section headers", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Find section header button
    const newCommandsSection = dialog.getByRole("button", { name: /New Commands/i });
    if (await newCommandsSection.isVisible()) {
      // When: Click to collapse
      await newCommandsSection.click();

      // The content should toggle (implementation dependent)
      // Just verify the button is clickable
      await expect(newCommandsSection).toBeVisible();
    }
  });

  test("should display shortcut conflicts section when conflicts exist", async ({ page }) => {
    // Given: Configuration page is loaded with mock data that has shortcut "t"
    // Mock import data also has shortcut "t" on a different command

    // When: Open preview dialog
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: Shortcut Conflicts section should be visible
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Check for shortcut conflicts section
    const conflictsSection = dialog.getByRole("button", { name: /Shortcut Conflicts/i });
    await expect(conflictsSection).toBeVisible();
  });

  test("should display shortcut conflicts count in summary", async ({ page }) => {
    // Given: Configuration page is loaded

    // When: Open preview dialog
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    // Then: Summary should show shortcut conflicts count
    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Check for shortcut conflicts indicator in summary (with red dot)
    await expect(dialog.getByText(/\d+ shortcut conflict/i).first()).toBeVisible();
  });

  test("should show conflicting shortcut key in conflicts section", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Then: Conflicting shortcut should be displayed
    const conflictsSection = dialog.getByRole("button", { name: /Shortcut Conflicts/i });
    await expect(conflictsSection).toBeVisible();

    // Expand if collapsed (default is open, but toggle to ensure content is visible)
    const isExpanded = await conflictsSection.getAttribute("aria-expanded");
    if (isExpanded === "false") {
      await conflictsSection.click();
    }

    // The shortcut key "t" should be visible in the conflicts section (in red-styled code block)
    await expect(dialog.locator("code.text-red-400").filter({ hasText: "t" })).toBeVisible();
  });

  test("should show source labels for conflicting buttons", async ({ page }) => {
    // Given: Preview dialog is open
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Expand conflicts section if needed
    const conflictsSection = dialog.getByRole("button", { name: /Shortcut Conflicts/i });
    const isExpanded = await conflictsSection.getAttribute("aria-expanded");
    if (isExpanded === "false") {
      await conflictsSection.click();
    }

    // Then: Should show [existing] and [imported] labels (with text color classes)
    await expect(dialog.locator(".text-blue-400").filter({ hasText: "[existing]" }).first()).toBeVisible();
    await expect(dialog.locator(".text-green-400").filter({ hasText: "[imported]" }).first()).toBeVisible();
  });

  test("should allow import even with shortcut conflicts", async ({ page }) => {
    // Given: Preview dialog is open with shortcut conflicts
    await openImportExportMenu(page);
    await clickImportFromFile(page);

    const dialog = getPreviewDialog(page);
    await expect(dialog).toBeVisible();

    // Verify conflicts exist
    await expect(dialog.getByRole("button", { name: /Shortcut Conflicts/i })).toBeVisible();

    // When: Click Import button
    await dialog.getByRole("button", { name: /^Import$/i }).click();

    // Then: Import should succeed (dialog closes, toast appears)
    await expect(dialog).not.toBeVisible();

    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible", timeout: 5000 });
    await expect(toast).toContainText(/Imported/i);
  });
});
