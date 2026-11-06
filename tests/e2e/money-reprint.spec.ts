// Provenance: gh283-verified-card (phase 5; PRD US-22, I-9)
// Protects the "Kto ma więcej?" page's two rules from the SheetState: a character change keeps the same card, and
// Drukuj on a card that was already printed asks "Ta karta była już drukowana" first ("Nowa karta i drukuj" draws
// another card and prints it, "Drukuj tę samą" prints the card as it is). window.print is a counter here, so the real
// print dialog is not covered; the trial print in the plan does that.
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
  await page.goto("/money");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Kto ma więcej?" })).toBeVisible();
}

async function piles(page: Page): Promise<string> {
  await expect(page.getByRole("img", { name: "Kto ma więcej?" })).toBeVisible();
  return page
    .getByRole("img", { name: "Kto ma więcej?" })
    .locator("g[data-pile]")
    .evaluateAll((groups) => groups.map((group) => group.textContent).join("|"));
}

async function printCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { printCalls: number }).printCalls);
}

test("a character change keeps the same card", async ({ page }) => {
  await open(page);
  const before = await piles(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
  expect(await piles(page)).toBe(before);
});

test("the second Drukuj on one card asks first; Drukuj tę samą prints it unchanged", async ({ page }) => {
  await open(page);
  const before = await piles(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);

  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(1);
  await page.getByRole("button", { name: "Drukuj tę samą" }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  expect(await piles(page)).toBe(before);
});

test("Nowa karta i drukuj draws another card and prints it once", async ({ page }) => {
  await open(page);
  const before = await piles(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Nowa karta i drukuj" }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  expect(await piles(page)).not.toBe(before);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
});

test("a level change draws a new card and clears the printed mark", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: /łatwy/ }).click();
  await expect(page.getByRole("button", { name: "Poziom: łatwy" })).toBeVisible();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(2);
});
