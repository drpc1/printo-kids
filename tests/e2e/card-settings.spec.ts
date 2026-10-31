// Provenance: card-settings-memory (S-28, US-08, FR-017, FR-006)
// Protects the memory of the bar settings on every card page: a change survives a reload with a profile and
// without one, a profile that never used a card starts from the defaults (not from the device), an old profile
// without card settings still loads, a profile switch with a card on screen follows the new profile's bar, and the
// "Zapamiętane dla" line never covers Generuj or Drukuj. The logic runs on desktop Chromium only; the overlap check
// also runs on the phone project.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";
const LAST_USED_KEY = "printo-kids:last-used";
const OLA = { id: "profile-ola", name: "Ola", character: "none", level: "lat5" };

interface Change {
  bar: string;
  option: string;
  shown: string;
}

interface CardCase {
  id: string;
  path: string;
  changes: Change[];
  colors?: boolean;
}

const CARDS: CardCase[] = [
  {
    id: "symetria",
    path: "/symmetry",
    changes: [
      { bar: "Poziom", option: "Poziom 4", shown: "4" },
      { bar: "Kategoria", option: "Zwierzęta", shown: "Zwierzęta" },
    ],
    colors: true,
  },
  {
    id: "sekwencje",
    path: "/sequences",
    changes: [{ bar: "Poziom", option: "Poziom 4", shown: "4" }],
    colors: true,
  },
  {
    id: "sudoku",
    path: "/sudoku",
    changes: [
      { bar: "Rozmiar", option: "6×6", shown: "6×6" },
      { bar: "Poziom", option: "trudny", shown: "trudny" },
    ],
    colors: true,
  },
  {
    id: "nonogram",
    path: "/nonogram",
    changes: [
      { bar: "Poziom", option: "łatwy", shown: "łatwy" },
      { bar: "Kategoria", option: "Jedzenie", shown: "Jedzenie" },
    ],
  },
  {
    id: "dyktando",
    path: "/dictation",
    changes: [
      { bar: "Poziom", option: "trudny", shown: "trudny" },
      { bar: "Kategoria", option: "Jedzenie", shown: "Jedzenie" },
    ],
  },
];

function barButton(page: Page, bar: string): Locator {
  return page.getByRole("button", { name: new RegExp(`^${bar}:`) });
}

async function choose(page: Page, change: Change): Promise<void> {
  await barButton(page, change.bar).click();
  // Rows may carry a description, so match from the start of the name.
  await page.getByRole("button", { name: new RegExp(`^${change.option}(?=\\s|$)`) }).click();
  await expect(page.getByRole("button", { name: `${change.bar}: ${change.shown}` })).toBeVisible();
}

async function applyChanges(page: Page, card: CardCase): Promise<void> {
  if (card.colors === true) {
    await page.getByRole("switch", { name: "Kolory" }).click();
  }
  for (const change of card.changes) {
    await choose(page, change);
  }
}

async function expectChanges(page: Page, card: CardCase): Promise<void> {
  for (const change of card.changes) {
    await expect(page.getByRole("button", { name: `${change.bar}: ${change.shown}` })).toBeVisible();
  }
  if (card.colors === true) {
    await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  }
}

/** Seeds localStorage on the site's origin, then opens the page. */
async function seedAndOpen(page: Page, path: string, seed: Record<string, string>): Promise<void> {
  await page.goto("/");
  await page.evaluate((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, value);
    }
  }, seed);
  await page.goto(path);
}

function profileSeed(profile: Record<string, unknown>): Record<string, string> {
  return { [PROFILES_KEY]: JSON.stringify({ profiles: [profile] }), [ACTIVE_KEY]: String(profile.id) };
}

async function stored(page: Page, key: string): Promise<unknown> {
  return page.evaluate((storageKey) => {
    const raw = localStorage.getItem(storageKey);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  }, key);
}

for (const card of CARDS) {
  test.describe(card.id, () => {
    test.skip(({ isMobile }) => isMobile, "layout-independent flow");

    test("without a profile the bar comes back after a reload", async ({ page }) => {
      await page.goto(card.path);
      await applyChanges(page, card);
      await page.reload();
      await expectChanges(page, card);

      const lastUsed = (await stored(page, LAST_USED_KEY)) as { cards?: Record<string, unknown> };
      expect(lastUsed.cards?.[card.id]).toBeDefined();
    });

    test("with a profile the change is saved in the profile, the note shows and the bar comes back", async ({
      page,
    }) => {
      await seedAndOpen(page, card.path, profileSeed(OLA));
      await expect(page.getByRole("button", { name: "Ola", exact: true })).toBeVisible();
      await applyChanges(page, card);
      await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

      await page.reload();
      await expectChanges(page, card);
      const profiles = (await stored(page, PROFILES_KEY)) as { profiles: { cards?: Record<string, unknown> }[] };
      expect(profiles.profiles[0].cards?.[card.id]).toBeDefined();
    });

    test("a profile that never used the card starts from the defaults, not from the device", async ({ page }) => {
      await page.goto(card.path);
      await expect(page.getByRole("button", { name: "Generuj" })).toBeVisible();
      const defaults = new Map<string, string | null>();
      for (const change of card.changes) {
        const button = barButton(page, change.bar);
        defaults.set(change.bar, (await button.count()) === 0 ? null : await button.getAttribute("aria-label"));
      }

      await applyChanges(page, card);
      await seedAndOpen(page, card.path, profileSeed(OLA));
      for (const change of card.changes) {
        const button = barButton(page, change.bar);
        const expected = defaults.get(change.bar) ?? null;
        if (expected === null) {
          await expect(button).toHaveCount(0);
        } else {
          await expect(button).toHaveAttribute("aria-label", expected);
        }
      }
      if (card.colors === true) {
        await expect(page.getByRole("switch", { name: "Kolory" })).not.toBeChecked();
      }
    });
  });
}

test.describe("profiles", () => {
  test.skip(({ isMobile }) => isMobile, "layout-independent flow");

  test("an old profile with only a level still loads: the level is the maze level", async ({ page }) => {
    await seedAndOpen(page, "/maze", profileSeed({ ...OLA, level: "lat6" }));
    await expect(page.getByRole("button", { name: "Poziom: 4" })).toBeVisible();
  });

  test("the maze level picked with a profile is saved in the profile", async ({ page }) => {
    await seedAndOpen(page, "/maze", profileSeed({ ...OLA, level: "lat6" }));
    await choose(page, { bar: "Poziom", option: "Poziom 2", shown: "2" });
    await expect(page.getByRole("status")).toHaveText("Zapamiętane dla Ola");

    await page.reload();
    await expect(page.getByRole("button", { name: "Poziom: 2" })).toBeVisible();
    const profiles = (await stored(page, PROFILES_KEY)) as {
      profiles: { level?: string; cards?: { labirynt?: { level: string } } }[];
    };
    expect(profiles.profiles[0].cards?.labirynt?.level).toBe("lat4");
    expect(profiles.profiles[0]).not.toHaveProperty("level");
  });

  test("a new profile starts with the bar of the page it is created on", async ({ page }) => {
    await page.goto("/nonogram");
    await choose(page, { bar: "Poziom", option: "trudny", shown: "trudny" });
    await page.getByRole("button", { name: "Profil", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Imię").fill("Zosia");
    await dialog.getByRole("button", { name: "Utwórz" }).click();

    await expect(page.getByRole("button", { name: "Poziom: trudny" })).toBeVisible();
    const profiles = (await stored(page, PROFILES_KEY)) as {
      profiles: { cards?: { nonogram?: { level: string } } }[];
    };
    expect(profiles.profiles[0].cards?.nonogram?.level).toBe("trudny");
  });

  test("switching the profile with a card on screen follows the new profile's bar", async ({ page }) => {
    const ania = {
      id: "profile-ania",
      name: "Ania",
      character: "none",
      level: "lat5",
      cards: { nonogram: { level: "trudny" } },
    };
    const zosia = { id: "profile-zosia", name: "Zosia", character: "none", level: "lat5" };
    await seedAndOpen(page, "/nonogram", {
      [PROFILES_KEY]: JSON.stringify({ profiles: [ania, zosia] }),
      [ACTIVE_KEY]: ania.id,
    });
    await expect(page.getByRole("button", { name: "Poziom: trudny" })).toBeVisible();
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("img", { name: "Nonogram" })).toBeVisible();

    await page.getByRole("button", { name: "Ania", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Zosia", exact: true }).click();
    await expect(page.getByRole("button", { name: "Poziom: średni" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Nonogram" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Poziom: średni" })).toBeEnabled();
  });
});

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) {
    throw new Error("element has no box");
  }
  return box;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test("the note under the bar does not cover Generuj or Drukuj", async ({ page }) => {
  await seedAndOpen(page, "/nonogram", profileSeed(OLA));
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Nonogram" })).toBeVisible();

  await choose(page, { bar: "Poziom", option: "trudny", shown: "trudny" });
  const note = page.getByRole("status");
  await expect(note).toHaveText("Zapamiętane dla Ola");

  const noteBox = await boxOf(note);
  expect(overlaps(noteBox, await boxOf(page.getByRole("button", { name: "Generuj" })))).toBe(false);
  expect(overlaps(noteBox, await boxOf(page.getByRole("button", { name: "Drukuj" })))).toBe(false);
});
