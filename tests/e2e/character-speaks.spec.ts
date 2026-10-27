// Provenance: character-speaks-instruction (S-30, US-21, FR-030)
// Protects the character beside the instruction on the five cards other than the maze: the Postać bar is there,
// "Bez postaci" leaves the plain sentence without an image, a catalog character is drawn in the sheet's SVG with the
// instruction in its bubble, and on every viewport the sheet fits the width and Generuj and Drukuj stay apart.
// It does not prove the printed page or the printed colors; the trial print in the plan does.
import { expect, test, type Page } from "@playwright/test";

interface CardCase {
  path: string;
  sheet: string | RegExp;
  sentence: string;
}

const CARDS: CardCase[] = [
  { path: "/symetria", sheet: "Symetria", sentence: "Dorysuj drugą połowę" },
  { path: "/sekwencje", sheet: "Sekwencje", sentence: "Co pasuje w puste pole?" },
  { path: "/sudoku", sheet: "Sudoku", sentence: "Uzupełnij puste pola." },
  { path: "/nonogram", sheet: /^Nonogram/, sentence: "Zamaluj kratki według liczb." },
  { path: "/dyktando", sheet: "Dyktando graficzne", sentence: "Rysuj po liniach kratki" },
];

async function pickCharacter(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name }).click();
}

for (const card of CARDS) {
  test(`${card.path}: Bez postaci keeps the plain sentence, a character speaks it in a bubble`, async ({ page }) => {
    await page.goto(card.path);
    await pickCharacter(page, "Bez postaci");
    await expect(page.getByRole("button", { name: "Postać: Bez postaci" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    const sheet = page.getByRole("img", { name: card.sheet });
    await expect(sheet).toBeVisible();
    await expect(sheet.locator("image")).toHaveCount(0);
    await expect(sheet.locator("text", { hasText: card.sentence }).first()).toBeVisible();

    await pickCharacter(page, "Dinozaur");
    await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
    await expect(sheet.locator('image[href="/characters/dinozaur.png"]')).toHaveCount(1);
    await expect(sheet.locator("text", { hasText: card.sentence }).first()).toBeVisible();

    await pickCharacter(page, "Bez postaci");
    await expect(sheet.locator("image")).toHaveCount(0);
  });

  test(`${card.path}: with a character the sheet fits the width and Generuj and Drukuj do not overlap`, async ({
    page,
  }) => {
    await page.goto(card.path);
    await pickCharacter(page, "Samochodzik");
    await page.getByRole("button", { name: "Generuj" }).click();
    const sheet = page.getByRole("img", { name: card.sheet });
    await expect(sheet.locator("image")).toHaveCount(1);

    const size = page.viewportSize();
    const box = await sheet.boundingBox();
    const generate = await page.getByRole("button", { name: "Generuj" }).boundingBox();
    const print = await page.getByRole("button", { name: "Drukuj" }).boundingBox();
    if (size === null || box === null || generate === null || print === null) {
      throw new Error("a box is missing");
    }

    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(size.width + 0.5);
    const apart =
      generate.x + generate.width <= print.x ||
      print.x + print.width <= generate.x ||
      generate.y + generate.height <= print.y ||
      print.y + print.height <= generate.y;
    expect(apart).toBe(true);
    const scroll = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth,
    }));
    expect(scroll.scroll).toBeLessThanOrEqual(scroll.inner);
  });
}
