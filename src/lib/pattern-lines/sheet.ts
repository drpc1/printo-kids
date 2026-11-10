/**
 * How the "Szlaczki" card is drawn, in page units (mm on an A4 sheet). The page component, the catalog thumbnail script,
 * the preview script and the tests all read these and nothing else, so none of them can drift from the printed card.
 * The values are a first guess: the trial print decides (PRD Open Questions 15). Keep every number here.
 */
export const PATTERN_LINES_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: no row leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the first row. */
  bandGap: 6,
  /** Space reserved above the first row for a row caption. The card has no captions, so it is 0 (the mockup left 4 mm). */
  captionSpace: 0,
  /** Font size of the instruction when no character stands in the band (one line). */
  plainInstructionSize: 7,
  /** One sentence per mode: the dots levels, the level with two dotted repeats, and the continue level. */
  instructions: {
    dots: "Prowadź ołówek po kropkach.",
    dotsThenFree: "Poprowadź po kropkach, potem rysuj dalej sam.",
    line: "Dokończ szlaczek do końca linii.",
  },
  /** A row starts this far inside the margin and ends as far from the right one: its length is the width minus twice this. */
  rowIndent: 3,
  /** Dots: radius and spacing along the path. Level 3 uses them for its two dotted repeats. */
  dots: {
    poziom1: { radius: 1.1, spacing: 4 },
    poziom2: { radius: 0.9, spacing: 3.5 },
    poziom3: { radius: 0.9, spacing: 3.5 },
  },
  /** A dot is not put closer than this fraction of the spacing to the one before it (corners and the end excepted). */
  minDotGap: 0.7,
  /** Dots from different arms of the path keep at least this much clear space between their edges. */
  minArmClearance: 0.6,
  /** Two dots count as "different arms" when their positions in the row differ by at least this many dots. */
  minArmIndexGap: 3,
  /** The empty ring around the first dot: its radius is the dot radius plus this. */
  startRingGap: 1.2,
  startRingStroke: 0.5,
  /** The pale line under the dots, so the child sees the way. */
  trackStroke: 0.8,
  /** The line of a drawn pattern. Only level 4 draws one; level 3 draws its repeats with dots. */
  patternStroke: 0.6,
  /** Level 3 guide lines (top and bottom of the pattern) and the pale bottom line left when the guides are off. */
  guides: { stroke: 0.3, dash: "1.2 1.2", paleStroke: 0.25 },
  /** Level 4 ruling, like a calligraphy copybook: `unit` is the height of a small letter. */
  ruling: { unit: 6.5, stroke: 0.25, paleStroke: 0.2, midDash: "1.2 1.2", paleDash: "0.6 1.4" },
  /** Extra empty strip at the bottom of the sheet, mm. Level 1 gets 15 mm so the child can hold the sheet. */
  bottomPad: { poziom1: 15, poziom2: 0, poziom3: 0, poziom4: 0 },
} as const;
