// Provenance: level-bar-fixes
// Protects the level control on a generated sheet: changing the level redraws the maze for
// the new level instead of hiding the sheet. It does not prove a solution or one printed page.
import { expect, test, type Page } from "@playwright/test";

// Distinct x positions of the wall ends: one per column boundary, so columns + 1.
async function gridColumns(page: Page): Promise<number> {
  const xs = await page
    .getByRole("img", { name: "Labirynt" })
    .locator("line")
    .evaluateAll((lines) => lines.flatMap((line) => [line.getAttribute("x1"), line.getAttribute("x2")]));
  return new Set(xs.map((x) => Number(x).toFixed(3))).size - 1;
}

async function wallSignature(page: Page): Promise<string> {
  const ends = await page
    .getByRole("img", { name: "Labirynt" })
    .locator("line")
    .evaluateAll((lines) =>
      lines.map((line) => ["x1", "y1", "x2", "y2"].map((name) => line.getAttribute(name)).join(",")),
    );
  return ends.join(" ");
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function box(page: Page, name: string | RegExp): Promise<Box> {
  const found = await page.getByRole("button", { name }).boundingBox();
  if (found === null) {
    throw new Error(`button ${String(name)} has no box`);
  }
  return found;
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

// Short names left room for Generuj in the first row and pushed Drukuj alone to the second;
// the longest names pushed both down. Every case must keep the two together under the selectors.
const BAR_CASES = [
  { name: "default names", character: "none", level: "lat5", levelLabel: "5 lat" },
  { name: "longest names", character: "samochodzik", level: "nastolatek", levelLabel: "nastolatek" },
] as const;

for (const barCase of BAR_CASES) {
  test(`on desktop the bar keeps Generuj and Drukuj in one row under Postać and Poziom (${barCase.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop layout check");
    await page.addInitScript(
      ([character, level]) => {
        window.localStorage.setItem("printo-kids:last-used", JSON.stringify({ character, level }));
      },
      [barCase.character, barCase.level] as const,
    );
    await page.goto("/labirynt");
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("img", { name: "Labirynt" })).toBeVisible();
    await expect(page.getByRole("button", { name: `Poziom: ${barCase.levelLabel}` })).toBeVisible();
    await settle(page);

    const boxes = {
      postac: await box(page, /^Postać:/),
      poziom: await box(page, /^Poziom:/),
      generuj: await box(page, "Generuj"),
      drukuj: await box(page, "Drukuj"),
    };
    const middle = (b: Box) => b.y + b.height / 2;
    expect(Math.abs(middle(boxes.generuj) - middle(boxes.drukuj))).toBeLessThanOrEqual(2);
    expect(boxes.postac.y + boxes.postac.height).toBeLessThanOrEqual(boxes.generuj.y);
    expect(boxes.poziom.y + boxes.poziom.height).toBeLessThanOrEqual(boxes.generuj.y);
    const all = Object.values(boxes);
    for (const [index, a] of all.entries()) {
      for (const b of all.slice(index + 1)) {
        expect(overlaps(a, b)).toBe(false);
      }
    }
  });
}

test("changing the level on a sheet redraws the maze for that level", async ({ page }) => {
  await page.goto("/labirynt");

  // client:only island: Generuj is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Generuj" }).click();
  const maze = page.getByRole("img", { name: "Labirynt" });
  await expect(maze).toBeVisible();
  await expect(page.getByRole("button", { name: "Poziom: 5 lat" })).toBeVisible();
  expect(await gridColumns(page)).toBe(13);
  const before = await wallSignature(page);

  await page.getByRole("button", { name: /^Poziom:/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "3 lata", exact: true }).click();

  await expect(page.getByRole("button", { name: "Poziom: 3 lata" })).toBeVisible();
  await expect(maze).toBeVisible();
  await expect(page.getByRole("button", { name: "Drukuj" })).toBeEnabled();
  expect(await gridColumns(page)).toBe(9);
  expect(await wallSignature(page)).not.toBe(before);
});
