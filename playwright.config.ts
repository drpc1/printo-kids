import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Local secrets come from the gitignored env file. In CI the file is absent
// and the variables come from the job. The product page does not need them.
if (existsSync(".env")) process.loadEnvFile(".env");

// 4321 is Astro's documented preview default. astro.config.mjs sets no server.port.
// E2E_PORT overrides it when that port is taken on this machine.
const PORT = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://localhost:${PORT}`;

// Playwright's WebKit crashes at launch on this Windows host (exit 0xC0EA0002), so the iPhone
// project runs on Linux and macOS, in the on-demand workflow e2e-phone.yml, or with E2E_WEBKIT=1.
const RUN_WEBKIT = process.platform !== "win32" || process.env.E2E_WEBKIT === "1";
if (!RUN_WEBKIT && process.env.TEST_WORKER_INDEX === undefined) {
  process.stderr.write(
    "[playwright] iphone-13 (WebKit) skipped on Windows; run the e2e-phone workflow or set E2E_WEBKIT=1.\n",
  );
}

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
    // Phone and tablet layout (S-09). Chromium stands in for Chrome, Edge and Brave on Android;
    // WebKit stands in for every browser on iOS. isMobile + hasTouch make the page report pointer: coarse.
    {
      name: "phone-360",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true },
    },
    {
      name: "pixel-7",
      use: { ...devices["Pixel 7"] },
    },
    ...(RUN_WEBKIT ? [{ name: "iphone-13", use: { ...devices["iPhone 13"] } }] : []),
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
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
