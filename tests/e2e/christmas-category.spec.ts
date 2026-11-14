// Provenance: christmas-objects (S-38, US-19, US-20, FR-029)
// Protects the window of the category "Boże Narodzenie": on the symmetry page it is on the bar right after "Wszystkie"
// inside 15.11-6.01 and a pick draws a card, and outside the window it is not on the bar, a remembered one reads as
// "Wszystkie" and the remembered value stays untouched until the bar changes. The date is the device clock, fixed here.
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

test.describe("category Boże Narodzenie", () => {
  test.skip(({ isMobile }) => isMobile, "layout-independent flow");

  test("on 10 December the bar offers it after Wszystkie and Generuj draws a card from it", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 10, 12, 0, 0));
    await page.goto("/symmetry");
    await page.getByRole("button", { name: /^Kategoria:/ }).click();

    const dialog = page.getByRole("dialog");
    const names = await dialog.getByRole("button").allTextContents();
    const labels = names.map((name) => name.trim()).filter((name) => name !== "");
    expect(labels[0]).toMatch(/^Wszystkie/);
    expect(labels[1]).toMatch(/^Boże Narodzenie/);

    await dialog.getByRole("button", { name: /^Boże Narodzenie/ }).click();
    await expect(page.getByRole("button", { name: "Kategoria: Boże Narodzenie" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();
  });

  test("on 10 February the bar has no such entry and a remembered one reads as Wszystkie", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 1, 10, 12, 0, 0));
    await openWithLastUsed(page, "boze-narodzenie");
    await expect(page.getByRole("button", { name: "Kategoria: Wszystkie" })).toBeVisible();

    await page.getByRole("button", { name: /^Kategoria:/ }).click();
    await expect(page.getByRole("dialog").getByRole("button", { name: /^Boże Narodzenie/ })).toHaveCount(0);
    await expect(page.getByRole("dialog").getByRole("button", { name: /^Zwierzęta/ })).toBeVisible();
  });
});
