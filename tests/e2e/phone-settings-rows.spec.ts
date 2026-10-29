// Provenance: phone-settings-rows (issue #173)
// On phone-360, before Generuj, the sudoku "Kształty" text starts where "Postać" does,
// and the nonogram gaps between Postać, Poziom and Kategoria match. Other projects open
// both pages and confirm the controls, then skip the boxes: from 640 px the inset and
// the tighter gap do not apply, and wrapping onto those lines is not guaranteed.
import { expect, test, type Locator } from "@playwright/test";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function viewportBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) {
    throw new Error("element has no box");
  }
  return box;
}

// "Kształty" is a text node inside the button, not a span. The span inset on "Postać"
// is what the chevron padding produces; the button frame already lined up.
async function textNodeBox(locator: Locator): Promise<Box> {
  const box = await locator.evaluate((element) => {
    const text = Array.from(element.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
    );
    if (text === undefined) {
      return null;
    }
    const range = document.createRange();
    range.selectNodeContents(text);
    const rect = range.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  if (box === null) {
    throw new Error("element has no text");
  }
  return box;
}

function bottom(box: Box): number {
  return box.y + box.height;
}

// Two boxes share a line when their vertical ranges overlap.
function sharesLine(a: Box, b: Box): boolean {
  return a.y < bottom(b) && b.y < bottom(a);
}

test("sudoku symbol text lines up with Postać before Generuj", async ({ page }, testInfo) => {
  await page.goto("/sudoku");
  // 4×4 has no symbol buttons. The click waits for the client:only island.
  await page.getByRole("button", { name: /^Rozmiar:/ }).click();
  await page.getByRole("button", { name: "6×6", exact: true }).click();

  const postac = page.getByRole("button", { name: /^Postać:/ });
  const ksztalty = page.getByRole("button", { name: "Kształty", exact: true });
  await expect(page.getByRole("button", { name: "Rozmiar: 6×6" })).toBeVisible();
  await expect(postac).toBeVisible();
  await expect(ksztalty).toBeVisible();

  if (testInfo.project.name !== "phone-360") {
    return;
  }

  const postacBox = await viewportBox(postac);
  const ksztaltyBox = await viewportBox(ksztalty);
  expect(sharesLine(postacBox, ksztaltyBox), "Kształty stayed on Postać's line").toBe(false);
  expect(ksztaltyBox.y).toBeGreaterThanOrEqual(bottom(postacBox));

  const row = ksztalty.locator("xpath=ancestor::div[contains(@class,'flex-wrap')][1]");
  const line: Box[] = [];
  for (const locator of await row.getByRole("button").all()) {
    const box = await locator.boundingBox();
    if (box !== null && sharesLine(box, ksztaltyBox)) {
      line.push(box);
    }
  }
  expect(line.length).toBeGreaterThan(0);
  const leftmost = line.reduce((left, box) => (box.x < left.x ? box : left));
  expect(leftmost.x, "Kształty is not the leftmost button on its line").toBe(ksztaltyBox.x);

  const postacLabel = await viewportBox(postac.locator("span").first());
  const ksztaltyText = await textNodeBox(ksztalty);
  expect(Math.abs(postacLabel.x - ksztaltyText.x), "Kształty text left edge").toBeLessThanOrEqual(1);
});

test("nonogram category gap matches the row above before Generuj", async ({ page }, testInfo) => {
  await page.goto("/nonogram");
  const postac = page.getByRole("button", { name: /^Postać:/ });
  const poziom = page.getByRole("button", { name: /^Poziom:/ });
  const kategoria = page.getByRole("button", { name: /^Kategoria:/ });
  await expect(postac).toBeVisible();
  await expect(poziom).toBeVisible();
  await expect(kategoria).toBeVisible();
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();

  if (testInfo.project.name !== "phone-360") {
    return;
  }

  const postacBox = await viewportBox(postac);
  const poziomBox = await viewportBox(poziom);
  const kategoriaBox = await viewportBox(kategoria);
  expect(sharesLine(postacBox, poziomBox), "Postać and Poziom share a line").toBe(false);
  expect(sharesLine(poziomBox, kategoriaBox), "Poziom and Kategoria share a line").toBe(false);
  expect(sharesLine(postacBox, kategoriaBox), "Postać and Kategoria share a line").toBe(false);
  expect(bottom(postacBox)).toBeLessThanOrEqual(poziomBox.y);
  expect(bottom(poziomBox)).toBeLessThanOrEqual(kategoriaBox.y);

  const postacToPoziom = poziomBox.y - bottom(postacBox);
  const poziomToKategoria = kategoriaBox.y - bottom(poziomBox);
  expect(Math.abs(postacToPoziom - poziomToKategoria), "category gap").toBeLessThanOrEqual(1);
});
