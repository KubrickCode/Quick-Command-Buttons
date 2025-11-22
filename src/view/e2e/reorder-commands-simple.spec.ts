import { expect, test } from "@playwright/test";

import {
  COMMAND_CARD_SELECTOR,
  DRAG_HANDLE_SELECTOR,
  dragCommandByMouse,
  getCommandOrder,
} from "./helpers/test-helpers";

const DRAG_FAILURE_WAIT_MS = 1000;

test.describe("Test 8: Reorder Commands with Drag & Drop (Simple)", () => {
  test("should reorder commands using low-level mouse events", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    // Get initial order
    const initialOrder = await getCommandOrder(page);

    const count = initialOrder.length;
    if (count < 2) {
      test.skip();
      return;
    }

    // When: Drag the second command to the first position
    await dragCommandByMouse({ page, sourceIndex: 1, targetIndex: 0 });

    // Then: Verify the order changed
    const finalOrder = await getCommandOrder(page);

    // The second item should now be first
    expect(finalOrder[0]).toBe(initialOrder[1]);
    expect(finalOrder[1]).toBe(initialOrder[0]);

    // Rest of the items should remain in the same order
    for (let i = 2; i < count; i++) {
      expect(finalOrder[i]).toBe(initialOrder[i]);
    }
  });

  test("should demonstrate that Playwright dragTo() does NOT work", async ({ page }) => {
    // Given: Navigate to the configuration page
    await page.goto("/");

    const initialOrder = await getCommandOrder(page);

    const count = initialOrder.length;
    if (count < 2) {
      test.skip();
      return;
    }

    const commandCards = page.locator(COMMAND_CARD_SELECTOR);
    const secondCard = commandCards.nth(1);
    const firstCard = commandCards.nth(0);
    const dragHandle = secondCard.locator(DRAG_HANDLE_SELECTOR);

    // When: Use Playwright's dragTo method
    await dragHandle.dragTo(firstCard, {
      force: true,
      targetPosition: { x: 100, y: 50 },
    });

    await page.waitForTimeout(DRAG_FAILURE_WAIT_MS);

    // Then: Verify if order changed
    const finalOrder = await getCommandOrder(page);

    // This will likely fail - dragTo() doesn't work with @dnd-kit
    // We expect the order to remain completely unchanged.
    expect(finalOrder).toEqual(initialOrder);
  });
});
