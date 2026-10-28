// Provenance: picture-sudoku-colors (S-20, US-14)
// The Kolory switch on /sudoku: off by default, it recolors the same board (same shapes in the same places) with a
// crayon token per shape, never generates a new board, and is not there for digits. It does not prove the print.
import { expect, test, type Page } from "@playwright/test";

/** Given outlines on the board. Paths in the shape list under the frame are not givens. */
const BOARD_SHAPE_PATHS = 'xpath=.//*[local-name()="path" and not(ancestor::*[@data-shape-list])]';

function boardShapePaths(page: Page) {
  return page.getByRole("img", { name: "Sudoku" }).locator(BOARD_SHAPE_PATHS);
}

async function shapePlaces(page: Page): Promise<string[]> {
  return boardShapePaths(page).evaluateAll((paths) => paths.map((path) => path.getAttribute("d") ?? ""));
}

async function shapeStrokes(page: Page): Promise<string[]> {
  return boardShapePaths(page).evaluateAll((paths) => paths.map((path) => path.getAttribute("stroke") ?? ""));
}

test("Kolory is off by default and recolors the same board without generating a new one", async ({ page }) => {
  await page.goto("/sudoku");
  const colors = page.getByRole("switch", { name: "Kolory" });
  await expect(colors).toBeVisible();
  await expect(colors).not.toBeChecked();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();

  const plainPlaces = await shapePlaces(page);
  const plainStrokes = await shapeStrokes(page);
  expect(plainPlaces.length).toBe(12);
  expect(plainStrokes.every((stroke) => stroke === "var(--foreground)")).toBe(true);

  await colors.click();
  await expect(colors).toBeChecked();
  expect(await shapePlaces(page)).toEqual(plainPlaces);
  const colorStrokes = await shapeStrokes(page);
  expect(colorStrokes.every((stroke) => stroke.startsWith("var(--symmetry-"))).toBe(true);
  // A 4×4 board draws four shapes, so four different crayons, and one shape always has one crayon.
  expect(new Set(colorStrokes).size).toBe(4);
  const fills = await boardShapePaths(page).evaluateAll((paths) =>
    paths.map((path) => path.getAttribute("fill") ?? ""),
  );
  expect(fills).toEqual(colorStrokes);

  await colors.click();
  await expect(colors).not.toBeChecked();
  expect(await shapePlaces(page)).toEqual(plainPlaces);
  expect(await shapeStrokes(page)).toEqual(plainStrokes);
});

test("Kolory is there before the first card, works from the keyboard and survives a change of size", async ({
  page,
}) => {
  await page.goto("/sudoku");
  const colors = page.getByRole("switch", { name: "Kolory" });
  await colors.focus();
  await page.keyboard.press("Space");
  await expect(colors).toBeChecked();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();

  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: "9×9", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rozmiar: 9×9" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  const strokes = await shapeStrokes(page);
  expect(strokes.length).toBe(81 - 35);
  expect(strokes.every((stroke) => stroke.startsWith("var(--symmetry-"))).toBe(true);
});

test("digits have no Kolory switch and stay black, and shapes bring the switch back as it was", async ({ page }) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: "6×6", exact: true }).click();
  await page.getByRole("switch", { name: "Kolory" }).click();
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();

  await page.getByRole("button", { name: "Cyfry", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toHaveCount(0);
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet.locator("path")).toHaveCount(0);
  await expect(sheet.locator("g[fill='var(--foreground)'][font-size]")).toHaveCount(1);

  await page.getByRole("button", { name: "Kształty", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
});
