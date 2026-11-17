// Provenance: clock-card (S-41, US-33, US-34, FR-043, FR-044)
// Protects the "Zegar" page: Poziom 1, Odczytaj and 24 h off by default; Odczytaj and Dorysuj draw six dials and Połącz
// five, with the hands, the boxes, the digital clocks and the dots each mode has; every dial stays inside the 10 mm
// margin of the A4 page; a level, mode or 24 h change with a card shown draws a new card; with 24 h every dial has its
// part of the day under it; the three settings are remembered in the profile and the level is on the catalog badge.
// It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Zegar";
const PARTS_OF_DAY = ["rano", "po południu", "wieczorem", "w nocy"];

const MODES = [
  { option: "Odczytaj", dials: 6, hands: 6, answers: 6, digitals: 0, dots: 0 },
  { option: "Dorysuj", dials: 6, hands: 0, answers: 0, digitals: 6, dots: 0 },
  { option: "Połącz", dials: 5, hands: 5, answers: 0, digitals: 5, dots: 10 },
] as const;

async function generate(page: Page): Promise<Locator> {
  await page.goto("/clock");
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

/** The rim of every dial: the first circle of each dial group. */
async function dialRims(sheet: Locator): Promise<{ cx: number; cy: number; r: number }[]> {
  return sheet.locator("g[data-dial] > circle:first-child").evaluateAll((circles) =>
    circles.map((circle) => ({
      cx: Number(circle.getAttribute("cx")),
      cy: Number(circle.getAttribute("cy")),
      r: Number(circle.getAttribute("r")),
    })),
  );
}

test("Poziom 1, Odczytaj and 24 h off are the defaults, and Generuj draws six dials with hands and boxes", async ({
  page,
}) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tryb: Odczytaj" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "24 h" })).not.toBeChecked();
  await expect(sheet.locator("text", { hasText: "Która godzina?" }).first()).toBeVisible();

  await expect(sheet.locator("g[data-dial]")).toHaveCount(6);
  await expect(sheet.locator("g[data-hands]")).toHaveCount(6);
  await expect(sheet.locator("g[data-answer]")).toHaveCount(6);
  await expect(sheet.locator("g[data-part-of-day]")).toHaveCount(0);
  // Every dial has its numbers 1-12.
  for (const number of ["12", "3", "6", "9"]) {
    await expect(
      sheet
        .locator("g[data-dial]")
        .first()
        .locator("text", { hasText: new RegExp(`^${number}$`) }),
    ).toHaveCount(1);
  }
});

test("each mode draws its dials, hands, boxes, digital clocks and dots", async ({ page }) => {
  const sheet = await generate(page);
  for (const mode of MODES) {
    await choose(page, "Tryb", mode.option, mode.option);
    await expect(sheet.locator("g[data-dial]"), mode.option).toHaveCount(mode.dials);
    await expect(sheet.locator("g[data-hands]"), mode.option).toHaveCount(mode.hands);
    await expect(sheet.locator("g[data-answer]"), mode.option).toHaveCount(mode.answers);
    await expect(sheet.locator("g[data-digital]"), mode.option).toHaveCount(mode.digitals);
    await expect(sheet.locator("[data-dot]"), mode.option).toHaveCount(mode.dots);
  }
});

test("every mode, with and without 24 h, keeps the dials inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);
  await choose(page, "Poziom", "Poziom 4", "4");
  const h24 = page.getByRole("switch", { name: "24 h" });
  for (const on of [false, true]) {
    if ((await h24.isChecked()) !== on) {
      await h24.click();
    }
    for (const mode of MODES) {
      await choose(page, "Tryb", mode.option, mode.option);
      const label = `${mode.option}${on ? " 24 h" : ""}`;
      const rims = await dialRims(sheet);
      expect(rims.length, label).toBe(mode.dials);
      for (const rim of rims) {
        expect(rim.cx - rim.r, label).toBeGreaterThanOrEqual(10 - 0.01);
        expect(rim.cy - rim.r, label).toBeGreaterThanOrEqual(10 - 0.01);
        expect(rim.cx + rim.r, label).toBeLessThanOrEqual(200 + 0.01);
        expect(rim.cy + rim.r, label).toBeLessThanOrEqual(287 + 0.01);
      }
    }
  }
});

test("a level, mode or 24 h change with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const first = await cardKey(sheet);

  await choose(page, "Poziom", "Poziom 3", "3");
  const second = await cardKey(sheet);
  expect(second).not.toBe(first);

  await choose(page, "Tryb", "Dorysuj", "Dorysuj");
  const third = await cardKey(sheet);
  expect(third).not.toBe(second);

  await page.getByRole("switch", { name: "24 h" }).click();
  await expect(page.getByRole("switch", { name: "24 h" })).toBeChecked();
  expect(await cardKey(sheet)).not.toBe(third);
});

test("with 24 h every dial has its part of the day under it, in words", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("switch", { name: "24 h" }).click();
  await expect(page.getByRole("switch", { name: "24 h" })).toBeChecked();

  for (const mode of MODES) {
    await choose(page, "Tryb", mode.option, mode.option);
    const words = await sheet.locator("g[data-part-of-day] text").allTextContents();
    expect(words.length, mode.option).toBe(mode.dials);
    for (const word of words) {
      expect(PARTS_OF_DAY, mode.option).toContain(word);
    }
  }
});

test("the level, mode and 24 h are remembered in the profile and the level is on the catalog badge", async ({
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
  await choose(page, "Tryb", "Połącz", "Połącz");
  await page.getByRole("switch", { name: "24 h" }).click();
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
          profiles: { cards?: { zegar?: unknown } }[];
        };
        return raw.profiles[0].cards?.zegar;
      }, PROFILES_KEY),
    )
    .toEqual({ level: "poziom4", mode: "polacz", h24: true });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: 4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tryb: Połącz" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "24 h" })).toBeChecked();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="zegar"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("poz. 4");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page.getByRole("link", { name: /Zegar/ }).first().click();
  await expect(page).toHaveURL(/\/clock$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});
