// The registry of card engines (gh283, phase 11): one engine per card kind in `CARD_KINDS`. The `satisfies` clause is
// the check: a kind in the catalog without an engine, an engine with settings of another kind, or an engine for an
// unknown kind is a compile error (`npx astro check`).
import type { CardEngine, CardKindId } from "./card-contract.ts";
import type { CardSettingsId, CardSettingsOf } from "./card-settings.ts";
import type { ClockCard } from "./clock/card.ts";
import { clockEngine } from "./clock/engine.ts";
import type { CodingCard } from "./coding/card.ts";
import { codingEngine } from "./coding/engine.ts";
import type { CopyDrawingCard } from "./copy-drawing/card.ts";
import { copyDrawingEngine } from "./copy-drawing/engine.ts";
import { dictationEngine } from "./dictation/engine.ts";
import type { DictationCard } from "./dictation/generate.ts";
import type { MathCrosswordCard } from "./math-crossword/card.ts";
import { mathCrosswordEngine } from "./math-crossword/engine.ts";
import { mazeEngine } from "./maze/engine.ts";
import type { Maze } from "./maze/generate.ts";
import { moneyEngine } from "./money/engine.ts";
import type { MoneyCard } from "./money/rules.ts";
import { nonogramEngine, type AnyNonogramCard } from "./nonogram/engine.ts";
import type { NumberMazeCard } from "./number-maze/card.ts";
import { numberMazeEngine } from "./number-maze/engine.ts";
import { sizeOrderEngine } from "./size-order/engine.ts";
import type { SizeOrderCard } from "./size-order/card.ts";
import { oddOneOutEngine } from "./odd-one-out/engine.ts";
import type { OddOneOutCard } from "./odd-one-out/rules.ts";
import type { PatternLinesCard } from "./pattern-lines/card.ts";
import { patternLinesEngine } from "./pattern-lines/engine.ts";
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
  niepasuje: OddOneOutCard;
  kopiuj: CopyDrawingCard;
  szlaczki: PatternLinesCard;
  krzyzowka: MathCrosswordCard;
  zegar: ClockCard;
  kodowanie: CodingCard;
  odnajmniejszego: SizeOrderCard;
  liczby: NumberMazeCard;
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
  niepasuje: oddOneOutEngine,
  kopiuj: copyDrawingEngine,
  szlaczki: patternLinesEngine,
  krzyzowka: mathCrosswordEngine,
  zegar: clockEngine,
  kodowanie: codingEngine,
  odnajmniejszego: sizeOrderEngine,
  liczby: numberMazeEngine,
} satisfies { [K in CardKindId]: CardEngine<CardSettingsOf<K>, CardTypeMap[K]> };
