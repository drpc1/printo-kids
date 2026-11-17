// Provenance: math-crossword-card (S-40, US-31, US-32, FR-041, FR-042)
// Protects the "Krzyżówka matematyczna" page: Generuj draws a crossword at every level (Poziom 1-7, Poziom 2 by default),
// every cell stays inside the 10 mm margin of the A4 page, "Pokaż rozwiązanie" shows the empty numbers in grey on screen,
// hides them in print and is off again after Generuj and after a level change, the level is remembered in the profile and
// shown on the catalog badge, and Generuj, Drukuj and the Profil corner do not cover each other. It does not prove the
// printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const SHEET = "Krzyżówka matematyczna";

const LEVELS = [
  { option: "Poziom 1", shown: "1" },
  { option: "Poziom 2", shown: "2" },
  { option: "Poziom 3", shown: "3" },
  { option: "Poziom 4", shown: "4" },
  { option: "Poziom 5", shown: "5" },
  { option: "Poziom 6", shown: "6" },
  { option: "Poziom 7", shown: "7" },
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
  await page.goto("/math-crossword");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: SHEET });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function choose(page: Page, level: (typeof LEVELS)[number]): Promise<void> {
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: new RegExp(`^${level.option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `Poziom: ${level.shown}` })).toBeVisible();
}

async function cardKey(sheet: Locator): Promise<string> {
  await expect(sheet).toBeVisible();
  return (await sheet.getAttribute("data-card-key")) ?? "";
}

test("Poziom 2 is the default and Generuj draws a crossword of framed cells with signs", async ({ page }) => {
  const sheet = await generate(page);
  await expect(page.getByRole("button", { name: "Poziom: 2" })).toBeVisible();
  await expect(sheet.locator("text", { hasText: "Uzupełnij krzyżówkę." }).first()).toBeVisible();

  expect(await sheet.locator("g[data-frames] > rect").count()).toBeGreaterThan(10);
  await expect(sheet.locator("text", { hasText: "=" }).first()).toBeVisible();
});

test("every level draws a crossword inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await choose(page, level);
    const frames = await sheet.locator("g[data-frames] > rect").evaluateAll((rects) =>
      rects.map((rect) => ({
        x: Number(rect.getAttribute("x")),
        y: Number(rect.getAttribute("y")),
        width: Number(rect.getAttribute("width")),
        height: Number(rect.getAttribute("height")),
      })),
    );
    expect(frames.length, level.option).toBeGreaterThan(10);
    for (const frame of frames) {
      expect(frame.x, level.option).toBeGreaterThanOrEqual(10 - 0.01);
      expect(frame.y, level.option).toBeGreaterThanOrEqual(10 - 0.01);
      expect(frame.x + frame.width, level.option).toBeLessThanOrEqual(200 + 0.01);
      expect(frame.y + frame.height, level.option).toBeLessThanOrEqual(287 + 0.01);
    }
  }
});

test("choosing another level with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);

  await choose(page, LEVELS[2]);
  const third = await cardKey(sheet);
  expect(third).not.toBe(before);

  await choose(page, LEVELS[6]);
  expect(await cardKey(sheet)).not.toBe(third);
});

test("Pokaż rozwiązanie is absent without a card, shows the empty numbers on screen only and starts off on every new card", async ({
  page,
}) => {
  await page.goto("/math-crossword");
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Pokaż rozwiązanie" })).toHaveCount(0);

  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: SHEET });
  await expect(sheet).toBeVisible();
  const toggle = page.getByRole("switch", { name: "Pokaż rozwiązanie" });
  await expect(toggle).not.toBeChecked();
  const solution = sheet.locator("[data-solution]");
  await expect(solution).toHaveCount(0);
  const printedTexts = await sheet.locator("text").count();

  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect(solution).toHaveCount(1);
  expect(await solution.locator("text").count()).toBeGreaterThan(0);
  // The answers are extra texts: every printed one stays.
  expect(await sheet.locator("text").count()).toBeGreaterThan(printedTexts);

  // In print the answers are gone.
  await page.emulateMedia({ media: "print" });
  await expect(solution).toHaveCSS("display", "none");
  await page.emulateMedia({ media: "screen" });
  await expect(solution).not.toHaveCSS("display", "none");

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(toggle).not.toBeChecked();
  await expect(solution).toHaveCount(0);

  await toggle.click();
  await choose(page, LEVELS[3]);
  await expect(toggle).not.toBeChecked();
  await expect(solution).toHaveCount(0);
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
  await choose(page, LEVELS[4]);
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  const saved = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { cards?: { krzyzowka?: { level: string } } }[];
    };
    return raw.profiles[0].cards?.krzyzowka;
  }, PROFILES_KEY);
  expect(saved).toEqual({ level: "poziom5" });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: 5" })).toBeVisible();

  await page.goto("/");
  const badge = page.locator('[data-badge-for="krzyzowka"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("poz. 5");
});

test("the catalog offers the card and opens its page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await page
    .getByRole("link", { name: /Krzyżówka matematyczna/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/math-crossword$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
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
