// Provenance: christmas-characters (S-39, US-03, FR-012, FR-030)
// Protects the window of the Christmas characters: inside 15.11-6.01 the pick list has them after Brak, with a line
// under them, and a pick speaks the instruction on a card; outside the window they are not on the list, but a
// remembered one stays selected and on the card. March is outside the winter window too (S-54). The date is the device
// clock, fixed here.
import { expect, test, type Page } from "@playwright/test";

const LAST_USED_KEY = "printo-kids:last-used";

async function openWith(page: Page, character: string): Promise<void> {
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [LAST_USED_KEY, JSON.stringify({ character })],
  );
  await page.goto("/symmetry");
}

async function listLabels(page: Page): Promise<string[]> {
  await page.getByRole("button", { name: /^Postać:/ }).click();
  const names = await page.getByRole("dialog").getByRole("button").allTextContents();
  return names.map((name) => name.trim()).filter((name) => name !== "");
}

test.describe("Christmas characters", () => {
  test.skip(({ isMobile }) => isMobile, "layout-independent flow");

  test("on 10 December the list offers them after Brak and a pick speaks the instruction", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 10, 12, 0, 0));
    await openWith(page, "none");
    const labels = await listLabels(page);
    expect(labels.slice(0, 4)).toEqual(["Brak", "Bałwanek", "Mikołaj", "Renifer"]);
    expect(labels).toContain("Wróżka");
    await expect(page.getByRole("dialog").locator('[data-slot="separator"]')).toHaveCount(1);

    await page.getByRole("dialog").getByRole("button", { name: "Mikołaj" }).click();
    await expect(page.getByRole("button", { name: "Postać: Mikołaj" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(
      page.getByRole("img", { name: "Symetria" }).locator('image[href="/characters/mikolaj.webp"]'),
    ).toHaveCount(1);
  });

  test("on 10 March the list has no seasonal characters", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 2, 10, 12, 0, 0));
    await openWith(page, "none");
    const labels = await listLabels(page);
    expect(labels).not.toContain("Mikołaj");
    expect(labels).not.toContain("Renifer");
    await expect(page.getByRole("dialog").locator('[data-slot="separator"]')).toHaveCount(0);
  });

  test("on 10 March a remembered Mikołaj stays selected, on top of the list and on the card", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 2, 10, 12, 0, 0));
    await openWith(page, "mikolaj");
    await expect(page.getByRole("button", { name: "Postać: Mikołaj" })).toBeVisible();
    const labels = await listLabels(page);
    expect(labels.slice(0, 2)).toEqual(["Brak", "Mikołaj"]);
    await expect(page.getByRole("dialog").getByRole("button", { name: "Mikołaj" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
