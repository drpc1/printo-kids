import { cardSettingsOf, type CardSettingsId, type CardSettingsMap } from "./card-settings.ts";
import { cardsInCatalogOrder } from "./cards.ts";
import type { ChildProfile } from "./child-profiles.ts";
import { clockLevelById, clockModeById } from "./clock/levels.ts";
import { codingLevelById, codingModeById } from "./coding/levels.ts";
import { copyDrawingLevelById } from "./copy-drawing/levels.ts";
import { dictationLevelById } from "./dictation/levels.ts";
import { mathCrosswordLevelById } from "./math-crossword/levels.ts";
import { levelById } from "./maze/levels.ts";
import { moneyCurrencyById } from "./money/currencies.ts";
import { moneyLevelById } from "./money/levels.ts";
import { nonogramSizeById } from "./nonogram/sizes.ts";
import { numberMazeLevelById } from "./number-maze/levels.ts";
import { shadowsLevelById } from "./shadows/levels.ts";
import { sizeOrderLevelById } from "./size-order/levels.ts";
import { oddOneOutLevelById } from "./odd-one-out/levels.ts";
import { patternLinesHasGuides, patternLinesLevelById } from "./pattern-lines/levels.ts";
import { sequenceLevelById } from "./sequence/levels.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./sudoku/levels.ts";
import { symmetryLevelById } from "./symmetry/levels.ts";
import { OBJECT_CATEGORY_CHOICES, visibleCategoryOn, type ObjectCategoryChoiceId } from "./symmetry/templates.ts";

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

/**
 * Every card of a profile, in catalog order. With `today` a remembered category outside its window reads as
 * "Wszystkie", as on the bar; without it the remembered one is shown.
 */
export function cardSummaries(profile: ChildProfile, today?: Date): CardSummary[] {
  return cardsInCatalogOrder().map((kind) => {
    const parts = summaryParts(kind.id, profile, today);
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

function summaryParts(cardId: string, profile: ChildProfile, today?: Date): SummaryParts | null {
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
        extras: [...(settings.colors ? ["kolory"] : []), categoryLabel(settings.category, today)],
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
      return { badge: badgeOf(level), level: level.label, extras: [categoryLabel(settings.category, today)] };
    }
    case "dyktando": {
      const settings = cards.dyktando;
      if (settings === undefined) {
        return null;
      }
      const level = dictationLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [categoryLabel(settings.category, today)] };
    }
    case "pieniadze": {
      const settings = cards.pieniadze;
      if (settings === undefined) {
        return null;
      }
      const level = moneyLevelById(settings.level, settings.currency);
      const currency = settings.currency === "pln" ? [] : [moneyCurrencyById(settings.currency).symbol];
      return {
        badge: badgeOf(level),
        level: level.label,
        extras: [...currency, ...(settings.colors ? ["kolory"] : [])],
      };
    }
    case "niepasuje": {
      const settings = cards.niepasuje;
      if (settings === undefined) {
        return null;
      }
      const level = oddOneOutLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: settings.colors ? ["kolory"] : [] };
    }
    case "kopiuj": {
      const settings = cards.kopiuj;
      if (settings === undefined) {
        return null;
      }
      const level = copyDrawingLevelById(settings.level);
      return {
        badge: badgeOf(level),
        level: level.label,
        extras: [...(settings.colors ? ["kolory"] : []), categoryLabel(settings.category, today)],
      };
    }
    case "szlaczki": {
      const settings = cards.szlaczki;
      if (settings === undefined) {
        return null;
      }
      const level = patternLinesLevelById(settings.level);
      const noLines = patternLinesHasGuides(settings.level) && !settings.lines;
      return { badge: badgeOf(level), level: level.label, extras: noLines ? ["bez linii"] : [] };
    }
    case "krzyzowka": {
      const settings = cards.krzyzowka;
      if (settings === undefined) {
        return null;
      }
      const level = mathCrosswordLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [] };
    }
    case "zegar": {
      const settings = cards.zegar;
      if (settings === undefined) {
        return null;
      }
      const level = clockLevelById(settings.level);
      // The mode is always shown, also the default one; "24 h" only when it is on.
      const mode = clockModeById(settings.mode);
      return { badge: badgeOf(level), level: level.label, extras: [mode.label, ...(settings.h24 ? ["24 h"] : [])] };
    }
    case "kodowanie": {
      const settings = cards.kodowanie;
      if (settings === undefined) {
        return null;
      }
      const level = codingLevelById(settings.level);
      // The mode is always shown, also the default one.
      return { badge: badgeOf(level), level: level.label, extras: [codingModeById(settings.mode).label] };
    }
    case "odnajmniejszego": {
      const settings = cards.odnajmniejszego;
      if (settings === undefined) {
        return null;
      }
      const level = sizeOrderLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: settings.colors ? ["kolory"] : [] };
    }
    case "liczby": {
      const settings = cards.liczby;
      if (settings === undefined) {
        return null;
      }
      const level = numberMazeLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [] };
    }
    case "cienie": {
      const settings = cards.cienie;
      if (settings === undefined) {
        return null;
      }
      const level = shadowsLevelById(settings.level);
      return { badge: badgeOf(level), level: level.label, extras: [] };
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

function categoryLabel(category: ObjectCategoryChoiceId, today?: Date): string {
  const shown = today === undefined ? category : visibleCategoryOn(category, today);
  return OBJECT_CATEGORY_CHOICES.find((choice) => choice.id === shown)?.label ?? shown;
}
