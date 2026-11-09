// Provenance: odd-one-out-card (S-34, US-22, US-26; gh283-verified-card)
// Protects the "Który nie pasuje" page's rules from the SheetState: a character change keeps the same card (the
// character is decoration), a Kolory switch draws a new card and clears the printed mark (the color rule is part of
// the task), and Drukuj on a card that was already printed asks "Ta karta była już drukowana" first ("Nowa karta" draws
// another card and the next Drukuj prints it, "Drukuj tę samą" prints the card as it is). window.print is a counter
// here, so the real print dialog is not covered; the trial print in the plan does that.
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { printCalls: number }).printCalls = 0;
    window.print = () => {
      (window as unknown as { printCalls: number }).printCalls += 1;
    };
  });
  await page.goto("/odd-one-out");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Który nie pasuje" })).toBeVisible();
}

/** The rows as drawn, without the character band: what makes one card different from another. */
async function rows(page: Page): Promise<string> {
  const sheet = page.getByRole("img", { name: "Który nie pasuje" });
  await expect(sheet).toBeVisible();
  return sheet.locator("g[data-row]").evaluateAll((groups) => groups.map((group) => group.innerHTML).join("|"));
}

async function printCalls(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { printCalls: number }).printCalls);
}

test("a character change keeps the same card", async ({ page }) => {
  await open(page);
  const before = await rows(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(page.getByRole("button", { name: "Postać: Dinozaur" })).toBeVisible();
  expect(await rows(page)).toBe(before);
});

test("the second Drukuj on one card asks first; Drukuj tę samą prints it unchanged", async ({ page }) => {
  await open(page);
  const before = await rows(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);

  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toBeVisible();
  expect(await printCalls(page)).toBe(1);
  await page.getByRole("button", { name: "Drukuj tę samą" }).click();
  await expect.poll(() => printCalls(page)).toBe(2);
  expect(await rows(page)).toBe(before);
});

test("Nowa karta draws another card without printing; the next Drukuj prints it at once", async ({ page }) => {
  await open(page);
  const before = await rows(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await page.getByRole("button", { name: "Nowa karta", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => rows(page)).not.toBe(before);
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
  await page.getByRole("button", { name: /łatwy/ }).click();
  await expect(page.getByRole("button", { name: "Poziom: łatwy" })).toBeVisible();
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(2);
});

test("a Kolory switch draws a new card and clears the printed mark", async ({ page }) => {
  await open(page);
  const before = await rows(page);
  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect.poll(() => printCalls(page)).toBe(1);

  await page.getByRole("switch", { name: "Kolory" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  await expect.poll(() => rows(page)).not.toBe(before);

  await page.getByRole("button", { name: "Drukuj", exact: true }).click();
  await expect(page.getByText("Ta karta była już drukowana")).toHaveCount(0);
  await expect.poll(() => printCalls(page)).toBe(2);
});
