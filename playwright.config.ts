import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Local secrets come from the gitignored env file. In CI the file is absent
// and the variables come from the job. The product page does not need them.
if (existsSync(".env")) process.loadEnvFile(".env");

// 4321 is Astro's documented preview default. astro.config.mjs sets no server.port.
// E2E_PORT overrides it when that port is taken on this machine.
const PORT = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Product flows are public. Starter sign-in stays outside the test budget.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
  },
});
