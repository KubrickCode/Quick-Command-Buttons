import { expect, test } from "@playwright/test";

test.describe("VS Code Language Change Sync", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should follow VS Code language when it changes, ignoring manual selection", async ({
    page,
    context,
  }) => {
    // Given: Previous state - user manually selected English while VS Code was in English
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("previous-vscode-language", "en");
      localStorage.setItem("language-manual-selection", "true");
      localStorage.setItem("language", "en");
    });

    // When: VS Code language changes to Korean (new page with different __VSCODE_LANGUAGE__)
    const newPage = await context.newPage();
    await newPage.addInitScript(() => {
      (window as unknown as { __VSCODE_LANGUAGE__: string }).__VSCODE_LANGUAGE__ = "ko";
    });
    await newPage.goto("/");

    // Then: UI should be in Korean (following VS Code, not manual selection)
    // aria-label is hardcoded in English, so use it to find button
    const applyButton = newPage.getByRole("button", { name: "Apply configuration changes" });
    await expect(applyButton).toHaveText("변경사항 적용");
  });

  test("should preserve manual selection when VS Code language unchanged", async ({
    page,
    context,
  }) => {
    // Given: Previous state - VS Code was Korean, user manually selected English
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("previous-vscode-language", "ko");
      localStorage.setItem("language-manual-selection", "true");
      localStorage.setItem("language", "en");
    });

    // When: Page reloads with same VS Code language (Korean)
    const newPage = await context.newPage();
    await newPage.addInitScript(() => {
      (window as unknown as { __VSCODE_LANGUAGE__: string }).__VSCODE_LANGUAGE__ = "ko";
    });
    await newPage.goto("/");

    // Then: UI should remain in English (manual selection preserved)
    const applyButton = newPage.getByRole("button", { name: "Apply configuration changes" });
    await expect(applyButton).toHaveText("Apply changes");
  });

  test("should reset manual selection flag when VS Code language changes", async ({
    page,
    context,
  }) => {
    // Given: Previous state - user manually selected Korean while VS Code was in English
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("previous-vscode-language", "en");
      localStorage.setItem("language-manual-selection", "true");
      localStorage.setItem("language", "ko");
    });

    // When: VS Code language changes to Korean
    const newPage = await context.newPage();
    await newPage.addInitScript(() => {
      (window as unknown as { __VSCODE_LANGUAGE__: string }).__VSCODE_LANGUAGE__ = "ko";
    });
    await newPage.goto("/");

    // Then: manual-selection flag should be removed
    const manualSelection = await newPage.evaluate(() =>
      localStorage.getItem("language-manual-selection"),
    );
    expect(manualSelection).toBeNull();
  });
});
