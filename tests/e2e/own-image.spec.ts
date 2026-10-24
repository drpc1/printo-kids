// Provenance: parent-supplied-maze-image (phase 2)
// Protects the parent photo on the maze sheet: a picked PNG is drawn from a data URL, Kot takes the
// sheet back and leaves the thumbnail, Ala's saved Kot returns after reload, and a GIF stays on Kot
// with the file message still in the open dialog. No request body carries the image.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test, type Page, type Request } from "@playwright/test";

const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG = Buffer.from(PNG_BASE64, "base64");
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

function trackImageLeak(page: Page, needles: readonly string[]): string[] {
  const hits: string[] = [];
  const see = (request: Request): void => {
    const url = request.url();
    const body = request.postData() ?? "";
    if (needles.some((needle) => url.includes(needle) || body.includes(needle))) {
      hits.push(`${request.method()} ${url}`);
    }
  };
  page.on("request", see);
  return hits;
}

async function sheetHref(page: Page): Promise<string | null> {
  return page.locator('svg[role="img"] image').getAttribute("href");
}

async function pickFile(page: Page, name: string, mimeType: string, buffer: Buffer): Promise<void> {
  const dialog = page.getByRole("dialog");
  const chooser = page.waitForEvent("filechooser");
  await dialog.getByRole("button", { name: "Własne zdjęcie", exact: true }).click();
  await (await chooser).setFiles({ name, mimeType, buffer });
}

test("a picked PNG is drawn on the sheet, Kot removes it, and the row keeps the thumbnail", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  const leaked = trackImageLeak(page, ["data:image", PNG_BASE64]);
  await page.goto("/labirynt");

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("img", { name: "Labirynt" })).toBeVisible();

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await pickFile(page, "zdjecie.png", "image/png", PNG);

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect.poll(() => sheetHref(page)).toMatch(/^data:image\//);
  await expect(page.locator('svg[role="img"] image')).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");

  await page.getByRole("button", { name: /^Postać:/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Kot", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect.poll(() => sheetHref(page)).toBe("/characters/kot.png");

  await page.getByRole("button", { name: "Postać: Kot" }).click();
  await expect(page.getByRole("dialog").locator('img[src^="data:image/"]')).toBeVisible();
  expect(leaked).toEqual([]);
});

test("Ala's saved Kot is on the sheet after reload and the device thumbnail stays in the dialog", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  const leaked = trackImageLeak(page, ["data:image", PNG_BASE64]);
  await page.addInitScript(() => {
    localStorage.setItem(
      "printo-kids:child-profiles",
      JSON.stringify({ profiles: [{ id: "ala", name: "Ala", character: "kot", level: "lat5" }] }),
    );
    localStorage.setItem("printo-kids:active-profile", "ala");
  });
  await page.goto("/labirynt");

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect.poll(() => sheetHref(page)).toBe("/characters/kot.png");

  await page.getByRole("button", { name: "Postać: Kot" }).click();
  await pickFile(page, "zdjecie.png", "image/png", PNG);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect.poll(() => sheetHref(page)).toMatch(/^data:image\//);

  const stored = await page.evaluate(() => localStorage.getItem("printo-kids:child-profiles"));
  expect(stored).toContain('"character":"kot"');
  expect(stored).not.toContain('"image"');

  await page.reload();
  await page.getByRole("button", { name: "Generuj" }).click();
  await expect(page.getByRole("button", { name: "Postać: Kot" })).toBeVisible();
  await expect.poll(() => sheetHref(page)).toBe("/characters/kot.png");

  await page.getByRole("button", { name: "Postać: Kot" }).click();
  await expect(page.getByRole("dialog").locator('img[src^="data:image/"]')).toBeVisible();
  expect(leaked).toEqual([]);
});

test("a GIF leaves Kot on the sheet and the open dialog explains JPEG, PNG, or WebP", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  const leaked = trackImageLeak(page, ["data:image", GIF.toString("base64")]);
  await page.addInitScript(() => {
    localStorage.setItem("printo-kids:last-used", JSON.stringify({ character: "kot", level: "lat5" }));
  });
  await page.goto("/labirynt");

  await page.getByRole("button", { name: "Generuj" }).click();
  await expect.poll(() => sheetHref(page)).toBe("/characters/kot.png");

  await page.getByRole("button", { name: "Postać: Kot" }).click();
  const dialog = page.getByRole("dialog");
  await pickFile(page, "animacja.gif", "image/gif", GIF);

  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Wybierz plik JPEG, PNG albo WebP.")).toBeVisible();
  await expect.poll(() => sheetHref(page)).toBe("/characters/kot.png");
  expect(leaked).toEqual([]);
});
