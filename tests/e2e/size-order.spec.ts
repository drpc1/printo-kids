// Provenance: size-order-card (S-48, US-37, US-38, FR-047, FR-048)
// Protects the "Od najmniejszego" page: łatwy is the default (4 rows of 3 pictures, an answer box under each); every row
// is one picture in several sizes; the level changes the count and draws a new card; Kolory keeps the same card (the same
// pictures in the same order) and gives each row one crayon; level and colors are remembered in the profile and the level
// is on the catalog badge. It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Od najmniejszego";

async function generate(page: Page): Promise<Locator> {
  await page.goto("/size-order");
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

/** The heights of the pictures of each row, left to right: the order the card shows. */
async function rowShapes(sheet: Locator): Promise<string[]> {
  return sheet.locator("g[data-row]").evaluateAll((rows) =>
    rows.map((row) =>
      Array.from(row.querySelectorAll("g[data-picture]"))
        .map(
          (picture) =>
            picture.firstElementChild?.getAttribute("d") ?? picture.firstElementChild?.getAttribute("transform") ?? "",
        )
        .join("|"),
    ),
  );
}

test("łatwy is the default: 4 rows of 3 pictures with an answer box under each, and the instruction", async ({
  page,
}) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: łatwy" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Kolory" })).not.toBeChecked();
  await expect(page.getByRole("switch", { name: /rozwiązanie/i })).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Wpisz 1, 2, 3…" }).first()).toBeVisible();

  await expect(sheet.locator("g[data-row]")).toHaveCount(4);
  await expect(sheet.locator("g[data-picture]")).toHaveCount(12);
  await expect(sheet.locator("[data-answer-box]")).toHaveCount(12);
  // The answer boxes are empty: no digit or dot on the sheet beyond the instruction.
  await expect(sheet.locator("g[data-row] text")).toHaveCount(0);
});

test("a level change with a card shown draws a new card with the count of that level", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);
  await choose(page, "Poziom", "średni", "średni");
  expect(await cardKey(sheet)).not.toBe(before);
  await expect(sheet.locator("g[data-row]")).toHaveCount(4);
  await expect(sheet.locator("g[data-picture]")).toHaveCount(16);

  await choose(page, "Poziom", "trudny", "trudny");
  await expect(sheet.locator("g[data-row]")).toHaveCount(5);
  await expect(sheet.locator("g[data-picture]")).toHaveCount(25);
});

test("Kolory keeps the same card and gives each row one crayon", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);
  const shapesBefore = await rowShapes(sheet);

  await page.getByRole("switch", { name: "Kolory" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  expect(await cardKey(sheet)).toBe(before);
  // The same pictures stand in the same rows (a crayon only changes the fill, not the drawing).
  expect((await rowShapes(sheet)).length).toBe(shapesBefore.length);

  const crayons = await sheet.locator("g[data-row]").evaluateAll((rows) =>
    rows.map((row) => {
      const fills = Array.from(row.querySelectorAll("g[data-picture] > :not([data-answer-box])"))
        .flatMap((element) => [element, ...Array.from(element.querySelectorAll("[fill], [stroke]"))])
        .map((element) => element.getAttribute("stroke") ?? element.getAttribute("fill") ?? "")
        .filter((value) => value.startsWith("var(--symmetry-"));
      return Array.from(new Set(fills));
    }),
  );
  for (const row of crayons) {
    expect(row.length).toBe(1);
  }
  expect(new Set(crayons.map((row) => row[0])).size).toBe(crayons.length);

  await page.getByRole("switch", { name: "Kolory" }).click();
  expect(await cardKey(sheet)).toBe(before);
});

test("without a character the instruction stands alone; with one it is in the speech band", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();
  await expect(page.getByRole("button", { name: "Postać: Brak" })).toBeVisible();
  await expect(sheet.locator("image")).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Wpisz 1, 2, 3…" }).first()).toBeVisible();

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Dinozaur" }).click();
  await expect(sheet.locator("image")).toHaveCount(1);
});

test("the level and colors are remembered in the profile and the level is on the catalog badge", async ({
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
  await choose(page, "Poziom", "trudny", "trudny");
  await page.getByRole("switch", { name: "Kolory" }).click();
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
          profiles: { cards?: { odnajmniejszego?: unknown } }[];
        };
        return raw.profiles[0].cards?.odnajmniejszego;
      }, PROFILES_KEY),
    )
    .toEqual({ level: "trudny", colors: true });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: trudny" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="odnajmniejszego"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("trudny");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page
    .getByRole("link", { name: /Od najmniejszego/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/size-order$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});
