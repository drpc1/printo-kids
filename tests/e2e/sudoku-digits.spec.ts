// Provenance: gh164-fix-sudoku-phone-view
// Digits on a number sudoku card sit in the middle of their cell, also in WebKit (Chrome and Brave on iPhone), which
// ignores `dominant-baseline` on SVG text and used to leave them at the top edge. The check reads the digit baseline and
// the font metrics of the engine; it does not look at pixels, so the print preview on a phone stays a manual check.
import { expect, test } from "@playwright/test";

const SIZE = 9;
/** How far the middle of a digit may be from the middle of its cell, as a share of the cell. */
const TOLERANCE = 0.15;

test("every digit on a 9×9 card is vertically centered in its cell", async ({ page }) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: /^9×9(?=\s|$)/ }).click();
  await page.getByRole("button", { name: "Cyfry", exact: true }).click();
  await page.getByRole("button", { name: "Generuj" }).click();

  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet).toBeVisible();

  const offsets = await sheet.evaluate((svg, size) => {
    const frame = svg.querySelector<SVGRectElement>('rect[fill="none"]');
    if (frame === null) {
      throw new Error("The grid frame is missing");
    }
    const frameTop = frame.y.baseVal.value;
    const cell = frame.height.baseVal.value / size;
    const context = document.createElement("canvas").getContext("2d");
    if (context === null) {
      throw new Error("No canvas context");
    }
    return Array.from(svg.querySelectorAll<SVGTextElement>("text"))
      .filter((text) => /^\d$/.test(text.textContent))
      .map((text) => {
        // The ink of a digit spans from `ascent` above its baseline to `descent` below it; getBBox would measure the
        // whole line box instead, which differs between engines.
        const parent = text.parentElement as unknown as SVGGElement;
        context.font = `${parent.getAttribute("font-size")}px ${parent.getAttribute("font-family")}`;
        const ink = context.measureText(text.textContent);
        const baseline = text.y.baseVal.getItem(0).value;
        const inkCenter = baseline - (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2;
        const cells = (inkCenter - frameTop) / cell;
        return cells - Math.floor(cells) - 0.5;
      });
  }, SIZE);

  expect(offsets.length).toBeGreaterThan(0);
  for (const offset of offsets) {
    expect(Math.abs(offset)).toBeLessThan(TOLERANCE);
  }
});
