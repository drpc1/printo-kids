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

test("changing the level on a sheet redraws the maze for that level", async ({ page }) => {
  await page.goto("/");

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
