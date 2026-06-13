import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// load environment variables from .env
dotenv.config();

// Ensure BASE_URL is present or fall back to a sensible default and warn
const baseURL = process.env.BASE_URL;
if (!process.env.BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "BASE_URL not set in environment; using default:",
    baseURL
  );
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers:  undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
