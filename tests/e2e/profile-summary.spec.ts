// Provenance: profile-window-summary (S-29, US-08, FR-007, FR-017, US-22)
// Protects the profile window: a new profile asks only for the name and the character and starts at the default maze
// level, the edit window has no level control but one sentence about the rule and a read-only summary of the six
// cards (each row leads to its card page, an old profile shows its level as the maze level, a card the profile never
// used says "domyślne"), "Zapisz" waits for a character change, and on a phone the window keeps its buttons reachable.
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
  await page.goto("/labirynt");

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
  await page.goto("/labirynt");

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
  await expect(dialog.getByRole("button", { name: "Zapisz" })).toBeDisabled();
});

test("a summary row opens the card page and the profile stays chosen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/labirynt");

  const dialog = await openEdit(page, "Ania");
  await dialog.getByRole("link", { name: /^Nonogram/ }).click();

  await expect(page).toHaveURL(/\/nonogram$/);
  await expect(page.getByRole("button", { name: "Ania", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kategoria: Zwierzęta" })).toBeVisible();
});

test("Zapisz stays disabled until the favorite character changes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/labirynt");

  const dialog = await openEdit(page, "Ania");
  const save = dialog.getByRole("button", { name: "Zapisz" });
  await expect(save).toBeDisabled();
  await dialog.getByRole("button", { name: /^Postać:/ }).click();
  await dialog.getByRole("button", { name: "Pies" }).click();
  await expect(save).toBeEnabled();
  await save.click();

  const stored = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? "null") as {
      profiles: { character: string; level: string }[];
    } | null;
    return raw?.profiles[0];
  }, PROFILES_KEY);
  expect(stored).toMatchObject({ character: "pies", level: "lat6" });
});

test("the edit window keeps Zapisz and Anuluj reachable and the summary inside it", async ({ page }) => {
  await seed(page, [ANIA], ANIA.id);
  await page.goto("/labirynt");

  const dialog = await openEdit(page, "Ania");
  const height = page.viewportSize()?.height ?? 0;
  for (const name of ["Zapisz", "Anuluj"]) {
    const button = dialog.getByRole("button", { name, exact: true });
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    expect(box, name).not.toBeNull();
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(height);
  }
  const list = await dialog.getByRole("list").boundingBox();
  const frame = await dialog.boundingBox();
  expect(list).not.toBeNull();
  expect(frame).not.toBeNull();
  expect((list?.x ?? 0) + (list?.width ?? 0)).toBeLessThanOrEqual((frame?.x ?? 0) + (frame?.width ?? 0));
});
