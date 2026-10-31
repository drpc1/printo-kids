// Provenance: card-catalog-home (phase 3); symmetry-first-printable (phase 4, US-05); sequences-first-printable (phase 3); picture-sudoku-first-printable (US-12); catalog-alpha-order (phase 2)
// Protects the card catalog on /: the Labirynt, Symetria and Sekwencje thumbnails open their generators, Symetria
// and Sekwencje show their card after Generuj and lead back with "Wszystkie karty", and the chosen child profile stays
// chosen across the round trip catalog -> generator -> catalog -> generator on both pages.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";

test("the catalog lists cards in alphabetical order when no profile is saved", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  // A saved profile rewrites each link's accessible name to "title, badge", so this visit stays unseeded.
  await page.goto("/");

  // The card list only: the footer link to "Jak to działa" is not a card.
  const links = page.getByRole("list").getByRole("link");
  const order = ["Dyktando graficzne", "Labirynt", "Nonogram", "Sekwencje", "Sudoku", "Symetria"];
  await expect(links).toHaveCount(order.length);
  for (const [index, name] of order.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(name);
  }
});

test("the Labirynt card on the catalog opens the maze generator", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  const card = page.getByRole("link", { name: "Labirynt" });
  await expect(card).toBeVisible();
  await card.click();

  await expect(page).toHaveURL(/\/maze$/);
  await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
});

test("the chosen profile persists across the catalog round trip", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(
        key,
        JSON.stringify({
          profiles: [
            { id: "profile-ania", name: "Ania", character: "none", level: "lat4" },
            { id: "profile-zosia", name: "Zosia", character: "kot", level: "lat7" },
          ],
        }),
      );
    }
  }, PROFILES_KEY);

  await page.goto("/maze");

  // Two profiles and none chosen: the dialog opens by itself and asks who is playing.
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Zosia", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Zosia", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Labirynt" }).click();
  await expect(page).toHaveURL(/\/maze$/);

  await expect(page.getByRole("button", { name: "Zosia", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the Symetria card on the catalog opens the symmetry generator and leads back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  await page.getByRole("link", { name: "Symetria" }).click();
  await expect(page).toHaveURL(/\/symmetry$/);

  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Symetria" })).toBeVisible();
});

test("the Sekwencje card on the catalog opens the sequence generator and leads back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  await page.getByRole("link", { name: "Sekwencje" }).click();
  await expect(page).toHaveURL(/\/sequences$/);

  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sekwencje" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Sekwencje" })).toBeVisible();
});

test("each Generuj on the sequence page draws a different card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/sequences");

  const generuj = page.getByRole("button", { name: "Generuj" });
  const sheet = page.getByRole("img", { name: "Sekwencje" });
  await generuj.click();
  await expect(sheet).toBeVisible();

  // The page passes the card on screen to the generator, so the next card never repeats it.
  for (let round = 0; round < 3; round += 1) {
    const before = await sheet.innerHTML();
    await generuj.click();
    await expect.poll(() => sheet.innerHTML()).not.toBe(before);
  }
});

test("choosing a level on the sequence page draws a new card with that level's rows and fields", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/sequences");

  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Sekwencje" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("g")).toHaveCount(42);

  // Fields per card: rows times fields per row (PRD table: 5×5, 6×7, 7×8, 7×8), and the empty ones the child fills in
  // (one per row; Poziom 2: three rows with two; Poziom 3: two per row; Poziom 4: three rows with three, four with two).
  const expected = {
    "1": { fields: 25, empty: 5 },
    "2": { fields: 42, empty: 9 },
    "3": { fields: 56, empty: 14 },
    "4": { fields: 56, empty: 17 },
  };
  for (const [label, { fields, empty }] of Object.entries(expected)) {
    const before = await sheet.innerHTML();
    await page.getByRole("button", { name: /^Poziom:/ }).click();
    await page.getByRole("button", { name: new RegExp(`^Poziom ${label}\\b`) }).click();
    await expect(page.getByRole("button", { name: `Poziom: ${label}` })).toBeVisible();
    await expect(sheet.locator("g")).toHaveCount(fields);
    await expect(sheet.locator("rect[stroke-dasharray]")).toHaveCount(empty);
    if (label !== "2") {
      await expect.poll(() => sheet.innerHTML()).not.toBe(before);
    }
  }
});

test("each Generuj on the symmetry page draws a different card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/symmetry");

  const generuj = page.getByRole("button", { name: "Generuj" });
  const sheet = page.getByRole("img", { name: "Symetria" });
  await generuj.click();
  await expect(sheet).toBeVisible();

  // The page passes the card on screen to the generator, so the next card never repeats it.
  for (let round = 0; round < 3; round += 1) {
    const before = await sheet.innerHTML();
    await generuj.click();
    await expect.poll(() => sheet.innerHTML()).not.toBe(before);
  }
});

test("choosing a level on the symmetry page draws a new card of that level", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/symmetry");

  await page.getByRole("button", { name: "Generuj" }).click();
  const sheet = page.getByRole("img", { name: "Symetria" });
  await expect(sheet).toBeVisible();
  const before = await sheet.innerHTML();

  await page.getByRole("button", { name: "Poziom: 2" }).click();
  await page.getByRole("button", { name: /^Poziom 1\b/ }).click();

  await expect(page.getByRole("button", { name: "Poziom: 1" })).toBeVisible();
  await expect.poll(() => sheet.innerHTML()).not.toBe(before);
});

test("the profile chosen on the symmetry page persists across the catalog round trip", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(
        key,
        JSON.stringify({
          profiles: [
            { id: "profile-ania", name: "Ania", character: "none", level: "lat4" },
            { id: "profile-zosia", name: "Zosia", character: "kot", level: "lat7" },
          ],
        }),
      );
    }
  }, PROFILES_KEY);

  await page.goto("/symmetry");

  // Two profiles and none chosen: the dialog opens by itself on the symmetry page too.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Closed without a choice, Generuj waits for the child, as on the maze page.
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Generuj" })).toBeDisabled();

  await page.getByRole("button", { name: "Profil", exact: true }).click();
  await dialog.getByRole("button", { name: "Ania", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Symetria" }).click();
  await expect(page).toHaveURL(/\/symmetry$/);

  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the Sudoku card on the catalog opens the sudoku generator and leads back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.addInitScript((key) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(
        key,
        JSON.stringify({
          profiles: [
            { id: "profile-ania", name: "Ania", character: "none", level: "lat4" },
            { id: "profile-zosia", name: "Zosia", character: "kot", level: "lat7" },
          ],
        }),
      );
    }
  }, PROFILES_KEY);
  await page.goto("/");

  await page.getByRole("link", { name: "Sudoku" }).click();
  await expect(page).toHaveURL(/\/sudoku$/);

  // Two profiles and none chosen: the dialog opens by itself and asks who is playing.
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Zosia", exact: true }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Sudoku" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Sudoku" }).click();
  await expect(page).toHaveURL(/\/sudoku$/);
  await expect(page.getByRole("button", { name: "Zosia", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

const ACTIVE_KEY = "printo-kids:active-profile";

const ANIA = {
  id: "profile-ania",
  name: "Ania",
  character: "kot",
  level: "lat6",
  cards: {
    symetria: { level: "lat6", colors: true, category: "wszystkie" },
    sudoku: { size: 6, level: "sredni", symbols: "shapes", colors: false },
    nonogram: { level: "sredni", category: "zwierzeta" },
  },
};
const ZOSIA = { id: "profile-zosia", name: "Zosia", character: "none", level: "lat3" };

async function seedProfiles(page: Page, profiles: unknown[], active: string | null): Promise<void> {
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript(
    ([profilesKey, activeKey, stored, activeId]) => {
      if (localStorage.getItem(profilesKey) === null) {
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: stored }));
        if (activeId !== null) {
          localStorage.setItem(activeKey, activeId);
        }
      }
    },
    [PROFILES_KEY, ACTIVE_KEY, profiles, active] as const,
  );
}

test("the catalog shows the remembered level on the cards the chosen profile used", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seedProfiles(page, [ANIA, ZOSIA], ANIA.id);
  await page.goto("/");

  await expect(page.getByText("Profil: Ania")).toBeVisible();
  await expect(page.getByRole("link", { name: "Labirynt, poz. 4" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Symetria, poz. 3" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sudoku, 6×6 · średni" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nonogram, średni" })).toBeVisible();
  // Cards the profile never used carry no badge.
  await expect(page.getByRole("link", { name: /^Sekwencje$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Dyktando graficzne$/ })).toBeVisible();
});

test("the catalog stays plain with several profiles and none chosen, and with no profile", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seedProfiles(page, [ANIA, ZOSIA], null);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Labirynt", exact: true })).toBeVisible();
  await expect(page.getByText(/^Profil: /)).toHaveCount(0);
  await expect(page.locator("[data-badge-for]:not([hidden])")).toHaveCount(0);

  await page.evaluate((key) => {
    localStorage.setItem(key, "none");
  }, ACTIVE_KEY);
  await page.reload();
  await expect(page.getByRole("link", { name: "Labirynt", exact: true })).toBeVisible();
  await expect(page.locator("[data-badge-for]:not([hidden])")).toHaveCount(0);
});

test("a level changed on a card page shows on the catalog after going back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seedProfiles(page, [ANIA, ZOSIA], ANIA.id);
  await page.goto("/nonogram");
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^trudny/ })
    .click();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page.getByRole("link", { name: "Nonogram, trudny" })).toBeVisible();
});

test("the catalog is titled PrintoKids; each generator page has the card name as heading and in its tab title", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  await expect(page).toHaveTitle("PrintoKids");

  const pages = [
    ["/maze", "Labirynt"],
    ["/symmetry", "Symetria"],
    ["/sudoku", "Sudoku"],
    ["/sequences", "Sekwencje"],
    ["/nonogram", "Nonogram"],
    ["/dictation", "Dyktando graficzne"],
  ];
  for (const [path, title] of pages) {
    await page.goto(path);
    await expect(page).toHaveTitle(`PrintoKids - ${title}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }
});
