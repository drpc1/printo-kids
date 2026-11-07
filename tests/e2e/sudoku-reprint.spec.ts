// Provenance: gh283-verified-card (phase 8; PRD US-22, I-9)
// Protects the sudoku page's rules from the SheetState: a character change or the colors switch keeps the same board,
// a size or level change draws a new one, and Drukuj on a card that was already printed asks "Ta karta była już
// drukowana" first ("Nowa karta" draws another card and the next Drukuj prints it, "Drukuj tę samą" prints it as it is).
// window.print is a counter here, so the real print dialog is not covered; the trial print in the plan does that.
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
  await page.goto("/sudoku");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();
}

async function cardKey(page: Page): Promise<string> {
  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

async function printCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { printCalls: number }).printCalls);
}

async function choose(page: Page, bar: "Rozmiar" | "Poziom", option: string): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${bar}:`) }).click();
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${bar}: ${option}` })).toBeVisible();
}

test("a character change and the colors switch keep the same board", async ({ page }) => {
  await open(page);
  const before = await cardKey(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
  expect(await cardKey(page)).toBe(before);
  await page.getByRole("switch", { name: "Kolory" }).click();
  expect(await cardKey(page)).toBe(before);
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

test("Nowa karta draws another board without printing; the next Drukuj prints it at once", async ({ page }) => {
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

test("a size or level change draws a new board and clears the printed mark", async ({ page }) => {
  await open(page);
  const before = await cardKey(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await choose(page, "Rozmiar", "6×6");
  const sized = await cardKey(page);
  expect(sized).not.toBe(before);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(2);

  await choose(page, "Poziom", "średni");
  expect(await cardKey(page)).not.toBe(sized);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(3);
});
