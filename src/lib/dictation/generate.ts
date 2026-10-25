import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import type { DictationLevel } from "./levels.ts";
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
import { DICTATION_MAX_COMMANDS } from "./sheet.ts";

export interface DictationCard {
  levelId: DictationLevel["id"];
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

interface DictationOutline {
  key: string;
  silhouette: DictationSilhouette;
  start: { x: number; y: number };
  commands: readonly DictationCommand[];
}

interface DictationCatalog {
  total: number;
  passing: number;
  outlines: readonly DictationOutline[];
}

const DIRECTION_LETTER: Readonly<Record<DictationDirection, string>> = { right: "r", left: "l", up: "u", down: "d" };

const catalogs = new WeakMap<DictationLevel, DictationCatalog>();

/**
 * A card of the level whose outline differs from the one behind `previousKey`, drawn uniformly among the distinct
 * outlines the templates give. Null only when no other outline exists, so a single possible card cannot loop.
 */
export function generateDictationCard(
  random: () => number,
  previousKey: string | null,
  level: DictationLevel,
): DictationCard | null {
  const candidates = catalogFor(level).outlines.filter((outline) => outline.key !== previousKey);
  if (candidates.length === 0) {
    return null;
  }
  return placeOutline(candidates[pick(random, candidates.length)], level);
}

/**
 * How many (template, variant) combinations the level has, how many of them give a drawable outline within the
 * command limit, and how many distinct outlines those are. For tests and notes; do not pin the numbers, the template catalog grows.
 */
export function dictationVariantCount(level: DictationLevel): {
  total: number;
  passing: number;
  distinctOutlines: number;
} {
  const catalog = catalogFor(level);
  return { total: catalog.total, passing: catalog.passing, distinctOutlines: catalog.outlines.length };
}

/** Every combination once per level: those that pass the outline rule, fit the grid and the sheet, deduped by outline. */
function catalogFor(level: DictationLevel): DictationCatalog {
  const cached = catalogs.get(level);
  if (cached !== undefined) {
    return cached;
  }
  const byKey = new Map<string, DictationOutline>();
  let total = 0;
  let passing = 0;
  for (const template of symmetryTemplatesFor(level.templateLevel)) {
    for (const variants of variantCombinations(template.parts.map((part) => part.variants.length))) {
      total += 1;
      const silhouette = dictationSilhouette(template, variants);
      const fits = silhouette.width <= level.columns - 2 && silhouette.height <= level.rows - 2;
      if (!fits || outlineProblems(silhouette).length > 0) {
        continue;
      }
      const { start, commands } = traceOutline(silhouette);
      if (commands.length > DICTATION_MAX_COMMANDS) {
        continue;
      }
      passing += 1;
      const key = `${level.id}:${commands.map((command) => `${DIRECTION_LETTER[command.direction]}${command.length}`).join("-")}`;
      if (!byKey.has(key)) {
        byKey.set(key, { key, silhouette, start, commands });
      }
    }
  }
  const catalog = { total, passing, outlines: [...byKey.values()] };
  catalogs.set(level, catalog);
  return catalog;
}

/** All index tuples for parts with the given variant counts (one empty tuple when there are no parts). */
function variantCombinations(counts: readonly number[]): readonly (readonly number[])[] {
  return counts.reduce<readonly (readonly number[])[]>(
    (tuples, count) => tuples.flatMap((tuple) => Array.from({ length: count }, (_, index) => [...tuple, index])),
    [[]],
  );
}

/** Centers the outline in the grid; odd slack leaves the extra cell on the right and bottom. At least one cell stays free on every side. */
function placeOutline(outline: DictationOutline, level: DictationLevel): DictationCard {
  const offsetCol = Math.floor((level.columns - outline.silhouette.width) / 2);
  const offsetRow = Math.floor((level.rows - outline.silhouette.height) / 2);
  return {
    levelId: level.id,
    columns: level.columns,
    rows: level.rows,
    cellSize: level.cellSize,
    start: { col: outline.start.x + offsetCol, row: outline.start.y + offsetRow },
    commands: outline.commands,
    outline: outline.silhouette.cells.map((cell) => ({ col: cell.col + offsetCol, row: cell.row + offsetRow })),
    key: outline.key,
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
