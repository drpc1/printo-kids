/**
 * How the shadows card ("Cienie") is drawn, in page units (mm on an A4 sheet). The page component, the thumbnail
 * script, the preview script and the tests read these and nothing else. Values from the accepted mockup v2
 * (context/changes/shadows-card/mockup.mts); the trial print decides (phase 4).
 */
export const SHADOWS_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: nothing of the task leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the first row. */
  bandGap: 8,
  /** Font size of the plain instruction when no character stands in the band (one line). */
  plainInstructionSize: 6.5,
  instruction: "Połącz każdy obrazek z jego cieniem.",
  /** Space between the page margin and a picture field, on both sides. */
  columnInset: 8,
  /** Vertical space a row keeps free around its pictures. */
  rowGap: 6,
  /** The dot next to every picture: radius and space to the picture field. */
  dotRadius: 1.8,
  dotGap: 8,
} as const;
