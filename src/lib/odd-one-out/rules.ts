import type { SudokuShapeId } from "../sudoku/shapes.ts";
import { iconById } from "./icons.ts";
import { rulesFor, type OddOneOutLevel, type OddOneOutLevelId, type OddRule } from "./levels.ts";

export type { OddRule } from "./levels.ts";

/** The crayons of the card: the `--symmetry-*` tokens that stay clear of the black outline in print (no gray, no black). */
export type OddCrayon = "red" | "blue" | "green" | "orange" | "purple" | "yellow" | "brown";

export const ODD_CRAYONS: readonly OddCrayon[] = ["red", "blue", "green", "orange", "purple", "yellow", "brown"];

/** Smallest and largest group of one picture. */
export const MIN_COUNT = 1;
export const MAX_COUNT = 6;

export interface OddItem {
  /** Null for an icon. */
  shape: SudokuShapeId | null;
  /** Id of the icon (`icons.ts`), null for a shape. */
  icon: string | null;
  size: "big" | "small";
  /** Shapes in the group, 1 to 6. An icon is always 1. */
  count: number;
  /** Null without colors, and always null for an icon (icons stay black). */
  crayon: OddCrayon | null;
}

export interface OddRow {
  rule: OddRule;
  items: readonly OddItem[];
  /** Index of the picture that breaks the rule. */
  answer: number;
}

export interface OddOneOutCard {
  levelId: OddOneOutLevelId;
  colors: boolean;
  rows: readonly OddRow[];
  /** Names all rows; two cards with one key show the same thing. */
  key: string;
}

/** The value of one feature of a picture, as text. Pictures with the same text look the same in that feature. */
export function itemFeature(item: OddItem, feature: OddRule): string {
  switch (feature) {
    case "shape":
      return item.icon === null ? (item.shape ?? "none") : `icon:${item.icon}`;
    case "size":
      return item.size;
    case "count":
      return String(item.count);
    case "color":
      return item.crayon ?? "none";
    case "category":
      return item.icon === null ? "shape" : (iconById(item.icon)?.category ?? "unknown");
  }
}

const FEATURES: readonly OddRule[] = ["shape", "size", "count", "color", "category"];

/** Indexes of the pictures whose value of `feature` shows in the row exactly once. */
export function loners(items: readonly OddItem[], feature: OddRule): number[] {
  const values = items.map((item) => itemFeature(item, feature));
  return values.flatMap((value, index) => (values.filter((other) => other === value).length === 1 ? [index] : []));
}

const itemKey = (item: OddItem): string =>
  [item.shape ?? "", item.icon ?? "", item.size, item.count, item.crayon ?? ""].join(",");

/** A row as shown, in order. */
export function rowKey(row: OddRow): string {
  return `${row.rule}:${row.items.map(itemKey).join("|")}`;
}

/** A row without regard to the order of its pictures: the same pictures shuffled count as the same row. */
export function rowContentKey(row: OddRow): string {
  return `${row.rule}:${row.items.map(itemKey).sort().join("|")}`;
}

export type OddRowProblem =
  | "ambiguous-row"
  | "answer"
  | "item-kind"
  | "count-range"
  | "crayon-without-colors"
  | "crayon-missing"
  | "category-row";

export type OddCardProblem =
  | OddRowProblem
  | "settings"
  | "row-count"
  | "row-size"
  | "rule-not-in-level"
  | "missing-rule"
  | "adjacent-rule"
  | "duplicate-row";

/**
 * A row is clear when the feature of its rule has exactly one picture whose value shows once (the answer) and no other
 * feature has such a picture. Shape is not checked in a category row: every icon is a different picture.
 */
export function oddOneOutRowProblems(row: OddRow, colors: boolean): readonly OddRowProblem[] {
  const problems = new Set<OddRowProblem>();
  const { items } = row;

  const own = loners(items, row.rule);
  if (own.length !== 1) {
    problems.add("ambiguous-row");
  } else if (row.answer !== own[0]) {
    problems.add("answer");
  }
  for (const feature of FEATURES) {
    if (feature === row.rule || (feature === "shape" && row.rule === "category")) {
      continue;
    }
    if (loners(items, feature).length > 0) {
      problems.add("ambiguous-row");
    }
  }

  for (const item of items) {
    if (item.count < MIN_COUNT || item.count > MAX_COUNT || !Number.isInteger(item.count)) {
      problems.add("count-range");
    }
    // A picture is a shape or an icon, never both and never neither; an icon is one picture, not a group.
    const isIcon = item.icon !== null;
    if (isIcon === (item.shape !== null) || (isIcon && (item.count !== 1 || iconById(item.icon ?? "") === undefined))) {
      problems.add("item-kind");
    }
    if (!colors && item.crayon !== null) {
      problems.add("crayon-without-colors");
    }
    if (colors && item.icon === null && item.crayon === null) {
      problems.add("crayon-missing");
    }
    if (item.icon !== null && item.crayon !== null) {
      problems.add("item-kind");
    }
  }

  if (row.rule === "category") {
    // n - 1 different icons of one category and one icon of another.
    const categories = items.map((item) => itemFeature(item, "category"));
    const counts = [...new Set(categories)].map((name) => categories.filter((other) => other === name).length);
    const distinct = new Set(items.map((item) => item.icon)).size === items.length;
    const shapes = items.some((item) => item.icon === null);
    if (shapes || !distinct || counts.length !== 2 || !counts.includes(1) || !counts.includes(items.length - 1)) {
      problems.add("category-row");
    }
  } else if (items.some((item) => item.icon !== null)) {
    problems.add("item-kind");
  }

  return [...problems];
}

export function oddOneOutCardProblems(
  card: OddOneOutCard,
  level: OddOneOutLevel,
  colors: boolean,
): readonly OddCardProblem[] {
  const problems = new Set<OddCardProblem>();
  const allowed = rulesFor(level, colors);

  if (card.levelId !== level.id || card.colors !== colors) {
    problems.add("settings");
  }
  if (card.rows.length !== level.rowCount) {
    problems.add("row-count");
  }
  for (const row of card.rows) {
    if (row.items.length !== level.itemCount) {
      problems.add("row-size");
    }
    if (!allowed.includes(row.rule)) {
      problems.add("rule-not-in-level");
    }
    for (const problem of oddOneOutRowProblems(row, colors)) {
      problems.add(problem);
    }
  }
  // Every rule of the level shows at least once, and no two neighbours share a rule.
  if (allowed.some((rule) => !card.rows.some((row) => row.rule === rule))) {
    problems.add("missing-rule");
  }
  if (card.rows.some((row, index) => index > 0 && row.rule === card.rows[index - 1].rule)) {
    problems.add("adjacent-rule");
  }
  if (new Set(card.rows.map(rowContentKey)).size !== card.rows.length) {
    problems.add("duplicate-row");
  }

  return [...problems];
}
