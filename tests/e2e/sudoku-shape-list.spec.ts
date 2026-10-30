// Provenance: sudoku-shape-list (US-12, US-14), gh174-sudoku-shapes-placement
// Under a shapes card sits a frame as wide as the grid with the caption "Użyj:" and that card's shapes, and no names.
// Digits remove the frame. Kolory crayons the drawings and leaves the frame and the caption black.
// It does not walk 4×4, 6×6 and 9×9: the geometry of every size is covered by the unit test.
import { expect, test } from "@playwright/test";

/** 6×6 draws six shapes, so the frame under that card has six drawings. */
const SIX_BY_SIX_SHAPES = 6;

/** The page frame of the grid: the only direct child rect of the sheet svg with the 1.1 mm frame stroke (SUDOKU_SHEET.frameStroke). */
const GRID_FRAME = ':scope > rect[stroke-width="1.1"]';

test("a shapes card has a Użyj: frame as wide as the grid, digits drop it, and Kolory crayons the drawings", async ({
  page,
}) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: "6×6", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rozmiar: 6×6" })).toBeVisible();

  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("[data-shape-list] path")).toHaveCount(SIX_BY_SIX_SHAPES);
  await expect(sheet.locator("[data-shape-list] text")).toHaveText(["Użyj:"]);

  const grid = await sheet.locator(GRID_FRAME).evaluate((rect: SVGRectElement) => ({
    x: rect.x.baseVal.value,
    width: rect.width.baseVal.value,
  }));
  const panel = await sheet.locator("[data-shape-list] rect").evaluate((rect: SVGRectElement) => ({
    x: rect.x.baseVal.value,
    width: rect.width.baseVal.value,
  }));
  expect(panel.x).toBeCloseTo(grid.x, 2);
  expect(panel.width).toBeCloseTo(grid.width, 2);

  await page.getByRole("button", { name: "Cyfry", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toHaveCount(0);
  await expect(sheet.locator("[data-shape-list]")).toHaveCount(0);

  await page.getByRole("button", { name: "Kształty", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeVisible();
  await expect(sheet.locator("[data-shape-list] path")).toHaveCount(SIX_BY_SIX_SHAPES);

  await page.getByRole("switch", { name: "Kolory" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  const listPaths = sheet.locator("[data-shape-list] path");
  await expect(listPaths.first()).toHaveAttribute("stroke", /^var\(--symmetry-/);
  const strokes = await listPaths.evaluateAll((paths) => paths.map((path) => path.getAttribute("stroke") ?? ""));
  expect(strokes).toHaveLength(SIX_BY_SIX_SHAPES);
  expect(strokes.every((stroke) => stroke.startsWith("var(--symmetry-"))).toBe(true);
  await expect(sheet.locator("[data-shape-list] rect")).toHaveAttribute("stroke", "var(--foreground)");
  await expect(sheet.locator("[data-shape-list] text")).toHaveAttribute("fill", "var(--foreground)");
});
