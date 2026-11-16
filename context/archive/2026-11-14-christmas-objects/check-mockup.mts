// Checks the S-38 mockup (mockup-drawings.json) against the catalog rules and measures nonogram and dictation yield.
// Objects: symmetry card, one piece without a corner touch (outer outline; holes may touch by a corner), nonogram (easy, medium, hard), distinct dictation outlines.
// Shapes: a valid dictation outline at every drawn level, plain and mirrored, within the command limit.
// Usage (from the repo root): node --experimental-strip-types context/changes/christmas-objects/check-mockup.mts [mockup.json]
// Writes the measurement to mockup-measure.txt next to the mockup. Not part of the product build.
// Moved from context/archive/2026-10-30-gh124-more-symetric-shapes/check-mockup.mts and extended with dictation shapes.
import fs from "node:fs";
import nodePath from "node:path";
import { drawing } from "../../../src/lib/symmetry/template-format.ts";
import type { SymmetryTemplate } from "../../../src/lib/symmetry/template-format.ts";
import { composeSymmetryCard, symmetryCardProblems } from "../../../src/lib/symmetry/generate.ts";
import { SYMMETRY_LEVELS } from "../../../src/lib/symmetry/levels.ts";
import type { SymmetryLevelId } from "../../../src/lib/symmetry/levels.ts";
import { composeNonogramCard, nonogramCardProblems } from "../../../src/lib/nonogram/generate.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems } from "../../../src/lib/nonogram/simple.ts";
import { NONOGRAM_SIZES } from "../../../src/lib/nonogram/sizes.ts";
import {
  dictationCardFor,
  dictationCardFromSilhouette,
  dictationCardProblems,
} from "../../../src/lib/dictation/generate.ts";
import { DICTATION_LEVELS, type DictationLevelId } from "../../../src/lib/dictation/levels.ts";
import { outlineProblems, silhouetteOfCells, type DictationCell } from "../../../src/lib/dictation/outline.ts";

type SizeKey = "half4" | "half6" | "half9";
const LEVEL_OF: Record<SizeKey, SymmetryLevelId> = { half4: "lat4", half6: "lat5", half9: "lat7" };
const KNOWN_CATEGORIES = ["zwierzeta", "jedzenie", "przyroda", "kosmos", "budowle", "ksztalty", "boze-narodzenie"];

interface MockVariant {
  top?: number;
  left?: number;
  lines: string[];
}
interface MockObject {
  id: string;
  name: string;
  categories: string[];
  holeColor: string | null;
  sizes: Record<
    SizeKey,
    { width: number; height: number; base: string[]; parts: { id: string; variants: MockVariant[] }[] }
  >;
}
interface MockShape {
  name: string;
  categories: string[];
  levels: Partial<Record<DictationLevelId, { rows: string[] }>>;
}
interface Mockup {
  objects?: MockObject[];
  shapes?: Record<string, MockShape>;
}

const args = process.argv.slice(2);
const mockPath = args.find((arg) => !arg.startsWith("--")) ?? "context/changes/christmas-objects/mockup-drawings.json";
const mock = JSON.parse(fs.readFileSync(mockPath, "utf8")) as Mockup;
const out: string[] = [];
const log = (line: string): void => {
  out.push(line);
  console.log(line);
};
let errors = 0;
const fail = (message: string): void => {
  errors += 1;
  log(`  ERROR ${message}`);
};

function templateOf(object: MockObject, size: SizeKey): SymmetryTemplate {
  const spec = object.sizes[size];
  return {
    id: object.id,
    width: spec.width,
    height: spec.height,
    holeColor: object.holeColor as SymmetryTemplate["holeColor"],
    categories: object.categories as unknown as SymmetryTemplate["categories"],
    base: drawing(spec.base),
    parts: spec.parts.map((part) => ({
      id: part.id,
      variants: part.variants.map((variant) => drawing(variant.lines, variant.top ?? 0, variant.left ?? 0)),
    })),
  };
}

function combos(template: SymmetryTemplate): number[][] {
  let sets: number[][] = [[]];
  for (const part of template.parts) {
    sets = sets.flatMap((set) => part.variants.map((_, index) => [...set, index]));
  }
  return sets;
}

function silhouette(template: SymmetryTemplate, variants: readonly number[]): Set<string> {
  const cells = [...template.base, ...template.parts.flatMap((part, index) => part.variants[variants[index]])];
  const places = new Set<string>();
  for (const cell of cells) {
    places.add(`${cell.col},${cell.row}`);
    places.add(`${2 * template.width - 1 - cell.col},${cell.row}`);
  }
  return places;
}

/** One piece (4-neighbours) and no two cells touching only by a corner. */
function withHolesFilled(places: ReadonlySet<string>): Set<string> {
  const cols = [...places].map((place) => Number(place.split(",")[0]));
  const rows = [...places].map((place) => Number(place.split(",")[1]));
  const [left, right, top, bottom] = [
    Math.min(...cols) - 1,
    Math.max(...cols) + 1,
    Math.min(...rows) - 1,
    Math.max(...rows) + 1,
  ];
  const outside = new Set([`${left},${top}`]);
  const queue = [[left, top]];
  for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
    for (const [col, row] of [
      [next[0] + 1, next[1]],
      [next[0] - 1, next[1]],
      [next[0], next[1] + 1],
      [next[0], next[1] - 1],
    ]) {
      const key = `${col},${row}`;
      if (col >= left && col <= right && row >= top && row <= bottom && !places.has(key) && !outside.has(key)) {
        outside.add(key);
        queue.push([col, row]);
      }
    }
  }
  const filled = new Set(places);
  for (let row = top; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      if (!outside.has(`${col},${row}`)) filled.add(`${col},${row}`);
    }
  }
  return filled;
}

function cleanOutline(places: ReadonlySet<string>): boolean {
  const filled = (col: number, row: number): boolean => places.has(`${col},${row}`);
  for (const place of places) {
    const [col, row] = place.split(",").map(Number);
    for (const side of [-1, 1]) {
      if (filled(col + side, row + 1) && !filled(col + side, row) && !filled(col, row + 1)) {
        return false;
      }
    }
  }
  const [first] = places;
  const reached = new Set([first]);
  const queue = [first];
  for (let place = queue.pop(); place !== undefined; place = queue.pop()) {
    const [col, row] = place.split(",").map(Number);
    for (const next of [`${col + 1},${row}`, `${col - 1},${row}`, `${col},${row + 1}`, `${col},${row - 1}`]) {
      if (places.has(next) && !reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached.size === places.size;
}

/** Cells of the drawing that sit outside the frame or on top of another cell (base and parts share no cell). */
function frameProblems(template: SymmetryTemplate, set: readonly number[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const cells = [...template.base, ...template.parts.flatMap((part, index) => part.variants[set[index]])];
  for (const cell of cells) {
    const key = `${cell.col},${cell.row}`;
    if (cell.col < 0 || cell.col >= template.width || cell.row < 0 || cell.row >= template.height) {
      problems.push(`cell ${key} outside the ${template.width}x${template.height} frame`);
    }
    if (seen.has(key)) {
      problems.push(`cell ${key} drawn twice`);
    }
    seen.add(key);
  }
  return problems;
}

log(`Mockup: ${mockPath}`);
log("Objects: sets = part combinations; clean = one piece without a corner touch; nonogram = sets with one solution");
log("without guessing (easy: chip rules); dictation = distinct outlines within the command limit.");

for (const object of mock.objects ?? []) {
  if (object.categories.length === 0 || object.categories.some((id) => !KNOWN_CATEGORIES.includes(id))) {
    fail(`${object.id}: categories ${JSON.stringify(object.categories)}`);
  }
  if (!object.categories.includes("boze-narodzenie")) {
    fail(`${object.id}: not in boze-narodzenie`);
  }
}

for (const size of ["half4", "half6", "half9"] as const) {
  const levelId = LEVEL_OF[size];
  const symLevel = SYMMETRY_LEVELS.find((level) => level.id === levelId)!;
  const nonoSize = NONOGRAM_SIZES.find((candidate) => candidate.templateLevel === levelId)!;
  const dictLevels = DICTATION_LEVELS.filter((level) =>
    levelId === "lat5"
      ? level.templateLevel === "lat5" || level.templateLevel === "lat6"
      : level.templateLevel === levelId,
  );
  log("");
  log(
    `== ${size} (symmetry ${levelId}), nonogram ${nonoSize.id}, dictation ${dictLevels.map((level) => level.id).join("+")}`,
  );
  for (const object of mock.objects ?? []) {
    const template = templateOf(object, size);
    const sets = combos(template);
    const frame = sets.flatMap((set) => frameProblems(template, set));
    if (frame.length > 0) fail(`${object.id} ${size}: ${[...new Set(frame)].join("; ")}`);
    // Symmetry: a valid card for every set at offset 0, and every set a different picture.
    const pictures = new Set<string>();
    let symmetryBad = 0;
    const seenProblems = new Set<string>();
    for (const set of sets) {
      const card = composeSymmetryCard(template, set, 0, symLevel);
      const found = symmetryCardProblems(card);
      if (found.length > 0) {
        found.forEach((problem) => seenProblems.add(problem));
        symmetryBad += 1;
      }
      pictures.add(
        [...silhouette(template, set)].sort().join("|") +
          JSON.stringify(template.parts.map((part, index) => part.variants[set[index]].map((cell) => cell.color))),
      );
    }
    if (symmetryBad > 0)
      fail(`${object.id} ${size}: ${symmetryBad} sets give an invalid symmetry card (${[...seenProblems].join(", ")})`);
    if (pictures.size < sets.length)
      fail(`${object.id} ${size}: only ${pictures.size} different pictures in ${sets.length} sets`);
    if (size === "half4") {
      // Poziom 1 shows 3 hint cells, picked from the pattern cells on the axis (pickHints), base and parts alike.
      const fewest = Math.min(
        ...sets.map(
          (set) =>
            [...template.base, ...template.parts.flatMap((part, index) => part.variants[set[index]])].filter(
              (cell) => cell.col === template.width - 1,
            ).length,
        ),
      );
      if (fewest < 3) fail(`${object.id} half4: a set has only ${fewest} cells on the axis`);
    }
    // templates.test.ts: some set is one piece without a corner touch, holes included. Every set: the outer outline
    // (holes filled, as the dictation traces it) is one piece without a corner touch; a corner touch between two
    // cells around a hole (a zigzag of holes) is allowed, since no card draws it as a line.
    const clean = sets.filter((set) => cleanOutline(silhouette(template, set))).length;
    if (clean === 0) fail(`${object.id} ${size}: no set is one piece without a corner touch`);
    const outlined = sets.filter((set) => cleanOutline(withHolesFilled(silhouette(template, set)))).length;
    if (outlined < sets.length)
      fail(
        `${object.id} ${size}: ${sets.length - outlined} sets have an outer outline in pieces or touching by a corner`,
      );
    // Nonogram.
    let nonoPass = 0;
    for (const set of sets) {
      const problems =
        nonoSize.kind === "znaczki"
          ? simpleNonogramProblems(composeSimpleNonogramCard(template, set, nonoSize))
          : nonogramCardProblems(composeNonogramCard(template, set, nonoSize));
      if (problems.length === 0) nonoPass += 1;
    }
    if (nonoSize.kind === "liczby" && nonoPass === 0)
      fail(`${object.id} ${size}: no set passes the ${nonoSize.id} nonogram`);
    if (nonoSize.kind === "znaczki" && nonoPass === 0) fail(`${object.id} ${size}: no set passes the easy nonogram`);
    // Dictation: distinct outlines per level.
    const dict = dictLevels.map((level) => {
      const keys = new Set<string>();
      let longest = 0;
      for (const set of sets) {
        const card = dictationCardFor(template, set, level);
        if (card !== null && card.commands.length <= level.maxCommands && dictationCardProblems(card).length === 0) {
          keys.add(card.key);
          longest = Math.max(longest, card.commands.length);
        }
      }
      if (keys.size === 0) fail(`${object.id} ${size}: no dictation outline at ${level.id}`);
      return `${level.id}:${keys.size} (max ${longest} commands)`;
    });
    log(
      `${object.id.padEnd(9)} sets ${String(sets.length).padStart(3)} clean ${String(clean).padStart(3)} | nonogram ${nonoSize.id} ${nonoPass}/${sets.length} | dictation outlines ${dict.join(" ")}`,
    );
  }
}

log("");
log("== dictation shapes: commands plain / mirrored at every drawn level (limit per level in brackets)");
for (const [id, shape] of Object.entries(mock.shapes ?? {})) {
  if (shape.categories.length === 0 || shape.categories.some((category) => !KNOWN_CATEGORIES.includes(category))) {
    fail(`${id}: categories ${JSON.stringify(shape.categories)}`);
  }
  if (!shape.categories.includes("boze-narodzenie")) fail(`${id}: not in boze-narodzenie`);
  const parts: string[] = [];
  for (const level of DICTATION_LEVELS) {
    const drawn = shape.levels[level.id];
    if (drawn === undefined) {
      continue;
    }
    const width = drawn.rows[0].length;
    if (drawn.rows.some((row) => row.length !== width || /[^#.]/.test(row))) {
      fail(`${id} ${level.id}: rows of different length or letters other than # and .`);
      continue;
    }
    const counts: number[] = [];
    const keys: string[] = [];
    for (const mirrored of [false, true]) {
      const cells: DictationCell[] = [];
      drawn.rows.forEach((line, row) => {
        for (let col = 0; col < line.length; col += 1) {
          if (line.charAt(col) === "#") cells.push({ col: mirrored ? width - 1 - col : col, row });
        }
      });
      const label = `${id} ${level.id} ${mirrored ? "mirrored" : "plain"}`;
      const shapeSilhouette = silhouetteOfCells(cells, width, drawn.rows.length);
      const outline = outlineProblems(shapeSilhouette);
      if (outline.length > 0) {
        fail(`${label}: ${outline.join(", ")}`);
        continue;
      }
      if (shapeSilhouette.width > level.columns - 2 || shapeSilhouette.height > level.rows - 2) {
        fail(
          `${label}: ${shapeSilhouette.width}x${shapeSilhouette.height} does not fit the ${level.columns}x${level.rows} grid with a free ring`,
        );
        continue;
      }
      const card = dictationCardFromSilhouette(shapeSilhouette, level);
      if (card === null) {
        fail(`${label}: no card`);
        continue;
      }
      const problems = dictationCardProblems(card);
      if (problems.length > 0) fail(`${label}: ${problems.join(", ")}`);
      if (card.commands.length > level.maxCommands)
        fail(`${label}: ${card.commands.length} commands, limit ${level.maxCommands}`);
      counts.push(card.commands.length);
      keys.push(card.key);
    }
    if (keys.length === 2 && keys[0] === keys[1]) fail(`${id} ${level.id}: symmetric, the mirror is the same outline`);
    parts.push(`${level.id} ${width}x${drawn.rows.length}: ${counts.join("/")} [${level.maxCommands}]`);
  }
  if (parts.length === 0) fail(`${id}: no level drawn`);
  log(`${id.padEnd(16)} ${shape.categories.join("+").padEnd(26)} ${parts.join(" | ")}`);
}

log("");
log(errors === 0 ? "RESULT: 0 errors" : `RESULT: ${errors} errors`);
fs.writeFileSync(nodePath.join(nodePath.dirname(mockPath), "mockup-measure.txt"), `${out.join("\n")}\n`);
process.exitCode = errors === 0 ? 0 : 1;
