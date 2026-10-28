// Provenance: picture-sudoku-levels (S-19, US-13)
// The sudoku bar: 4×4 has no Poziom and no Kształty / Cyfry; 6×6 and 9×9 do, and each choice draws a card with the
// right number of symbols. A card has 2 instruction lines of text; digit cards add one text per given.
import { expect, test, type Page } from "@playwright/test";

const INSTRUCTION_LINES = 2;

/** Given outlines on the board. Paths in the shape list under the frame are not givens. */
const BOARD_SHAPE_PATHS = 'xpath=.//*[local-name()="path" and not(ancestor::*[@data-shape-list])]';

async function choose(page: Page, bar: "Rozmiar" | "Poziom", option: string): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${bar}:`) }).click();
  // Rows may carry a description, so match from the start of the name.
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${bar}: ${option}` })).toBeVisible();
}

test("4×4 has no level bar and no shapes or digits choice, and 6×6 and 9×9 have both", async ({ page }) => {
  await page.goto("/sudoku");
  await expect(page.getByRole("button", { name: "Rozmiar: 4×4" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Poziom:/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toHaveCount(0);

  await choose(page, "Rozmiar", "6×6");
  await expect(page.getByRole("button", { name: "Poziom: łatwy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kształty", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toBeVisible();

  await choose(page, "Rozmiar", "9×9");
  await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toBeVisible();

  await choose(page, "Rozmiar", "4×4");
  await expect(page.getByRole("button", { name: /^Poziom:/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toHaveCount(0);
});

test("a 6×6 easy card with shapes has 24 shapes, and the hardest 9×9 card with digits has 29 digits", async ({
  page,
}) => {
  await page.goto("/sudoku");
  await choose(page, "Rozmiar", "6×6");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator(BOARD_SHAPE_PATHS)).toHaveCount(36 - 12);

  await choose(page, "Rozmiar", "9×9");
  await choose(page, "Poziom", "trudny");
  await page.getByRole("button", { name: "Cyfry", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(sheet.locator("text")).toHaveCount(INSTRUCTION_LINES + (81 - 52));
  await expect(sheet.locator("path")).toHaveCount(0);
});

test("changing a setting with a card on screen draws a new card for the new setting", async ({ page }) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet.locator(BOARD_SHAPE_PATHS)).toHaveCount(16 - 4);

  await choose(page, "Rozmiar", "9×9");
  await expect(sheet.locator(BOARD_SHAPE_PATHS)).toHaveCount(81 - 35);
  await choose(page, "Poziom", "średni");
  await expect(sheet.locator(BOARD_SHAPE_PATHS)).toHaveCount(81 - 45);
});

test("a 6×6 level row says how many cells are empty", async ({ page }) => {
  await page.goto("/sudoku");
  await choose(page, "Rozmiar", "6×6");

  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: /^łatwy\b/ })).toContainText("12 pustych pól z 36");
});
