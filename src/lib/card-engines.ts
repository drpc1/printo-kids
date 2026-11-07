// The registry of card engines (gh283, phase 11): one engine per card kind in `CARD_KINDS`. The `satisfies` clause is
// the check: a kind in the catalog without an engine, an engine with settings of another kind, or an engine for an
// unknown kind is a compile error (`npx astro check`).
import type { CardEngine, CardKindId } from "./card-contract.ts";
import type { CardSettingsId, CardSettingsOf } from "./card-settings.ts";
import { dictationEngine } from "./dictation/engine.ts";
import type { DictationCard } from "./dictation/generate.ts";
import { mazeEngine } from "./maze/engine.ts";
import type { Maze } from "./maze/generate.ts";
import { moneyEngine } from "./money/engine.ts";
import type { MoneyCard } from "./money/rules.ts";
import { nonogramEngine, type AnyNonogramCard } from "./nonogram/engine.ts";
import { sequenceEngine } from "./sequence/engine.ts";
import type { SequenceCard } from "./sequence/generate.ts";
import { sudokuEngine } from "./sudoku/engine.ts";
import type { SudokuCard } from "./sudoku/generate.ts";
import { symmetryEngine } from "./symmetry/engine.ts";
import type { SymmetryCard } from "./symmetry/generate.ts";

interface CardTypeMap {
  labirynt: Maze;
  symetria: SymmetryCard;
  sekwencje: SequenceCard;
  sudoku: SudokuCard;
  nonogram: AnyNonogramCard;
  dyktando: DictationCard;
  pieniadze: MoneyCard;
}

// The card kinds and the settings ids are one union: a kind with settings but no engine (or the reverse) fails here.
type SameIds = [CardKindId] extends [CardSettingsId] ? ([CardSettingsId] extends [CardKindId] ? true : never) : never;
export const kindsAndSettingsAgree: SameIds = true;

export const CARD_ENGINES = {
  labirynt: mazeEngine,
  symetria: symmetryEngine,
  sekwencje: sequenceEngine,
  sudoku: sudokuEngine,
  nonogram: nonogramEngine,
  dyktando: dictationEngine,
  pieniadze: moneyEngine,
} satisfies { [K in CardKindId]: CardEngine<CardSettingsOf<K>, CardTypeMap[K]> };
