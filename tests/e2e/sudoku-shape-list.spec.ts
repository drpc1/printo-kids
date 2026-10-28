// Provenance: sudoku-shape-list (US-12, US-14)
// The row under a shapes card names that card's set in catalog order. Digits remove the row. Kolory crayons the
// drawings and leaves the names black. It does not walk 4×4, 6×6 and 9×9, and it does not demand a new order.
import { expect, test, type Locator } from "@playwright/test";

/** Catalog order. A card shows a subsequence of this list, never a resorted one. */
const CATALOG = ["koło", "kwadrat", "trójkąt", "serce", "krzyżyk", "gwiazdka", "romb", "księżyc", "kropla"];

/** 6×6 draws six shapes, so the row under that card has six names. */
const SIX_BY_SIX_SHAPES = 6;

function listNames(sheet: Locator): Promise<string[]> {
  return sheet.locator("[data-shape-list] text").evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
}

test("a shapes card names its set, digits drop the row, and Kolory crayons the list drawings", async ({ page }) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: "6×6", exact: true }).click();
  await expect(page.getByRole("button", { name: "Rozmiar: 6×6" })).toBeVisible();

  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("[data-shape-list] text")).toHaveCount(SIX_BY_SIX_SHAPES);

  const names = await listNames(sheet);
  expect(names).toEqual(CATALOG.filter((name) => names.includes(name)));

  await page.getByRole("button", { name: "Cyfry", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toHaveCount(0);
  await expect(sheet.locator("[data-shape-list] path")).toHaveCount(0);
  await expect(sheet.locator("[data-shape-list] text")).toHaveCount(0);

  await page.getByRole("button", { name: "Kształty", exact: true }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeVisible();
  await expect(sheet.locator("[data-shape-list] text")).toHaveCount(SIX_BY_SIX_SHAPES);
  const namesAgain = await listNames(sheet);
  expect(namesAgain).toEqual(CATALOG.filter((name) => namesAgain.includes(name)));

  await page.getByRole("switch", { name: "Kolory" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  const listPaths = sheet.locator("[data-shape-list] path");
  await expect(listPaths.first()).toHaveAttribute("stroke", /^var\(--symmetry-/);
  const strokes = await listPaths.evaluateAll((paths) => paths.map((path) => path.getAttribute("stroke") ?? ""));
  expect(strokes).toHaveLength(namesAgain.length);
  expect(strokes.every((stroke) => stroke.startsWith("var(--symmetry-"))).toBe(true);
  const nameFills = await sheet
    .locator("[data-shape-list] text")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("fill") ?? ""));
  expect(nameFills.every((fill) => fill === "var(--foreground)")).toBe(true);
  expect(await listNames(sheet)).toEqual(namesAgain);
});
