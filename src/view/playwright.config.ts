import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 1,
  reporter: isCI ? [["blob"], ["html", { open: "never" }]] : [["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: isCI ? "on-first-retry" : "on",
    screenshot: isCI ? "only-on-failure" : "on",
    video: isCI ? "retain-on-failure" : "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
