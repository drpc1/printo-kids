// Provenance: gh283-verified-card (phase 4; PRD US-22, I-9)
// Protects the maze page's two rules from the SheetState: a character change keeps the same card, and Drukuj on a card
// that was already printed asks "Ta karta była już drukowana" first ("Nowa karta" draws another card and the next
// Drukuj prints it, "Drukuj tę samą" prints the card as it is). window.print is replaced by a counter, so the real print
// dialog is not covered; the trial print in the plan does that.
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
  await page.goto("/maze");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Labirynt" })).toBeVisible();
}

async function walls(page: Page): Promise<string> {
  await expect(page.getByRole("img", { name: "Labirynt" })).toBeVisible();
  return page.getByRole("img", { name: "Labirynt" }).locator("g").innerHTML();
}

async function printCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { printCalls: number }).printCalls);
}

test("a character change keeps the same maze", async ({ page }) => {
  await open(page);
  const before = await walls(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
  expect(await walls(page)).toBe(before);
});

test("the first Drukuj prints without asking, the second asks and offers a new card or the same one", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);

  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(1);
  await expect(page.getByRole("button", { name: "Nowa karta", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Drukuj tę samą" })).toBeVisible();
});

test("Drukuj tę samą prints the card unchanged", async ({ page }) => {
  await open(page);
  const before = await walls(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj tę samą" }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  expect(await walls(page)).toBe(before);
});

test("Nowa karta draws another maze without printing; the next Drukuj prints it at once", async ({ page }) => {
  await open(page);
  const before = await walls(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Nowa karta", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => walls(page)).not.toBe(before);
  // Safari blocks a print that does not come straight from a click, so "Nowa karta" only lays out the card.
  expect(await printCalls(page)).toBe(1);
  // The new card was not printed yet: Drukuj prints it without asking, and only the Drukuj after that asks again.
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
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: /Poziom 1/ }).click();
  await expect(page.getByRole("button", { name: "Poziom: 1" })).toBeVisible();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(2);
});
