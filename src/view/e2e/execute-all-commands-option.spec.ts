import { expect, test } from "@playwright/test";

const GROUP_CONFIG = {
  editButtonName: "Edit command $(git-branch) Git",
  groupName: "$(git-branch) Git",
};

test.describe("Test 19: Execute All Commands Option", () => {
  test("should toggle Execute All checkbox and persist state", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // When: Click Edit button for Git group
    await page.getByRole("button", { name: GROUP_CONFIG.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

    // Verify Execute All checkbox exists and is initially unchecked
    const executeAllCheckbox = page.getByRole("checkbox", {
      name: "Execute all commands simultaneously",
    });
    await expect(executeAllCheckbox).toBeVisible();
    await expect(executeAllCheckbox).not.toBeChecked();

    // Check the Execute All checkbox
    await executeAllCheckbox.check();

    // Verify checkbox is now checked
    await expect(executeAllCheckbox).toBeChecked();

    // Save changes
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify dialog closed
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Reopen edit dialog to verify persistence
    await page.getByRole("button", { name: GROUP_CONFIG.editButtonName }).click();

    // Verify Execute All checkbox state persisted
    await expect(
      page.getByRole("checkbox", {
        name: "Execute all commands simultaneously",
      })
    ).toBeChecked();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Restore original state
    await page.goto("/");
    await page.getByRole("button", { name: GROUP_CONFIG.editButtonName }).click();
    await page.getByRole("checkbox", { name: "Execute all commands simultaneously" }).uncheck();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();
  });
});
