// Provenance: dialog-close-button (impl-review F3)
// Protects the close X: on "Usunąć profil …?" it returns to the list and deletes nothing,
// and on the character list it closes without changing the character on the bar.
// On desktop Chromium the close target is 44 px and its right edge meets the native scrollbar.
// The flow is the same on every screen size, so it runs on desktop Chromium only.
import { expect, test, type Locator, type Page } from "@playwright/test";

const PROFILES_KEY = "printo-kids:child-profiles";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function viewportBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) {
    throw new Error("element has no box");
  }
  return box;
}

// The dialog zooms in; measure the settled corner, not a mid-animation box.
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

async function expectPreciseCloseCorner(page: Page, dialog: Locator): Promise<void> {
  await settle(page);
  const closeBox = await viewportBox(dialog.getByRole("button", { name: "Zamknij", exact: true }));
  // A precise pointer keeps a 44 px close target. Its right edge meets the native scrollbar,
  // the body's right edge, 12 px inside the dialog padding.
  expect(Math.abs(closeBox.width - 44)).toBeLessThanOrEqual(1);
  expect(Math.abs(closeBox.height - 44)).toBeLessThanOrEqual(1);
  const bodyBox = await viewportBox(dialog.locator('[data-slot="dialog-body"]'));
  expect(Math.abs(closeBox.x + closeBox.width - (bodyBox.x + bodyBox.width))).toBeLessThanOrEqual(1);
}

async function storedNames(page: Page): Promise<unknown> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const stored = raw === null ? null : (JSON.parse(raw) as { profiles: { name: string }[] });
    return stored?.profiles.map((profile) => profile.name) ?? null;
  }, PROFILES_KEY);
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout-independent flow");
  await page.addInitScript((key) => {
    // Seed once: a reload in the test must keep what the page saved.
    if (window.sessionStorage.getItem("e2e-seeded") === null) {
      window.localStorage.setItem(
        key,
        JSON.stringify({ profiles: [{ id: "e2e-ala", name: "Ala", character: "kot", level: "lat5" }] }),
      );
      window.sessionStorage.setItem("e2e-seeded", "1");
    }
  }, PROFILES_KEY);
  await page.goto("/maze");
});

test("the close X on the delete question returns to the list and keeps the profile", async ({ page }) => {
  // client:only island: the corner is absent until React mounts. The click waits for it.
  await page.getByRole("button", { name: "Ala", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Usuń Ala" }).click();
  await expect(dialog.getByText("Usunąć profil Ala?")).toBeVisible();
  await expectPreciseCloseCorner(page, dialog);

  await dialog.getByRole("button", { name: "Zamknij", exact: true }).click();

  // While Radix animates a close the dialog is still visible, already showing the list:
  // data-state tells a dialog that stays open from one on its way out.
  await expect(dialog).toHaveAttribute("data-state", "open");
  await expect(dialog.getByRole("button", { name: "Edytuj Ala" })).toBeVisible();
  expect(await storedNames(page)).toEqual(["Ala"]);
});

test("the close X on the character list keeps the character on the bar", async ({ page }) => {
  const character = page.getByRole("button", { name: "Postać: Kot" });
  await character.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expectPreciseCloseCorner(page, dialog);

  await dialog.getByRole("button", { name: "Zamknij", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(character).toBeVisible();
});
