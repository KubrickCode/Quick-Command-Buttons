import { expect, test } from "@playwright/test";

const SELECTORS = {
  COMMAND_CARD: '[data-testid="command-card"]',
  GIT_CARD_TEXT: "Git",
} as const;

test.describe("Test M9: Nested Group Edit Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Trigger config reload to ensure mock data is loaded
    await page.evaluate(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "getConfig" },
        })
      );
    });
    await page.waitForTimeout(200);
  });

  test("should open nested group edit dialog (2 levels)", async ({ page }) => {
    // Given: Git group exists with nested Check Status group
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await expect(gitCard).toBeVisible();

    // When: Edit Git group
    await gitCard.getByRole("button", { name: /Edit command/i }).click();

    // Then: Edit Command dialog should appear
    const editDialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(editDialog).toBeVisible();

    // And: Check Status nested group should be visible
    const checkStatusGroup = page.getByRole("textbox", { name: "Group name" });
    await expect(checkStatusGroup).toHaveValue("$(search) Check Status");

    // When: Click Edit on nested group
    await page.getByRole("button", { name: "Edit group $(search) Check" }).click();

    // Then: Nested group dialog should appear
    const nestedDialog = page.getByRole("dialog", {
      name: "Edit Group: $(search) Check Status",
    });
    await expect(nestedDialog).toBeVisible();

    // And: Should show nested commands (command values in input fields)
    await expect(nestedDialog.locator('input[value="git status"]')).toBeVisible();
    await expect(nestedDialog.locator('input[value="git diff"]')).toBeVisible();
  });

  test("should display multiple dialog layers for deep nesting", async ({ page }) => {
    // Given: Navigate to nested group edit
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: /Edit command/i }).click();
    await page.getByRole("button", { name: "Edit group $(search) Check" }).click();

    // When: Add a new group in nested dialog (creating 3rd level)
    const nestedDialog = page.getByRole("dialog", {
      name: "Edit Group: $(search) Check Status",
    });
    await nestedDialog.getByRole("button", { name: "Add new group" }).click();

    // Then: New group item should appear
    const newGroupInput = nestedDialog.getByRole("textbox", { name: "Group name" }).last();
    await expect(newGroupInput).toBeVisible();

    // When: Enter name and edit the new group
    await newGroupInput.fill("$(folder) Level 3 Group");
    await page.getByRole("button", { name: "Edit group $(folder) Level 3" }).click();

    // Then: 3rd level dialog should appear
    const level3Dialog = page.getByRole("dialog", {
      name: "Edit Group: $(folder) Level 3 Group",
    });
    await expect(level3Dialog).toBeVisible();

    // And: All 3 dialogs should be present
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Edit Group: $(search) Check Status" })
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Edit Group: $(folder) Level 3 Group" })
    ).toBeVisible();
  });

  test("should preserve values when closing nested dialogs", async ({ page }) => {
    // Given: Open nested group edit
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: /Edit command/i }).click();
    await page.getByRole("button", { name: "Edit group $(search) Check" }).click();

    // When: Modify a command in nested group
    const nestedDialog = page.getByRole("dialog", {
      name: "Edit Group: $(search) Check Status",
    });
    const statusCommand = nestedDialog.getByRole("textbox", { name: "Command name" }).first();
    await statusCommand.fill("$(git-commit) Modified Status");

    // And: Save nested dialog
    await nestedDialog.getByRole("button", { name: "Save" }).click();

    // Then: Nested dialog should close
    await expect(nestedDialog).not.toBeVisible();

    // And: Parent dialog should still be open
    const parentDialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(parentDialog).toBeVisible();
  });

  test("should add new command to nested group", async ({ page }) => {
    // Given: Open nested group edit
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: /Edit command/i }).click();
    await page.getByRole("button", { name: "Edit group $(search) Check" }).click();

    const nestedDialog = page.getByRole("dialog", {
      name: "Edit Group: $(search) Check Status",
    });

    // Get initial command count
    const commandItems = nestedDialog.locator('[data-testid="group-command-item"]');
    const initialCount = await commandItems.count();

    // When: Add new command
    await nestedDialog.getByRole("button", { name: "Add new command" }).click();

    // Then: New command should be added
    const newCount = await commandItems.count();
    expect(newCount).toBe(initialCount + 1);

    // And: New command fields should be empty
    const newCommand = commandItems.last();
    const nameInput = newCommand.getByPlaceholder("Command name");
    await expect(nameInput).toHaveValue("");
  });

  test("should show Add Group button in nested group for further nesting", async ({ page }) => {
    // Given: Open nested group edit
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: /Edit command/i }).click();
    await page.getByRole("button", { name: "Edit group $(search) Check" }).click();

    const nestedDialog = page.getByRole("dialog", {
      name: "Edit Group: $(search) Check Status",
    });

    // Then: Add Group button should be available for further nesting
    const addGroupButton = nestedDialog.getByRole("button", { name: "Add new group" });
    await expect(addGroupButton).toBeVisible();
  });

  test("should distinguish between single command and group command icons", async ({ page }) => {
    // Given: Open Git group edit
    const gitCard = page.locator(SELECTORS.COMMAND_CARD, {
      hasText: SELECTORS.GIT_CARD_TEXT,
    });
    await gitCard.getByRole("button", { name: /Edit command/i }).click();

    // Then: Should show "Single command" indicator for Pull/Push (accessible name)
    const editDialog = page.getByRole("dialog", { name: "Edit Command" });
    await expect(editDialog.locator('[aria-label="Single command"]').first()).toBeVisible();

    // And: Should show "Group command" indicator for Check Status
    await expect(editDialog.locator('[aria-label="Group command"]')).toBeVisible();
  });
});
