// Provenance: refactor-opportunities (phase 3, TD-1, issue 284)
// Protects the profile list against a stale tab: a profile written by another open tab survives when this tab
// deletes or creates a profile, because the list is read afresh just before it is written.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const OLA = { id: "e2e-ola", name: "Ola", character: "kot" };
const ANIA = { id: "e2e-ania", name: "Ania", character: "pies" };

test.beforeEach(({ page: _page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
});

async function storedNames(page: Page): Promise<string[]> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    const parsed = raw === null ? { profiles: [] } : (JSON.parse(raw) as { profiles: { name: string }[] });
    return parsed.profiles.map((profile) => profile.name);
  }, PROFILES_KEY);
}

/** Tab A loads with Ola only; a second tab of the same browser then stores Ania next to her. */
async function openWithOlaThenAddAniaElsewhere(page: Page): Promise<void> {
  await page.goto("/maze");
  await page.evaluate(
    ([key, profiles]) => {
      window.localStorage.setItem(key, JSON.stringify({ profiles }));
    },
    [PROFILES_KEY, [OLA]] as const,
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "Ola", exact: true })).toBeVisible();

  const other = await page.context().newPage();
  await other.goto("/maze");
  await other.evaluate(
    ([key, profiles]) => {
      window.localStorage.setItem(key, JSON.stringify({ profiles }));
    },
    [PROFILES_KEY, [OLA, ANIA]] as const,
  );
  await other.close();
}

test("deleting a profile keeps one added in another tab", async ({ page }) => {
  await openWithOlaThenAddAniaElsewhere(page);

  await page.getByRole("button", { name: "Ola", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Usuń Ola" }).click();
  await dialog.getByRole("button", { name: "Usuń", exact: true }).click();

  await expect.poll(() => storedNames(page)).toEqual(["Ania"]);
});

test("creating a profile keeps one added in another tab", async ({ page }) => {
  await openWithOlaThenAddAniaElsewhere(page);

  await page.getByRole("button", { name: "Ola", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Dodaj profil" }).click();
  await dialog.getByLabel("Imię:").fill("Basia");
  await dialog.getByRole("button", { name: "Utwórz" }).click();

  await expect.poll(async () => (await storedNames(page)).sort()).toEqual(["Ania", "Basia", "Ola"]);
});
