// Provenance: profile-window-summary (S-29, US-08, FR-007, FR-017, US-22)
// Protects the profile window: a new profile asks only for the name and the character and starts at the default maze
// level, the edit window has no level control but one sentence about the rule and a read-only summary of the six
// cards (each row leads to its card page, an old profile shows its level as the maze level, a card the profile never
// used says "domyślne"), a pick in the favorite list is saved at once (no "Zapisz" and no "Anuluj"; favorite-character-
// explicit, S-31), the list opened from edit shows a visible heading "Ulubiona postać" in the window title, level
// with the close control and above the character rows, and has no "Wybierz postać", the add and edit forms show that
// caption under the name (beside the chosen character on a wide screen, above it on a phone), the list opened from
// "Dodaj profil" uses that same window title, and on a phone the window keeps its character row
// and summary reachable.
// The flows are the same on every screen size, so they run on desktop Chromium; the reach check runs on every project.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
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

async function seed(page: Page, profiles: unknown[], activeId: string): Promise<void> {
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript(
    ([profilesKey, activeKey, stored, active]) => {
      if (localStorage.getItem(profilesKey) === null) {
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: stored }));
        localStorage.setItem(activeKey, active);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY, profiles, activeId] as const,
  );
}

async function openEdit(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: `Edytuj ${name}` }).click();
  return dialog;
}

test("a new profile asks for the name and the character only and starts at the default maze level", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/maze");

  // The bar is moved off the default first, so the reset to the default level is visible.
  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Poziom 5\b/ })
    .click();
  await expect(page.getByRole("button", { name: "Poziom: 5" })).toBeVisible();

  await page.getByRole("button", { name: "Profil", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: /^Poziom:/ })).toHaveCount(0);
  await dialog.getByLabel("Imię").fill("Zosia");
  await dialog.getByRole("button", { name: "Utwórz" }).click();

  await expect(page.getByRole("button", { name: "Poziom: 3" })).toBeVisible();
  const levels = await page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null") as { profiles: { level: string }[] } | null;
    return stored?.profiles.map((profile) => profile.level) ?? null;
  }, PROFILES_KEY);
  expect(levels).toEqual(["lat5"]);
});

test("the edit window shows the rule and a read-only summary of every card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  await expect(dialog.getByRole("button", { name: /^Poziom:/ })).toHaveCount(0);
  await expect(dialog).toContainText(
    "Ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.",
  );
  await expect(dialog.getByRole("link", { name: /^Labirynt\s+Poziom 4/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /^Symetria\s+Poziom 3 · kolory · Wszystkie/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /^Sudoku\s+6×6 · średni · kształty/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /^Sekwencje\s+domyślne/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /^Nonogram\s+średni · Zwierzęta/ })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /^Dyktando graficzne\s+domyślne/ })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Zapisz" })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Anuluj" })).toHaveCount(0);
});

test("a summary row opens the card page and the profile stays chosen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("link", { name: /^Nonogram/ }).click();

  await expect(page).toHaveURL(/\/nonogram$/);
  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kategoria: Zwierzęta" })).toBeVisible();
});

test("a pick in the favorite list is saved at once and keeps the card settings", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  await dialog.getByRole("button", { name: "Pies" }).click();
  await expect(dialog.getByRole("button", { name: "Postać: Pies" })).toBeVisible();

  const stored = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { character: string; level: string; cards?: unknown }[];
    } | null;
    return raw?.profiles[0];
  }, PROFILES_KEY);
  expect(stored).toMatchObject({ character: "pies", level: "lat6", cards: ANIA.cards });
});

test("the list opened from edit shows a visible Ulubiona postać heading", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  // A screen-reader-only title stays a heading and is one pixel tall. The painted title is a line of text.
  const heading = dialog.getByRole("heading", { name: "Ulubiona postać", exact: true });
  const close = dialog.getByRole("button", { name: "Zamknij" });
  await expect(heading).toBeVisible();
  const headingBox = await heading.boundingBox();
  const closeBox = await close.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(headingBox?.height ?? 0).toBeGreaterThan(1);
  const headingMid = (headingBox?.y ?? 0) + (headingBox?.height ?? 0) / 2;
  const closeMid = (closeBox?.y ?? 0) + (closeBox?.height ?? 0) / 2;
  expect(Math.abs(headingMid - closeMid)).toBeLessThan(8);
  const kotBox = await dialog.getByRole("button", { name: "Kot", exact: true }).boundingBox();
  expect(kotBox?.y ?? 0).toBeGreaterThan((headingBox?.y ?? 0) + (headingBox?.height ?? 0));
  await expect(dialog.getByRole("heading", { name: "Wybierz postać", exact: true })).toHaveCount(0);
});

test("the list opened from Dodaj profil shows the same Ulubiona postać title", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  await page.getByRole("button", { name: "Ania", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Dodaj profil" }).click();
  await expect(dialog.getByText("Ulubiona postać:", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  const heading = dialog.getByRole("heading", { name: "Ulubiona postać", exact: true });
  const close = dialog.getByRole("button", { name: "Zamknij" });
  await expect(heading).toBeVisible();
  const headingBox = await heading.boundingBox();
  const closeBox = await close.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  const headingMid = (headingBox?.y ?? 0) + (headingBox?.height ?? 0) / 2;
  const closeMid = (closeBox?.y ?? 0) + (closeBox?.height ?? 0) / 2;
  expect(Math.abs(headingMid - closeMid)).toBeLessThan(8);
  const rowBox = await dialog.getByRole("button", { name: "Brak", exact: true }).boundingBox();
  expect(rowBox?.y ?? 0).toBeGreaterThan((headingBox?.y ?? 0) + (headingBox?.height ?? 0));
  await expect(dialog.getByRole("heading", { name: "Wybierz postać", exact: true })).toHaveCount(0);
});

test("the favorite caption sits under the name, beside the character on a wide screen and above it on a phone", async ({
  page,
}, testInfo) => {
  test.skip(!["chromium", "phone-360"].includes(testInfo.project.name), "wide and phone layouts");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  const nameBox = await dialog.getByRole("heading", { name: "Ania", exact: true }).boundingBox();
  const caption = dialog.getByText("Ulubiona postać:", { exact: true });
  const character = dialog.getByRole("button", { name: "Postać: Kot" });
  await expect(caption).toBeVisible();
  const captionBox = await caption.boundingBox();
  const characterBox = await character.boundingBox();
  expect(nameBox).not.toBeNull();
  expect(captionBox).not.toBeNull();
  expect(characterBox).not.toBeNull();
  expect(captionBox?.y ?? 0).toBeGreaterThan((nameBox?.y ?? 0) + (nameBox?.height ?? 0) - 1);
  if (testInfo.project.name === "chromium") {
    expect(characterBox?.x ?? 0).toBeGreaterThan((captionBox?.x ?? 0) + (captionBox?.width ?? 0) - 1);
    const captionMid = (captionBox?.y ?? 0) + (captionBox?.height ?? 0) / 2;
    const characterMid = (characterBox?.y ?? 0) + (characterBox?.height ?? 0) / 2;
    expect(Math.abs(captionMid - characterMid)).toBeLessThan(16);
  } else {
    expect(characterBox?.y ?? 0).toBeGreaterThan((captionBox?.y ?? 0) + (captionBox?.height ?? 0) - 1);
  }
});

test("a favorite pick keeps card settings written on another open page meanwhile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  // The island must have read the profiles before the other tab writes, or it would simply read the new value.
  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();
  // Another tab changes Ania's nonogram level after this page loaded.
  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as { profiles: { cards: { nonogram: object } }[] };
    raw.profiles[0].cards.nonogram = { level: "trudny", category: "zwierzeta" };
    localStorage.setItem(key, JSON.stringify(raw));
  }, PROFILES_KEY);

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  await dialog.getByRole("button", { name: "Pies" }).click();
  await expect(dialog.getByRole("button", { name: "Postać: Pies" })).toBeVisible();

  const stored = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { character: string; cards?: { nonogram?: { level: string } } }[];
    } | null;
    return raw?.profiles[0];
  }, PROFILES_KEY);
  expect(stored?.character).toBe("pies");
  expect(stored?.cards?.nonogram?.level).toBe("trudny");
});

test("an own image picked in the favorite list is the favorite after a reload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Własne zdjęcie", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "a.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(dialog.getByRole("button", { name: "Postać: Własne zdjęcie" })).toBeVisible();

  const stored = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { character: string; image?: string }[];
    } | null;
    return raw?.profiles[0];
  }, PROFILES_KEY);
  expect(stored?.character).toBe("wlasne");
  expect(stored?.image?.startsWith("data:image/")).toBe(true);

  await page.reload();
  await expect(page.getByRole("button", { name: "Postać: Własne zdjęcie" })).toBeVisible();
});

test("the edit window keeps the character row reachable and the summary inside it", async ({ page }) => {
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  const dialog = await openEdit(page, "Ania");
  const height = page.viewportSize()?.height ?? 0;
  const row = dialog.getByRole("button", { name: /^Postać:/ });
  await row.scrollIntoViewIfNeeded();
  const box = await row.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(height);
  await expect(dialog.getByRole("button", { name: "Zapisz" })).toHaveCount(0);
  const list = await dialog.getByRole("list").boundingBox();
  const frame = await dialog.boundingBox();
  expect(list).not.toBeNull();
  expect(frame).not.toBeNull();
  expect((list?.x ?? 0) + (list?.width ?? 0)).toBeLessThanOrEqual((frame?.x ?? 0) + (frame?.width ?? 0));
});

test("Dodaj profil has a plus icon and a border, unlike the profile rows", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/maze");

  await page.getByRole("button", { name: "Ania", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const add = dialog.getByRole("button", { name: "Dodaj profil", exact: true });
  await expect(add.locator("svg")).toHaveCount(1);
  await expect(add).toHaveCSS("border-top-width", "1px");
  await expect(dialog.getByRole("button", { name: "Bez profilu", exact: true })).toHaveCSS("border-top-width", "0px");
});
