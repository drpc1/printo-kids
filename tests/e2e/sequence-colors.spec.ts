// Provenance: sequence-shape-colors
// The Kolory switch on /sequences: off by default, it recolors the same card (same circles, polygons and
// paths) and never generates a new card. It does not prove the print, and it does not require the next
// Generuj to draw a different crayon.
import { expect, test, type Page } from "@playwright/test";

const SHAPE = 'circle[stroke-width="0.9"], polygon[stroke-width="0.9"], path[stroke-width="0.9"]';

interface ShapeGeometry {
  circles: string[];
  polygons: string[];
  paths: string[];
}

function sheet(page: Page) {
  return page.getByRole("img", { name: "Sekwencje" });
}

async function shapeGeometry(page: Page): Promise<ShapeGeometry> {
  const card = sheet(page);
  const circles = await card
    .locator('circle[stroke-width="0.9"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => `${node.getAttribute("cx")},${node.getAttribute("cy")},${node.getAttribute("r")}`),
    );
  const polygons = await card
    .locator('polygon[stroke-width="0.9"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points") ?? ""));
  const paths = await card
    .locator('path[stroke-width="0.9"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("d") ?? ""));
  return { circles, polygons, paths };
}

async function shapePaint(page: Page): Promise<{ strokes: string[]; fills: string[] }> {
  const card = sheet(page);
  const strokes = await card
    .locator(SHAPE)
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("stroke") ?? ""));
  const fills = await card.locator(SHAPE).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("fill") ?? ""));
  return { strokes, fills };
}

interface Marks {
  fills: string[];
  hasDigit: boolean;
  hasGap: boolean;
}

/** Digit text and the gap "?". The instruction sentence is neither, so it stays out of this list. */
async function sheetMarks(page: Page): Promise<Marks> {
  return sheet(page)
    .locator("text")
    .evaluateAll((nodes) => {
      const chosen = nodes
        .map((node) => ({ text: node.textContent.trim(), fill: node.getAttribute("fill") ?? "" }))
        .filter((mark) => mark.text === "?" || /^\d+$/.test(mark.text));
      return {
        fills: chosen.map((mark) => mark.fill),
        hasDigit: chosen.some((mark) => /^\d+$/.test(mark.text)),
        hasGap: chosen.some((mark) => mark.text === "?"),
      };
    });
}

test("Kolory is off by default and recolors the same card without generating a new one", async ({ page }) => {
  await page.goto("/sequences");
  const colors = page.getByRole("switch", { name: "Kolory" });
  await expect(colors).toBeVisible();
  await expect(colors).not.toBeChecked();

  // The default level draws shapes only. Poziom 4 is the one that also draws digits.
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: /^Poziom 4\b/ }).click();
  await expect(page.getByRole("button", { name: "Poziom: 4" })).toBeVisible();
  await expect(colors).not.toBeChecked();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(sheet(page)).toBeVisible();
  await expect(colors).not.toBeChecked();

  const plainGeometry = await shapeGeometry(page);
  const plainPaint = await shapePaint(page);
  expect(plainPaint.strokes.length).toBeGreaterThan(0);
  expect(plainPaint.strokes.every((stroke) => stroke === "var(--foreground)")).toBe(true);
  expect(plainPaint.fills.every((fill) => fill === "none")).toBe(true);

  await colors.click();
  await expect(colors).toBeChecked();
  expect(await shapeGeometry(page)).toEqual(plainGeometry);
  const colorPaint = await shapePaint(page);
  expect(colorPaint.fills).toEqual(colorPaint.strokes);
  expect(colorPaint.strokes.every((stroke) => stroke.startsWith("var(--symmetry-"))).toBe(true);

  const circleStrokes = await sheet(page)
    .locator('circle[stroke-width="0.9"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("stroke") ?? ""));
  expect(new Set(circleStrokes).size).toBeLessThanOrEqual(1);

  const frameStrokes = await sheet(page)
    .locator("rect[stroke]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("stroke") ?? ""));
  expect(frameStrokes.length).toBeGreaterThan(0);
  expect(frameStrokes.every((stroke) => stroke === "var(--foreground)")).toBe(true);

  const paintedMarks = await sheetMarks(page);
  expect(paintedMarks.hasGap).toBe(true);
  expect(paintedMarks.hasDigit).toBe(true);
  expect(paintedMarks.fills.every((fill) => fill === "var(--foreground)")).toBe(true);

  await colors.click();
  await expect(colors).not.toBeChecked();
  expect(await shapeGeometry(page)).toEqual(plainGeometry);
  expect(await shapePaint(page)).toEqual(plainPaint);
});
