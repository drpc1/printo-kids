// Provenance: odd-one-out-card (S-34, US-25, US-26, FR-035, FR-036)
// Protects the "Który nie pasuje" page: Generuj draws the right number of framed rows and pictures on every level, a new
// level or a new Kolory choice with a card shown draws a new card, the sheet keeps the 10 mm margin of the A4 page, the
// catalog badge shows the profile's level, and on every screen Generuj, Drukuj and the Profil corner do not cover each
// other. It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";

const LEVELS = [
  { name: "łatwy", rows: 5, pictures: 4 },
  { name: "średni", rows: 5, pictures: 5 },
  { name: "trudny", rows: 6, pictures: 6 },
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
  await page.goto("/odd-one-out");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Który nie pasuje" });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function chooseLevel(page: Page, level: string): Promise<void> {
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: new RegExp(`^${level}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `Poziom: ${level}` })).toBeVisible();
}

async function drawnRows(sheet: Locator): Promise<string> {
  return sheet.locator("g[data-row]").evaluateAll((rows) => rows.map((row) => row.outerHTML).join("|"));
}

test("Generuj draws the rows and pictures of every level, with no answer on the sheet", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await chooseLevel(page, level.name);
    await expect(sheet.locator("g[data-row]")).toHaveCount(level.rows);
    await expect(sheet.locator("g[data-picture]")).toHaveCount(level.rows * level.pictures);
    const perRow = await sheet
      .locator("g[data-row]")
      .evaluateAll((rows) => rows.map((row) => row.querySelectorAll("g[data-picture]").length));
    for (const count of perRow) {
      expect(count, level.name).toBe(level.pictures);
    }
  }

  // The only text on the sheet is the instruction.
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();
  await expect(page.getByRole("button", { name: "Postać: Brak" })).toBeVisible();
  await expect(sheet.locator("text")).toHaveCount(1);
  expect(await sheet.locator("text").allTextContents()).toEqual(["Który nie pasuje? Zakreśl go."]);
});

test("choosing another level with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const before = await sheet.innerHTML();

  await chooseLevel(page, "trudny");
  await expect(sheet).toBeVisible();

  expect(await sheet.innerHTML()).not.toBe(before);
});

test("Kolory is off by default, and switching it with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const colors = page.getByRole("switch", { name: "Kolory" });
  await expect(colors).not.toBeChecked();
  const plain = await drawnRows(sheet);
  expect(plain).not.toContain("var(--symmetry-");

  await colors.click();
  await expect(colors).toBeChecked();
  await expect(sheet.locator("g[data-row]")).toHaveCount(5);
  const colored = await drawnRows(sheet);
  expect(colored).not.toBe(plain);
  expect(colored).toContain("var(--symmetry-");

  await colors.click();
  await expect(colors).not.toBeChecked();
  await expect(sheet.locator("g[data-row]")).toHaveCount(5);
  expect(await drawnRows(sheet)).not.toContain("var(--symmetry-");
});

test("every row stays inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await chooseLevel(page, level.name);
    const boxes = await sheet.locator("g[data-row]").evaluateAll((elements) =>
      elements.map((element) => {
        const box = (element as unknown as SVGGraphicsElement).getBBox();
        return { x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height };
      }),
    );
    expect(boxes, level.name).toHaveLength(level.rows);
    for (const box of boxes) {
      expect(box.x, level.name).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.y, level.name).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.right, level.name).toBeLessThanOrEqual(200 + 0.5);
      expect(box.bottom, level.name).toBeLessThanOrEqual(287 + 0.5);
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
          cards: { niepasuje: { level: "trudny", colors: false } },
        };
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: [profile] }));
        localStorage.setItem(activeKey, profile.id);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY] as const,
  );
  await page.goto("/");

  const badge = page.locator('[data-badge-for="niepasuje"]');
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
    kolory: await viewportBox(page.getByRole("switch", { name: "Kolory" })),
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
