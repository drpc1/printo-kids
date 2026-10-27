import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CardSettingsMap } from "./card-settings.ts";
import { cardSummaries } from "./card-summary.ts";
import { CARD_KINDS } from "./cards.ts";
import type { ChildProfile } from "./child-profiles.ts";

function profile(level: ChildProfile["level"], cards?: CardSettingsMap): ChildProfile {
  return { id: "p1", name: "Ania", character: "none", level, ...(cards === undefined ? {} : { cards }) };
}

function byId(summaries: ReturnType<typeof cardSummaries>, id: string) {
  const found = summaries.find((summary) => summary.id === id);
  assert.ok(found, `summary for ${id}`);
  return found;
}

void describe("cardSummaries", () => {
  void test("lists the six cards in catalog order with their pages", () => {
    const summaries = cardSummaries(profile("lat5"));
    assert.deepEqual(
      summaries.map((summary) => [summary.id, summary.href]),
      CARD_KINDS.map((kind) => [kind.id, kind.href]),
    );
  });

  void test("an old profile with only a level shows it as the maze level and the rest as defaults", () => {
    const summaries = cardSummaries(profile("lat6"));
    assert.deepEqual(byId(summaries, "labirynt"), {
      id: "labirynt",
      title: "Labirynt",
      href: "/labirynt",
      used: true,
      badge: "poz. 4",
      detail: "Poziom 4",
    });
    for (const summary of summaries.filter((candidate) => candidate.id !== "labirynt")) {
      assert.equal(summary.used, false, summary.id);
      assert.equal(summary.badge, null, summary.id);
      assert.equal(summary.detail, "domyślne", summary.id);
    }
  });

  void test("a profile that used cards shows the level on the badge and every setting in the detail", () => {
    const summaries = cardSummaries(
      profile("lat6", {
        symetria: { level: "lat6", colors: true, category: "wszystkie" },
        nonogram: { level: "sredni", category: "zwierzeta" },
        sudoku: { size: 6, level: "sredni", symbols: "shapes", colors: false },
      }),
    );
    const symmetry = byId(summaries, "symetria");
    assert.equal(symmetry.badge, "poz. 3");
    assert.equal(symmetry.detail, "Poziom 3 · kolory · Wszystkie");
    const nonogram = byId(summaries, "nonogram");
    assert.equal(nonogram.badge, "średni");
    assert.equal(nonogram.detail, "średni · Zwierzęta");
    const sudoku = byId(summaries, "sudoku");
    assert.equal(sudoku.badge, "6×6 · średni");
    assert.equal(sudoku.detail, "6×6 · średni · kształty");
    assert.equal(byId(summaries, "sekwencje").used, false);
    assert.equal(byId(summaries, "dyktando").badge, null);
  });

  void test("the symmetry colors appear only when they are on", () => {
    const off = byId(
      cardSummaries(profile("lat5", { symetria: { level: "lat5", colors: false, category: "wszystkie" } })),
      "symetria",
    );
    assert.equal(off.detail, "Poziom 2 · Wszystkie");
  });

  void test("sudoku 4×4 has no level and no symbol choice", () => {
    const four = byId(
      cardSummaries(profile("lat5", { sudoku: { size: 4, level: "trudny", symbols: "digits", colors: true } })),
      "sudoku",
    );
    assert.equal(four.badge, "4×4");
    assert.equal(four.detail, "4×4");
  });

  void test("sudoku with digits has no colors; with shapes the colors show", () => {
    const digits = byId(
      cardSummaries(profile("lat5", { sudoku: { size: 9, level: "trudny", symbols: "digits", colors: true } })),
      "sudoku",
    );
    assert.equal(digits.badge, "9×9 · trudny");
    assert.equal(digits.detail, "9×9 · trudny · cyfry");
    const shapes = byId(
      cardSummaries(profile("lat5", { sudoku: { size: 9, level: "latwy", symbols: "shapes", colors: true } })),
      "sudoku",
    );
    assert.equal(shapes.detail, "9×9 · łatwy · kształty · kolory");
  });
});
