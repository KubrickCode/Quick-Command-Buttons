import { expect, test } from "@playwright/test";

test.describe("Test N1: Error Boundary Recovery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display error boundary fallback when error occurs", async ({ page }) => {
    // Given: App is loaded normally
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // When: Trigger an error via test button
    const triggerButton = page.getByTestId("test-error-trigger");
    await expect(triggerButton).toBeVisible();
    await triggerButton.click();

    // Then: Error boundary fallback should be displayed
    const fallback = page.getByTestId("error-boundary-fallback");
    await expect(fallback).toBeVisible();

    // Verify error message is shown
    const errorMessage = page.getByTestId("error-message");
    await expect(errorMessage).toContainText("Test error triggered for E2E testing");

    // Verify title is shown
    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("should recover when reset button is clicked", async ({ page }) => {
    // Given: Trigger an error first
    const triggerButton = page.getByTestId("test-error-trigger");
    await triggerButton.click();

    // Verify error state
    const fallback = page.getByTestId("error-boundary-fallback");
    await expect(fallback).toBeVisible();

    // When: Click reset button
    const resetButton = page.getByTestId("error-boundary-reset");
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // Then: App should recover and show normal UI
    await expect(fallback).not.toBeVisible();

    // Header should be visible again
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Command list should be visible
    const commandList = page.locator('[data-testid="command-card"]');
    await expect(commandList.first()).toBeVisible();
  });

  test("should show error boundary fallback in Korean when language is Korean", async ({
    page,
  }) => {
    // Given: Switch to Korean
    await page.getByRole("button", { name: /language|언어/i }).click();
    await page.getByText("한국어").click();

    // Wait for language change
    await page.waitForTimeout(300);

    // When: Trigger an error
    const triggerButton = page.getByTestId("test-error-trigger");
    await triggerButton.click();

    // Then: Error boundary should show Korean text
    await expect(page.getByText("문제가 발생했습니다")).toBeVisible();
    await expect(page.getByText("구성 UI에서 오류가 발생했습니다")).toBeVisible();
  });

  test("should log error to console when error occurs", async ({ page }) => {
    // Given: Set up console listener
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleMessages.push(msg.text());
      }
    });

    // When: Trigger an error
    const triggerButton = page.getByTestId("test-error-trigger");
    await triggerButton.click();

    // Wait for error boundary to display
    await expect(page.getByTestId("error-boundary-fallback")).toBeVisible();

    // Then: Error should be logged
    expect(consoleMessages.some((msg) => msg.includes("Webview crashed"))).toBe(true);
  });

  test("should be able to trigger error again after recovery", async ({ page }) => {
    // First error and recovery cycle
    const triggerButton = page.getByTestId("test-error-trigger");
    await triggerButton.click();

    const fallback = page.getByTestId("error-boundary-fallback");
    await expect(fallback).toBeVisible();

    await page.getByTestId("error-boundary-reset").click();
    await expect(fallback).not.toBeVisible();

    // Second error cycle
    await expect(triggerButton).toBeVisible();
    await triggerButton.click();

    await expect(fallback).toBeVisible();
    await expect(page.getByTestId("error-message")).toContainText("Test error triggered");
  });
});
