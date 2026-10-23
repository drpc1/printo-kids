// Provenance: card-catalog-home (phase 3)
// Protects the card catalog on /: the Labirynt thumbnail opens the maze generator, and the chosen
// child profile stays chosen across the round trip catalog -> generator -> catalog -> generator.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";

test("the Labirynt card on the catalog opens the maze generator", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  const card = page.getByRole("link", { name: "Labirynt" });
  await expect(card).toBeVisible();
  await card.click();

  await expect(page).toHaveURL(/\/labirynt$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});

test("the chosen profile persists across the catalog round trip", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(
        key,
        JSON.stringify({
          profiles: [
            { id: "profile-ania", name: "Ania", character: "none", level: "lat4" },
            { id: "profile-zosia", name: "Zosia", character: "kot", level: "lat7" },
          ],
        }),
      );
    }
  }, PROFILES_KEY);

  await page.goto("/labirynt");

  // Two profiles and none chosen: the dialog opens by itself and asks who is playing.
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Zosia", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Zosia", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Labirynt" }).click();
  await expect(page).toHaveURL(/\/labirynt$/);

  await expect(page.getByRole("button", { name: "Zosia", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
