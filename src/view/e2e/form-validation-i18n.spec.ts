import { expect, test } from "@playwright/test";

test.describe("Test 3: Form Validation i18n Consistency", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show English validation error when language is English (default)", async ({
    page,
  }) => {
    // Given: Language is English (default)
    await expect(page.getByRole("button", { name: "Add new command" })).toBeVisible();

    // When: Open add command dialog and click save without filling fields
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Save" }).click();

    // Then: English validation errors should be displayed
    await expect(page.getByRole("alert").filter({ hasText: "Command name is required" })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "Command is required" })).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show Korean validation error when language is Korean", async ({
    page,
  }) => {
    // Given: Switch language to Korean
    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByText("한국어").click();

    // Wait for language switch - check visible text content
    await expect(page.getByText("추가").first()).toBeVisible();

    // When: Open add command dialog and click save without filling fields
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: /저장|Save/ }).click();

    // Then: Korean validation errors should be displayed
    await expect(page.getByRole("alert").filter({ hasText: "명령 이름을 입력해주세요" })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "명령어를 입력해주세요" })).toBeVisible();

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });

  test("should show English group validation error when language is English", async ({
    page,
  }) => {
    // Given: English language (default)
    await page.getByRole("button", { name: "Add new command" }).click();

    // Fill name and switch to group mode
    await page.getByRole("textbox", { name: "Command Name" }).fill("Test Group");
    await page.getByRole("radio", { name: "Group Commands" }).click();

    // When: Try to save empty group
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Save" }).click();

    // Then: English group validation error should be displayed
    await expect(page.getByText("Group must have at least one command")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("should show Korean group validation error when language is Korean", async ({
    page,
  }) => {
    // Given: Switch to Korean
    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByText("한국어").click();
    await expect(page.getByText("추가").first()).toBeVisible();

    // Open dialog and switch to group mode
    await page.getByRole("button", { name: "Add new command" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.locator("#displayText").fill("테스트 그룹");
    await dialog.getByRole("radio", { name: /그룹|Group/ }).click();

    // When: Try to save empty group
    await dialog.getByRole("button", { name: /저장|Save/ }).click();

    // Then: Korean group validation error should be displayed
    await expect(page.getByText("그룹에 최소 하나의 커맨드가 필요합니다")).toBeVisible();
    await expect(dialog).toBeVisible();
  });
});
