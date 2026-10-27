// Provenance: favorite-character-explicit (S-31, US-03, US-08, US-22, FR-009)
// Protects the explicit favorite: with a profile active, a character picked on the bar is for this visit only (the
// favorite is back after a reload), the list of characters then says "Tylko na tę kartę" and offers "Ustaw jako
// ulubioną {imię}", one click saves it in the profile and closes the list, the favorite itself and a profile-less
// visit offer nothing, a stored own image without a picture does not offer to be overwritten, and on a phone the
// offer stays reachable under the long list. The flows are the same on every screen size, so they run on desktop
// Chromium; the reach check runs on every project.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const ANIA = { id: "profile-ania", name: "Ania", character: "kot", level: "lat6" };

async function seed(page: Page, profiles: unknown[], activeId: string | null): Promise<void> {
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript(
    ([profilesKey, activeKey, stored, active]) => {
      if (localStorage.getItem(profilesKey) === null) {
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: stored }));
        if (active !== null) {
          localStorage.setItem(activeKey, active);
        }
      }
    },
    [PROFILES_KEY, ACTIVE_KEY, profiles, activeId] as const,
  );
}

async function storedProfile(page: Page): Promise<{ character: string; image?: string } | undefined> {
  return page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { character: string; image?: string }[];
    } | null;
    return stored?.profiles[0];
  }, PROFILES_KEY);
}

async function openList(page: Page) {
  await page.getByRole("button", { name: /^Postać:/ }).click();
  return page.getByRole("dialog");
}

async function pick(page: Page, name: string): Promise<void> {
  const dialog = await openList(page);
  await dialog.getByRole("button", { name, exact: true }).click();
}

test("a character picked on the bar is for this visit only and the favorite is back after a reload", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/symetria");
  await expect(page.getByRole("button", { name: "Postać: Kot" })).toBeVisible();

  await pick(page, "Smok");
  await expect(page.getByRole("button", { name: "Postać: Smok" })).toBeVisible();
  expect((await storedProfile(page))?.character).toBe("kot");

  await page.reload();
  await expect(page.getByRole("button", { name: "Postać: Kot" })).toBeVisible();
});

test("the list says Tylko na tę kartę and one click makes the character the favorite", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/symetria");

  // The favorite itself offers nothing.
  let dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Smok", exact: true }).click();

  dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toBeVisible();
  await dialog.getByRole("button", { name: "Ustaw jako ulubioną Ania" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Zapamiętane dla Ania")).toBeVisible();
  expect((await storedProfile(page))?.character).toBe("smok");

  // Smok is now the favorite: the list offers nothing, and a reload keeps it.
  dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.getByRole("button", { name: "Postać: Smok" })).toBeVisible();
});

test("the maze page offers the favorite too", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/labirynt");

  await pick(page, "Pies");
  const dialog = await openList(page);
  await dialog.getByRole("button", { name: "Ustaw jako ulubioną Ania" }).click();
  expect((await storedProfile(page))?.character).toBe("pies");
});

test("without a profile the list offers nothing", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/symetria");

  await pick(page, "Smok");
  const dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: /^Ustaw jako ulubioną/ })).toHaveCount(0);
});

test("a stored own image without a picture does not offer to be overwritten on entry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [{ ...ANIA, character: "wlasne" }], ANIA.id);
  await page.goto("/symetria");

  await expect(page.getByRole("button", { name: "Postać: Bez postaci" })).toBeVisible();
  const dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toHaveCount(0);
});

test("an own image is saved as the favorite from the bar and is not offered again", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/symetria");

  let dialog = await openList(page);
  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Własne zdjęcie", exact: true }).click();
  await (await chooser).setFiles({ name: "a.png", mimeType: "image/png", buffer: Buffer.from(PNG_BASE64, "base64") });

  dialog = await openList(page);
  await dialog.getByRole("button", { name: "Ustaw jako ulubioną Ania" }).click();
  const profile = await storedProfile(page);
  expect(profile?.character).toBe("wlasne");
  expect(profile?.image?.startsWith("data:image/")).toBe(true);

  dialog = await openList(page);
  await expect(dialog.getByText("Tylko na tę kartę")).toHaveCount(0);
});

test("on every screen size the offer stays reachable under the long list", async ({ page }) => {
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/symetria");
  await pick(page, "Smok");

  const dialog = await openList(page);
  const offer = dialog.getByRole("button", { name: "Ustaw jako ulubioną Ania" });
  await expect(offer).toBeVisible();
  // The dialog zooms in from 95%: a box measured mid-animation is a few percent smaller than the settled one.
  await expect.poll(async () => (await offer.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  const box = await offer.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box !== null && viewport !== null) {
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await offer.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
