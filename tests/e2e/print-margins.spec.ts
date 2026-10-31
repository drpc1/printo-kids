// Provenance: print-printer-margins (GH 38, phase 2)
// Protects the print variant of the sheet: on a touch screen with a narrow print area the sheet
// may be 116vh tall (iOS reports 100vh as about 82% of the printable height); a desktop keeps
// 100vh, also with a narrow viewport. It reads the computed max-height under print media and
// does not print a page.
import { expect, test } from "@playwright/test";

const MM = 96 / 25.4;
const A4 = { width: Math.round(210 * MM), height: Math.round(297 * MM) };
const NARROW = { width: Math.round(170 * MM), height: Math.round(240 * MM) };

const cases = [
  { name: "desktop, A4 viewport keeps 100vh", viewport: A4, touch: false, factor: 1 },
  { name: "touch, 170x240 mm viewport gets 116vh", viewport: NARROW, touch: true, factor: 1.16 },
  { name: "desktop, 170x240 mm viewport keeps 100vh", viewport: NARROW, touch: false, factor: 1 },
];

for (const { name, viewport, touch, factor } of cases) {
  test(name, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "the spec sets its own viewport and touch");
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport,
      ...(touch ? { hasTouch: true, isMobile: true } : {}),
    });
    try {
      const page = await context.newPage();
      await page.goto("/maze");
      await page.getByRole("button", { name: /Generuj/ }).click();
      const sheet = page.locator("#worksheet-home svg").last();
      await expect(sheet).toBeVisible();
      await page.emulateMedia({ media: "print" });
      const maxHeight = await sheet.evaluate((el) => parseFloat(getComputedStyle(el).maxHeight));
      expect(maxHeight).toBeCloseTo(viewport.height * factor, 0);
    } finally {
      await context.close();
    }
  });
}
