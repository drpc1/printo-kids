// Provenance: symmetry-color-codes (S-15, US-09)
// The Kolory switch on /symmetry: off by default, it redraws the same card (same cells, same
// positions) with crayon tokens and never generates a new card. It does not prove the print.
import { expect, test, type Page } from "@playwright/test";

async function cellPlaces(page: Page): Promise<string[]> {
  return page
    .getByRole("img", { name: "Symetria" })
    .locator("g:first-of-type rect")
    .evaluateAll((rects) => rects.map((rect) => `${rect.getAttribute("x")},${rect.getAttribute("y")}`));
}

async function cellFills(page: Page): Promise<string[]> {
  return page
    .getByRole("img", { name: "Symetria" })
    .locator("g:first-of-type rect")
    .evaluateAll((rects) => rects.map((rect) => rect.getAttribute("fill") ?? ""));
}

test("Kolory is off by default and recolors the same card without generating a new one", async ({ page }) => {
  await page.goto("/symmetry");
  const colors = page.getByRole("switch", { name: "Kolory" });
  await expect(colors).toBeVisible();
  await expect(colors).not.toBeChecked();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Symetria" })).toBeVisible();

  const plainPlaces = await cellPlaces(page);
  const plainFills = await cellFills(page);
  expect(plainFills.length).toBeGreaterThan(0);
  expect(plainFills.every((fill) => fill === "var(--foreground)")).toBe(true);

  await colors.click();
  await expect(colors).toBeChecked();

  const colorFills = await cellFills(page);
  const colorPlaces = await cellPlaces(page);
  expect(colorFills.every((fill) => fill.startsWith("var(--symmetry-"))).toBe(true);
  // The details are the holes, so colors add cells and keep every plain cell where it was.
  expect(colorFills.length).toBeGreaterThanOrEqual(plainFills.length);
  for (const place of plainPlaces) {
    expect(colorPlaces).toContain(place);
  }

  await colors.click();
  await expect(colors).not.toBeChecked();
  expect(await cellPlaces(page)).toEqual(plainPlaces);
  expect(await cellFills(page)).toEqual(plainFills);
});

test("Kolory is there before the first card and works from the keyboard", async ({ page }) => {
  await page.goto("/symmetry");
  const colors = page.getByRole("switch", { name: "Kolory" });
  await colors.focus();
  await page.keyboard.press("Space");
  await expect(colors).toBeChecked();

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("switch", { name: "Kolory" })).toBeChecked();
  const fills = await cellFills(page);
  expect(fills.every((fill) => fill.startsWith("var(--symmetry-"))).toBe(true);
});
