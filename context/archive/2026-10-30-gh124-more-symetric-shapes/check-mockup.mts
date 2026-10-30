// Checks a mockup (mockup-drawings.json) against the catalog rules and measures nonogram and dictation yield.
// Usage: node --experimental-strip-types check-mockup.mts [mockup.json] [--baseline]
// Not part of the product build; run it from the repo root.
import fs from "node:fs";
import { symmetryTemplatesFor } from "../../../src/lib/symmetry/templates.ts";
import { drawing } from "../../../src/lib/symmetry/template-format.ts";
import type { SymmetryCell, SymmetryTemplate } from "../../../src/lib/symmetry/template-format.ts";
import { composeSymmetryCard, symmetryCardProblems } from "../../../src/lib/symmetry/generate.ts";
import { SYMMETRY_LEVELS } from "../../../src/lib/symmetry/levels.ts";
import type { SymmetryLevelId } from "../../../src/lib/symmetry/levels.ts";
import { composeNonogramCard, nonogramCardProblems } from "../../../src/lib/nonogram/generate.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems } from "../../../src/lib/nonogram/simple.ts";
import { NONOGRAM_SIZES } from "../../../src/lib/nonogram/sizes.ts";
import { solveLine, type CellState } from "../../../src/lib/nonogram/solve.ts";
import { dictationCardFor, dictationCardProblems } from "../../../src/lib/dictation/generate.ts";
import { DICTATION_LEVELS } from "../../../src/lib/dictation/levels.ts";

type SizeKey = "half4" | "half6" | "half9";
const LEVEL_OF: Record<SizeKey, SymmetryLevelId> = { half4: "lat4", half6: "lat5", half9: "lat7" };

interface MockVariant {
  top?: number;
  left?: number;
  lines: string[];
}
interface MockAddition extends MockVariant {
  object: string;
  size: SizeKey;
  part: string;
}
interface MockObject {
  id: string;
  categories: string[];
  holeColor: string | null;
  sizes: Record<SizeKey, { width: number; height: number; base: string[]; parts: { id: string; variants: MockVariant[] }[] }>;
}
interface Mockup {
  variants?: MockAddition[];
  objects?: MockObject[];
}

const args = process.argv.slice(2);
const baseline = args.includes("--baseline");
const path = args.find((arg) => !arg.startsWith("--")) ?? "context/changes/gh124-more-symetric-shapes/mockup-drawings.json";
const mock: Mockup = baseline ? {} : (JSON.parse(fs.readFileSync(path, "utf8")) as Mockup);

function patched(size: SizeKey): SymmetryTemplate[] {
  const templates = symmetryTemplatesFor(LEVEL_OF[size]).map((template) => ({
    ...template,
    parts: template.parts.map((part) => ({ ...part, variants: [...part.variants] })),
  })) as SymmetryTemplate[];
  for (const add of (mock.variants ?? []).filter((entry) => entry.size === size)) {
    const template = templates.find((candidate) => candidate.id === add.object);
    const part = template?.parts.find((candidate) => candidate.id === add.part);
    if (template === undefined || part === undefined) {
      throw new Error(`No ${add.object}/${add.part} in ${size}`);
    }
    (part.variants as unknown as SymmetryCell[][]).push(drawing(add.lines, add.top ?? 0, add.left ?? 0));
  }
  for (const object of mock.objects ?? []) {
    const spec = object.sizes[size];
    templates.push({
      id: object.id,
      width: spec.width,
      height: spec.height,
      holeColor: object.holeColor as SymmetryTemplate["holeColor"],
      categories: object.categories as SymmetryTemplate["categories"],
      base: drawing(spec.base),
      parts: spec.parts.map((part) => ({
        id: part.id,
        variants: part.variants.map((variant) => drawing(variant.lines, variant.top ?? 0, variant.left ?? 0)),
      })),
    });
  }
  return templates;
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

const stallArg = args.find((arg) => arg.startsWith("--stall="));
if (stallArg !== undefined) {
  const [object, sizeKey, setText] = stallArg.slice(8).split(":");
  const template = patched(sizeKey as SizeKey).find((candidate) => candidate.id === object)!;
  const size = NONOGRAM_SIZES.find((candidate) => candidate.templateLevel === LEVEL_OF[sizeKey as SizeKey])!;
  const card = composeNonogramCard(template, setText.split("-").map(Number), size);
  const known: CellState[][] = card.solution.map((row) => row.map(() => "unknown" as CellState));
  for (let changed = true; changed; ) {
    changed = false;
    for (let r = 0; r < card.rows; r += 1) {
      solveLine(known[r], card.clues.rows[r])?.forEach((state, c) => {
        if (known[r][c] !== state) { known[r][c] = state; changed = true; }
      });
    }
    for (let c = 0; c < card.columns; c += 1) {
      solveLine(known.map((row) => row[c]), card.clues.columns[c])?.forEach((state, r) => {
        if (known[r][c] !== state) { known[r][c] = state; changed = true; }
      });
    }
  }
  card.solution.forEach((row, r) => console.log(String(r).padStart(2), row.map((v, c) => (known[r][c] === "unknown" ? "?" : v ? "#" : ".")).join("")));
  process.exit(0);
}
const watched = new Set([
  ...(mock.variants ?? []).map((entry) => entry.object),
  ...(mock.objects ?? []).map((object) => object.id),
  ...(baseline ? ["kot", "tulipan", "pingwin", "ananas", "choinka", "latarnia", "truskawka"] : []),
]);
let errors = 0;
const fail = (message: string): void => {
  errors += 1;
  console.log(`  ERROR ${message}`);
};

for (const size of ["half4", "half6", "half9"] as const) {
  const levelId = LEVEL_OF[size];
  const symLevel = SYMMETRY_LEVELS.find((level) => level.id === levelId)!;
  const nonoSize = NONOGRAM_SIZES.find((candidate) => candidate.templateLevel === levelId)!;
  const dictLevels = DICTATION_LEVELS.filter((level) => (levelId === "lat5" ? level.templateLevel === "lat5" || level.templateLevel === "lat6" : level.templateLevel === levelId));
  console.log(`== ${size} (${levelId}), nonogram ${nonoSize.id}, dictation ${dictLevels.map((level) => level.id).join("+")}`);
  for (const template of patched(size)) {
    if (!watched.has(template.id)) {
      continue;
    }
    const sets = combos(template);
    // Symmetry: valid card for every set at offset 0, different pictures.
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
      pictures.add([...silhouette(template, set)].sort().join("|") + JSON.stringify(template.parts.map((p, i) => p.variants[set[i]].map((c) => c.color))));
    }
    if (symmetryBad > 0) fail(`${template.id} ${size}: ${symmetryBad} sets give an invalid symmetry card (${[...seenProblems].join(", ")})`);
    if (pictures.size < sets.length) fail(`${template.id} ${size}: only ${pictures.size} different pictures in ${sets.length} sets`);
    if (size === "half4") {
      const axisCells = template.base.filter((cell) => cell.col === template.width - 1).length;
      if (axisCells < 3) fail(`${template.id} half4: ${axisCells} base cells on the axis`);
    }
    const clean = sets.filter((set) => cleanOutline(silhouette(template, set))).length;
    if (clean === 0 && template.id !== "truskawka") fail(`${template.id} ${size}: no set with a clean outline`);
    // Nonogram.
    let nonoPass = 0;
    for (const set of sets) {
      const problems =
        nonoSize.kind === "znaczki"
          ? simpleNonogramProblems(composeSimpleNonogramCard(template, set, nonoSize))
          : nonogramCardProblems(composeNonogramCard(template, set, nonoSize));
      if (problems.length === 0) nonoPass += 1;
    }
    // Dictation: distinct outlines per level.
    const dict = dictLevels.map((level) => {
      const keys = new Set<string>();
      for (const set of sets) {
        const card = dictationCardFor(template, set, level);
        if (card !== null && card.commands.length <= level.maxCommands && dictationCardProblems(card).length === 0) {
          keys.add(card.key);
        }
      }
      return `${level.id}:${keys.size}`;
    });
    console.log(
      `${template.id.padEnd(10)} sets ${String(sets.length).padStart(3)} clean ${String(clean).padStart(3)} | nonogram ${nonoPass}/${sets.length} | dictation outlines ${dict.join(" ")}`,
    );
  }
}
console.log(errors === 0 ? "RESULT: 0 errors" : `RESULT: ${errors} errors`);
process.exitCode = errors === 0 ? 0 : 1;
