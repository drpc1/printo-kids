// Provenance: s32-how-does-it-work (S-32, US-22, FR-031)
// Protects the footer link "Jak to działa" and the page behind it: the catalog and a generator page lead to
// /how-it-works, the page states the rules of levels, profile and character, the words it uses for the favorite
// ("Ustaw jako ulubioną") are still the ones the character list shows with an active profile, and the footer stays out
// of the print. S-53 (how-it-works-m7): the card kinds are collapsible <details> rows with their own level lists, so
// the tests open the rows and the general level rules no longer enumerate the cards. The flows are the same on every screen size, so they run on desktop Chromium only.
import { expect, test, type Locator, type Page } from "@playwright/test";

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

// A card's row is the closed-by-default <details> whose summary holds the h3 with its title.
function rowFor(page: Page, title: string): Locator {
  return page.locator("details", { has: page.getByRole("heading", { level: 3, name: title, exact: true }) });
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
  // S-53: the level rules are general; each card's levels live in its own row under "Rodzaje kart".
  await expect(body).toContainText("Poziomy nie oceniają dziecka");
  await expect(body).toContainText("nie są porównywalne między kartami");
  await expect(body).toContainText("typowy wiek");
  await expect(body).toContainText("w jej wierszu poniżej");
  await expect(body).not.toContainText("krzyżówka matematyczna (Poziom 1–7)");
  await expect(body).not.toContainText("sudoku i nonogram wieku nie mają");
  // GitHub 375: the seasonal characters and the "Boże Narodzenie" category are described with their date window.
  await expect(page.getByRole("heading", { level: 2, name: "Święta" })).toBeVisible();
  await expect(body).toContainText("Od 15 listopada do 6 stycznia");
  await expect(body).toContainText("dodatkowo Mikołaja i Renifera");
  await expect(body).toContainText("Od 1 grudnia do końca lutego lista ma Bałwanka i Pingwina");
  await expect(body).not.toContainText("filtr");
});

test("the page describes every card kind in catalog order", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  const titles = await page
    .locator("a[data-card-title]")
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("data-card-title") ?? ""));
  expect(titles.length).toBeGreaterThan(0);
  await page.goto("/how-it-works");

  await expect(page.getByRole("heading", { level: 2, name: "Rodzaje kart" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(titles);
  const rows = page.locator("details");
  await expect(rows).toHaveCount(titles.length);
  for (const title of titles) {
    // Exact: "Labirynt" is also a word of "Labirynt liczbowy".
    const row = rowFor(page, title);
    await expect(row).not.toHaveAttribute("open", "");
    await row.locator("summary").click();
    await expect(row).toHaveAttribute("open", "");
    await expect(row.locator("p").first()).toBeVisible();
    await expect(row.locator("p").first()).not.toBeEmpty();
    // The level list of every card comes from the registry and is never empty.
    await expect(row.locator("li").first()).toBeVisible();
    const link = row.getByRole("link", { name: `Otwórz ${title}`, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^\/[a-z-]+$/);
  }
});

test("only the cards with an old age name show a typical age in their level rows", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/how-it-works");

  const maze = rowFor(page, "Labirynt");
  await maze.locator("summary").click();
  await expect(maze).toContainText("zwykle ok.");

  const shadows = rowFor(page, "Cienie");
  await shadows.locator("summary").click();
  await expect(shadows.locator("li").first()).toBeVisible();
  await expect(shadows).not.toContainText("zwykle ok.");
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
  const feedback = page.getByRole("link", { name: /^Podziel się opinią/ });
  await expect(link).toBeVisible();
  await expect(feedback).toBeVisible();
  // GitHub 292: the anonymous form opens outside the app, in a new tab.
  await expect(feedback).toHaveAttribute("href", /^https:\/\/forms\.gle\//);
  await expect(feedback).toHaveAttribute("target", "_blank");

  await page.emulateMedia({ media: "print" });
  await expect(link).toBeHidden();
  await expect(feedback).toBeHidden();
});
