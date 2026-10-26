// Provenance: profile-level-choice (impl-review F2)
// Protects the level choice in the profile dialog: Dodaj profil saves the level picked in the
// form, Edytuj can change only the level, and the bar follows the saved level.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";

async function storedLevels(page: Page): Promise<unknown> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const stored = raw === null ? null : (JSON.parse(raw) as { profiles: { level: string }[] });
    return stored?.profiles.map((profile) => profile.level) ?? null;
  }, PROFILES_KEY);
}

test("the profile dialog saves the picked level and the bar follows it", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/labirynt");

  // client:only island: the Profil corner is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Profil" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Imię").fill("Zosia");
  await dialog.getByRole("button", { name: "Poziom: 3" }).click();
  await dialog.getByRole("button", { name: /^Poziom 5\b/ }).click();
  await expect(dialog.getByRole("button", { name: "Poziom: 5" })).toBeVisible();
  await dialog.getByRole("button", { name: "Utwórz" }).click();

  await expect(page.getByRole("button", { name: "Poziom: 5" })).toBeVisible();
  expect(await storedLevels(page)).toEqual(["lat7"]);

  await page.getByRole("button", { name: "Zosia" }).click();
  await dialog.getByRole("button", { name: "Edytuj Zosia" }).click();
  const save = dialog.getByRole("button", { name: "Zapisz" });
  await expect(save).toBeDisabled();
  await dialog.getByRole("button", { name: "Poziom: 5" }).click();
  await dialog.getByRole("button", { name: /^Poziom 2\b/ }).click();
  await expect(save).toBeEnabled();
  await save.click();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("button", { name: "Poziom: 2" })).toBeVisible();
  expect(await storedLevels(page)).toEqual(["lat4"]);
});
