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
 */
export const openAddCommandDialog = async (page: Page) => {
  await page.getByRole("button", { name: /add/i }).click();
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
