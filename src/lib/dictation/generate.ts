import {
  DEFAULT_OBJECT_CATEGORY_ID,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
  type SymmetryTemplate,
} from "../symmetry/templates.ts";
import type { DictationLevel, DictationLevelId } from "./levels.ts";
import {
  dictationSilhouette,
  outlineProblems,
  traceOutline,
  walkCommands,
  type DictationCell,
  type DictationCommand,
  type DictationDirection,
  type DictationSilhouette,
} from "./outline.ts";

export interface DictationCard {
  levelId: DictationLevelId;
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** Grid vertex (0..columns, 0..rows) where the child puts the pencil down; the first command leaves it. */
  start: { col: number; row: number };
  /** The outline as runs along grid lines, clockwise, ending back at `start`. */
  commands: readonly DictationCommand[];
  /** Cells of the silhouette on the grid, for checks only. The sheet never draws them: they are the answer. */
  outline: readonly DictationCell[];
  /** Level and commands, so two cards with one key show the same outline (variants that differ only in holes share it). */
  key: string;
}

export type DictationProblem =
  | "no-commands"
  | "bad-length"
  | "same-direction"
  | "not-closed"
  | "repeated-vertex"
  | "outside-margin"
  | "not-the-outline";

interface DictationCatalog {
  total: number;
  passing: number;
  cards: readonly DictationCard[];
}

const DIRECTION_LETTER: Readonly<Record<DictationDirection, string>> = { right: "r", left: "l", up: "u", down: "d" };

/** One catalog per level and category, built on first use. */
const catalogs = new Map<string, DictationCatalog>();

/**
 * A card of the level whose outline differs from the one behind `previousKey`, drawn uniformly among the distinct
 * outlines the templates give. Null only when no other outline exists, so a single possible card cannot loop.
 */
export function generateDictationCard(
  random: () => number,
  previousKey: string | null,
  level: DictationLevel,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): DictationCard | null {
  const candidates = catalogFor(level, category).cards.filter((card) => card.key !== previousKey);
  if (candidates.length === 0) {
    return null;
  }
  return candidates[pick(random, candidates.length)];
}

/**
 * How many (template, variant) combinations the level has, how many of them give a drawable outline within the
 * command limit, and how many distinct outlines those are. For tests and notes; do not pin the numbers, the template catalog grows.
 */
export function dictationVariantCount(
  level: DictationLevel,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): {
  total: number;
  passing: number;
  distinctOutlines: number;
} {
  const catalog = catalogFor(level, category);
  return { total: catalog.total, passing: catalog.passing, distinctOutlines: catalog.cards.length };
}

/**
 * Every combination once per level and category, keeping only cards without `dictationCardProblems` within the command limit,
 * deduped by outline. A template that cannot be traced is skipped, so one broken template never breaks Generuj.
 */
function catalogFor(level: DictationLevel, category: ObjectCategoryChoiceId): DictationCatalog {
  const cacheKey = `${level.id}:${category}`;
  const cached = catalogs.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const byKey = new Map<string, DictationCard>();
  let total = 0;
  let passing = 0;
  for (const template of symmetryTemplatesFor(level.templateLevel, category)) {
    for (const variants of variantCombinations(template.parts.map((part) => part.variants.length))) {
      total += 1;
      const card = dictationCardFor(template, variants, level);
      if (card === null || card.commands.length > level.maxCommands || dictationCardProblems(card).length > 0) {
        continue;
      }
      passing += 1;
      if (!byKey.has(card.key)) {
        byKey.set(card.key, card);
      }
    }
  }
  const catalog = { total, passing, cards: [...byKey.values()] };
  catalogs.set(cacheKey, catalog);
  return catalog;
}

/**
 * The card for one template and one variant index per part, centered in the level grid, or null when the silhouette
 * breaks the outline rule, leaves no free cell around it, or cannot be traced. Does not check `dictationCardProblems`.
 */
export function dictationCardFor(
  template: SymmetryTemplate,
  variants: readonly number[],
  level: DictationLevel,
): DictationCard | null {
  const silhouette = dictationSilhouette(template, variants);
  const fits = silhouette.width <= level.columns - 2 && silhouette.height <= level.rows - 2;
  if (!fits || outlineProblems(silhouette).length > 0) {
    return null;
  }
  let traced: ReturnType<typeof traceOutline>;
  try {
    traced = traceOutline(silhouette);
  } catch {
    return null;
  }
  const key = `${level.id}:${traced.commands.map((command) => `${DIRECTION_LETTER[command.direction]}${command.length}`).join("-")}`;
  return placeOutline(silhouette, traced, key, level);
}

/** All index tuples for parts with the given variant counts (one empty tuple when there are no parts). */
export function variantCombinations(counts: readonly number[]): readonly (readonly number[])[] {
  return counts.reduce<readonly (readonly number[])[]>(
    (tuples, count) => tuples.flatMap((tuple) => Array.from({ length: count }, (_, index) => [...tuple, index])),
    [[]],
  );
}

/** Centers the outline in the grid; odd slack leaves the extra cell on the right and bottom. At least one cell stays free on every side. */
function placeOutline(
  silhouette: DictationSilhouette,
  traced: ReturnType<typeof traceOutline>,
  key: string,
  level: DictationLevel,
): DictationCard {
  const offsetCol = Math.floor((level.columns - silhouette.width) / 2);
  const offsetRow = Math.floor((level.rows - silhouette.height) / 2);
  return {
    levelId: level.id,
    columns: level.columns,
    rows: level.rows,
    cellSize: level.cellSize,
    start: { col: traced.start.x + offsetCol, row: traced.start.y + offsetRow },
    commands: traced.commands,
    outline: silhouette.cells.map((cell) => ({ col: cell.col + offsetCol, row: cell.row + offsetRow })),
    key,
  };
}

/**
 * The PRD rules for a dictation card. An empty list means the card may be shown: the commands are whole runs that
 * turn at every step, walk back to the start without crossing themselves, keep one free cell around the grid edge,
 * and draw exactly the boundary of the silhouette, clockwise.
 */
export function dictationCardProblems(card: DictationCard): readonly DictationProblem[] {
  const problems = new Set<DictationProblem>();
  const { commands } = card;
  if (commands.length === 0) {
    problems.add("no-commands");
  }
  if (commands.some((command) => !Number.isInteger(command.length) || command.length < 1)) {
    problems.add("bad-length");
  }
  // Compared around the corner too: the last command meets the first at the start.
  if (commands.some((command, index) => command.direction === commands[(index + 1) % commands.length].direction)) {
    problems.add("same-direction");
  }

  const start = { x: card.start.col, y: card.start.row };
  const vertices = walkCommands(start, commands);
  const end = vertices[vertices.length - 1];
  if (end.x !== start.x || end.y !== start.y) {
    problems.add("not-closed");
  }
  const seen = new Set<string>();
  // The closing step lands on the start again, which is not a repeat.
  for (const vertex of vertices.slice(0, end.x === start.x && end.y === start.y ? -1 : undefined)) {
    const place = `${vertex.x},${vertex.y}`;
    if (seen.has(place)) {
      problems.add("repeated-vertex");
    }
    seen.add(place);
  }
  if (
    vertices.some((vertex) => vertex.x < 1 || vertex.x > card.columns - 1 || vertex.y < 1 || vertex.y > card.rows - 1)
  ) {
    problems.add("outside-margin");
  }

  const walked = directedEdges(vertices);
  const boundary = silhouetteEdges(card.outline);
  if (walked.length !== boundary.size || walked.some((edge) => !boundary.has(edge))) {
    problems.add("not-the-outline");
  }
  return [...problems];
}

/** Each unit step as "x,y>x,y", in the order walked. */
function directedEdges(vertices: readonly { x: number; y: number }[]): readonly string[] {
  return vertices.slice(1).map((vertex, index) => `${vertices[index].x},${vertices[index].y}>${vertex.x},${vertex.y}`);
}

/** The clockwise unit edges around the cells, only where the neighbor is empty: the object is on the right of each. */
function silhouetteEdges(cells: readonly DictationCell[]): Set<string> {
  const filled = new Set(cells.map((cell) => `${cell.col},${cell.row}`));
  const edges = new Set<string>();
  for (const { col, row } of cells) {
    if (!filled.has(`${col},${row - 1}`)) {
      edges.add(`${col},${row}>${col + 1},${row}`);
    }
    if (!filled.has(`${col + 1},${row}`)) {
      edges.add(`${col + 1},${row}>${col + 1},${row + 1}`);
    }
    if (!filled.has(`${col},${row + 1}`)) {
      edges.add(`${col + 1},${row + 1}>${col},${row + 1}`);
    }
    if (!filled.has(`${col - 1},${row}`)) {
      edges.add(`${col},${row + 1}>${col},${row}`);
    }
  }
  return edges;
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
