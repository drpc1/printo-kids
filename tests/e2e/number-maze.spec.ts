// Provenance: number-maze-card (S-49, US-39, US-40, FR-049, FR-050)
// Protects the "Labirynt liczbowy" page: Poziom 1 is the default; at every level (Poziom 1-6) the grid has a number in
// each of its cols × rows cells, the start (top left) holds the first number and the goal (bottom right) the last one,
// both with a thick frame and "Start" / "Meta"; every cell stays inside the 10 mm margin of the A4 page; a level change
// with a card shown draws a new card; there is no colors, category or solution switch; the level is remembered in the
// profile and shown on the catalog badge. It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Labirynt liczbowy";

// From the level table of the plan (src/lib/number-maze/levels.ts).
const LEVELS = [
  { option: "Poziom 1", shown: "1", cells: 25, first: "1", last: "15", sentence: "Idź po liczbach 1, 2, 3…" },
  { option: "Poziom 2", shown: "2", cells: 30, first: "1", last: "20", sentence: "Idź po liczbach 1, 2, 3…" },
  { option: "Poziom 3", shown: "3", cells: 42, first: "1", last: "30", sentence: "Idź po liczbach 1, 2, 3…" },
  { option: "Poziom 4", shown: "4", cells: 72, first: "1", last: "50", sentence: "Idź po liczbach 1, 2, 3…" },
  { option: "Poziom 5", shown: "5", cells: 42, first: "2", last: "60", sentence: "Licz co 2: 2, 4, 6…" },
  { option: "Poziom 6", shown: "6", cells: 56, first: "5", last: "200", sentence: "Licz co 5: 5, 10, 15…" },
] as const;

async function generate(page: Page): Promise<Locator> {
  await page.goto("/number-maze");
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

/** The cell frames in page units (mm): every one must lie inside the 10 mm margin. */
async function cellBoxes(sheet: Locator): Promise<{ x: number; y: number; width: number; height: number }[]> {
  return sheet.locator("g[data-cells] rect").evaluateAll((rects) =>
    rects.map((rect) => ({
      x: Number(rect.getAttribute("x")),
      y: Number(rect.getAttribute("y")),
      width: Number(rect.getAttribute("width")),
      height: Number(rect.getAttribute("height")),
    })),
  );
}

test("Poziom 1 is the default: a 5×5 grid of numbers, start and goal framed, and no switch on the bar", async ({
  page,
}) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: 1" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Kolory" })).toHaveCount(0);
  await expect(page.getByRole("switch", { name: /rozwiązanie/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Kategoria:/ })).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Idź po liczbach" }).first()).toBeVisible();

  await expect(sheet.locator("[data-number]")).toHaveCount(25);
  await expect(sheet.locator('[data-endpoint="start"]')).toHaveCount(1);
  await expect(sheet.locator('[data-endpoint="goal"]')).toHaveCount(1);
  await expect(sheet.locator('[data-label="Start"]')).toHaveText("Start");
  await expect(sheet.locator('[data-label="Meta"]')).toHaveText("Meta");
  await expect(sheet.locator("[data-number]").first()).toHaveText("1");
  await expect(sheet.locator("[data-number]").last()).toHaveText("15");
});

test("every level has a number in each cell, the first and last number on start and goal, inside the margin", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  const sheet = await generate(page);
  for (const level of LEVELS) {
    await choose(page, "Poziom", level.option, level.shown);
    await expect(sheet.locator("[data-number]")).toHaveCount(level.cells);
    await expect(sheet.locator("[data-number]").first()).toHaveText(level.first);
    await expect(sheet.locator("[data-number]").last()).toHaveText(level.last);
    await expect(sheet.locator("text", { hasText: level.sentence }).first()).toBeVisible();
    for (const box of await cellBoxes(sheet)) {
      expect(box.x).toBeGreaterThanOrEqual(10 - 1e-6);
      expect(box.y).toBeGreaterThanOrEqual(10 - 1e-6);
      expect(box.x + box.width).toBeLessThanOrEqual(200 + 1e-6);
      expect(box.y + box.height).toBeLessThanOrEqual(287 + 1e-6);
    }
  }
});

test("a level change with a card shown draws a new card of that level", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);
  await choose(page, "Poziom", "Poziom 4", "4");
  expect(await cardKey(sheet)).not.toBe(before);
  await expect(sheet.locator("[data-number]")).toHaveCount(72);
});

test("without a character the instruction stands alone; with one it is in the speech band", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();
  await expect(page.getByRole("button", { name: "Postać: Brak" })).toBeVisible();
  await expect(sheet.locator("image")).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Idź po liczbach" }).first()).toBeVisible();

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(sheet.locator("image")).toHaveCount(1);
  await expect(sheet.locator("[data-number]")).toHaveCount(25);
});

test("the level is remembered in the profile and shown on the catalog badge", async ({ page }, testInfo) => {
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
  await choose(page, "Poziom", "Poziom 5", "5");
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
          profiles: { cards?: { liczby?: unknown } }[];
        };
        return raw.profiles[0].cards?.liczby;
      }, PROFILES_KEY),
    )
    .toEqual({ level: "poziom5" });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: 5" })).toBeVisible();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="liczby"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("poz. 5");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page
    .getByRole("link", { name: /^Labirynt liczbowy/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/number-maze$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});
