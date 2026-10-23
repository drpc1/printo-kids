// Provenance: card-catalog-home (phase 3); symmetry-first-printable (phase 4, US-05)
// Protects the card catalog on /: the Labirynt and Symetria thumbnails open their generators, Symetria
// shows its card after Generuj and leads back with "Wszystkie karty", and the chosen child profile stays
// chosen across the round trip catalog -> generator -> catalog -> generator on both pages.
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

test("the Symetria card on the catalog opens the symmetry generator and leads back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  await page.getByRole("link", { name: "Symetria" }).click();
  await expect(page).toHaveURL(/\/symetria$/);

  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Symetria" })).toBeVisible();
});

test("each Generuj on the symmetry page draws a different card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/symetria");

  const generuj = page.getByRole("button", { name: "Generuj" });
  const sheet = page.getByRole("img", { name: "Symetria" });
  await generuj.click();
  await expect(sheet).toBeVisible();

  // The page passes the card on screen to the generator, so the next card never repeats it.
  for (let round = 0; round < 3; round += 1) {
    const before = await sheet.innerHTML();
    await generuj.click();
    await expect.poll(() => sheet.innerHTML()).not.toBe(before);
  }
});

test("the profile chosen on the symmetry page persists across the catalog round trip", async ({ page }, testInfo) => {
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

  await page.goto("/symetria");

  // Two profiles and none chosen: the dialog opens by itself on the symmetry page too.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Closed without a choice, Generuj waits for the child, as on the maze page.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Generuj" })).toBeDisabled();

  await page.getByRole("button", { name: "Profil", exact: true }).click();
  await dialog.getByRole("button", { name: "Ania", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Symetria" }).click();
  await expect(page).toHaveURL(/\/symetria$/);

  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
