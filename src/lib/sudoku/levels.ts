/** Board sides: 4×4, 6×6 and 9×9. */
export type SudokuSize = 4 | 6 | 9;

export type SudokuLevelId = "latwy" | "sredni" | "trudny";

/** What the cells hold: drawn shapes or digits. Only 6×6 and 9×9 offer digits; 4×4 is always shapes. */
export type SudokuSymbols = "shapes" | "digits";

export interface SudokuSettings {
  size: SudokuSize;
  level: SudokuLevelId;
  symbols: SudokuSymbols;
}

export const SUDOKU_SIZES: readonly { id: SudokuSize; label: string }[] = [
  { id: 4, label: "4×4" },
  { id: 6, label: "6×6" },
  { id: 9, label: "9×9" },
];

export const SUDOKU_LEVELS: readonly { id: SudokuLevelId; label: string }[] = [
  { id: "latwy", label: "łatwy" },
  { id: "sredni", label: "średni" },
  { id: "trudny", label: "trudny" },
];

export const DEFAULT_SUDOKU_SETTINGS: SudokuSettings = { size: 4, level: "latwy", symbols: "shapes" };

/** Empty cells of a 4×4 card: one in every row. */
const BLANKS_4 = 4;

/** Empty cells by size and level (PRD, Business Logic "Karta sudoku"); starting values the print confirms. */
const BLANKS: Record<6 | 9, Record<SudokuLevelId, number>> = {
  6: { latwy: 12, sredni: 18, trudny: 22 },
  9: { latwy: 35, sredni: 45, trudny: 52 },
};

/** How many cells are empty. 4×4 has one level, so its level is ignored. */
export function sudokuBlankCount(size: SudokuSize, level: SudokuLevelId): number {
  return size === 4 ? BLANKS_4 : BLANKS[size][level];
}

/** The level bar is shown only for sizes that have more than one level. */
export function sudokuHasLevels(size: SudokuSize): boolean {
  return size !== 4;
}

/** The shapes / digits choice is shown only for 6×6 and 9×9. */
export function sudokuHasSymbolChoice(size: SudokuSize): boolean {
  return size !== 4;
}
