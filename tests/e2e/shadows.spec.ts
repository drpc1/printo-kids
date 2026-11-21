// Provenance: shadows-card (S-47, US-41, US-42, FR-051, FR-052)
// Protects the "Cienie" page: łatwy is the default; at every level (łatwy 4, średni 5, trudny 6 pairs) the card has a
// colored picture and a black shadow in each row, a dot beside each, the same set of pictures on both sides and no
// shadow in the row of its own picture; every field stays inside the 10 mm margin of the A4 page; a level change with
// a card shown draws a new card; there is no colors, category or solution switch; the level is remembered in the
// profile and shown on the catalog badge. It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Cienie";

// From the level table of the plan (src/lib/shadows/levels.ts).
const LEVELS = [
  { option: "łatwy", pairs: 4 },
  { option: "średni", pairs: 5 },
  { option: "trudny", pairs: 6 },
] as const;

async function generate(page: Page): Promise<Locator> {
  await page.goto("/shadows");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: SHEET });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function choose(page: Page, option: string): Promise<void> {
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `Poziom: ${option}` })).toBeVisible();
}

async function cardKey(sheet: Locator): Promise<string> {
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

/** Per row: the picture id on the left, the shadow id on the right, and both fields' boxes in page units (mm). */
async function rows(sheet: Locator) {
  return sheet.locator("[data-row]").evaluateAll((groups) =>
    groups.map((group) => {
      const fields = [...group.querySelectorAll("g[data-picture]")].map((field) => {
        const match = /translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/.exec(field.getAttribute("transform") ?? "");
        const size = Number(match?.[3]) * 100;
        return {
          id: field.getAttribute("data-picture") ?? "",
          shadow: field.hasAttribute("data-shadow"),
          x: Number(match?.[1]),
          y: Number(match?.[2]),
          size,
        };
      });
      return { picture: fields[0], shadow: fields[1], dots: group.querySelectorAll("[data-dot]").length };
    }),
  );
}

test("łatwy is the default: four pairs, a dot beside each, and no switch on the bar", async ({ page }) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: łatwy" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Kolory" })).toHaveCount(0);
  await expect(page.getByRole("switch", { name: /rozwiązanie/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Kategoria:/ })).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Połącz każdy obrazek z jego cieniem." }).first()).toBeVisible();
  await expect(sheet.locator("[data-row]")).toHaveCount(4);
  await expect(sheet.locator("[data-dot]")).toHaveCount(8);
});

test("every level has its pairs: the same pictures as shadows, none in its own row, inside the margin", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  const sheet = await generate(page);
  for (const level of LEVELS) {
    await choose(page, level.option);
    await expect(sheet.locator("[data-row]")).toHaveCount(level.pairs);
    const found = await rows(sheet);
    const pictures = found.map((row) => row.picture.id);
    const shadows = found.map((row) => row.shadow.id);
    expect(new Set(pictures).size).toBe(level.pairs);
    expect([...shadows].sort()).toEqual([...pictures].sort());
    for (const row of found) {
      expect(row.picture.shadow).toBe(false);
      expect(row.shadow.shadow).toBe(true);
      expect(row.shadow.id).not.toBe(row.picture.id);
      expect(row.dots).toBe(2);
      for (const field of [row.picture, row.shadow]) {
        expect(field.x).toBeGreaterThanOrEqual(10 - 1e-6);
        expect(field.y).toBeGreaterThanOrEqual(10 - 1e-6);
        expect(field.x + field.size).toBeLessThanOrEqual(200 + 1e-6);
        expect(field.y + field.size).toBeLessThanOrEqual(287 + 1e-6);
      }
    }
  }
});

test("a level change with a card shown draws a new card of that level", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);
  await choose(page, "trudny");
  expect(await cardKey(sheet)).not.toBe(before);
  await expect(sheet.locator("[data-row]")).toHaveCount(6);
});

test("without a character the instruction stands alone; with one it is in the speech band", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();
  await expect(page.getByRole("button", { name: "Postać: Brak" })).toBeVisible();
  await expect(sheet.locator("image")).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Połącz każdy obrazek" }).first()).toBeVisible();

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(sheet.locator("image")).toHaveCount(1);
  await expect(sheet.locator("[data-row]")).toHaveCount(4);
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
  await choose(page, "średni");
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
          profiles: { cards?: { cienie?: unknown } }[];
        };
        return raw.profiles[0].cards?.cienie;
      }, PROFILES_KEY),
    )
    .toEqual({ level: "sredni" });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: średni" })).toBeVisible();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="cienie"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("średni");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page
    .getByRole("link", { name: /^Cienie/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/shadows$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});
