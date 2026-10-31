// Provenance: s32-how-does-it-work (S-32, US-22, FR-031)
// Protects the footer link "Jak to działa" and the page behind it: the catalog and a generator page lead to
// /how-it-works, the page states the rules of levels, profile and character, the words it uses for the favorite
// ("Ustaw jako ulubioną") are still the ones the character list shows with an active profile, and the footer stays out
// of the print. The flows are the same on every screen size, so they run on desktop Chromium only.
import { expect, test, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const ANIA = { id: "profile-ania", name: "Ania", character: "kot", level: "lat6" };

async function seedProfile(page: Page): Promise<void> {
  // Seed once: the init script runs on every navigation and must not overwrite later changes.
  await page.addInitScript(
    ([profilesKey, activeKey, stored, active]) => {
      if (localStorage.getItem(profilesKey) === null) {
        localStorage.setItem(profilesKey, JSON.stringify({ profiles: stored }));
        localStorage.setItem(activeKey, active);
      }
    },
    [PROFILES_KEY, ACTIVE_KEY, [ANIA], ANIA.id] as const,
  );
}

test("the catalog footer leads to the how-it-works page and back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");

  await page.getByRole("link", { name: "Jak to działa", exact: true }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jak to działa" })).toBeVisible();

  await page.getByRole("link", { name: "Wszystkie karty" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("a generator page has the footer link and the page states the rules of levels, profile and character", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/sudoku");

  await page.getByRole("link", { name: "Jak to działa", exact: true }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);

  for (const heading of ["Poziomy", "Profil dziecka", "Ulubiona postać", "Postać na karcie"]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  const body = page.locator("main");
  await expect(body).toContainText("bez przycisku „Zapisz”");
  await expect(body).toContainText("Ustaw jako ulubioną");
  await expect(body).toContainText("do końca wizyty");
  await expect(body).toContainText("przy zdaniu polecenia");
});

test("the page describes every card kind in catalog order", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/how-it-works");

  await expect(page.getByRole("heading", { level: 2, name: "Rodzaje kart" })).toBeVisible();
  const titles = ["Dyktando graficzne", "Labirynt", "Nonogram", "Sekwencje", "Sudoku", "Symetria"];
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(titles);
  for (const title of titles) {
    const heading = page.getByRole("heading", { level: 3, name: title });
    await expect(heading.getByRole("link", { name: title })).toHaveAttribute("href", /^\/[a-z]+$/);
    await expect(heading.locator("xpath=following-sibling::p[1]")).not.toBeEmpty();
  }
});

test("the page words for the favorite are the ones the character list shows", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await seedProfile(page);
  await page.goto("/symmetry");

  await page.getByRole("button", { name: /^Postać:/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Smok", exact: true }).click();
  await page.getByRole("button", { name: /^Postać:/ }).click();
  await expect(page.getByRole("dialog").getByText("Tylko na tę kartę")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Ustaw jako ulubioną Ania" })).toBeVisible();

  await page.goto("/how-it-works");
  await expect(page.locator("main")).toContainText("„Ustaw jako ulubioną”");
});

test("the footer link is not printed", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/maze");
  const link = page.getByRole("link", { name: "Jak to działa", exact: true });
  await expect(link).toBeVisible();

  await page.emulateMedia({ media: "print" });
  await expect(link).toBeHidden();
});
