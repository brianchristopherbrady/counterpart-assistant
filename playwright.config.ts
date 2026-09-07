import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // dist/ must be rebuilt (`yarn build`) before this picks up source changes
  webServer: {
    command: "yarn preview -- --port 4173",
    port: 4173,
    reuseExistingServer: false,
  },
});
