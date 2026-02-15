import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5000",
    trace: "on-first-retry",
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "mobile",
      use: {
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
