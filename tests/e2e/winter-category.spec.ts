// Provenance: seasons-objects-characters (S-54, US-19, US-20, FR-029)
// Protects the window of the category "Zima" (1.12 to the end of February) next to "Boże Narodzenie": in December both
// are on the symmetry bar right after "Wszystkie", in February only Zima, and from 1 March a remembered Zima reads as
// "Wszystkie". The date is the device clock, fixed here.
import { expect, test, type Page } from "@playwright/test";

const LAST_USED_KEY = "printo-kids:last-used";

async function openWithLastUsed(page: Page, category: string): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [
      LAST_USED_KEY,
      JSON.stringify({ character: "none", cards: { symetria: { level: "lat5", colors: false, category } } }),
    ],
  );
  await page.goto("/symmetry");
}

async function categoryLabels(page: Page): Promise<string[]> {
  await page.getByRole("button", { name: /^Kategoria:/ }).click();
  const names = await page.getByRole("dialog").getByRole("button").allTextContents();
  return names.map((name) => name.trim()).filter((name) => name !== "");
}

test.describe("category Zima", () => {
  test.skip(({ isMobile }) => isMobile, "layout-independent flow");

  test("on 10 December the bar offers Boże Narodzenie and then Zima after Wszystkie", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 10, 12, 0, 0));
    await page.goto("/symmetry");

    const labels = await categoryLabels(page);
    expect(labels[0]).toMatch(/^Wszystkie/);
    expect(labels[1]).toMatch(/^Boże Narodzenie/);
    expect(labels[2]).toMatch(/^Zima/);
  });

  test("on 10 February only Zima is seasonal and Generuj draws a card from it", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 1, 10, 12, 0, 0));
    await page.goto("/symmetry");

    const labels = await categoryLabels(page);
    expect(labels[1]).toMatch(/^Zima/);
    await expect(page.getByRole("dialog").getByRole("button", { name: /^Boże Narodzenie/ })).toHaveCount(0);

    await page.getByRole("dialog").getByRole("button", { name: /^Zima/ }).click();
    await expect(page.getByRole("button", { name: "Kategoria: Zima" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();
  });

  test("on 1 March the bar has no Zima and a remembered one reads as Wszystkie", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 2, 1, 12, 0, 0));
    await openWithLastUsed(page, "zima");
    await expect(page.getByRole("button", { name: "Kategoria: Wszystkie" })).toBeVisible();

    await page.getByRole("button", { name: /^Kategoria:/ }).click();
    await expect(page.getByRole("dialog").getByRole("button", { name: /^Zima/ })).toHaveCount(0);
    await expect(page.getByRole("dialog").getByRole("button", { name: /^Zwierzęta/ })).toBeVisible();
  });
});
