// Provenance: number-maze-card (S-49, US-39, US-40, FR-049, FR-050)
// Protects the number-maze page rules from the SheetState: a character change keeps the same card, a level change draws
// a new one and clears the printed mark, and Drukuj on a card that was already printed asks "Ta karta była już
// drukowana" first ("Nowa karta" draws another card and the next Drukuj prints it, "Drukuj tę samą" prints it as it is).
// window.print is a counter here, so the real print dialog is not covered; the trial print in the plan does that.
import { expect, test, type Page } from "@playwright/test";

const SHEET = "Labirynt liczbowy";

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
  await page.goto("/number-maze");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: SHEET })).toBeVisible();
}

async function cardKey(page: Page): Promise<string> {
  const sheet = page.getByRole("img", { name: SHEET });
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

async function printCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { printCalls: number }).printCalls);
}

async function choose(page: Page, bar: string, option: string, shown: string): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${bar}:`) }).click();
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${bar}: ${shown}` })).toBeVisible();
}

/**
 * With the card on screen already printed, makes `change` and expects a new card whose Drukuj prints at once, without
 * the question. That Drukuj marks the new card as printed, so the next call starts from the same state.
 */
async function expectFreshCardAfter(page: Page, change: () => Promise<void>): Promise<void> {
  const before = await cardKey(page);
  const calls = await printCalls(page);
  await change();
  expect(await cardKey(page)).not.toBe(before);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(calls + 1);
}

test("a character change keeps the same card and the printed mark", async ({ page }) => {
  await open(page);
  const before = await cardKey(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
  expect(await cardKey(page)).toBe(before);
  // The card is the same, so it still counts as printed.
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(1);
});

test("the second Drukuj on one card asks first; Drukuj tę samą prints it unchanged", async ({ page }) => {
  await open(page);
  const before = await cardKey(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);

  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(1);
  await page.getByRole("button", { name: "Drukuj tę samą" }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  expect(await cardKey(page)).toBe(before);
});

test("Nowa karta draws another card without printing; the next Drukuj prints it at once", async ({ page }) => {
  await open(page);
  const before = await cardKey(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Nowa karta", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => cardKey(page)).not.toBe(before);
  // Safari blocks a print that does not come straight from a click, so "Nowa karta" only lays out the card.
  expect(await printCalls(page)).toBe(1);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(2);
});

test("a level change draws a new card and clears the printed mark", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);
  await expectFreshCardAfter(page, () => choose(page, "Poziom", "Poziom 3", "3"));
  await expectFreshCardAfter(page, () => choose(page, "Poziom", "Poziom 6", "6"));
});
