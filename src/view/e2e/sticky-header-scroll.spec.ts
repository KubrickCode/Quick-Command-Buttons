import { expect, test } from "@playwright/test";

test.describe("Test N2: Sticky Header on Scroll", () => {
  test.beforeEach(async ({ page }) => {
    // Set smaller viewport to ensure scrollable content
    await page.setViewportSize({ width: 800, height: 400 });
    await page.goto("/");
  });

  test("should have sticky positioning on header", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify header has sticky positioning
    const headerStyles = await page.evaluate(() => {
      const header = document.querySelector("header");
      if (!header) return null;
      const styles = getComputedStyle(header);
      return {
        position: styles.position,
        top: styles.top,
      };
    });

    expect(headerStyles?.position).toBe("sticky");
    expect(headerStyles?.top).toBe("0px");
  });

  test("should have sticky and z-index classes on header", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify header has correct Tailwind classes
    const header = page.locator("header");
    await expect(header).toHaveClass(/sticky/);
    await expect(header).toHaveClass(/top-0/);
    await expect(header).toHaveClass(/z-10/);
  });

  test("should not have shadow when not scrolled", async ({ page }) => {
    // Given: Page is loaded at scroll position 0

    // Then: Verify header does not have shadow class
    const header = page.locator("header");
    await expect(header).not.toHaveClass(/shadow-md/);
  });

  test("should add shadow when scrolled down", async ({ page }) => {
    // Given: Page is loaded

    // When: Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));

    // Wait for requestAnimationFrame to process scroll event
    await page.waitForTimeout(100);

    // Then: Verify header has shadow class
    const header = page.locator("header");
    await expect(header).toHaveClass(/shadow-md/);
  });

  test("should remove shadow when scrolled back to top", async ({ page }) => {
    // Given: Page is scrolled down with shadow
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(100);

    const header = page.locator("header");
    await expect(header).toHaveClass(/shadow-md/);

    // When: Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    // Then: Verify shadow is removed
    await expect(header).not.toHaveClass(/shadow-md/);
  });

  test("should have smooth transition for shadow", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify header has transition classes
    const header = page.locator("header");
    await expect(header).toHaveClass(/transition-shadow/);
    await expect(header).toHaveClass(/duration-200/);
  });

  test("should maintain sticky header while interacting with content", async ({ page }) => {
    // Given: Page is loaded and scrolled
    await page.evaluate(() => window.scrollTo(0, 50));
    await page.waitForTimeout(100);

    // When: Click on a button in header
    await page.getByRole("button", { name: "Add new command" }).click();

    // Then: Dialog opens and header remains sticky
    await expect(page.getByRole("dialog")).toBeVisible();

    const headerStyles = await page.evaluate(() => {
      const header = document.querySelector("header");
      return header ? getComputedStyle(header).position : null;
    });

    expect(headerStyles).toBe("sticky");

    // Close dialog
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  test("should have backdrop blur effect on header", async ({ page }) => {
    // Given: Page is loaded

    // Then: Verify header has backdrop blur class
    const header = page.locator("header");
    await expect(header).toHaveClass(/backdrop-blur-md/);
  });
});
