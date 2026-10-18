// Provenance: phone-worksheet (S-09, US-04)
// Protects the screen around the sheet on phones, tablets and desktop: no sideways scroll,
// Generuj, Drukuj and Postać do not cover each other, and the Profil corner does not cover
// the heading or, on touch screens, the sheet. It does not prove one printed page.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
// 40 code points, the longest name the profile form accepts (src/lib/child-profiles.ts).
const LONG_NAME = "Aleksandra Maksymiliana Wierzbicka-Nowak";

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

// The bar and dialogs animate (transition-all, zoom-in); measure the settled layout.
// Looping animations (a spinner) never finish, so they are left out. A cancelled animation
// rejects its finished promise; allSettled keeps that from failing the test.
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

function viewportWidth(page: Page): number {
  const size = page.viewportSize();
  if (size === null) {
    throw new Error("the project has no fixed viewport");
  }
  return size.width;
}

async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
}

async function generate(page: Page): Promise<void> {
  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Labirynt" })).toBeVisible();
  await settle(page);
}

test("the action bar fits the screen and its controls do not cover each other", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await generate(page);
  await expectNoSidewaysScroll(page);

  const width = viewportWidth(page);
  const boxes = {
    generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
    drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
    postac: await viewportBox(page.getByRole("button", { name: /^Postać:/ })),
  };
  expect(overlaps(boxes.generuj, boxes.drukuj)).toBe(false);
  expect(overlaps(boxes.generuj, boxes.postac)).toBe(false);
  expect(overlaps(boxes.drukuj, boxes.postac)).toBe(false);
  for (const box of Object.values(boxes)) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  expect(boxes.generuj.height).toBeGreaterThanOrEqual(44);
  expect(boxes.drukuj.height).toBeGreaterThanOrEqual(44);
});

test.describe("with a profile that has the longest allowed name", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([key, name]) => {
        window.localStorage.setItem(key, JSON.stringify({ profiles: [{ id: "e2e-long", name, character: "kot" }] }));
      },
      [PROFILES_KEY, LONG_NAME] as const,
    );
  });

  test("the Profil corner does not cover the heading", async ({ page }) => {
    await page.goto("/");
    const corner = page.getByRole("button", { name: LONG_NAME });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(corner).toBeVisible();

    expect(overlaps(await viewportBox(corner), await viewportBox(heading))).toBe(false);

    await generate(page);
    expect(overlaps(await viewportBox(corner), await viewportBox(heading))).toBe(false);
  });

  test("on a touch screen the Profil corner scrolls away instead of covering the sheet", async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.hasTouch !== true, "a mouse screen keeps the corner fixed on purpose");

    // A short window makes the sheet taller than the screen, so a fixed corner would land on it.
    await page.setViewportSize({ width: viewportWidth(page), height: 400 });
    await page.goto("/");
    await generate(page);

    const sheet = page.getByRole("img", { name: "Labirynt" });
    await sheet.evaluate((element) => {
      element.scrollIntoView({ block: "end" });
    });
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    // boundingBox is relative to the viewport; in page coordinates the two never meet.
    const corner = await viewportBox(page.getByRole("button", { name: LONG_NAME }));
    expect(overlaps(corner, await viewportBox(sheet))).toBe(false);
  });
});

test("a long profile list shows a scrollbar the eye can find", async ({ page }, testInfo) => {
  // Touch screens hide the native scrollbar until scrolling, so ui/dialog.tsx draws its own
  // (useScrollIndicator). A mouse screen keeps the native one, coloured from the theme.
  await page.addInitScript((key) => {
    const names = [
      "Ala",
      "Bartek",
      "Celina",
      "Dawid",
      "Ela",
      "Franek",
      "Gosia",
      "Henio",
      "Iga",
      "Jaś",
      "Kasia",
      "Leon",
    ];
    window.localStorage.setItem(
      key,
      JSON.stringify({ profiles: names.map((name, index) => ({ id: `e2e-${index}`, name, character: "kot" })) }),
    );
  }, PROFILES_KEY);
  await page.setViewportSize({ width: viewportWidth(page), height: 600 });
  await page.goto("/");

  // Two or more profiles and none chosen: the corner opens the list on its own.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await settle(page);
  // The body inside ui/dialog.tsx is the element that scrolls.
  const body = dialog.locator('[data-slot="dialog-body"]');
  const overflows = await body.evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(overflows, "12 profiles must overflow a 600 px tall window for this test to mean anything").toBe(true);
  const track = dialog.locator('[data-slot="dialog-scroll-track"]');

  if (testInfo.project.use.hasTouch !== true) {
    await expect(track).toBeHidden();
    expect(await body.evaluate((element) => getComputedStyle(element).scrollbarColor)).not.toBe("auto");
    return;
  }

  await expect(track).toBeVisible();
  const trackBox = await viewportBox(track);
  const bodyBox = await viewportBox(body);
  // The bar sits beside the rows, not over them.
  expect(trackBox.x).toBeGreaterThanOrEqual(bodyBox.x + bodyBox.width);
  const thumb = track.locator("div");
  const top = await viewportBox(thumb);
  expect(Math.abs(top.y - trackBox.y)).toBeLessThanOrEqual(1);
  expect(top.height).toBeLessThan(trackBox.height);

  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(async () => {
      const end = await viewportBox(thumb);
      return Math.abs(end.y + end.height - (trackBox.y + trackBox.height));
    })
    .toBeLessThanOrEqual(1);
});
