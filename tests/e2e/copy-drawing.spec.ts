// Provenance: copy-the-drawing-card (S-35, US-27, US-28, FR-037, FR-038)
// Protects the "Skopiuj obrazek" page: Generuj draws two grids of one size on every level, the left one with
// black cells and the right one with none, a new level or category with a card shown draws a new card, both grids keep
// the 10 mm margin of the A4 page, the catalog badge shows the profile's level, and on every screen Generuj, Drukuj and
// the Profil corner do not cover each other. It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";

const LEVELS = [
  { name: "łatwy", columns: 8, rows: 12, cell: 11 },
  { name: "średni", columns: 12, rows: 15, cell: 7.5 },
  { name: "trudny", columns: 18, rows: 24, cell: 5 },
] as const;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function viewportBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) {
    throw new Error("element has no box");
  }
  return box;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
}

async function generate(page: Page): Promise<Locator> {
  await page.goto("/copy-drawing");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Skopiuj obrazek" });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function choose(page: Page, bar: "Poziom" | "Kategoria", option: string): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${bar}:`) }).click();
  await page.getByRole("button", { name: new RegExp(`^${option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${bar}: ${option}` })).toBeVisible();
}

async function cardKey(sheet: Locator): Promise<string> {
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

/** The size of a grid in page units, taken from its own geometry (without stroke). */
async function gridBox(sheet: Locator, name: "source" | "copy"): Promise<Box> {
  return sheet.locator(`g[data-grid="${name}"]`).evaluate((element) => {
    const box = (element as unknown as SVGGraphicsElement).getBBox();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  });
}

test("Generuj draws two grids of one size on every level: black cells on the left, none on the right", async ({
  page,
}) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await choose(page, "Poziom", level.name);
    const source = await gridBox(sheet, "source");
    const copy = await gridBox(sheet, "copy");
    expect(source.width, level.name).toBeCloseTo(level.columns * level.cell, 1);
    expect(source.height, level.name).toBeCloseTo(level.rows * level.cell, 1);
    expect(copy.width, level.name).toBeCloseTo(source.width, 1);
    expect(copy.height, level.name).toBeCloseTo(source.height, 1);
    expect(copy.x, level.name).toBeGreaterThan(source.x + source.width);
    expect(copy.y, level.name).toBeCloseTo(source.y, 1);

    expect(await sheet.locator('g[data-grid="source"] g[data-filled] rect').count(), level.name).toBeGreaterThan(0);
    await expect(sheet.locator('g[data-grid="copy"] g[data-filled]')).toHaveCount(0);
  }
});

test("the Kolory switch is off by default, colors the left grid with crayons and keeps the same card", async ({
  page,
}) => {
  const sheet = await generate(page);
  const colors = page.getByRole("switch", { name: "Kolory" });
  await expect(colors).not.toBeChecked();
  const key = await cardKey(sheet);
  const black = sheet.locator('g[data-grid="source"] g[data-filled] rect[fill]');
  await expect(black).toHaveCount(0);

  await colors.click();
  await expect(colors).toBeChecked();
  expect(await cardKey(sheet)).toBe(key);
  expect(await black.count()).toBeGreaterThan(0);
  const fills = await black.evaluateAll((rects) => rects.map((rect) => rect.getAttribute("fill")));
  expect(fills.every((fill) => (fill ?? "").startsWith("var(--symmetry-"))).toBe(true);
  await expect(sheet.locator('g[data-grid="copy"] g[data-filled]')).toHaveCount(0);

  await colors.click();
  await expect(black).toHaveCount(0);
  expect(await cardKey(sheet)).toBe(key);
});

test("the sheet shows only the instruction as text, with no name of the object", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();
  await expect(page.getByRole("button", { name: "Postać: Brak" })).toBeVisible();
  expect(await sheet.locator("text").allTextContents()).toEqual(["Przerysuj obrazek na pustą kratkę."]);
});

test("choosing another level or category with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);

  await choose(page, "Poziom", "trudny");
  const sized = await cardKey(sheet);
  expect(sized).not.toBe(before);

  await choose(page, "Kategoria", "Zwierzęta");
  expect(await cardKey(sheet)).not.toBe(sized);
});

test("both grids stay inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await choose(page, "Poziom", level.name);
    for (const name of ["source", "copy"] as const) {
      const box = await gridBox(sheet, name);
      expect(box.x, `${level.name} ${name}`).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.y, `${level.name} ${name}`).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.x + box.width, `${level.name} ${name}`).toBeLessThanOrEqual(200 + 0.5);
      expect(box.y + box.height, `${level.name} ${name}`).toBeLessThanOrEqual(287 + 0.5);
    }
  }
});

test("the catalog badge of a profile shows the remembered level", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.addInitScript(
    ([profilesKey, activeKey]) => {
      if (localStorage.getItem(profilesKey) === null) {
        const profile = {
          id: "profile-ola",
          name: "Ola",
          character: "none",
          cards: { kopiuj: { level: "trudny", category: "wszystkie", colors: false } },
        };
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: [profile] }));
        localStorage.setItem(activeKey, profile.id);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY] as const,
  );
  await page.goto("/");

  const badge = page.locator('[data-badge-for="kopiuj"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("trudny");
});

test("Generuj, Drukuj and the Profil corner do not cover each other and stay on screen", async ({ page }) => {
  await generate(page);
  await settle(page);

  const size = page.viewportSize();
  if (size === null) {
    throw new Error("the project has no fixed viewport");
  }
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);

  const boxes = {
    poziom: await viewportBox(page.getByRole("button", { name: /^Poziom:/ })),
    kategoria: await viewportBox(page.getByRole("button", { name: /^Kategoria:/ })),
    generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
    drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
    profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
  };
  const names = Object.keys(boxes) as (keyof typeof boxes)[];
  for (const [index, first] of names.entries()) {
    for (const second of names.slice(index + 1)) {
      expect(overlaps(boxes[first], boxes[second]), `${first} covers ${second}`).toBe(false);
    }
  }
  for (const box of Object.values(boxes)) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(size.width);
  }
  expect(boxes.generuj.height).toBeGreaterThanOrEqual(44);
  expect(boxes.drukuj.height).toBeGreaterThanOrEqual(44);
});
