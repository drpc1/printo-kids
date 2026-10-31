import { BUDOWLE } from "./objects/budowle.ts";
import { JEDZENIE } from "./objects/jedzenie.ts";
import { KOSMOS } from "./objects/kosmos.ts";
import { KSZTALTY } from "./objects/ksztalty.ts";
import { PRZYRODA } from "./objects/przyroda.ts";
import { ZWIERZETA } from "./objects/zwierzeta.ts";
import type { SymmetryLevelId } from "./levels.ts";
import { OBJECT_CATEGORIES } from "./template-format.ts";
import type { ObjectCategoryId, SymmetryObjectSizes, SymmetryTemplate } from "./template-format.ts";

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

/** The choices of the "Kategoria" bar: all objects first, then one entry per category, in the order of the PRD. */
export const OBJECT_CATEGORY_CHOICES: readonly { id: ObjectCategoryChoiceId; label: string }[] = [
  { id: "wszystkie", label: "Wszystkie" },
  ...OBJECT_CATEGORIES,
];

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
