// Provenance: seasons-objects-characters (S-54, US-03, FR-012, FR-030)
// Protects the winter window of the characters (1.12 to the end of February): Bałwanek and Pingwin are on the pick
// list with one line under the seasonal rows, together with Mikołaj and Renifer until 6.01, alone in February, and
// gone from 1 March. A pick of Pingwin speaks the instruction on a card. The date is the device clock, fixed here.
import { expect, test, type Page } from "@playwright/test";

async function listLabels(page: Page): Promise<string[]> {
  await page.getByRole("button", { name: /^Postać:/ }).click();
  const names = await page.getByRole("dialog").getByRole("button").allTextContents();
  return names.map((name) => name.trim()).filter((name) => name !== "");
}

test.describe("winter characters", () => {
  test.skip(({ isMobile }) => isMobile, "layout-independent flow");

  test("on 10 December the list has the Christmas and winter characters under one line", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 10, 12, 0, 0));
    await page.goto("/symmetry");
    const labels = await listLabels(page);
    expect(labels.slice(0, 5)).toEqual(["Brak", "Bałwanek", "Mikołaj", "Renifer", "Pingwin"]);
    await expect(page.getByRole("dialog").locator('[data-slot="separator"]')).toHaveCount(1);
  });

  test("on 10 February only Bałwanek and Pingwin, and a pick of Pingwin speaks the instruction", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 1, 10, 12, 0, 0));
    await page.goto("/symmetry");
    const labels = await listLabels(page);
    expect(labels.slice(0, 3)).toEqual(["Brak", "Bałwanek", "Pingwin"]);
    expect(labels).not.toContain("Mikołaj");
    await expect(page.getByRole("dialog").locator('[data-slot="separator"]')).toHaveCount(1);

    await page.getByRole("dialog").getByRole("button", { name: "Pingwin" }).click();
    await expect(page.getByRole("button", { name: "Postać: Pingwin" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(
      page.getByRole("img", { name: "Symetria" }).locator('image[href="/characters/pingwin.webp"]'),
    ).toHaveCount(1);
  });

  test("on 1 March neither Bałwanek nor Pingwin is on the list", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 2, 1, 12, 0, 0));
    await page.goto("/symmetry");
    const labels = await listLabels(page);
    expect(labels).not.toContain("Bałwanek");
    expect(labels).not.toContain("Pingwin");
    await expect(page.getByRole("dialog").locator('[data-slot="separator"]')).toHaveCount(0);
  });
});
