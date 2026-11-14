import { BUDOWLE } from "./objects/budowle.ts";
import { JEDZENIE } from "./objects/jedzenie.ts";
import { KOSMOS } from "./objects/kosmos.ts";
import { KSZTALTY } from "./objects/ksztalty.ts";
import { PRZYRODA } from "./objects/przyroda.ts";
import { ZWIERZETA } from "./objects/zwierzeta.ts";
import type { SymmetryLevelId } from "./levels.ts";
import { OBJECT_CATEGORIES } from "./template-format.ts";
import type {
  CategoryWindow,
  ObjectCategory,
  ObjectCategoryId,
  SymmetryObjectSizes,
  SymmetryTemplate,
} from "./template-format.ts";

export type ObjectCategoryChoiceId = "wszystkie" | ObjectCategoryId;

export {
  OBJECT_CATEGORIES,
  SYMMETRY_COLORS,
  type ObjectCategoryId,
  type SymmetryCell,
  type SymmetryColor,
  type SymmetryPart,
  type SymmetryTemplate,
} from "./template-format.ts";

/** Rakieta, robot and truskawka stay first, in that order; the other objects follow in the category order of the PRD. */
function byOrder(templates: readonly SymmetryTemplate[]): readonly SymmetryTemplate[] {
  const first = ["rakieta", "robot", "truskawka"];
  return [
    ...first.flatMap((id) => templates.filter((template) => template.id === id)),
    ...templates.filter((template) => !first.includes(template.id)),
  ];
}

const CATALOG: readonly SymmetryObjectSizes[] = [ZWIERZETA, JEDZENIE, PRZYRODA, KOSMOS, BUDOWLE, KSZTALTY];

/** Drawn as the left half of a 12-column grid: 6 columns, and column 5 touches the axis. Used by 5 and 6 lat. */
const TEMPLATES_6_BY_15 = byOrder(CATALOG.flatMap((sizes) => sizes.half6));

const TEMPLATES_BY_LEVEL: Readonly<Record<SymmetryLevelId, readonly SymmetryTemplate[]>> = {
  lat4: byOrder(CATALOG.flatMap((sizes) => sizes.half4)),
  lat5: TEMPLATES_6_BY_15,
  lat6: TEMPLATES_6_BY_15,
  lat7: byOrder(CATALOG.flatMap((sizes) => sizes.half9)),
};

function windowOf(category: ObjectCategory): CategoryWindow | undefined {
  return category.window;
}

/**
 * Every choice of the "Kategoria" bar: all objects first, then the categories with a window, then the always-on
 * ones, alphabetically by Polish label. The bar itself shows `objectCategoryChoicesOn(today)`.
 */
export const OBJECT_CATEGORY_CHOICES: readonly { id: ObjectCategoryChoiceId; label: string }[] = [
  { id: "wszystkie", label: "Wszystkie" },
  ...[...OBJECT_CATEGORIES]
    .sort(
      (a, b) =>
        Number(windowOf(b) !== undefined) - Number(windowOf(a) !== undefined) || a.label.localeCompare(b.label, "pl"),
    )
    .map(({ id, label }) => ({ id, label })),
];

/** Whether `today` (local month and day) is inside the window, ends included, also across New Year. */
function inWindow(window: CategoryWindow, today: Date): boolean {
  const day = (today.getMonth() + 1) * 100 + today.getDate();
  const from = window.from.month * 100 + window.from.day;
  const to = window.to.month * 100 + window.to.day;
  return from <= to ? from <= day && day <= to : day >= from || day <= to;
}

function categoryOpenOn(id: ObjectCategoryId, today: Date): boolean {
  const category: ObjectCategory | undefined = OBJECT_CATEGORIES.find((candidate) => candidate.id === id);
  const window = category === undefined ? undefined : windowOf(category);
  return window === undefined || inWindow(window, today);
}

/** The choices of the bar on `today`: every category except those whose window does not include the day. */
export function objectCategoryChoicesOn(today: Date): readonly { id: ObjectCategoryChoiceId; label: string }[] {
  return OBJECT_CATEGORY_CHOICES.filter((choice) => choice.id === "wszystkie" || categoryOpenOn(choice.id, today));
}

/** The category the bar shows for a remembered one: "wszystkie" when its window does not include `today`. */
export function visibleCategoryOn(category: ObjectCategoryChoiceId, today: Date): ObjectCategoryChoiceId {
  return category === "wszystkie" || categoryOpenOn(category, today) ? category : "wszystkie";
}

export const DEFAULT_OBJECT_CATEGORY_ID: ObjectCategoryChoiceId = "wszystkie";

/** The templates of the level, only those in `category` (all of them for "wszystkie"). Empty for a category without objects. */
export function symmetryTemplatesFor(
  levelId: SymmetryLevelId,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): readonly SymmetryTemplate[] {
  const all = TEMPLATES_BY_LEVEL[levelId];
  if (category === "wszystkie") {
    return all;
  }
  return all.filter((template) => template.categories.includes(category));
}
