// Provenance: coding-card (S-42, US-35, US-36, FR-045, FR-046)
// Protects the "Kodowanie" page: Poziom 1 and Zapisz are the defaults; Zapisz has as many answer boxes as the path has
// steps (a "n →" command each on Poziom 4) and the flag, Wykonaj has the three pictures and the given arrows; without a
// character the start cell says "Start"; a level or mode change with a card shown draws a new card; both are remembered
// in the profile and the level is on the catalog badge. It does not prove the printed page; the trial print in the
// plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Kodowanie";

async function pickCharacter(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name }).click();
}

async function generate(page: Page): Promise<Locator> {
  await page.goto("/coding");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: SHEET });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function choose(page: Page, bar: string, option: string, shown: string): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${bar}:`) }).click();
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${bar}: ${shown}` })).toBeVisible();
}

async function cardKey(sheet: Locator): Promise<string> {
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

test("Poziom 1 and Zapisz are the defaults; Zapisz draws the flag and the answer boxes, the first one in grey", async ({
  page,
}) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tryb: Zapisz" })).toBeVisible();
  await expect(page.getByRole("switch")).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Zapisz strzałkami najkrótszą drogę" }).first()).toBeVisible();

  await expect(sheet.locator("g[data-flag]")).toHaveCount(1);
  await expect(sheet.locator("[data-picture]")).toHaveCount(0);
  // Poziom 1: 6-8 steps, one box per step; the first one carries the example arrow.
  const boxes = await sheet.locator("g[data-answer-box]").count();
  expect(boxes).toBeGreaterThanOrEqual(6);
  expect(boxes).toBeLessThanOrEqual(8);
  await expect(sheet.locator("g[data-answer-box] [data-arrow]")).toHaveCount(1);
});

test("Wykonaj draws three pictures on the grid and a given arrow in every box, without the flag", async ({ page }) => {
  const sheet = await generate(page);
  await choose(page, "Tryb", "Wykonaj", "Wykonaj");
  await expect(sheet.locator("text", { hasText: "Idź za strzałkami" }).first()).toBeVisible();
  await expect(sheet.locator("g[data-flag]")).toHaveCount(0);
  await expect(sheet.locator("[data-picture]")).toHaveCount(3);
  const boxes = await sheet.locator("g[data-answer-box]").count();
  expect(boxes).toBeGreaterThanOrEqual(6);
  await expect(sheet.locator("g[data-answer-box] [data-arrow]")).toHaveCount(boxes);
});

test("Poziom 4 writes the steps as commands with a number and an arrow, on a 10 × 10 grid", async ({ page }) => {
  const sheet = await generate(page);
  await choose(page, "Poziom", "Poziom 4", "4");
  await expect(sheet.locator("g[data-grid] rect")).toHaveCount(101);
  await expect(sheet.locator("text", { hasText: "Liczba kratek i strzałka" }).first()).toBeVisible();
});

test("without a character the start cell says Start; with one it holds the character", async ({ page }) => {
  const sheet = await generate(page);
  await pickCharacter(page, "Brak");
  await expect(sheet.locator("[data-start] text", { hasText: "Start" })).toHaveCount(1);
  await expect(sheet.locator("image")).toHaveCount(0);

  await pickCharacter(page, "Dinozaur");
  await expect(sheet.locator("g[data-start]")).toHaveCount(0);
  // The speech band and the start cell: the same character twice.
  await expect(sheet.locator('image[href="/characters/dinozaur.webp"]')).toHaveCount(2);
});

test("a level or mode change with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const first = await cardKey(sheet);

  await choose(page, "Poziom", "Poziom 3", "3");
  const second = await cardKey(sheet);
  expect(second).not.toBe(first);

  await choose(page, "Tryb", "Wykonaj", "Wykonaj");
  expect(await cardKey(sheet)).not.toBe(second);
});

test("the level and mode are remembered in the profile and the level is on the catalog badge", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.addInitScript(
    ([profilesKey, activeKey]) => {
      if (localStorage.getItem(profilesKey) === null) {
        const profile = { id: "profile-ola", name: "Ola", character: "none", cards: {} };
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: [profile] }));
        localStorage.setItem(activeKey, profile.id);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY] as const,
  );
  await generate(page);
  await choose(page, "Poziom", "Poziom 4", "4");
  await choose(page, "Tryb", "Wykonaj", "Wykonaj");
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
          profiles: { cards?: { kodowanie?: unknown } }[];
        };
        return raw.profiles[0].cards?.kodowanie;
      }, PROFILES_KEY),
    )
    .toEqual({ level: "poziom4", mode: "wykonaj" });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: 4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tryb: Wykonaj" })).toBeVisible();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="kodowanie"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("poz. 4");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page
    .getByRole("link", { name: /Kodowanie/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/coding$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});
