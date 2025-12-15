import { expect, test } from "@playwright/test";

test.describe("Test N3: Large Dataset Performance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should handle 100+ commands without performance degradation", async ({ page }) => {
    // Given: Generate 100 commands via mock API
    const COMMAND_COUNT = 100;

    await page.evaluate((count) => {
      const commands = Array.from({ length: count }, (_, i) => ({
        command: `echo "Command ${i + 1}"`,
        id: `perf-test-${i}`,
        name: `$(gear) Command ${i + 1}`,
        shortcut: i < 26 ? String.fromCharCode(97 + i) : undefined,
      }));

      // Access mock storage
      localStorage.setItem("vscode-mock-workspace-data", JSON.stringify(commands));
    }, COMMAND_COUNT);

    // Reload to apply new data
    await page.reload();
    await page.waitForLoadState("networkidle");

    // When: Measure initial render time
    const startTime = Date.now();

    // Wait for all command cards to render
    const commandCards = page.locator('[data-testid="command-card"]');
    await expect(commandCards).toHaveCount(COMMAND_COUNT, { timeout: 10000 });

    const renderTime = Date.now() - startTime;
    console.log(`Render time for ${COMMAND_COUNT} commands: ${renderTime}ms`);

    // Then: Render should complete within reasonable time (< 5 seconds)
    expect(renderTime).toBeLessThan(5000);

    // Verify first and last cards are visible (scrollable)
    await expect(commandCards.first()).toBeVisible();
    const lastCard = commandCards.nth(COMMAND_COUNT - 1);
    await lastCard.scrollIntoViewIfNeeded();
    await expect(lastCard).toBeVisible();
  });

  test("should maintain smooth scrolling with large dataset", async ({ page }) => {
    // Given: 50 commands for scroll test
    const COMMAND_COUNT = 50;

    await page.evaluate((count) => {
      const commands = Array.from({ length: count }, (_, i) => ({
        command: `echo "Scroll test ${i + 1}"`,
        id: `scroll-test-${i}`,
        name: `$(symbol-property) Item ${i + 1}`,
      }));

      localStorage.setItem("vscode-mock-workspace-data", JSON.stringify(commands));
    }, COMMAND_COUNT);

    await page.reload();
    await page.waitForLoadState("networkidle");

    const commandCards = page.locator('[data-testid="command-card"]');
    await expect(commandCards).toHaveCount(COMMAND_COUNT, { timeout: 10000 });

    // When: Scroll to bottom
    const scrollStartTime = Date.now();

    await page.evaluate(() => {
      window.scrollTo({ behavior: "smooth", top: document.body.scrollHeight });
    });

    // Wait for scroll to complete
    await page.waitForTimeout(500);

    const scrollTime = Date.now() - scrollStartTime;
    console.log(`Scroll time: ${scrollTime}ms`);

    // Then: Last item should be visible
    const lastCard = commandCards.nth(COMMAND_COUNT - 1);
    await expect(lastCard).toBeVisible();

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo({ behavior: "smooth", top: 0 });
    });

    await page.waitForTimeout(500);
    await expect(commandCards.first()).toBeVisible();
  });

  test("should handle command operations efficiently with large dataset", async ({ page }) => {
    // Given: 30 commands
    const COMMAND_COUNT = 30;

    await page.evaluate((count) => {
      const commands = Array.from({ length: count }, (_, i) => ({
        command: `echo "Operation test ${i + 1}"`,
        id: `op-test-${i}`,
        name: `$(circle) Operation ${i + 1}`,
      }));

      localStorage.setItem("vscode-mock-workspace-data", JSON.stringify(commands));
    }, COMMAND_COUNT);

    await page.reload();
    await page.waitForLoadState("networkidle");

    const commandCards = page.locator('[data-testid="command-card"]');
    await expect(commandCards).toHaveCount(COMMAND_COUNT, { timeout: 10000 });

    // When: Delete a command from the middle
    const middleIndex = Math.floor(COMMAND_COUNT / 2);
    const middleCard = commandCards.nth(middleIndex);

    await middleCard.scrollIntoViewIfNeeded();

    const deleteStartTime = Date.now();

    await middleCard.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Wait for animation and state update
    await expect(commandCards).toHaveCount(COMMAND_COUNT - 1, { timeout: 5000 });

    const deleteTime = Date.now() - deleteStartTime;
    console.log(`Delete operation time: ${deleteTime}ms`);

    // Then: Operation should complete within reasonable time
    expect(deleteTime).toBeLessThan(3000);
  });

  test("should render nested groups efficiently", async ({ page }) => {
    // Given: Commands with deep nesting
    await page.evaluate(() => {
      const createNestedGroup = (depth: number, prefix: string): object => {
        if (depth === 0) {
          return {
            command: `echo "${prefix}"`,
            id: `nested-${prefix}`,
            name: `$(primitive-dot) ${prefix}`,
          };
        }

        return {
          group: Array.from({ length: 3 }, (_, i) =>
            createNestedGroup(depth - 1, `${prefix}-${i + 1}`)
          ),
          id: `group-${prefix}`,
          name: `$(folder) Group ${prefix}`,
        };
      };

      // Create 10 top-level groups with 3 levels of nesting each
      const commands = Array.from({ length: 10 }, (_, i) => createNestedGroup(3, `L${i + 1}`));

      localStorage.setItem("vscode-mock-workspace-data", JSON.stringify(commands));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // When: Check render completion
    const startTime = Date.now();

    const commandCards = page.locator('[data-testid="command-card"]');
    await expect(commandCards).toHaveCount(10, { timeout: 10000 });

    const renderTime = Date.now() - startTime;
    console.log(`Nested groups render time: ${renderTime}ms`);

    // Then: Should render within reasonable time
    expect(renderTime).toBeLessThan(5000);

    // Verify first group can be edited
    await commandCards.first().getByRole("button", { name: /edit/i }).click();

    // Dialog should open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });
});
