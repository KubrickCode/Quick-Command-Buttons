import { type Locator, test } from "@playwright/test";

import {
  COMMAND_CARD_SELECTOR,
  DRAG_HANDLE_SELECTOR,
  getCapturedEvents,
  injectEventListeners,
} from "./helpers/test-helpers";

// Debug test constants
const TARGET_POSITION = { x: 100, y: 50 };
const FINAL_WAIT_MS = 500;
const DRAG_START_WAIT_MS = 100;
const MOVE_STEPS = 5;
const MOVE_INTERVAL_MS = 50;

/**
 * Log captured drag events to console
 */
const logCapturedEvents = (capturedEvents: string[], title: string) => {
  console.log(`\n=== ${title} ===`);
  capturedEvents.forEach((event: string, index: number) => {
    console.log(`${index + 1}. ${event}`);
  });
  console.log(`\nTotal events: ${capturedEvents.length}\n`);
};

test.describe("Debug: Drag Events Analysis", () => {
  let commandCards: Locator;
  let count: number;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await injectEventListeners(page);

    commandCards = page.locator(COMMAND_CARD_SELECTOR);
    count = await commandCards.count();

    if (count < 2) {
      test.skip();
    }
  });

  test("should log all events during Playwright dragTo()", async ({ page }) => {
    const secondCard = commandCards.nth(1);
    const firstCard = commandCards.nth(0);
    const dragHandle = secondCard.locator(DRAG_HANDLE_SELECTOR);

    console.log("=== Starting Playwright dragTo() ===");

    // Perform Playwright's dragTo
    await dragHandle.dragTo(firstCard, {
      force: true,
      targetPosition: TARGET_POSITION,
    });

    await page.waitForTimeout(FINAL_WAIT_MS);

    // Retrieve and log captured events
    const capturedEvents = await getCapturedEvents(page);
    logCapturedEvents(capturedEvents, "Events captured during dragTo()");
  });

  test("should log all events during manual mouse events", async ({ page }) => {
    const secondCard = commandCards.nth(1);
    const dragHandle = secondCard.locator(DRAG_HANDLE_SELECTOR);
    const firstCard = commandCards.nth(0);

    const handleBox = await dragHandle.boundingBox();
    const targetBox = await firstCard.boundingBox();

    if (!handleBox || !targetBox) {
      test.skip();
      return;
    }

    console.log("=== Starting manual mouse events ===");

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = targetBox.x + targetBox.width / 2;
    const endY = targetBox.y + targetBox.height / 2;

    // Manual drag with page.mouse
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(DRAG_START_WAIT_MS);

    // Move in steps
    for (let i = 1; i <= MOVE_STEPS; i++) {
      const x = startX + (endX - startX) * (i / MOVE_STEPS);
      const y = startY + (endY - startY) * (i / MOVE_STEPS);
      await page.mouse.move(x, y);
      await page.waitForTimeout(MOVE_INTERVAL_MS);
    }

    await page.mouse.up();
    await page.waitForTimeout(FINAL_WAIT_MS);

    // Retrieve and log captured events
    const capturedEvents = await getCapturedEvents(page);
    logCapturedEvents(capturedEvents, "Events captured during manual mouse events");
  });
});
