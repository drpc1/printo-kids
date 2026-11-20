/**
 * How the "Labirynt liczbowy" card is drawn, in page units (mm on an A4 sheet). The page component, the thumbnail
 * script, the preview script and the tests all read these and nothing else, so none of them can drift from the
 * printed card. The values come from the accepted mockup (context/changes/number-maze-card/mockup.mts); the trial
 * print decides (phase 3).
 */
export const NUMBER_MAZE_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: nothing of the task leaves the area inside it. */
  inset: 10,
  /** Space between the instruction (band or plain line) and the "Start" label band. */
  bandGap: 8,
  /** Font size of the plain instruction when no character stands in the band (one line). */
  plainInstructionSize: 6.5,
  /** Band above the grid for "Start" and below it for "Meta". */
  labelBand: 9,
  /** Font size of "Start" and "Meta". */
  labelSize: 5.5,
  /** Gap between the grid edge and the label baseline above ("Start") / the label top below ("Meta"). */
  labelGap: 2.5,
  /** The largest cell; small grids stop here instead of filling the page. */
  maxCell: 30,
  /** Line widths: a cell, the outer frame, the frame of the start and goal cells. */
  cellStroke: 0.4,
  frameStroke: 0.9,
  endpointStroke: 1.4,
  /** The start and goal frames sit this far inside their cell, with this corner radius. */
  endpointInset: 0.8,
  endpointRadius: 1.2,
  /** Height of a number as a share of the cell: one or two digits, three digits. */
  digitShare: 0.42,
  wideDigitShare: 0.36,
  /** How far below a text's centre its baseline lies, in font sizes; no `dominant-baseline` (GitHub 371). */
  baselineShift: 0.36,
} as const;
