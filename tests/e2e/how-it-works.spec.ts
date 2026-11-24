// Provenance: s32-how-does-it-work (S-32, US-22, FR-031)
// Protects the footer link "Jak to działa" and the page behind it: the catalog and a generator page lead to
// /how-it-works, the page states the rules of levels, profile and character, the words it uses for the favorite
// ("Ustaw jako ulubioną") are still the ones the character list shows with an active profile, and the footer stays out
// of the print. S-53 (how-it-works-m7): the card kinds are collapsible <details> rows with their own level lists, so
// the tests open the rows and the general level rules no longer enumerate the cards. how-it-works-groups: the page has three
// groups (rules, cards, good to know) whose rows are all closed and alphabetical, and the character row describes the own image. The flows are the same on every screen size, so they run on desktop Chromium only.
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

const GROUPS = ["Ustawienia i zasady", "Karty", "Dobrze wiedzieć"];

// A group is the <section> under its h2; its rows are the <details> inside it.
function groupFor(page: Page, name: string): Locator {
  return page.locator("section", { has: page.getByRole("heading", { level: 2, name, exact: true }) });
}

async function expandRow(page: Page, title: string): Promise<Locator> {
  const row = rowFor(page, title);
  await row.locator("summary").click();
  await expect(row).toHaveAttribute("open", "");
  return row;
}

test("a generator page has the footer link and the page states the rules of levels, profile and character", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/sudoku");

  await page.getByRole("link", { name: "Jak to działa", exact: true }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);

  // The rule rows are collapsed like the card rows; open each before reading it.
  const character = await expandRow(page, "Postać i własny obrazek");
  await expect(character).toContainText("przy zdaniu polecenia");
  const levels = await expandRow(page, "Poziomy");
  await expect(levels).toContainText("Poziomy nie oceniają dziecka");
  await expect(levels).toContainText("nie są porównywalne między kartami");
  await expect(levels).toContainText("typowy wiek");
  await expect(levels).toContainText("w jej wierszu poniżej");
  await expect(levels).not.toContainText("krzyżówka matematyczna (Poziom 1–7)");
  await expect(levels).not.toContainText("sudoku i nonogram wieku nie mają");
  const profile = await expandRow(page, "Profil dziecka i ulubiona postać");
  await expect(profile).toContainText("bez przycisku „Zapisz”");
  await expect(profile).toContainText("Ustaw jako ulubioną");
  await expect(profile).toContainText("do końca wizyty");
  // GitHub 375: the seasonal characters and the "Boże Narodzenie" category are described with their date window.
  const seasons = await expandRow(page, "Święta i zima");
  await expect(seasons).toContainText("Od 15 listopada do 6 stycznia");
  await expect(seasons).toContainText("dodatkowo Mikołaja i Renifera");
  await expect(seasons).toContainText("Od 1 grudnia do końca lutego lista ma Bałwanka i Pingwina");
  await expect(page.locator("main")).not.toContainText("filtr");
});

test("the own image is described in the character row", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/how-it-works");

  const row = await expandRow(page, "Postać i własny obrazek");
  await expect(row).toContainText("„Własny obrazek” na liście postaci");
  await expect(row).toContainText("JPEG, PNG, WebP albo HEIC, do 8 MB");
  await expect(row).toContainText("nie jest wysyłany na serwer");
  await expect(row).toContainText("ulubioną postacią profilu");
});

test("the page has three groups, every row closed, rows in Polish alphabetical order", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/how-it-works");

  // The groups keep a fixed order that is deliberately not alphabetical.
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(GROUPS);
  const rows = page.locator("details");
  for (const row of await rows.all()) {
    await expect(row).not.toHaveAttribute("open", "");
  }
  for (const group of GROUPS) {
    const titles = await groupFor(page, group).getByRole("heading", { level: 3 }).allTextContents();
    expect(titles.length).toBeGreaterThan(0);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, "pl")));
  }
  await expect(groupFor(page, "Ustawienia i zasady").locator("details")).toHaveCount(3);
  await expect(groupFor(page, "Dobrze wiedzieć").locator("details")).toHaveCount(2);

  // A rule row opens from the keyboard.
  const summary = rowFor(page, "Poziomy").locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(rowFor(page, "Poziomy")).toHaveAttribute("open", "");
});

test("the page describes every card kind in catalog order", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.goto("/");
  const titles = await page
    .locator("a[data-card-title]")
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("data-card-title") ?? ""));
  expect(titles.length).toBeGreaterThan(0);
  await page.goto("/how-it-works");

  const cards = groupFor(page, "Karty");
  await expect(cards.getByRole("heading", { level: 3 })).toHaveText(titles);
  await expect(cards.locator("details")).toHaveCount(titles.length);
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
