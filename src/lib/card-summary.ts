import { cardSettingsOf, type CardSettingsId, type CardSettingsMap } from "./card-settings.ts";
import { CARD_KINDS } from "./cards.ts";
import type { ChildProfile } from "./child-profiles.ts";
import { dictationLevelById } from "./dictation/levels.ts";
import { levelById } from "./maze/levels.ts";
import { nonogramSizeById } from "./nonogram/sizes.ts";
import { sequenceLevelById } from "./sequence/levels.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./sudoku/levels.ts";
import { symmetryLevelById } from "./symmetry/levels.ts";
import { OBJECT_CATEGORY_CHOICES, type ObjectCategoryChoiceId } from "./symmetry/templates.ts";

/** What the profile window and the catalog show about one card of a profile. */
export interface CardSummary {
  id: string;
  title: string;
  href: string;
  /** The profile has chosen something on this card's bar. The maze always counts: a profile starts at the default level. */
  used: boolean;
  /** Level text for the catalog thumbnail; null while the card is not used. */
  badge: string | null;
  /** Everything the profile remembers for the card, for the profile window. */
  detail: string;
}

const UNUSED_DETAIL = "domyślne";

/** Every card of a profile in the order of CARD_KINDS. */
export function cardSummaries(profile: ChildProfile): CardSummary[] {
  return CARD_KINDS.map((kind) => {
    const parts = summaryParts(kind.id, profile);
    if (parts === null) {
      return { id: kind.id, title: kind.title, href: kind.href, used: false, badge: null, detail: UNUSED_DETAIL };
    }
    return {
      id: kind.id,
      title: kind.title,
      href: kind.href,
      used: true,
      badge: parts.badge,
      detail: [parts.level, ...parts.extras].join(" · "),
    };
  });
}

interface SummaryParts {
  badge: string;
  level: string;
  extras: string[];
}

function summaryParts(cardId: string, profile: ChildProfile): SummaryParts | null {
  const cards: CardSettingsMap = profile.cards ?? {};
  switch (cardId as CardSettingsId) {
    case "labirynt": {
      const level = levelById(cardSettingsOf(cards, "labirynt").level);
      return { badge: badgeOf(level), level: level.label, extras: [] };
    }
    case "symetria": {
      const settings = cards.symetria;
      if (settings === undefined) {
        return null;
      }
      const level = symmetryLevelById(settings.level);
      return {
        badge: badgeOf(level),
        level: level.label,
        extras: [...(settings.colors ? ["kolory"] : []), categoryLabel(settings.category)],
      };
    }
    case "sekwencje": {
      const settings = cards.sekwencje;
      if (settings === undefined) {
        return null;
      }
      const level = sequenceLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: settings.colors ? ["kolory"] : [] };
    }
    case "sudoku":
      return sudokuParts(cards.sudoku);
    case "nonogram": {
      const settings = cards.nonogram;
      if (settings === undefined) {
        return null;
      }
      const level = nonogramSizeById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [categoryLabel(settings.category)] };
    }
    case "dyktando": {
      const settings = cards.dyktando;
      if (settings === undefined) {
        return null;
      }
      const level = dictationLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [categoryLabel(settings.category)] };
    }
    default:
      return null;
  }
}

function sudokuParts(settings: CardSettingsMap["sudoku"]): SummaryParts | null {
  if (settings === undefined) {
    return null;
  }
  const size =
    SUDOKU_SIZES.find((candidate) => candidate.id === settings.size)?.label ?? `${settings.size}×${settings.size}`;
  const level = SUDOKU_LEVELS.find((candidate) => candidate.id === settings.level)?.label ?? settings.level;
  const head = sudokuHasLevels(settings.size) ? `${size} · ${level}` : size;
  const symbols = sudokuHasSymbolChoice(settings.size) ? [settings.symbols === "digits" ? "cyfry" : "kształty"] : [];
  const colors = settings.symbols === "shapes" && settings.colors ? ["kolory"] : [];
  return { badge: head, level: head, extras: [...symbols, ...colors] };
}

/** "poz. 4" for a numbered level, the level's own name ("średni") for a named one. */
function badgeOf(level: { label: string; barLabel: string }): string {
  return /^\d+$/.test(level.barLabel) ? `poz. ${level.barLabel}` : level.label;
}

function categoryLabel(category: ObjectCategoryChoiceId): string {
  return OBJECT_CATEGORY_CHOICES.find((choice) => choice.id === category)?.label ?? category;
}
