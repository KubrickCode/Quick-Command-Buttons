import type { Page } from "@playwright/test";

/**
 * Get command card by name
 */
export const getCommandCard = (page: Page, commandName: string) => {
  return page.locator(`[data-testid="command-card"]`, {
    hasText: commandName,
  });
};

/**
 * Open command dialog
 * Clicks the first available add button (could be "Add your first command" or "Add new command")
 */
export const openAddCommandDialog = async (page: Page) => {
  await page.getByRole("button", { name: /add/i }).first().click();
};

/**
 * Fill command form
 */
export const fillCommandForm = async (
  page: Page,
  data: {
    name?: string;
    type?: "Single Command" | "Group Commands";
    command?: string;
    color?: string;
    shortcut?: string;
    terminalName?: string;
    useVsCodeApi?: boolean;
  },
) => {
  if (data.name) {
    await page.getByLabel(/command name/i).fill(data.name);
  }

  if (data.type) {
    await page.getByLabel(/command type/i).click();
    await page.getByRole("option", { name: data.type }).click();
  }

  if (data.command) {
    await page.getByLabel(/^command$/i).fill(data.command);
  }

  if (data.color) {
    await page.getByLabel(/color/i).fill(data.color);
  }

  if (data.shortcut) {
    await page.getByLabel(/shortcut/i).fill(data.shortcut);
  }

  if (data.terminalName) {
    await page.getByLabel(/terminal name/i).fill(data.terminalName);
  }

  if (data.useVsCodeApi !== undefined) {
    const checkbox = page.getByLabel(/use vs code api/i);
    const isChecked = await checkbox.isChecked();
    if (isChecked !== data.useVsCodeApi) {
      await checkbox.click();
    }
  }
};

/**
 * Save command dialog
 */
export const saveCommandDialog = async (page: Page) => {
  await page.getByRole("button", { name: /save/i }).click();
};

const TOAST_TIMEOUT = 5000;

/**
 * Wait for toast message
 */
export const waitForToast = async (page: Page, message?: string) => {
  const toast = message
    ? page.locator('[role="status"]', { hasText: message })
    : page.locator('[role="status"]');

  await toast.waitFor({ state: "visible", timeout: TOAST_TIMEOUT });
  return toast;
};

/**
 * Verify success toast message and wait for disappearance
 */
export const verifySuccessToast = async (page: Page, message: string) => {
  const toast = page.locator('[data-sonner-toast]', { hasText: message });
  await toast.waitFor({ state: "visible", timeout: TOAST_TIMEOUT });

  // Wait for toast to disappear
  await toast.waitFor({ state: "hidden", timeout: TOAST_TIMEOUT });
};

// Test selectors (exported for use in test files)
export const COMMAND_CARD_SELECTOR = '[data-testid="command-card"]';
export const COMMAND_NAME_SELECTOR = '[data-testid="command-name"]';
export const DRAG_HANDLE_SELECTOR = '[aria-label*="Drag handle"]';

// Drag and drop constants
// Increased values for CI environment stability
const MOUSE_MOVE_DELAY_MS = 200;
const DRAG_START_DELAY_MS = 300;
const ACTIVATION_MOVE_PX = 15;
const DRAG_ACTIVATION_DELAY_MS = 300;
const DRAG_STEPS = 30;
const DRAG_MOVE_INTERVAL_MS = 30;
const DRAG_END_HOLD_MS = 400;
const DRAG_FINAL_WAIT_MS = 800;
const DRAG_TARGET_UPPER_RATIO = 0.3; // Upper third for upward drag
const DRAG_TARGET_LOWER_RATIO = 0.7; // Lower third for downward drag

/**
 * Helper to perform drag and drop using low-level mouse events
 * This is necessary for @dnd-kit which requires:
 * 1. Minimum 8px movement to activate drag (activationConstraint.distance)
 * 2. Smooth pointer events to trigger collision detection
 * 3. Proper collision detection timing
 */
export const dragCommandByMouse = async ({
  page,
  sourceIndex,
  targetIndex,
}: {
  page: Page;
  sourceIndex: number;
  targetIndex: number;
}) => {
  const commandCards = page.locator(COMMAND_CARD_SELECTOR);

  // Wait for cards to be stable
  await page.waitForLoadState("networkidle");
  await commandCards.first().waitFor({ state: "visible" });

  // Get source and target cards
  const sourceCard = commandCards.nth(sourceIndex);
  const targetCard = commandCards.nth(targetIndex);

  // Get drag handles
  const sourceDragHandle = sourceCard.locator(DRAG_HANDLE_SELECTOR);

  // Wait for elements to be ready
  await sourceDragHandle.waitFor({ state: "visible" });
  await targetCard.waitFor({ state: "visible" });

  // Get bounding boxes
  const sourceBox = await sourceDragHandle.boundingBox();
  const targetCardBox = await targetCard.boundingBox();

  if (!sourceBox || !targetCardBox) {
    throw new Error(`Could not find elements for cards ${sourceIndex} and ${targetIndex}`);
  }

  // Calculate positions
  const startX = sourceBox.x + sourceBox.width / 2;
  const startY = sourceBox.y + sourceBox.height / 2;

  // When dragging:
  // - Upward (sourceIndex > targetIndex): aim slightly above target center
  // - Downward (sourceIndex < targetIndex): aim slightly below target center
  const isUpward = sourceIndex > targetIndex;
  const endX = targetCardBox.x + targetCardBox.width / 2;
  const endY = isUpward
    ? targetCardBox.y + targetCardBox.height * DRAG_TARGET_UPPER_RATIO
    : targetCardBox.y + targetCardBox.height * DRAG_TARGET_LOWER_RATIO;

  // Step 1: Move mouse to the drag handle
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(MOUSE_MOVE_DELAY_MS);

  // Step 2: Press mouse down to start drag
  await page.mouse.down();
  await page.waitForTimeout(DRAG_START_DELAY_MS);

  // Step 3: Move to activate drag (>8px threshold)
  await page.mouse.move(startX + ACTIVATION_MOVE_PX, startY);
  await page.waitForTimeout(DRAG_ACTIVATION_DELAY_MS);

  // Step 4: Move to target in smooth steps
  for (let i = 1; i <= DRAG_STEPS; i++) {
    const progress = i / DRAG_STEPS;
    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;
    await page.mouse.move(x, y);
    await page.waitForTimeout(DRAG_MOVE_INTERVAL_MS);
  }

  // Step 5: Hold at target for collision detection
  await page.waitForTimeout(DRAG_END_HOLD_MS);

  // Step 6: Release mouse to drop
  await page.mouse.up();

  // Step 7: Wait for drag end animation and state update
  await page.waitForTimeout(DRAG_FINAL_WAIT_MS);
};

/**
 * Helper to get command names in order
 */
export const getCommandOrder = async (page: Page): Promise<string[]> => {
  const cards = await page.locator(COMMAND_CARD_SELECTOR).all();
  const names = await Promise.all(
    cards.map(async (card) => {
      const name = await card.locator(COMMAND_NAME_SELECTOR).textContent();
      return name?.trim();
    }),
  );
  return names.filter((name): name is string => !!name);
};

// Event types for drag and drop debugging
export const DRAG_EVENT_TYPES = [
  // HTML5 Drag and Drop API
  "drag",
  "dragstart",
  "dragend",
  "dragover",
  "dragenter",
  "dragleave",
  "drop",
  // Pointer Events API (used by @dnd-kit)
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointercancel",
  "pointerenter",
  "pointerleave",
  "pointerover",
  "pointerout",
  // Mouse Events
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  // Touch Events
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
];

type WindowWithEvents = Window & typeof globalThis & {
  __capturedEvents: string[];
};

/**
 * Inject event listeners to capture drag-related events
 */
export const injectEventListeners = async (page: Page) => {
  await page.evaluate((eventTypes) => {
    const events: string[] = [];

    eventTypes.forEach((eventType) => {
      document.addEventListener(
        eventType,
        (e) => {
          const target = e.target as HTMLElement;
          const targetInfo =
            target.getAttribute?.("data-testid") ||
            target.getAttribute?.("aria-label") ||
            target.tagName;
          events.push(`${eventType} on ${targetInfo}`);
        },
        true,
      );
    });

    // Store events in window for retrieval
    (window as WindowWithEvents).__capturedEvents = events;
  }, DRAG_EVENT_TYPES);
};

/**
 * Get captured events from window
 */
export const getCapturedEvents = async (page: Page): Promise<string[]> => {
  return page.evaluate(() => {
    return (window as WindowWithEvents).__capturedEvents || [];
  });
};

/**
 * Clear all existing commands
 */
export const clearAllCommands = async (page: Page) => {
  // Wait for page to be fully loaded
  await page.waitForLoadState("networkidle");

  const commandCards = page.locator(COMMAND_CARD_SELECTOR);
  const initialCount = await commandCards.count();

  if (initialCount === 0) {
    return; // Already empty
  }

  for (let i = 0; i < initialCount; i++) {
    // Wait for command cards to be visible
    await commandCards.first().waitFor({ state: "visible", timeout: 5000 });

    // Delete the first card
    const deleteButton = commandCards.first().getByRole("button", { name: /delete/i });
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmButton = page.getByRole("button", { name: /delete/i });
    await confirmButton.click();

    // Wait for toast to disappear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "hidden", timeout: TOAST_TIMEOUT });

    // Extra wait for UI to stabilize
    await page.waitForTimeout(100);
  }

  // Verify all commands are deleted
  const finalCount = await commandCards.count();
  if (finalCount > 0) {
    throw new Error(`Failed to clear all commands. ${finalCount} commands remaining.`);
  }
};

/**
 * Create test commands
 */
export const createTestCommands = async (
  page: Page,
  commands: Array<{ name: string; command: string }>,
) => {
  for (const cmd of commands) {
    // Click the first available add button (could be "Add your first command" or "Add new command")
    const addButton = page.getByRole("button", { name: /add/i }).first();
    await addButton.click();
    await fillCommandForm(page, cmd);
    await saveCommandDialog(page);

    // Wait for toast to disappear
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "hidden", timeout: TOAST_TIMEOUT });
  }
};

/**
 * Setup test environment by clearing existing commands and creating new ones
 */
export const setupTestCommands = async (
  page: Page,
  commands: Array<{ name: string; command: string }>,
) => {
  await clearAllCommands(page);
  await createTestCommands(page, commands);
};
