import type { DictationCommand, DictationDirection } from "./outline.ts";

/**
 * How the graphic dictation card is drawn, in page units (mm on an A4 sheet). The page component and the catalog
 * thumbnail script both read these, so the thumbnail cannot drift from the printed card. The command list sizes that
 * differ per level are in levels.ts.
 */
export const DICTATION_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  instructionSize: 7,
  instructionGap: 6,
  instructionText: "Rysuj po liniach kratki według strzałek. Zacznij od kropki.",
  /** Space between the last command row and the grid. */
  listGap: 6,
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
  /** Screen-only outline. Thicker than the frame so it stays visible on the grid lines. */
  solutionStroke: 1.2,
  /** The dot on the grid where the child puts the pencil down. */
  startDotRadius: 2,
} as const;

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
