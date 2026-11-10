// Provenance: pattern-lines-card (S-36, US-29, US-30, FR-039, FR-040)
// Protects the "Szlaczki" page: Generuj draws the rows of the level (4 / 5 / 6 / 7) in the mode of the level (dots on
// Poziom 1-2, two dotted repeats on Poziom 3, a drawn line in a ruling on Poziom 4), the "Linie" switch exists only on
// Poziom 3-4, keeps the same card and is remembered in the profile, a new level with a card shown draws a new card,
// every row stays inside the 10 mm margin of the A4 page, the catalog badge shows the profile's level, and on every
// screen Generuj, Drukuj and the Profil corner do not cover each other. It does not prove the printed page; the trial
// print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";

const LEVELS = [
  { option: "Poziom 1", shown: "1", rows: 4 },
  { option: "Poziom 2", shown: "2", rows: 5 },
  { option: "Poziom 3", shown: "3", rows: 6 },
  { option: "Poziom 4", shown: "4", rows: 7 },
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
  await page.goto("/patterns");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Szlaczki" });
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

test("Generuj draws the rows of the level, in the mode of the level", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await choose(page, level);
    const rows = sheet.locator("g[data-row]");
    await expect(rows, level.option).toHaveCount(level.rows);

    for (const row of await rows.all()) {
      const dots = await row.locator("[data-dot]").count();
      const drawn = await row.locator("[data-line]").count();
      if (level.shown === "4") {
        expect(dots, level.option).toBe(0);
        expect(drawn, level.option).toBe(1);
        await expect(row.locator("[data-guide]"), level.option).toHaveCount(4);
      } else {
        expect(dots, level.option).toBeGreaterThan(0);
        expect(drawn, level.option).toBe(0);
        await expect(row.locator("[data-start]"), level.option).toHaveCount(1);
      }
      if (level.shown === "3") {
        // Two dotted repeats, then the child draws alone.
        await expect(row, level.option).toHaveAttribute("data-repeats", "2");
      }
    }
  }
});

test("the Linie switch exists on Poziom 3-4, keeps the same card and is remembered in the profile", async ({
  page,
}) => {
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
  const sheet = await generate(page);
  const lines = page.getByRole("switch", { name: "Linie" });

  await expect(lines, "Poziom 2 is the default").toHaveCount(0);
  await choose(page, LEVELS[0]);
  await expect(lines).toHaveCount(0);

  await choose(page, LEVELS[3]);
  await expect(lines).toBeChecked();
  const before = await cardKey(sheet);
  const row = sheet.locator("g[data-row]").first();
  await expect(row.locator("[data-guide]")).toHaveCount(4);

  await lines.click();
  await expect(lines).not.toBeChecked();
  expect(await cardKey(sheet)).toBe(before);
  // Without the lines only the pale line under the pattern is left.
  await expect(row.locator("[data-guide]")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

  const saved = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { cards?: { szlaczki?: { level: string; lines: boolean } } }[];
    };
    return raw.profiles[0].cards?.szlaczki;
  }, PROFILES_KEY);
  expect(saved).toEqual({ level: "poziom4", lines: false });

  await page.reload();
  await expect(page.getByRole("button", { name: "Poziom: 4" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Linie" })).not.toBeChecked();
});

test("choosing another level with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const before = await cardKey(sheet);

  await choose(page, LEVELS[2]);
  const third = await cardKey(sheet);
  expect(third).not.toBe(before);

  await choose(page, LEVELS[3]);
  expect(await cardKey(sheet)).not.toBe(third);
});

test("every row stays inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of LEVELS) {
    await choose(page, level);
    const boxes = await sheet.locator("g[data-row]").evaluateAll((rows) =>
      rows.map((row) => {
        const svg = (row as unknown as SVGGraphicsElement).ownerSVGElement;
        if (svg === null) {
          throw new Error("row outside the SVG");
        }
        const scale = svg.viewBox.baseVal.width / svg.getBoundingClientRect().width;
        const frame = svg.getBoundingClientRect();
        const rect = row.getBoundingClientRect();
        return {
          left: (rect.left - frame.left) * scale,
          top: (rect.top - frame.top) * scale,
          right: (rect.right - frame.left) * scale,
          bottom: (rect.bottom - frame.top) * scale,
        };
      }),
    );
    for (const box of boxes) {
      expect(box.left, level.option).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.top, level.option).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.right, level.option).toBeLessThanOrEqual(200 + 0.5);
      expect(box.bottom, level.option).toBeLessThanOrEqual(287 + 0.5);
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
          cards: { szlaczki: { level: "poziom4", lines: true } },
        };
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: [profile] }));
        localStorage.setItem(activeKey, profile.id);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY] as const,
  );
  await page.goto("/");

  const badge = page.locator('[data-badge-for="szlaczki"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("poz. 4");
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
