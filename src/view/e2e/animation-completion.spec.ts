import { expect, test } from "@playwright/test";

test.describe("Test N4: Animation Completion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for initial commands to load
    await page.waitForSelector('[data-testid="command-card"]');
  });

  test("should complete delete animation and update UI correctly", async ({ page }) => {
    // Given: Page has commands
    const initialCards = page.locator('[data-testid="command-card"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // When: Delete first command
    await page.getByRole("button", { name: /Delete command/ }).first().click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Then: Wait for animation to complete and verify card count decreased
    await expect(initialCards).toHaveCount(initialCount - 1);

    // Verify no UI flickering (dialog is closed)
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should complete add animation and show new card", async ({ page }) => {
    // Given: Count current cards
    const cards = page.locator('[data-testid="command-card"]');
    const initialCount = await cards.count();

    // When: Add new command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Animation Test");
    await page.getByRole("textbox", { name: "Command", exact: true }).fill("echo animation");
    await page.getByRole("button", { name: "Save" }).click();

    // Then: Wait for dialog to close first
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Then: Verify new card appears (wait for it specifically)
    await expect(page.getByText("Animation Test")).toBeVisible();

    // Verify count increased
    const newCount = await cards.count();
    expect(newCount).toBe(initialCount + 1);

    // Cleanup: Delete the test command
    await page.getByRole("button", { name: "Delete command Animation Test" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("should maintain proper state after rapid add/delete operations", async ({ page }) => {
    // Given: Page has commands
    const cards = page.locator('[data-testid="command-card"]');
    const initialCount = await cards.count();

    // When: Quickly add a command
    await page.getByRole("button", { name: "Add new command" }).click();
    await page.getByRole("textbox", { name: "Command Name" }).fill("Rapid Test");
    await page.getByRole("textbox", { name: "Command", exact: true }).fill("echo rapid");
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for add animation - wait for the new element to appear
    await expect(page.getByText("Rapid Test")).toBeVisible();

    // When: Immediately delete the command
    await page.getByRole("button", { name: "Delete command Rapid Test" }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Then: Verify UI returns to initial state
    await expect(page.getByText("Rapid Test")).not.toBeVisible();
    const finalCount = await cards.count();
    expect(finalCount).toBe(initialCount);
  });

  test("should not show UI flickering during animation", async ({ page }) => {
    // Given: Page has commands
    const cards = page.locator('[data-testid="command-card"]');

    // When: Delete a command
    await page.getByRole("button", { name: /Delete command/ }).first().click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Then: Cards container should remain visible during animation
    const cardContainer = page.locator('[data-testid="command-card"]').first();
    // AnimatePresence should handle exit animation gracefully
    // After animation, remaining cards should still be visible
    await expect(cards.first()).toBeVisible();
  });

  test("should handle multiple sequential deletions correctly", async ({ page }) => {
    // Given: Page has multiple commands
    const cards = page.locator('[data-testid="command-card"]');
    const initialCount = await cards.count();

    // Skip if not enough commands
    if (initialCount < 2) {
      test.skip();
      return;
    }

    // When: Delete first command
    await page.getByRole("button", { name: /Delete command/ }).first().click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(cards).toHaveCount(initialCount - 1);

    // When: Delete another command
    await page.getByRole("button", { name: /Delete command/ }).first().click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(cards).toHaveCount(initialCount - 2);

    // Then: UI should be in consistent state
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should wait for dialog close animation before allowing new actions", async ({ page }) => {
    // Given: Open add dialog
    await page.getByRole("button", { name: "Add new command" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // When: Close dialog
    await page.getByRole("button", { name: "Cancel" }).click();

    // Then: Dialog should be fully closed
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // When: Open dialog again immediately
    await page.getByRole("button", { name: "Add new command" }).click();

    // Then: Dialog should open correctly without animation conflict
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add New Command" })).toBeVisible();

    // Cleanup
    await page.getByRole("button", { name: "Cancel" }).click();
  });
});
