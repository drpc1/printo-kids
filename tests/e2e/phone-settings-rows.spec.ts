// Provenance: phone-settings-rows (issue #173), generalized to every card page by gh192-pages-sceleton (GH 192)
// On phone-360, before and after the first card, the settings row follows two rules however many controls it holds and however
// the text happens to wrap: the text of the first control on every line starts where the text of "Postać" does,
// and the vertical gap between one line and the next is the same for every pair of lines. Other projects open the
// pages and confirm the controls, then skip the boxes: from 640 px the inset and the tighter gap do not apply.
import { expect, test, type Locator, type Page } from "@playwright/test";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function bottom(box: Box): number {
  return box.y + box.height;
}

// Two boxes share a line when their vertical ranges overlap.
function sharesLine(a: Box, b: Box): boolean {
  return a.y < bottom(b) && b.y < bottom(a);
}

// The left edge of the first visible text inside the element, in viewport pixels.
async function textLeft(locator: Locator): Promise<number> {
  const left = await locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if ((node.textContent ?? "").trim() === "") {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0) {
        return rect.x;
      }
    }
    return null;
  });
  if (left === null) {
    throw new Error("element has no text");
  }
  return left;
}

// Where a control's content starts: the switch of a toggle, otherwise the first text of a button.
async function contentLeft(locator: Locator): Promise<number> {
  const toggle = locator.getByRole("switch");
  if ((await toggle.count()) > 0) {
    const box = await toggle.first().boundingBox();
    if (box === null) {
      throw new Error("switch has no box");
    }
    return box.x;
  }
  return textLeft(locator);
}

// The settings row is the nearest wrapping flex row above "Postać".
function settingsRow(page: Page): Locator {
  return page.getByRole("button", { name: /^Postać:/ }).locator("xpath=ancestor::div[contains(@class,'flex-wrap')][1]");
}

async function expectRowRules(page: Page): Promise<void> {
  const row = settingsRow(page);
  const postac = page.getByRole("button", { name: /^Postać:/ });
  const items: { box: Box; element: Locator }[] = [];
  for (const element of await row.locator(":scope > *").all()) {
    const box = await element.boundingBox();
    if (box !== null && box.width > 0) {
      items.push({ box, element });
    }
  }
  expect(items.length, "controls in the settings row").toBeGreaterThan(1);

  // Lines, top to bottom.
  items.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x);
  const lines: { box: Box; element: Locator }[][] = [];
  for (const item of items) {
    const line = lines.find((candidate) => candidate.some((other) => sharesLine(other.box, item.box)));
    if (line === undefined) {
      lines.push([item]);
    } else {
      line.push(item);
    }
  }

  const postacLeft = await textLeft(postac);
  for (const line of lines) {
    const first = line.reduce((left, item) => (item.box.x < left.box.x ? item : left));
    const left = await contentLeft(first.element);
    expect(
      Math.abs(left - postacLeft),
      "text of the first control on a line starts where Postać does",
    ).toBeLessThanOrEqual(1);
  }

  const gaps: number[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    const above = Math.max(...lines[index - 1].map((item) => bottom(item.box)));
    const below = Math.min(...lines[index].map((item) => item.box.y));
    gaps.push(below - above);
  }
  for (const gap of gaps) {
    expect(Math.abs(gap - gaps[0]), "gap between lines").toBeLessThanOrEqual(1);
  }
}

// Every card page, with the controls its row has before the first card. Sudoku opens at 6×6 so the row holds the
// symbol buttons and the colors switch as well.
const CARD_PAGES: { path: string; label: string; controls: RegExp[]; prepare?: (page: Page) => Promise<void> }[] = [
  { path: "/maze", label: "maze", controls: [/^Postać:/, /^Poziom:/] },
  { path: "/symmetry", label: "symmetry", controls: [/^Postać:/, /^Poziom:/, /^Kategoria:/] },
  { path: "/sequences", label: "sequences", controls: [/^Postać:/, /^Poziom:/] },
  {
    path: "/sudoku",
    label: "sudoku",
    controls: [/^Postać:/, /^Rozmiar: 6×6/, /^Poziom:/, /^Kształty$/],
    prepare: async (page) => {
      // 4×4 has no symbol buttons. The click waits for the client:only island.
      await page.getByRole("button", { name: /^Rozmiar:/ }).click();
      await page.getByRole("button", { name: "6×6", exact: true }).click();
    },
  },
  { path: "/nonogram", label: "nonogram", controls: [/^Postać:/, /^Poziom:/, /^Kategoria:/] },
  { path: "/dictation", label: "dictation", controls: [/^Postać:/, /^Poziom:/, /^Kategoria:/] },
];

for (const card of CARD_PAGES) {
  test(`${card.label} settings row keeps its rules before and after the first card`, async ({ page }, testInfo) => {
    await page.goto(card.path);
    await card.prepare?.(page);
    for (const name of card.controls) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();

    const phone = testInfo.project.name === "phone-360";
    if (phone) {
      await expectRowRules(page);
    }

    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("button", { name: "Drukuj" })).toBeVisible();
    for (const name of card.controls) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    if (phone) {
      await expectRowRules(page);
    }
  });
}
