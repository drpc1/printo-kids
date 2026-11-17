import type { CodingLevelId } from "./levels.ts";

/**
 * How the "Kodowanie" card is drawn, in page units (mm on an A4 sheet). The page component, the thumbnail script, the
 * preview script and the tests all read these and nothing else, so none of them can drift from the printed card. The
 * values come from the accepted mockup (context/changes/coding-card/mockup.mts); the trial print decides (phase 4).
 */
export const CODING_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: nothing of the task leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the grid. */
  bandGap: 6,
  /** Height of the plain instruction line when no character stands in the band. */
  plainInstructionSize: 7,
  /** Line width of the grid's inner lines. */
  gridStroke: 0.5,
  /** Line width of the grid's frame. */
  frameStroke: 1.1,
  /** Space between the grid and the answer boxes under it. */
  gapUnderGrid: 9,
  /** Space between two answer boxes, both ways. */
  boxGap: 3,
  /** Line width of an answer box. */
  boxStroke: 0.6,
  /** Corner radius of an answer box. */
  boxRadius: 1.5,
  /** Line width of an arrow. */
  arrowStroke: 1.1,
  /** Answer box of a "3 →" command (Level 4), mm. */
  groupBox: { width: 27, height: 16 },
  /** Side of the answer box of a single arrow, per level, mm. */
  box: { poziom1: 22, poziom2: 20, poziom3: 16, poziom4: 16 } satisfies Record<CodingLevelId, number>,
  /** How far below a text's centre its baseline lies, in font sizes; no `dominant-baseline` (GitHub 371). */
  baselineShift: 0.36,
  /** The character fills this share of the start cell. */
  characterShare: 0.88,
  /** Share of the cell the start circle ("Start", no character) and the flag/targets use. */
  startCircleShare: 0.36,
  startTextShare: 0.22,
  flagShare: 0.66,
  targetShare: 0.32,
  /** Colour tokens from global.css; the sheet never writes a hex. */
  colors: {
    obstacle: "var(--muted-foreground)",
    example: "var(--muted-foreground)",
    ink: "var(--foreground)",
    paper: "var(--card)",
  },
} as const;
