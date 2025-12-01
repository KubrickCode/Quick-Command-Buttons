import { expect, test } from "@playwright/test";

test.describe("Test H4: Reorder Child Commands in Group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for mock data to load
    await page.waitForTimeout(500);
  });

  test("should display child commands in group edit dialog", async ({
    page,
  }) => {
    // Click edit on Git group
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();

    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Verify Group Commands is selected
    const groupRadio = page.getByRole("radio", { name: "Group Commands" });
    await expect(groupRadio).toBeChecked();

    // Verify child commands are displayed in Group Commands section
    // Look for inputs with Pull and Push values
    await expect(page.locator('input[value*="Pull"]')).toBeVisible();
    await expect(page.locator('input[value*="Push"]')).toBeVisible();
  });

  test("should have drag handles for reordering child commands", async ({
    page,
  }) => {
    // Click edit on Git group
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();

    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Verify drag handles exist for each child command
    const dragHandles = dialog.getByRole("button", {
      name: "Drag handle to reorder command",
    });
    const handleCount = await dragHandles.count();

    // Should have 3 drag handles (Pull, Push, Check Status)
    expect(handleCount).toBe(3);
  });

  test("should save group after editing child command name", async ({
    page,
  }) => {
    // Click edit on Git group
    await page.getByRole("button", { name: /Edit command.*Git/ }).click();

    const dialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(dialog).toBeVisible();

    // Edit first child command name
    const firstCommandName = page
      .getByRole("textbox", { name: "Command name" })
      .first();
    await firstCommandName.clear();
    await firstCommandName.fill("$(arrow-down) Pull Origin");

    // Save
    await page.getByRole("button", { name: "Save" }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });
});
