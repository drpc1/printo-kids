import { pick, shuffle } from "../sequence/random.ts";
import { SUDOKU_SHAPES_4 } from "../sudoku/shapes.ts";
import { ICON_CATEGORIES, iconsOfCategory, type Icon } from "./icons.ts";
import { rulesFor, type OddOneOutLevel, type OddRule } from "./levels.ts";
import {
  loners,
  MAX_COUNT,
  MIN_COUNT,
  ODD_CRAYONS,
  oddOneOutCardProblems,
  oddOneOutRowProblems,
  rowContentKey,
  rowKey,
  type OddCrayon,
  type OddItem,
  type OddOneOutCard,
  type OddRow,
} from "./rules.ts";

export type { OddItem, OddOneOutCard, OddRow } from "./rules.ts";

export const MAX_ATTEMPTS = 50;
const MAX_ROW_ATTEMPTS = 50;
const MAX_DISTINCT_ROW_ATTEMPTS = 20;

type Size = OddItem["size"];
const SIZES: readonly Size[] = ["big", "small"];

/** `n` values in random order, each of them at least twice (pairs; an odd `n` gets one group of three). */
function inPairs<T>(random: () => number, values: readonly T[], n: number): T[] {
  const chosen = shuffle(random, [...values]).slice(0, Math.floor(n / 2));
  return shuffle(
    random,
    Array.from({ length: n }, (_, index) => chosen[Math.min(Math.floor(index / 2), chosen.length - 1)]),
  );
}

function plainItem(): OddItem {
  return { shape: "circle", icon: null, size: "big", count: 1, crayon: null };
}

function categoryRow(random: () => number, level: OddOneOutLevel, odd: number): OddItem[] {
  const [major, minor] = shuffle(random, [...ICON_CATEGORIES]);
  const many = shuffle(random, [...iconsOfCategory(major)]).slice(0, level.itemCount - 1);
  const one: Icon = iconsOfCategory(minor)[pick(random, iconsOfCategory(minor).length)];
  let next = 0;
  // Icons stay black, so size is the only feature that can vary in pairs.
  const sizes = level.distractors > 0 ? inPairs(random, SIZES, level.itemCount) : null;
  return Array.from({ length: level.itemCount }, (_, index) => ({
    shape: null,
    icon: (index === odd ? one : many[next++]).id,
    size: sizes === null ? "big" : sizes[index],
    count: 1,
    crayon: null,
  }));
}

function shapeRow(random: () => number, level: OddOneOutLevel, rule: OddRule, colors: boolean, odd: number): OddItem[] {
  const n = level.itemCount;
  const [common, other] = shuffle(random, [...SUDOKU_SHAPES_4]);
  const crayon: OddCrayon | null = colors ? ODD_CRAYONS[pick(random, ODD_CRAYONS.length)] : null;
  let items: OddItem[] = Array.from({ length: n }, () => ({ ...plainItem(), shape: common, crayon }));

  if (rule === "shape") {
    items[odd] = { ...items[odd], shape: other };
  } else if (rule === "size") {
    const majority: Size = random() < 0.7 ? "big" : "small";
    const minority: Size = majority === "big" ? "small" : "big";
    items = items.map((item, index) => ({ ...item, size: index === odd ? minority : majority }));
  } else if (rule === "count") {
    const group = level.counts[pick(random, level.counts.length)];
    const neighbours = [group - 1, group + 1].filter((value) => value >= MIN_COUNT && value <= MAX_COUNT);
    const differing = neighbours[pick(random, neighbours.length)];
    items = items.map((item, index) => ({ ...item, count: index === odd ? differing : group }));
  } else if (rule === "color") {
    const [majority, minority] = shuffle(random, [...ODD_CRAYONS]);
    items = items.map((item, index) => ({ ...item, crayon: index === odd ? minority : majority }));
  }

  // Distractors: other features that vary in pairs. The count is never one. Color goes first, as it is the easiest to
  // see past. Fewer than the level allows is fine when fewer features are free.
  const free = shuffle(
    random,
    (["color", "shape", "size"] as const).filter((feature) => feature !== rule && (feature !== "color" || colors)),
  ).sort((left, right) => Number(right === "color") - Number(left === "color"));
  for (const feature of free.slice(0, level.distractors)) {
    if (feature === "color") {
      const spread = inPairs(random, ODD_CRAYONS, n);
      items = items.map((item, index) => ({ ...item, crayon: spread[index] }));
    } else if (feature === "shape") {
      const spread = inPairs(random, SUDOKU_SHAPES_4, n);
      items = items.map((item, index) => ({ ...item, shape: spread[index] }));
    } else {
      const spread = inPairs(random, SIZES, n);
      items = items.map((item, index) => ({ ...item, size: spread[index] }));
    }
  }
  return items;
}

/** One row for `rule` that passes the row rules, or null when the attempts run out. */
function drawRow(random: () => number, level: OddOneOutLevel, rule: OddRule, colors: boolean): OddRow | null {
  for (let attempt = 0; attempt < MAX_ROW_ATTEMPTS; attempt += 1) {
    const odd = pick(random, level.itemCount);
    const items = rule === "category" ? categoryRow(random, level, odd) : shapeRow(random, level, rule, colors, odd);
    const row: OddRow = { rule, items, answer: odd };
    if (loners(items, rule)[0] === odd && oddOneOutRowProblems(row, colors).length === 0) {
      return row;
    }
  }
  return null;
}

/** Every rule of the level at least once, the rest at random, and no rule twice in a row. */
function drawRules(random: () => number, level: OddOneOutLevel, colors: boolean): OddRule[] | null {
  const rules = rulesFor(level, colors);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const list = shuffle(random, [
      ...rules,
      ...Array.from({ length: level.rowCount - rules.length }, () => rules[pick(random, rules.length)]),
    ]);
    if (list.every((rule, index) => index === 0 || rule !== list[index - 1])) {
      return list;
    }
  }
  return null;
}

function drawOddOneOutCard(random: () => number, level: OddOneOutLevel, colors: boolean): OddOneOutCard | null {
  const rules = drawRules(random, level, colors);
  if (rules === null) {
    return null;
  }
  const rows: OddRow[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    let row: OddRow | null = null;
    for (let attempt = 0; attempt < MAX_DISTINCT_ROW_ATTEMPTS && row === null; attempt += 1) {
      const drawn = drawRow(random, level, rule, colors);
      if (drawn !== null && !seen.has(rowContentKey(drawn))) {
        row = drawn;
      }
    }
    if (row === null) {
      return null;
    }
    seen.add(rowContentKey(row));
    rows.push(row);
  }
  return { levelId: level.id, colors, rows, key: rows.map(rowKey).join(";") };
}

/**
 * Draws a card for the level, or null when no card that keeps every rule (see `oddOneOutCardProblems`) turned up within
 * the attempts. A card never repeats `previousKey`.
 */
export function generateOddOneOutCard(
  random: () => number,
  previousKey: string | null,
  level: OddOneOutLevel,
  colors: boolean,
): OddOneOutCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const card = drawOddOneOutCard(random, level, colors);
    if (card !== null && card.key !== previousKey && oddOneOutCardProblems(card, level, colors).length === 0) {
      return card;
    }
  }
  return null;
}
