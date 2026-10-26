// Provenance: phone-worksheet (S-09, US-04); symmetry-first-printable (phase 4, US-06); sequences-first-printable (phase 3); picture-sudoku-first-printable (US-12)
// Protects the screen around the sheet on phones, tablets and desktop: no sideways scroll,
// Generuj, Drukuj and Postać do not cover each other (on /symetria: Generuj, Drukuj and the
// Profil corner, after Generuj), and the Profil corner does not cover
// the heading or, on touch screens, the sheet. On a coarse pointer that corner is at least
// 44 px tall and under 48 px; a precise pointer keeps it under 44 px. It does not prove
// one printed page.
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
  await page.goto("/labirynt");
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

test("the symmetry page fits the screen and Generuj, Drukuj and Profil do not cover each other", async ({ page }) => {
  await page.goto("/symetria");
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();
  await settle(page);
  await expectNoSidewaysScroll(page);

  const width = viewportWidth(page);
  const boxes = {
    generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
    drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
    profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
  };
  expect(overlaps(boxes.generuj, boxes.drukuj)).toBe(false);
  expect(overlaps(boxes.generuj, boxes.profil)).toBe(false);
  expect(overlaps(boxes.drukuj, boxes.profil)).toBe(false);
  for (const box of Object.values(boxes)) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  expect(boxes.generuj.height).toBeGreaterThanOrEqual(44);
  expect(boxes.drukuj.height).toBeGreaterThanOrEqual(44);
});

test("the sequence page fits the screen and Generuj, Drukuj and Profil do not cover each other", async ({ page }) => {
  await page.goto("/sekwencje");
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sekwencje" })).toBeVisible();
  await settle(page);
  await expectNoSidewaysScroll(page);

  const width = viewportWidth(page);
  const boxes = {
    generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
    drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
    profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
  };
  expect(overlaps(boxes.generuj, boxes.drukuj)).toBe(false);
  expect(overlaps(boxes.generuj, boxes.profil)).toBe(false);
  expect(overlaps(boxes.drukuj, boxes.profil)).toBe(false);
  for (const box of Object.values(boxes)) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  expect(boxes.generuj.height).toBeGreaterThanOrEqual(44);
  expect(boxes.drukuj.height).toBeGreaterThanOrEqual(44);
});

test("every sequence level fits the screen and keeps Poziom, Generuj, Drukuj and Profil apart", async ({ page }) => {
  await page.goto("/sekwencje");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sekwencje" })).toBeVisible();

  for (const label of ["1", "2", "3", "4"]) {
    await page.getByRole("button", { name: /^Poziom:/ }).click();
    await page.getByRole("button", { name: new RegExp(`^Poziom ${label}\\b`) }).click();
    await expect(page.getByRole("button", { name: `Poziom: ${label}` })).toBeVisible();
    await expect(page.getByRole("img", { name: "Sekwencje" })).toBeVisible();
    await settle(page);
    await expectNoSidewaysScroll(page);

    const width = viewportWidth(page);
    const boxes = {
      poziom: await viewportBox(page.getByRole("button", { name: /^Poziom:/ })),
      generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
      drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
      profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
    };
    const names = Object.keys(boxes) as (keyof typeof boxes)[];
    for (const [index, first] of names.entries()) {
      for (const second of names.slice(index + 1)) {
        expect(overlaps(boxes[first], boxes[second]), `${label}: ${first} / ${second}`).toBe(false);
      }
      expect(boxes[first].x).toBeGreaterThanOrEqual(0);
      expect(boxes[first].x + boxes[first].width).toBeLessThanOrEqual(width);
    }
  }
});

test("the sudoku page fits the screen and Generuj, Drukuj and Profil do not cover each other", async ({ page }) => {
  await page.goto("/sudoku");
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();
  await settle(page);
  await expectNoSidewaysScroll(page);

  const width = viewportWidth(page);
  const boxes = {
    generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
    drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
    profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
  };
  expect(overlaps(boxes.generuj, boxes.drukuj)).toBe(false);
  expect(overlaps(boxes.generuj, boxes.profil)).toBe(false);
  expect(overlaps(boxes.drukuj, boxes.profil)).toBe(false);
  for (const box of Object.values(boxes)) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  expect(boxes.generuj.height).toBeGreaterThanOrEqual(44);
  expect(boxes.drukuj.height).toBeGreaterThanOrEqual(44);
});

test("every sudoku size with digits fits the screen and keeps Rozmiar, Poziom, Cyfry, Generuj, Drukuj and Profil apart", async ({
  page,
}) => {
  await page.goto("/sudoku");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Poziom:/ })).toHaveCount(0);

  for (const size of ["6×6", "9×9"]) {
    await page.getByRole("button", { name: /^Rozmiar:/ }).click();
    await page.getByRole("button", { name: size, exact: true }).click();
    await expect(page.getByRole("button", { name: `Rozmiar: ${size}` })).toBeVisible();
    await page.getByRole("button", { name: "Cyfry", exact: true }).click();
    await expect(page.getByRole("button", { name: "Cyfry", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();
    await settle(page);
    await expectNoSidewaysScroll(page);

    const width = viewportWidth(page);
    const boxes = {
      rozmiar: await viewportBox(page.getByRole("button", { name: /^Rozmiar:/ })),
      poziom: await viewportBox(page.getByRole("button", { name: /^Poziom:/ })),
      cyfry: await viewportBox(page.getByRole("button", { name: "Cyfry", exact: true })),
      generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
      drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
      profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
    };
    const names = Object.keys(boxes) as (keyof typeof boxes)[];
    for (const [index, first] of names.entries()) {
      for (const second of names.slice(index + 1)) {
        expect(overlaps(boxes[first], boxes[second]), `${size}: ${first} overlaps ${second}`).toBe(false);
      }
      expect(boxes[first].x, `${size}: ${first}`).toBeGreaterThanOrEqual(0);
      expect(boxes[first].x + boxes[first].width, `${size}: ${first}`).toBeLessThanOrEqual(width);
    }
  }

  const sheet = page.getByRole("img", { name: "Sudoku" });
  await expect(sheet.locator("text")).not.toHaveCount(0);
});

test("every sudoku size with shapes and colors on fits the screen and keeps Rozmiar, Poziom, Kolory, Generuj, Drukuj and Profil apart", async ({
  page,
}) => {
  await page.goto("/sudoku");
  await page.getByRole("switch", { name: "Kolory" }).click();
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();

  for (const size of ["6×6", "9×9"]) {
    await page.getByRole("button", { name: /^Rozmiar:/ }).click();
    await page.getByRole("button", { name: size, exact: true }).click();
    await expect(page.getByRole("button", { name: `Rozmiar: ${size}` })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
    await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();
    await settle(page);
    await expectNoSidewaysScroll(page);

    const width = viewportWidth(page);
    const boxes = {
      rozmiar: await viewportBox(page.getByRole("button", { name: /^Rozmiar:/ })),
      poziom: await viewportBox(page.getByRole("button", { name: /^Poziom:/ })),
      kolory: await viewportBox(page.getByRole("switch", { name: "Kolory" })),
      generuj: await viewportBox(page.getByRole("button", { name: "Generuj" })),
      drukuj: await viewportBox(page.getByRole("button", { name: "Drukuj" })),
      profil: await viewportBox(page.getByRole("button", { name: "Profil", exact: true })),
    };
    const names = Object.keys(boxes) as (keyof typeof boxes)[];
    for (const [index, first] of names.entries()) {
      for (const second of names.slice(index + 1)) {
        expect(overlaps(boxes[first], boxes[second]), `${size}: ${first} overlaps ${second}`).toBe(false);
      }
      expect(boxes[first].x, `${size}: ${first}`).toBeGreaterThanOrEqual(0);
      expect(boxes[first].x + boxes[first].width, `${size}: ${first}`).toBeLessThanOrEqual(width);
    }
  }
});

test("every symmetry level fits the screen and keeps Poziom, Kolory, Generuj, Drukuj and Profil apart", async ({
  page,
}) => {
  await page.goto("/symetria");
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  for (const label of ["1", "2", "3", "4"]) {
    await page.getByRole("button", { name: /^Poziom:/ }).click();
    await page.getByRole("button", { name: new RegExp(`^Poziom ${label}\\b`) }).click();
    await expect(page.getByRole("button", { name: `Poziom: ${label}` })).toBeVisible();
    await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();
    await settle(page);
    await expectNoSidewaysScroll(page);

    const width = viewportWidth(page);
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
        expect(overlaps(boxes[first], boxes[second]), `${label}: ${first} / ${second}`).toBe(false);
      }
      expect(boxes[first].x).toBeGreaterThanOrEqual(0);
      expect(boxes[first].x + boxes[first].width).toBeLessThanOrEqual(width);
    }
  }
});

test("the Profil corner grows on a touch screen and stays short on a mouse", async ({ page }, testInfo) => {
  // No profile is chosen, so the corner reads "Profil". pointer-coarse:min-h-11 is 44 px at a
  // 16 px root and does not apply to a precise pointer, which keeps the height of the text.
  await page.goto("/labirynt");
  const corner = page.getByRole("button", { name: "Profil", exact: true });
  await expect(corner).toBeVisible();

  const { height } = await viewportBox(corner);
  if (testInfo.project.use.hasTouch === true) {
    expect(height).toBeGreaterThanOrEqual(44);
    expect(height).toBeLessThan(48);
    return;
  }
  if (testInfo.project.name === "chromium") {
    expect(height).toBeLessThan(44);
  }
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
    await page.goto("/labirynt");
    const corner = page.getByRole("button", { name: LONG_NAME });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(corner).toBeVisible();

    expect(overlaps(await viewportBox(corner), await viewportBox(heading))).toBe(false);

    await generate(page);
    expect(overlaps(await viewportBox(corner), await viewportBox(heading))).toBe(false);
  });

  test("the Wszystkie karty link covers neither the Profil corner, the heading, nor the sheet", async ({ page }) => {
    await page.goto("/labirynt");
    const link = page.getByRole("link", { name: "Wszystkie karty" });
    const corner = page.getByRole("button", { name: LONG_NAME });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(link).toBeVisible();
    await expect(corner).toBeVisible();

    expect(overlaps(await viewportBox(link), await viewportBox(corner))).toBe(false);
    expect(overlaps(await viewportBox(link), await viewportBox(heading))).toBe(false);
    expect((await viewportBox(link)).height).toBeGreaterThanOrEqual(44);

    await generate(page);
    expect(overlaps(await viewportBox(link), await viewportBox(corner))).toBe(false);
    expect(overlaps(await viewportBox(link), await viewportBox(heading))).toBe(false);
    expect(overlaps(await viewportBox(link), await viewportBox(page.getByRole("img", { name: "Labirynt" })))).toBe(
      false,
    );
  });

  test("on a touch screen the Profil corner scrolls away instead of covering the sheet", async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.hasTouch !== true, "a mouse screen keeps the corner fixed on purpose");

    // A short window makes the sheet taller than the screen, so a fixed corner would land on it.
    await page.setViewportSize({ width: viewportWidth(page), height: 400 });
    await page.goto("/labirynt");
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
  // On touch the close target is 44 px, stays clear of the first row, and lines up with that track.
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
  await page.goto("/labirynt");

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

  const close = dialog.getByRole("button", { name: "Zamknij", exact: true });
  const closeBox = await viewportBox(close);
  // The hit area is a 44 px square and its bottom stays at least 4 px above the first row.
  expect(Math.abs(closeBox.width - 44)).toBeLessThanOrEqual(1);
  expect(Math.abs(closeBox.height - 44)).toBeLessThanOrEqual(1);
  const firstRowBox = await viewportBox(body.getByRole("button").first());
  expect(firstRowBox.y - (closeBox.y + closeBox.height)).toBeGreaterThanOrEqual(4);
  // The hit area's right edge meets the drawn track, and the track does not start left of the glyph.
  expect(Math.abs(closeBox.x + closeBox.width - (trackBox.x + trackBox.width))).toBeLessThanOrEqual(1);
  const glyphBox = await viewportBox(close.locator("svg"));
  expect(trackBox.x).toBeGreaterThanOrEqual(glyphBox.x);

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

test("the maze level list fits the screen with all six rows and no scrolling", async ({ page }) => {
  await page.goto("/labirynt");
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: /^Poziom 6\b/ })).toBeVisible();
  await settle(page);

  // The dialog itself clips; its body is the element that scrolls.
  const overflow = await dialog
    .locator('[data-slot="dialog-body"]')
    .evaluate((element) => element.scrollHeight - element.clientHeight);
  expect(overflow).toBeLessThanOrEqual(0);
  const height = page.viewportSize()?.height ?? 0;
  for (const level of [1, 2, 3, 4, 5, 6]) {
    const box = await viewportBox(dialog.getByRole("button", { name: new RegExp(`^Poziom ${level}\\b`) }));
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
  }
});
