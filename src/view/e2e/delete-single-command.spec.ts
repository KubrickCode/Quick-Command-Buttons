import { expect, test } from "@playwright/test";

const COMMAND_TO_DELETE = {
  name: "Test",
  fullName: "$(pass) Test",
};

test.describe("Test 3: Delete Single Command", () => {
  test("should show confirmation dialog and delete command", async ({
    page,
  }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Verify Test command exists
    await expect(page.getByText(COMMAND_TO_DELETE.name, { exact: true })).toBeVisible();
    const initialCardCount = await page
      .locator('[data-testid="command-card"]')
      .count();

    // When: Click Delete button for Test command
    await page
      .getByRole("button", { name: `Delete command ${COMMAND_TO_DELETE.fullName}` })
      .click();

    // Then: Verify confirmation dialog appears
    await expect(
      page.getByRole("dialog", { name: "Delete Command" })
    ).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to delete")
    ).toBeVisible();
    await expect(page.getByText(COMMAND_TO_DELETE.fullName)).toBeVisible();
    await expect(
      page.getByText("? This action cannot be undone.")
    ).toBeVisible();

    // Click Delete button in confirmation dialog
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify command is removed from list
    const testCommandCount = await page
      .getByText(COMMAND_TO_DELETE.name, { exact: true })
      .count();
    expect(testCommandCount).toBe(0);

    // Verify total command count decreased
    const finalCardCount = await page
      .locator('[data-testid="command-card"]')
      .count();
    expect(finalCardCount).toBe(initialCardCount - 1);
  });
});
