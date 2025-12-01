import { expect, test } from "@playwright/test";

test.describe("Test C5: Form Required Field Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show validation error when command name is empty", async ({
    page,
  }) => {
    // When: Open add command dialog and click save without filling name
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).toBeVisible();

    // Ensure name field is empty
    const nameField = page.getByRole("textbox", { name: "Command Name" });
    await expect(nameField).toHaveValue("");

    // Click save without filling required field
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Validation error should be displayed
    await expect(page.getByText("Command name is required")).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should clear validation error after valid input and re-submit", async ({
    page,
  }) => {
    // Given: Open dialog and trigger validation error
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("button", { name: "Save" }).click();

    const errorMessage = page.getByText("Command name is required");
    await expect(errorMessage).toBeVisible();

    // When: Fill name field and attempt save again
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Dialog should close (validation passed)
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).not.toBeVisible();
  });

  test("should allow save after filling required name field", async ({
    page,
  }) => {
    // Given: Open dialog
    await page.getByRole("button", { name: "Add new command" }).click();

    // Trigger validation error first
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Command name is required")).toBeVisible();

    // When: Fill the required name field and save
    await page
      .getByRole("textbox", { name: "Command Name" })
      .fill("ValidCommand");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Dialog should close (form submitted successfully)
    const dialog = page.getByRole("dialog", { name: "Add New Command" });
    await expect(dialog).not.toBeVisible();
  });
});
