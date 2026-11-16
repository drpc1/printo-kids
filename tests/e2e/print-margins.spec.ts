// Provenance: print-printer-margins (GH 38, phase 2)
// Protects the print variant of the sheet: on a touch screen with a narrow viewport the sheet is
// 94% of the page width with no height limit (iOS measures vh against the browser window, so a vh
// limit changed with the browser's toolbars); a desktop keeps 100vh, also with a narrow viewport.
// It reads the computed size under print media and does not print a page.
import { expect, test } from "@playwright/test";

const MM = 96 / 25.4;
const A4 = { width: Math.round(210 * MM), height: Math.round(297 * MM) };
const NARROW = { width: Math.round(170 * MM), height: Math.round(240 * MM) };

const cases = [
  { name: "desktop, A4 viewport keeps 100vh", viewport: A4, touch: false },
  { name: "touch, 170x240 mm viewport gets 94% of the page width", viewport: NARROW, touch: true },
  { name: "desktop, 170x240 mm viewport keeps 100vh", viewport: NARROW, touch: false },
];

for (const { name, viewport, touch } of cases) {
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
      const size = await sheet.evaluate((el) => ({
        maxHeight: getComputedStyle(el).maxHeight,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        pageWidth: document.documentElement.clientWidth,
      }));
      if (touch) {
        expect(size.maxHeight).toBe("none");
        expect(size.width / size.pageWidth).toBeCloseTo(0.94, 2);
        expect(size.height / size.width).toBeCloseTo(297 / 210, 2);
      } else {
        expect(parseFloat(size.maxHeight)).toBeCloseTo(viewport.height, 0);
      }
    } finally {
      await context.close();
    }
  });
}
