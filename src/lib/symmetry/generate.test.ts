import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  composeSymmetryCard,
  generateSymmetryCard,
  mirrorAnswer,
  symmetryCardProblems,
  symmetryRowOffsets,
  type SymmetryCard,
} from "./generate.ts";
import { symmetryLevelById, type SymmetryLevel, type SymmetryLevelId } from "./levels.ts";
import { SYMMETRY_COLORS, symmetryTemplatesFor, type SymmetryCell, type SymmetryTemplate } from "./templates.ts";

const LAT4 = symmetryLevelById("lat4");
const LAT5 = symmetryLevelById("lat5");
const LAT6 = symmetryLevelById("lat6");
const LEVELS_WITH_TEMPLATES: readonly SymmetryLevel[] = [LAT5, LAT6];

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

void describe("symmetryTemplatesFor", () => {
  void test("5 lat and 6 lat share the rocket, the robot, and the strawberry, each 6 wide and at most 16 rows high", () => {
    for (const level of LEVELS_WITH_TEMPLATES) {
      assert.deepEqual(
        symmetryTemplatesFor(level.id).map((template) => template.id),
        ["rakieta", "robot", "truskawka"],
        level.id,
      );
    }
    for (const template of symmetryTemplatesFor("lat5")) {
      assert.equal(template.width, 6, template.id);
      assert.ok(template.height <= LAT5.rows, template.id);
      assert.ok(template.parts.length >= 2 && template.parts.length <= 3, template.id);
      for (const part of template.parts) {
        assert.ok(part.variants.length >= 2, `${template.id} ${part.id}`);
      }
    }
  });

  void test("every cell stays in the half-grid frame and carries a palette color", () => {
    for (const template of symmetryTemplatesFor("lat5")) {
      const cells = [...template.base, ...template.parts.flatMap((part) => part.variants.flat())];
      for (const cell of cells) {
        assert.ok(cell.col >= 0 && cell.col < template.width, `${template.id} ${JSON.stringify(cell)}`);
        assert.ok(cell.row >= 0 && cell.row < template.height, `${template.id} ${JSON.stringify(cell)}`);
        assert.ok((SYMMETRY_COLORS as readonly string[]).includes(cell.color), template.id);
      }
    }
  });

  void test("every template, variant set, and row offset gives a valid card, and each template has more than one", () => {
    for (const level of LEVELS_WITH_TEMPLATES) {
      for (const template of symmetryTemplatesFor(level.id)) {
        const keys = new Set<string>();
        for (const variants of variantSets(template)) {
          for (let offset = 0; offset < symmetryRowOffsets(template, level); offset += 1) {
            const card = composeSymmetryCard(template, variants, offset, level);

            assert.deepEqual(symmetryCardProblems(card), [], card.key);
            keys.add(card.key);
          }
        }

        assert.ok(keys.size > 1, `${level.id} ${template.id}`);
      }
    }
  });

  void test("different variant sets of one template draw different cells", () => {
    for (const template of symmetryTemplatesFor("lat5")) {
      const pictures = new Set(
        variantSets(template).map((variants) => picture(composeSymmetryCard(template, variants, 0, LAT5))),
      );

      assert.equal(pictures.size, variantSets(template).length, template.id);
    }
  });
});

void describe("symmetryRowOffsets", () => {
  void test("a template as tall as the grid has one position, a taller or wider one throws", () => {
    const template = (height: number, width = 6): SymmetryTemplate => ({
      id: "wieza",
      width,
      height,
      base: [{ col: 5, row: 0, color: "black" }],
      parts: [],
    });

    assert.equal(symmetryRowOffsets(template(LAT5.rows), LAT5), 1);
    assert.throws(() => symmetryRowOffsets(template(LAT5.rows + 1), LAT5), /wieza/);
    assert.throws(() => symmetryRowOffsets(template(10, 7), LAT5), /wieza/);
    assert.equal(symmetryRowOffsets(template(10, 7), LAT6), 11);
  });
});

void describe("generateSymmetryCard", () => {
  void test("returns a valid card with a key other than the previous one", () => {
    const random = mulberry32(12);
    let previous: string | null = null;

    for (let round = 0; round < 50; round += 1) {
      const card = generateSymmetryCard(random, previous, LAT5);

      assert.ok(card);
      assert.notEqual(card.key, previous);
      assert.deepEqual(symmetryCardProblems(card), [], card.key);
      previous = card.key;
    }
  });

  void test("returns null instead of looping when every draw repeats the previous card", () => {
    const always = (): number => 0;
    const first = generateSymmetryCard(always, null, LAT5);

    assert.ok(first);
    assert.equal(generateSymmetryCard(always, first.key, LAT5), null);
  });

  void test("returns null for a level without templates", () => {
    assert.equal(generateSymmetryCard(mulberry32(1), null, LAT4), null);
  });

  void test("a 6 lat card shifts the drawing so it touches the axis of the 7 column half", () => {
    const card = generateSymmetryCard(mulberry32(5), null, LAT6);

    assert.ok(card);
    assert.equal(card.columns, 14);
    assert.ok(card.cells.some((cell) => cell.col === 6));
    assert.ok(card.cells.every((cell) => cell.col >= 1 && cell.col <= 6));
  });

  void test("the key names the level, so one picture on two levels is two cards", () => {
    const template = symmetryTemplatesFor("lat5")[0];

    assert.notEqual(
      composeSymmetryCard(template, [0, 0, 0], 0, LAT5).key,
      composeSymmetryCard(template, [0, 0, 0], 0, LAT6).key,
    );
  });
});

void describe("hints", () => {
  const pattern: SymmetryCell[] = [0, 2, 4, 6, 8].map((row) => ({ col: 3, row, color: "red" }));
  const mirrored = (cell: SymmetryCell): SymmetryCell => ({ ...cell, col: 7 - cell.col });
  const lat4Card = (hints: readonly SymmetryCell[], cells: readonly SymmetryCell[] = pattern): SymmetryCard => ({
    ...cardWith(cells, "lat4"),
    hints,
  });

  void test("three mirrored cells of the answer are a valid hint (hand-written oracle)", () => {
    assert.deepEqual(symmetryCardProblems(lat4Card(pattern.slice(0, 3).map(mirrored))), []);
  });

  void test("rejects a hint that is not in the answer", () => {
    const stray: SymmetryCell = { col: 5, row: 1, color: "red" };

    assert.deepEqual(symmetryCardProblems(lat4Card([...pattern.slice(0, 2).map(mirrored), stray])), [
      "hint-not-in-answer",
    ]);
  });

  void test("rejects a hint of the wrong color", () => {
    const recolored: SymmetryCell = { ...mirrored(pattern[2]), color: "blue" };

    assert.deepEqual(symmetryCardProblems(lat4Card([...pattern.slice(0, 2).map(mirrored), recolored])), [
      "hint-not-in-answer",
    ]);
  });

  void test("rejects the wrong number of hints, and a repeated hint", () => {
    assert.deepEqual(symmetryCardProblems(lat4Card(pattern.slice(0, 2).map(mirrored))), ["hint-count-mismatch"]);
    assert.deepEqual(symmetryCardProblems(lat4Card([pattern[0], pattern[1], pattern[0]].map(mirrored))), [
      "hint-count-mismatch",
    ]);
  });

  void test("rejects hints that fill the whole answer", () => {
    const three = pattern.slice(0, 3);

    assert.deepEqual(symmetryCardProblems(lat4Card(three.map(mirrored), three)), ["hints-reveal-all"]);
  });

  void test("a level without hints rejects any hint", () => {
    const card = cardWith([
      { col: 5, row: 0, color: "red" },
      { col: 5, row: 1, color: "red" },
    ]);

    assert.deepEqual(symmetryCardProblems({ ...card, hints: [{ col: 6, row: 0, color: "red" }] }), [
      "hint-count-mismatch",
    ]);
  });

  void test("the generator spreads the hints down the axis column of the answer, never all of it", () => {
    const template: SymmetryTemplate = {
      id: "slup",
      width: 4,
      height: 12,
      base: Array.from({ length: 10 }, (_, row) => ({ col: 3, row, color: "red" as const })),
      parts: [],
    };
    const card = composeSymmetryCard(template, [], 0, LAT4);

    assert.deepEqual(symmetryCardProblems(card), []);
    assert.deepEqual(
      card.hints.map((cell) => cell.row),
      [1, 5, 8],
    );
    assert.ok(card.hints.every((cell) => cell.col === 4));
  });
});

function cardWith(cells: readonly SymmetryCell[], levelId: SymmetryLevelId = "lat5"): SymmetryCard {
  const level = symmetryLevelById(levelId);
  return {
    levelId,
    columns: level.columns,
    rows: level.rows,
    cellSize: level.cellSize,
    axis: "vertical",
    cells,
    hints: [],
    key: "test",
  };
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
