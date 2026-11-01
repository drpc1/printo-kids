// Provenance: coins-who-has-more (S-33, US-23, US-24, FR-033, FR-034)
// Protects the "Kto ma więcej?" page: Generuj draws five rows of two piles with an empty square between them and no
// answer on the sheet, a new level draws a new card, the sheet keeps the 10 mm margin of the A4 page, the catalog
// badge shows the profile's level, and on every screen Generuj, Drukuj and the Profil corner do not cover each other.
// It does not prove the printed page; the trial print in the plan does.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";

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
  await page.goto("/money");
  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Kto ma więcej?" });
  await expect(sheet).toBeVisible();
  return sheet;
}

test("Generuj draws five rows of two piles with an empty square between them", async ({ page }) => {
  const sheet = await generate(page);

  await expect(sheet.locator("g[data-pile]")).toHaveCount(10);
  await expect(sheet.locator("rect[data-sign]")).toHaveCount(5);
  // Every pile is a frame with at least one piece, each piece showing its value as a number.
  const piles = await sheet
    .locator("g[data-pile]")
    .evaluateAll((groups) =>
      groups.map((group) => [...group.querySelectorAll("text")].map((text) => text.textContent)),
    );
  for (const values of piles) {
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(["1", "2", "5", "10", "20"]).toContain(value);
    }
  }
});

test("the sheet shows no answer: the only text besides the pieces is the instruction", async ({ page }) => {
  const sheet = await generate(page);
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("button", { name: "Brak" }).click();

  await expect(sheet.locator("image")).toHaveCount(0);
  await expect(sheet.locator("text", { hasText: "Gdzie jest" })).toHaveCount(1);
  const texts = await sheet.locator("text").allTextContents();
  const words = texts.filter((text) => !/^\d+$/.test(text));
  expect(words).toEqual(["Gdzie jest więcej pieniędzy? Wskaż <, > lub =."]);
  // The squares between the piles are empty frames.
  await expect(sheet.locator("rect[data-sign]")).toHaveCount(5);
});

test("choosing another level with a card shown draws a new card", async ({ page }) => {
  const sheet = await generate(page);
  const before = await sheet.innerHTML();

  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("button", { name: /^trudny(?=\s|$)/ }).click();
  await expect(page.getByRole("button", { name: "Poziom: trudny" })).toBeVisible();
  await expect(sheet).toBeVisible();

  expect(await sheet.innerHTML()).not.toBe(before);
});

test("every pile and square stays inside the 10 mm margin of the A4 page", async ({ page }) => {
  const sheet = await generate(page);

  for (const level of ["łatwy", "średni", "trudny"]) {
    await page.getByRole("button", { name: /^Poziom:/ }).click();
    await page.getByRole("button", { name: new RegExp(`^${level}(?=\\s|$)`) }).click();
    await expect(page.getByRole("button", { name: `Poziom: ${level}` })).toBeVisible();

    const boxes = await sheet.locator("g[data-pile], rect[data-sign]").evaluateAll((elements) =>
      elements.map((element) => {
        const box = (element as unknown as SVGGraphicsElement).getBBox();
        return { x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height };
      }),
    );
    expect(boxes).toHaveLength(15);
    for (const box of boxes) {
      expect(box.x, level).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.y, level).toBeGreaterThanOrEqual(10 - 0.5);
      expect(box.right, level).toBeLessThanOrEqual(200 + 0.5);
      expect(box.bottom, level).toBeLessThanOrEqual(287 + 0.5);
    }
  }
});

test("the catalog badge of a profile shows the remembered level", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.addInitScript(
    ([profilesKey, activeKey]) => {
      if (localStorage.getItem(profilesKey) === null) {
        const profile = { id: "profile-ola", name: "Ola", character: "none", cards: { pieniadze: { level: "latwy" } } };
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: [profile] }));
        localStorage.setItem(activeKey, profile.id);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY] as const,
  );
  await page.goto("/");

  const badge = page.locator('[data-badge-for="pieniadze"]');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("łatwy");
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
