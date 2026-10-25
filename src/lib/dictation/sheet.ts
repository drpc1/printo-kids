import type { DictationCommand, DictationDirection } from "./outline.ts";

/**
 * How the graphic dictation card is drawn, in page units (mm on an A4 sheet). The page component and the catalog
 * thumbnail script both read these, so the thumbnail cannot drift from the printed card.
 */
export const DICTATION_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  instructionSize: 7,
  instructionGap: 6,
  instructionText: "Rysuj po liniach kratki według strzałek. Zacznij od kropki.",
  /** Command boxes per row; they share the inner page width equally. */
  commandsPerRow: 11,
  commandRowHeight: 12,
  /** Space between the last command row and the grid. */
  listGap: 6,
  /** Font size of the bold "n →" in a command box. */
  commandFontSize: 6,
  /** Font size of the small grey number in the top-left corner of a command box. */
  commandNumberSize: 2.6,
  commandBoxStroke: 0.3,
  /** Space between a command box and the edge of its cell, on every side. */
  commandBoxInset: 0.6,
  /** Distance of the small number from the left edge and from the top edge of its box (its baseline). */
  commandNumberOffsetX: 1.2,
  commandNumberOffsetY: 3.2,
  commandBoxRadius: 1.2,
  gridStroke: 0.3,
  frameStroke: 0.65,
  /** The dot on the grid where the child puts the pencil down. */
  startDotRadius: 2,
} as const;

/** The most commands the 6 lat sheet fits: 5 rows of 11 command boxes (7 + 6 + 60 + 6 + 187 = 266 of 277 mm). */
export const DICTATION_MAX_COMMANDS = 55;

export const DICTATION_ARROWS: Readonly<Record<DictationDirection, string>> = {
  right: "→",
  left: "←",
  up: "↑",
  down: "↓",
};

/** The bold text of a command box, for example "3 →". The page and the thumbnail format commands the same way. */
export function formatDictationCommand(command: DictationCommand): string {
  return `${command.length} ${DICTATION_ARROWS[command.direction]}`;
}
