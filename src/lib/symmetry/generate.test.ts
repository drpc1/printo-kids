import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  composeSymmetryCard,
  generateSymmetryCard,
  mirrorAnswer,
  mirrorAnswerWithDetails,
  symmetryCardProblems,
  symmetryRowOffsets,
  type SymmetryCard,
} from "./generate.ts";
import { SYMMETRY_LEVELS, symmetryLevelById, type SymmetryLevel, type SymmetryLevelId } from "./levels.ts";
import { SYMMETRY_COLORS, symmetryTemplatesFor, type SymmetryCell, type SymmetryTemplate } from "./templates.ts";

const LAT4 = symmetryLevelById("lat4");
const LAT5 = symmetryLevelById("lat5");
const LAT6 = symmetryLevelById("lat6");
const LEVELS_WITH_TEMPLATES: readonly SymmetryLevel[] = SYMMETRY_LEVELS;

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

void describe("mirrorAnswerWithDetails", () => {
  void test("reflects the pattern cells and the details with row and color, while mirrorAnswer leaves details out", () => {
    const card: SymmetryCard = {
      ...cardWith([{ col: 5, row: 0, color: "red" }]),
      details: [{ col: 4, row: 2, color: "blue" }],
    };

    assert.deepEqual(mirrorAnswerWithDetails(card), [
      { col: 6, row: 0, color: "red" },
      { col: 7, row: 2, color: "blue" },
    ]);
    assert.deepEqual(mirrorAnswer(card), [{ col: 6, row: 0, color: "red" }]);
  });
});

void describe("details", () => {
  const rocket = symmetryTemplatesFor("lat5")[0];

  void test("the 5 lat rocket with the open window has a 2 by 2 blue hole shifted by the row offset (hand-written oracle)", () => {
    const card = composeSymmetryCard(rocket, [0, 0, 0], 3, LAT5);

    assert.deepEqual(card.details, [
      { col: 4, row: 7, color: "blue" },
      { col: 5, row: 7, color: "blue" },
      { col: 4, row: 8, color: "blue" },
      { col: 5, row: 8, color: "blue" },
    ]);
  });

  void test("a window variant that fills the cells leaves only the remaining hole, the 4 lat one leaves none", () => {
    assert.deepEqual(composeSymmetryCard(rocket, [0, 1, 0], 0, LAT5).details, [
      { col: 5, row: 4, color: "blue" },
      { col: 5, row: 5, color: "blue" },
    ]);
    const rocket4 = symmetryTemplatesFor("lat4")[0];

    assert.deepEqual(composeSymmetryCard(rocket4, [0, 0, 0], 0, LAT4).details, [{ col: 3, row: 4, color: "blue" }]);
    assert.deepEqual(composeSymmetryCard(rocket4, [0, 1, 0], 0, LAT4).details, []);
  });

  void test("the robot keeps its eye and mouth as holes, while the gap beside the arm is not one (hand-written oracle)", () => {
    const card = composeSymmetryCard(symmetryTemplatesFor("lat5")[1], [0, 0, 0], 0, LAT5);

    assert.deepEqual(card.details, [
      { col: 3, row: 3, color: "yellow" },
      { col: 4, row: 5, color: "yellow" },
      { col: 5, row: 5, color: "yellow" },
    ]);
  });

  void test("every template, variant set, and offset keeps details out of the pattern cells and inside the palette", () => {
    for (const level of LEVELS_WITH_TEMPLATES) {
      for (const template of symmetryTemplatesFor(level.id)) {
        for (const variants of variantSets(template)) {
          const card = composeSymmetryCard(template, variants, 0, level);
          const filled = new Set(card.cells.map((cell) => `${cell.col},${cell.row}`));

          if (template.holeColor === null) {
            assert.deepEqual(card.details, [], card.key);
          }
          for (const detail of card.details) {
            assert.equal(detail.color, template.holeColor, card.key);
            assert.ok(!filled.has(`${detail.col},${detail.row}`), card.key);
            assert.ok(detail.col < level.columns / 2, card.key);
          }
        }
      }
    }
  });

  void test("rejects a detail on a filled cell, in the other half, off the grid, repeated, or of an unknown color", () => {
    const base = cardWith([{ col: 5, row: 2, color: "red" }]);
    const withDetails = (details: SymmetryCell[]): SymmetryCard => ({ ...base, details });

    assert.deepEqual(symmetryCardProblems(withDetails([{ col: 5, row: 2, color: "blue" }])), ["detail-on-filled-cell"]);
    assert.deepEqual(symmetryCardProblems(withDetails([{ col: 6, row: 3, color: "blue" }])), ["outside-pattern-half"]);
    assert.deepEqual(symmetryCardProblems(withDetails([{ col: 4, row: 16, color: "blue" }])), ["outside-grid"]);
    assert.deepEqual(
      symmetryCardProblems(
        withDetails([
          { col: 4, row: 3, color: "blue" },
          { col: 4, row: 3, color: "blue" },
        ]),
      ),
      ["duplicate-cell"],
    );
    assert.deepEqual(symmetryCardProblems(withDetails([{ col: 4, row: 3, color: "pink" as SymmetryCell["color"] }])), [
      "unknown-color",
    ]);
  });

  void test("a template that keeps its holes white has no details, so the answer with details is the plain answer", () => {
    const ring: SymmetryTemplate = {
      id: "obwarzanek",
      holeColor: null,
      categories: ["jedzenie"],
      width: 6,
      height: 3,
      base: [
        { col: 4, row: 0, color: "brown" },
        { col: 5, row: 0, color: "brown" },
        { col: 4, row: 1, color: "brown" },
        { col: 4, row: 2, color: "brown" },
        { col: 5, row: 2, color: "brown" },
      ],
      parts: [],
    };
    const card = composeSymmetryCard(ring, [], 0, LAT5);

    assert.deepEqual(composeSymmetryCard({ ...ring, holeColor: "yellow" }, [], 0, LAT5).details, [
      { col: 5, row: 1, color: "yellow" },
    ]);
    assert.deepEqual(card.details, []);
    assert.deepEqual(mirrorAnswerWithDetails(card), mirrorAnswer(card));
    assert.deepEqual(symmetryCardProblems(card), []);
  });

  void test("orange and brown are in the palette", () => {
    assert.ok((SYMMETRY_COLORS as readonly string[]).includes("orange"));
    assert.ok((SYMMETRY_COLORS as readonly string[]).includes("brown"));
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
  void test("every level starts with the rocket, the robot, and the strawberry; 5 lat and 6 lat share 6 wide templates", () => {
    for (const level of LEVELS_WITH_TEMPLATES) {
      assert.deepEqual(
        symmetryTemplatesFor(level.id)
          .slice(0, 3)
          .map((template) => template.id),
        ["rakieta", "robot", "truskawka"],
        level.id,
      );
    }
    assert.equal(symmetryTemplatesFor("lat5"), symmetryTemplatesFor("lat6"));
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
    for (const level of LEVELS_WITH_TEMPLATES) {
      for (const template of symmetryTemplatesFor(level.id)) {
        const cells = [...template.base, ...template.parts.flatMap((part) => part.variants.flat())];
        for (const cell of cells) {
          assert.ok(cell.col >= 0 && cell.col < template.width, `${level.id} ${template.id} ${JSON.stringify(cell)}`);
          assert.ok(cell.row >= 0 && cell.row < template.height, `${level.id} ${template.id} ${JSON.stringify(cell)}`);
          assert.ok((SYMMETRY_COLORS as readonly string[]).includes(cell.color), template.id);
        }
      }
    }
  });

  void test("4 lat has simple templates 4 wide and at most 12 tall, each with room for three hints", () => {
    for (const template of symmetryTemplatesFor("lat4")) {
      assert.equal(template.width, 4, template.id);
      assert.ok(template.height <= LAT4.rows, template.id);
      for (const variants of variantSets(template)) {
        const card = composeSymmetryCard(template, variants, 0, LAT4);
        assert.equal(card.hints.length, 3, `${template.id} ${variants.join("-")}`);
      }
    }
  });

  void test("7 lat has richer templates up to 9 wide and 24 tall with at least three parts", () => {
    for (const template of symmetryTemplatesFor("lat7")) {
      assert.ok(template.width <= 9 && template.height <= 24, template.id);
      assert.ok(template.parts.length >= 3, template.id);
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
      holeColor: "blue",
      categories: ["budowle"],
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
      holeColor: "blue",
      categories: ["budowle"],
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
    details: [],
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

void describe("generateSymmetryCard edges", () => {
  void test("a category with no objects gives no card", () => {
    for (const level of SYMMETRY_LEVELS) {
      assert.equal(
        generateSymmetryCard(() => 0.5, null, level, "nie-ma-takiej" as never),
        null,
        level.id,
      );
    }
  });

  void test("a draw that repeats the previous key is drawn again, on every level", () => {
    for (const level of SYMMETRY_LEVELS) {
      const first = generateSymmetryCard(mulberry32(3), null, level);
      assert.ok(first, level.id);
      const next = generateSymmetryCard(mulberry32(3), first.key, level);

      assert.ok(next, level.id);
      assert.notEqual(next.key, first.key, level.id);
    }
  });

  void test("a card has a vertical axis and a key of level, object, variants and row offset", () => {
    const rocket = symmetryTemplatesFor("lat5")[0];
    const card = composeSymmetryCard(rocket, [1, 0, 0], 3, LAT5);

    assert.equal(card.axis, "vertical");
    assert.equal(card.key, `lat5:${rocket.id}:1-0-0:3`);
  });

  void test("a variant index outside the part names the object and the index", () => {
    const rocket = symmetryTemplatesFor("lat5")[0];

    assert.throws(() => composeSymmetryCard(rocket, [99, 0, 0], 0, LAT5), /rakieta.*no variant 99/);
  });

  void test("the errors of a template that does not fit say how big it is and how big the grid is", () => {
    const wide = (height: number, width: number): SymmetryTemplate => ({
      id: "wieza",
      holeColor: "blue",
      categories: ["budowle"],
      width,
      height,
      base: [{ col: 5, row: 0, color: "black" }],
      parts: [],
    });

    assert.throws(() => symmetryRowOffsets(wide(17, 6), LAT5), /wieza is 17 rows tall, the lat5 grid has 16/);
    assert.throws(() => symmetryRowOffsets(wide(10, 7), LAT5), /wieza is 7 columns wide, the lat5 half grid has 6/);
  });
});

void describe("hints for a template with few axis cells", () => {
  const axisTemplate = (axisRows: readonly number[]): SymmetryTemplate => ({
    id: "slup",
    holeColor: null,
    categories: ["budowle"],
    width: 4,
    height: 8,
    base: [
      ...axisRows.map((row) => ({ col: 3, row, color: "red" as const })),
      { col: 1, row: 0, color: "red" as const },
    ],
    parts: [],
  });

  void test("fewer axis cells than hints: every axis cell is a hint, in order from the top, off-axis cells are not", () => {
    const card = composeSymmetryCard(axisTemplate([5, 1]), [], 0, LAT4);

    assert.deepEqual(card.hints, [
      { col: 4, row: 1, color: "red" },
      { col: 4, row: 5, color: "red" },
    ]);
  });

  void test("more axis cells than hints: three are spread down the axis from top to bottom", () => {
    const card = composeSymmetryCard(axisTemplate([4, 0, 3, 1, 2]), [], 0, LAT4);

    assert.deepEqual(
      card.hints.map((hint) => hint.row),
      [0, 2, 4],
    );
  });

  void test("as many axis cells as hints: all of them", () => {
    const card = composeSymmetryCard(axisTemplate([2, 0, 1]), [], 0, LAT4);

    assert.deepEqual(
      card.hints.map((hint) => hint.row),
      [0, 1, 2],
    );
  });
});

/** The empty cells of the pattern half that the whole silhouette closes in, found by growing the outside inwards. */
function enclosedCells(card: SymmetryCard): { col: number; row: number }[] {
  const filled = new Set<string>();
  for (const cell of card.cells) {
    filled.add(`${cell.col},${cell.row}`);
    filled.add(`${card.columns - 1 - cell.col},${cell.row}`);
  }
  const outside = new Set<string>();
  for (let row = 0; row < card.rows; row += 1) {
    for (let col = 0; col < card.columns; col += 1) {
      const onEdge = row === 0 || col === 0 || row === card.rows - 1 || col === card.columns - 1;
      if (onEdge && !filled.has(`${col},${row}`)) outside.add(`${col},${row}`);
    }
  }
  for (let grew = true; grew;) {
    grew = false;
    for (let row = 0; row < card.rows; row += 1) {
      for (let col = 0; col < card.columns; col += 1) {
        const place = `${col},${row}`;
        if (filled.has(place) || outside.has(place)) continue;
        const next = [`${col - 1},${row}`, `${col + 1},${row}`, `${col},${row - 1}`, `${col},${row + 1}`];
        if (next.some((neighbour) => outside.has(neighbour))) {
          outside.add(place);
          grew = true;
        }
      }
    }
  }
  const holes: { col: number; row: number }[] = [];
  for (let row = 0; row < card.rows; row += 1) {
    for (let col = 0; col < card.columns / 2; col += 1) {
      if (!filled.has(`${col},${row}`) && !outside.has(`${col},${row}`)) holes.push({ col, row });
    }
  }
  return holes;
}

void describe("details against an independent flood fill", () => {
  void test("every object, variant set and offset closes in exactly the cells an independent fill finds", () => {
    let withHoles = 0;
    for (const level of LEVELS_WITH_TEMPLATES) {
      for (const template of symmetryTemplatesFor(level.id)) {
        const offsets = [0, symmetryRowOffsets(template, level) - 1];
        for (const variants of variantSets(template)) {
          for (const rowOffset of offsets) {
            const card = composeSymmetryCard(template, variants, rowOffset, level);
            const expected = template.holeColor === null ? [] : enclosedCells(card);
            if (expected.length > 0) withHoles += 1;

            assert.deepEqual(
              card.details.map(({ col, row }) => ({ col, row })),
              expected,
              card.key,
            );
          }
        }
      }
    }

    assert.ok(withHoles > 20, `${withHoles} cards with holes`);
  });

  void test("a hand-drawn ring encloses its centre and a hook open at the side does not", () => {
    const ring = cardWith([
      { col: 3, row: 3, color: "red" },
      { col: 4, row: 3, color: "red" },
      { col: 5, row: 3, color: "red" },
      { col: 3, row: 4, color: "red" },
      { col: 3, row: 5, color: "red" },
      { col: 4, row: 5, color: "red" },
      { col: 5, row: 5, color: "red" },
      { col: 5, row: 4, color: "red" },
    ]);

    assert.deepEqual(enclosedCells(ring), [{ col: 4, row: 4 }]);
    assert.deepEqual(
      enclosedCells(cardWith([...ring.cells.filter((cell) => !(cell.col === 3 && cell.row === 4))])),
      [],
    );
  });
});

void describe("details of a chamber that opens onto the axis", () => {
  void test("a room reached only by going left from the open axis is outside, not a hole", () => {
    // Walls: top row 2 and bottom row 6 (columns 1 to 4), left column 1 (rows 2 to 6). The room is columns 2 to 4,
    // rows 3 to 5, and it opens east onto column 5, which touches the axis and is empty all the way down.
    const wall = (cols: readonly number[], rows: readonly number[]): SymmetryCell[] =>
      rows.flatMap((row) => cols.map((col) => ({ col, row, color: "black" as const })));
    const template: SymmetryTemplate = {
      id: "komnata",
      holeColor: "blue",
      categories: ["budowle"],
      width: 6,
      height: 8,
      base: [...wall([1, 2, 3, 4], [2, 6]), ...wall([1], [3, 4, 5])],
      parts: [],
    };

    assert.deepEqual(composeSymmetryCard(template, [], 0, LAT5).details, []);
  });

  void test("closing the room with a wall on the axis side makes the same room a hole", () => {
    const template: SymmetryTemplate = {
      id: "komnata",
      holeColor: "blue",
      categories: ["budowle"],
      width: 6,
      height: 8,
      base: [
        ...[1, 2, 3, 4, 5].flatMap((col) => [2, 6].map((row) => ({ col, row, color: "black" as const }))),
        ...[3, 4, 5].flatMap((row) => [1, 5].map((col) => ({ col, row, color: "black" as const }))),
      ],
      parts: [],
    };
    const holes = composeSymmetryCard(template, [], 0, LAT5).details;

    assert.equal(holes.length, 9);
    assert.deepEqual(holes[0], { col: 2, row: 3, color: "blue" });
  });
});

void describe("details at the edges of the grid", () => {
  const base = cardWith([{ col: 5, row: 2, color: "red" }]);
  const withDetail = (col: number, row: number): readonly string[] =>
    symmetryCardProblems({ ...base, details: [{ col, row, color: "blue" }] });

  void test("the first column and the first row are inside the grid", () => {
    assert.deepEqual(withDetail(0, 3), []);
    assert.deepEqual(withDetail(4, 0), []);
    assert.deepEqual(withDetail(4, 15), []);
  });

  void test("a column or row just outside the grid, or between grid lines, is outside the grid", () => {
    assert.deepEqual(withDetail(-1, 3), ["outside-grid"]);
    assert.deepEqual(withDetail(12, 3), ["outside-grid"]);
    assert.deepEqual(withDetail(4, -1), ["outside-grid"]);
    assert.deepEqual(withDetail(4, 16), ["outside-grid"]);
    assert.deepEqual(withDetail(1.5, 3), ["outside-grid"]);
    assert.deepEqual(withDetail(4, 2.5), ["outside-grid"]);
  });
});
