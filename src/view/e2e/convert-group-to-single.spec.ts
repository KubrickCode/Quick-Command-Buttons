import { expect, test } from "@playwright/test";

const GIT_GROUP = {
  name: "$(git-branch) Git",
  editButtonName: "Edit command $(git-branch) Git",
  commandsCount: "3 commands",
  convertedCommand: "git status",
  shortcut: "g",
};

test.describe("Test 11: Convert Group to Single Command (Warning Shown)", () => {
  test("should show warning dialog when converting group with children to single command", async ({
    page,
  }) => {
    // Given: Navigate to the configuration page with Git fixture
    await page.goto("/");

    // When: Click Edit button for Git group
    await page.getByRole("button", { name: GIT_GROUP.editButtonName }).click();

    // Verify edit dialog opened
    await expect(page.getByRole("dialog", { name: "Edit Command" })).toBeVisible();

    // Verify Group Commands is initially selected
    await expect(page.getByRole("radio", { name: "Group Commands" })).toBeChecked();

    // Verify group has child commands
    await expect(page.getByText(GIT_GROUP.commandsCount)).toBeVisible();

    // Change Command Type to Single Command
    await page.getByRole("radio", { name: "Single Command" }).click();

    // Then: Verify UI switches to single command editing form (no warning yet)
    await expect(page.getByRole("radio", { name: "Single Command" })).toBeChecked();
    await expect(page.getByRole("textbox", { name: "Command", exact: true })).toBeVisible();
    // Verify Execution Mode dropdown is visible (replaces checkbox)
    await expect(
      page.getByRole("button", { name: /Terminal|VS Code API|Insert Only/i })
    ).toBeVisible();

    // Verify warning dialog does NOT appear yet
    const dialogsBeforeSave = await page.getByRole("dialog").count();
    expect(dialogsBeforeSave).toBe(1); // Only the edit dialog

    // Fill in command field
    await page.getByRole("textbox", { name: "Command", exact: true }).fill(GIT_GROUP.convertedCommand);

    // Click Save button
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Verify warning dialog appears
    await expect(
      page.getByRole("dialog", { name: "Convert to Single Command?" })
    ).toBeVisible();

    // Verify warning message content
    await expect(
      page.getByText(/Converting.*will permanently delete all 3 child commands/)
    ).toBeVisible();
    await expect(page.getByText(/This action cannot be undone/)).toBeVisible();

    // Verify dialog buttons
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Convert & Delete Child Commands" })
    ).toBeVisible();

    // Click Convert & Delete Child Commands button
    await page
      .getByRole("button", { name: "Convert & Delete Child Commands" })
      .click();

    // Then: Verify conversion completes and dialog closes
    await expect(
      page.getByRole("dialog", { name: "Convert to Single Command?" })
    ).not.toBeVisible();
    await expect(page.getByRole("dialog", { name: "Edit Command" })).not.toBeVisible();

    // Verify converted to single command card
    const gitCommandCard = page.getByTestId("command-card").filter({ hasText: "Git" }).nth(0);
    await expect(gitCommandCard).toBeVisible();

    // Verify command code is displayed (not "X commands")
    await expect(gitCommandCard.locator("code")).toContainText(GIT_GROUP.convertedCommand);

    // Verify it's NOT showing group indicator (e.g., "3 commands")
    await expect(gitCommandCard).not.toContainText("commands");
  });
});
