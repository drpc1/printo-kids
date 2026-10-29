// Provenance: phone-toggle-margin (issue #166)
// After Generuj, on phone-360 the switch track's left edge matches the first span of the
// settings button on the line above, within 1 px. That label takes the whole line. Other
// projects still open the card and skip the comparison: from 640 px the label stays in
// the row and has no extra inset. It does not prove the switch still changes the card.
import { expect, test, type Locator } from "@playwright/test";

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

const CARDS = [
  { path: "/sudoku", image: "Sudoku", switchName: "Kolory" },
  { path: "/sequences", image: "Sekwencje", switchName: "Kolory" },
  { path: "/symmetry", image: "Symetria", switchName: "Kolory" },
  { path: "/nonogram", image: "Nonogram", switchName: "Pokaż rozwiązanie" },
  { path: "/dictation", image: "Dyktando graficzne", switchName: "Pokaż rozwiązanie" },
] as const;

function bottom(box: Box): number {
  return box.y + box.height;
}

// Two boxes share a line when their vertical ranges overlap. A neighbor beside the switch
// is on that line; a button whose bottom sits on or above the switch's top is not.
function sharesLine(a: Box, b: Box): boolean {
  return a.y < bottom(b) && b.y < bottom(a);
}

// The reference is the leftmost settings button on the nearest line above the switch.
// Those buttons live in the same wrapping row. A button beside the switch is not a reference:
// the label was supposed to take the whole row.
async function referenceButton(toggle: Locator, toggleBox: Box, path: string): Promise<Locator> {
  const row = toggle.locator("xpath=ancestor::div[contains(@class,'flex-wrap')][1]");
  const placed: { locator: Locator; box: Box }[] = [];
  for (const locator of await row.getByRole("button").all()) {
    const box = await locator.boundingBox();
    if (box === null) {
      continue;
    }
    placed.push({ locator, box });
  }

  const beside = placed.filter((button) => sharesLine(button.box, toggleBox));
  expect(beside.length, `${path}: the label did not take the full row`).toBe(0);

  const above = placed.filter((button) => bottom(button.box) <= toggleBox.y);
  expect(above.length, `${path}: the label did not take the full row`).toBeGreaterThan(0);
  const anchor = above.reduce((closest, button) => (bottom(button.box) > bottom(closest.box) ? button : closest));
  const line = above.filter((button) => sharesLine(button.box, anchor.box));
  const reference = line.reduce((leftmost, button) => (button.box.x < leftmost.box.x ? button : leftmost));
  return reference.locator;
}

for (const card of CARDS) {
  test(`${card.path} lines the switch up with the settings label above`, async ({ page }, testInfo) => {
    await page.goto(card.path);
    // client:only island: Generuj is absent until React mounts. The click waits for it.
    await page.getByRole("button", { name: "Generuj" }).click();
    await expect(page.getByRole("img", { name: card.image })).toBeVisible();

    // Wider projects do not get the inset, and the switch often stays on the settings line.
    if (testInfo.project.name !== "phone-360") {
      return;
    }

    const toggle = page.getByRole("switch", { name: card.switchName });
    const toggleBox = await viewportBox(toggle);
    const reference = await referenceButton(toggle, toggleBox, card.path);
    const labelBox = await viewportBox(reference.locator("span").first());
    expect(Math.abs(labelBox.x - toggleBox.x), `${card.path}: switch left edge`).toBeLessThanOrEqual(1);
  });
}
