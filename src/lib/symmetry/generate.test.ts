import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  SYMMETRY_SETTING,
  composeSymmetryCard,
  generateSymmetryCard,
  mirrorAnswer,
  symmetryCardProblems,
  symmetryRowOffsets,
  type SymmetryCard,
} from "./generate.ts";
import { SYMMETRY_COLORS, SYMMETRY_TEMPLATES, type SymmetryCell, type SymmetryTemplate } from "./templates.ts";

void describe("SYMMETRY_SETTING", () => {
  void test("is the 5 lat row: a 12 by 16 grid of 15 mm with a vertical axis", () => {
    assert.deepEqual(SYMMETRY_SETTING, { columns: 12, rows: 16, cellSize: 15, axis: "vertical" });
  });
});

void describe("mirrorAnswer", () => {
  void test("reflects each cell across the vertical axis with its row and color (hand-written oracle)", () => {
    const card = cardWith([
      { col: 5, row: 0, color: "red" },
      { col: 2, row: 3, color: "blue" },
    ]);

    assert.deepEqual(mirrorAnswer(card), [
      { col: 6, row: 0, color: "red" },
      { col: 9, row: 3, color: "blue" },
    ]);
  });
});

void describe("symmetryCardProblems", () => {
  void test("accepts a small card that touches the axis", () => {
    assert.deepEqual(symmetryCardProblems(cardWith([{ col: 5, row: 7, color: "gray" }])), []);
  });

  void test("rejects an empty pattern", () => {
    assert.deepEqual(symmetryCardProblems(cardWith([])), ["no-filled-cell"]);
  });

  void test("rejects a full pattern half", () => {
    const cells: SymmetryCell[] = [];
    for (let row = 0; row < 16; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        cells.push({ col, row, color: "black" });
      }
    }

    assert.deepEqual(symmetryCardProblems(cardWith(cells)), ["no-empty-cell"]);
  });

  void test("rejects a cell in the other half", () => {
    for (const col of [6, 11]) {
      const card = cardWith([
        { col: 5, row: 0, color: "red" },
        { col, row: 1, color: "red" },
      ]);

      assert.deepEqual(symmetryCardProblems(card), ["outside-pattern-half"], `column ${col}`);
    }
  });

  void test("rejects a cell on the middle column of an odd grid, which is the axis", () => {
    const card: SymmetryCard = {
      ...cardWith([
        { col: 5, row: 0, color: "red" },
        { col: 6, row: 1, color: "red" },
      ]),
      columns: 13,
    };

    assert.deepEqual(symmetryCardProblems(card), ["outside-pattern-half"]);
  });

  void test("rejects a cell off the grid", () => {
    for (const place of [
      { col: -1, row: 0 },
      { col: 5, row: -1 },
      { col: 5, row: 16 },
      { col: 12, row: 0 },
    ]) {
      const card = cardWith([
        { col: 5, row: 2, color: "red" },
        { ...place, color: "red" },
      ]);

      assert.deepEqual(symmetryCardProblems(card), ["outside-grid"], JSON.stringify(place));
    }
  });

  void test("rejects a cell between grid lines", () => {
    for (const place of [
      { col: 4.5, row: 0 },
      { col: 5, row: 2.5 },
      { col: Number.NaN, row: 0 },
    ]) {
      const card = cardWith([
        { col: 5, row: 2, color: "red" },
        { ...place, color: "red" },
      ]);

      assert.deepEqual(symmetryCardProblems(card), ["outside-grid"], JSON.stringify(place));
    }
  });

  void test("rejects a repeated cell", () => {
    const card = cardWith([
      { col: 5, row: 2, color: "red" },
      { col: 5, row: 2, color: "green" },
    ]);

    assert.deepEqual(symmetryCardProblems(card), ["duplicate-cell"]);
  });

  void test("rejects a color outside the palette", () => {
    const card = cardWith([{ col: 5, row: 2, color: "pink" as SymmetryCell["color"] }]);

    assert.deepEqual(symmetryCardProblems(card), ["unknown-color"]);
  });

  void test("rejects a pattern that does not touch the axis", () => {
    const card = cardWith([
      { col: 4, row: 2, color: "red" },
      { col: 0, row: 9, color: "red" },
    ]);

    assert.deepEqual(symmetryCardProblems(card), ["not-touching-axis"]);
  });
});

void describe("SYMMETRY_TEMPLATES", () => {
  void test("are the rocket, the robot, and the strawberry, each at most 16 rows high", () => {
    assert.deepEqual(
      SYMMETRY_TEMPLATES.map((template) => template.id),
      ["rakieta", "robot", "truskawka"],
    );
    for (const template of SYMMETRY_TEMPLATES) {
      assert.ok(template.height <= SYMMETRY_SETTING.rows, template.id);
      assert.ok(template.parts.length >= 2 && template.parts.length <= 3, template.id);
      for (const part of template.parts) {
        assert.ok(part.variants.length >= 2, `${template.id} ${part.id}`);
      }
    }
  });

  void test("every cell stays in the half-grid frame and carries a palette color", () => {
    for (const template of SYMMETRY_TEMPLATES) {
      const cells = [...template.base, ...template.parts.flatMap((part) => part.variants.flat())];
      for (const cell of cells) {
        assert.ok(cell.col >= 0 && cell.col < SYMMETRY_SETTING.columns / 2, `${template.id} ${JSON.stringify(cell)}`);
        assert.ok(cell.row >= 0 && cell.row < template.height, `${template.id} ${JSON.stringify(cell)}`);
        assert.ok((SYMMETRY_COLORS as readonly string[]).includes(cell.color), template.id);
      }
    }
  });

  void test("every template, variant set, and row offset gives a valid card, and each template has more than one", () => {
    for (const template of SYMMETRY_TEMPLATES) {
      const keys = new Set<string>();
      for (const variants of variantSets(template)) {
        for (let offset = 0; offset < symmetryRowOffsets(template); offset += 1) {
          const card = composeSymmetryCard(template, variants, offset);

          assert.deepEqual(symmetryCardProblems(card), [], card.key);
          keys.add(card.key);
        }
      }

      assert.ok(keys.size > 1, template.id);
    }
  });

  void test("different variant sets of one template draw different cells", () => {
    for (const template of SYMMETRY_TEMPLATES) {
      const pictures = new Set(
        variantSets(template).map((variants) => picture(composeSymmetryCard(template, variants, 0))),
      );

      assert.equal(pictures.size, variantSets(template).length, template.id);
    }
  });
});

void describe("symmetryRowOffsets", () => {
  void test("a template as tall as the grid has one position, a taller one throws", () => {
    const template = (height: number): SymmetryTemplate => ({
      id: "wieza",
      height,
      base: [{ col: 5, row: 0, color: "black" }],
      parts: [],
    });

    assert.equal(symmetryRowOffsets(template(SYMMETRY_SETTING.rows)), 1);
    assert.throws(() => symmetryRowOffsets(template(SYMMETRY_SETTING.rows + 1)), /wieza/);
  });
});

void describe("generateSymmetryCard", () => {
  void test("returns a valid card with a key other than the previous one", () => {
    const random = mulberry32(12);
    let previous: string | null = null;

    for (let round = 0; round < 50; round += 1) {
      const card = generateSymmetryCard(random, previous);

      assert.ok(card);
      assert.notEqual(card.key, previous);
      assert.deepEqual(symmetryCardProblems(card), [], card.key);
      previous = card.key;
    }
  });

  void test("returns null instead of looping when every draw repeats the previous card", () => {
    const always = (): number => 0;
    const first = generateSymmetryCard(always, null);

    assert.ok(first);
    assert.equal(generateSymmetryCard(always, first.key), null);
  });
});

function cardWith(cells: readonly SymmetryCell[]): SymmetryCard {
  return { columns: 12, rows: 16, axis: "vertical", cells, key: "test" };
}

function variantSets(template: SymmetryTemplate): number[][] {
  let sets: number[][] = [[]];
  for (const part of template.parts) {
    sets = sets.flatMap((set) => part.variants.map((_, index) => [...set, index]));
  }
  return sets;
}

function picture(card: SymmetryCard): string {
  return card.cells
    .map((cell) => `${cell.col},${cell.row}`)
    .sort()
    .join(" ");
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
