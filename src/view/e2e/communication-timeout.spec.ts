import { expect, test } from "@playwright/test";

test.describe("Test N2: VS Code Communication Timeout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async ({ page }) => {
    // Clean up: reset mock settings
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { clearSilentMessageTypes: () => void; resetResponseDelay: () => void } }).__vscodeMock;
      if (mock) {
        mock.clearSilentMessageTypes();
        mock.resetResponseDelay();
      }
    });
  });

  // Note: saveConfig in dev mode uses synchronous setCurrentData, not sendMessage
  // So we test timeout with operations that actually use sendMessage

  test("should show timeout error toast when button set creation times out", async ({ page }) => {
    // Given: Set mock to not respond to createButtonSet messages
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { addSilentMessageType: (type: string) => void } }).__vscodeMock;
      if (mock) {
        mock.addSilentMessageType("createButtonSet");
      }
    });

    // When: Try to create a new button set
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Timeout Test Set");
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Timeout error toast should appear
    const toast = page.locator("[data-sonner-toast]", {
      hasText: "Communication with extension timed out",
    });
    await expect(toast).toBeVisible({ timeout: 7000 });
  });

  test("should recover after timeout and allow retry", async ({ page }) => {
    // Given: Set mock to not respond to createButtonSet first
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { addSilentMessageType: (type: string) => void } }).__vscodeMock;
      if (mock) {
        mock.addSilentMessageType("createButtonSet");
      }
    });

    // When: Try to create button set and wait for timeout
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Retry Test Set");
    await page.getByRole("button", { name: "Create" }).click();

    const timeoutToast = page.locator("[data-sonner-toast]", {
      hasText: "timed out",
    });
    await expect(timeoutToast).toBeVisible({ timeout: 7000 });

    // Clear silent mode
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { clearSilentMessageTypes: () => void } }).__vscodeMock;
      if (mock) {
        mock.clearSilentMessageTypes();
      }
    });

    // Wait for timeout toast to disappear
    await timeoutToast.waitFor({ state: "hidden", timeout: 10000 });

    // Retry - should succeed now
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Success toast should appear
    const successToast = page.locator("[data-sonner-toast]", {
      hasText: 'Button set "Retry Test Set" created',
    });
    await expect(successToast).toBeVisible({ timeout: 3000 });
  });

  test("should log timeout error to console", async ({ page }) => {
    // Set up console listener
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleMessages.push(msg.text());
      }
    });

    // Given: Set mock to not respond
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { addSilentMessageType: (type: string) => void } }).__vscodeMock;
      if (mock) {
        mock.addSilentMessageType("createButtonSet");
      }
    });

    // When: Try to create button set
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Console Test");
    await page.getByRole("button", { name: "Create" }).click();

    // Wait for timeout
    await page.waitForTimeout(6000);

    // Then: Error should be logged
    expect(consoleMessages.some((msg) => msg.includes("Communication with extension timed out"))).toBe(true);
  });

  test("should handle slow but successful response", async ({ page }) => {
    // Given: Set mock to respond slowly (but within timeout)
    await page.evaluate(() => {
      const mock = (window as Window & { __vscodeMock?: { setResponseDelay: (delay: number) => void } }).__vscodeMock;
      if (mock) {
        mock.setResponseDelay(2000); // 2 seconds delay
      }
    });

    // When: Create a button set (uses sendMessage unlike save)
    await page.getByRole("button", { name: "Button Set" }).click();
    await page.getByRole("menuitem", { name: "Create new set" }).click();
    await page.getByRole("textbox", { name: "Set Name" }).fill("Slow Response Test");
    await page.getByRole("button", { name: "Create" }).click();

    // Then: Should eventually show success (not timeout)
    const successToast = page.locator("[data-sonner-toast]", {
      hasText: 'Button set "Slow Response Test" created',
    });
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // No timeout toast should appear
    const timeoutToast = page.locator("[data-sonner-toast]", {
      hasText: "timed out",
    });
    await expect(timeoutToast).not.toBeVisible();
  });
});
